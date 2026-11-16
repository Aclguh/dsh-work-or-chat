/**
 * Host half of the Work / Chat plugin.
 *
 * Registers three owner-only routes below `/api/work-or-chat`:
 * - `/api` — JSON actions for the local conversation store and credentials.
 * - `/messages` — a streaming proxy to the official DeepSeek Messages API.
 * - `/import` — a DeepSeek website export ZIP, converted into local chats.
 *
 * No route forwards a credential to the browser, and the plugin never writes a
 * Harness session or exposes a model-facing tool.
 */
import { ChatStore } from './host/store.js'
import { Credentials } from './host/credentials.js'
import { proxyMessages, validateApiKey } from './host/deepseek.js'
import { importDeepSeekZip } from './host/import.js'
import { startDemoServer } from './host/demo-server.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const API_PATH = '/api/work-or-chat/api'
const MESSAGES_PATH = '/api/work-or-chat/messages'
const IMPORT_PATH = '/api/work-or-chat/import'
const DEMO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'web', 'demo')
const MAX_IMPORT_BYTES = 256 * 1024 * 1024
const VERSION = '0.2.0'

/** Services this Host half requires. */
export const inject = ['connection', 'credentials']

/** Stable plugin name. */
export const name = 'work-or-chat'

const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
})

const failure = (code, message, status = 400) => json({ error: { code, message } }, status)

/**
 * Read a request body with a hard byte cap.
 * @param {Request} request
 * @param {number} limit
 * @returns {Promise<Buffer>}
 */
async function readBody(request, limit) {
  const reader = request.body?.getReader()
  if (!reader) return Buffer.alloc(0)
  const chunks = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > limit) {
      await reader.cancel().catch(() => undefined)
      throw new Error('archive-too-large')
    }
    chunks.push(Buffer.from(value))
  }
  return Buffer.concat(chunks)
}

/**
 * Extract a useful message from a failed upstream response.
 * @param {Response} response
 */
async function upstreamMessage(response) {
  let body = ''
  try {
    body = (await response.text()).slice(0, 2_000)
  } catch {
    // Keep the status-only message.
  }
  try {
    const parsed = JSON.parse(body)
    const message = parsed?.error?.message ?? parsed?.message ?? parsed?.msg
    if (typeof message === 'string' && message.trim()) return message.trim()
  } catch {
    // Not JSON.
  }
  return body.trim() || `DeepSeek API returned HTTP ${response.status}`
}

/** @param {import('@deepseek-ai/cordis').Context} ctx */
export function apply(ctx) {
  const store = new ChatStore(ctx)
  const credentials = new Credentials(ctx)
  const log = (message, error) => {
    try {
      ctx.logger?.error(`work-or-chat: ${message}`, error)
    } catch {
      // Logging must never fail a request.
    }
  }

  const demoServer = startDemoServer({
    root: DEMO_ROOT,
    store,
    credentials,
    log,
  })

  /**
   * JSON action route.
   * @param {Request} request
   */
  const apiHandler = async (request) => {
    let body
    try {
      body = await request.json()
    } catch {
      return failure('bad-request', 'Request body must be JSON.')
    }
    const action = typeof body?.action === 'string' ? body.action : ''
    try {
      switch (action) {
        case 'bootstrap': {
          const settings = await store.getSettings()
          const [sessions, credential] = await Promise.all([
            store.list(),
            credentials.describe(settings.credentialMode),
          ])
          return json({ sessions, settings, credential, version: VERSION })
        }
        case 'session-get': {
          const session = await store.get(String(body?.id ?? ''))
          if (!session) return failure('not-found', 'Conversation not found.', 404)
          return json({ session })
        }
        case 'session-save': {
          const summary = await store.save(body?.session)
          return json({ summary })
        }
        case 'session-delete': {
          await store.remove(String(body?.id ?? ''))
          return json({ ok: true })
        }
        case 'settings-save': {
          const settings = await store.saveSettings(body?.settings ?? {})
          const credential = await credentials.describe(settings.credentialMode)
          return json({ settings, credential })
        }
        case 'credential': {
          const settings = await store.getSettings()
          return json({ credential: await credentials.describe(settings.credentialMode) })
        }
        case 'api-key-set': {
          const key = typeof body?.key === 'string' ? body.key.trim() : ''
          if (key.length < 8 || key.length > 300) return failure('invalid-key', 'API key is empty or invalid.')
          const check = await validateApiKey(key)
          if (!check.ok) return failure('invalid-key', `API key was rejected: ${check.message}`, 400)
          await credentials.setApiKey(key)
          const settings = await store.getSettings()
          return json({ credential: await credentials.describe(settings.credentialMode) })
        }
        case 'api-key-clear': {
          await credentials.clearApiKey()
          const settings = await store.getSettings()
          return json({ credential: await credentials.describe(settings.credentialMode) })
        }
        case 'sessions-clear': {
          await store.clear()
          return json({ ok: true })
        }
        case 'demo-info': {
          const server = await demoServer
          if (!server) return failure('demo-server', 'The embedded chat client could not start.', 503)
          return json({ url: server.url, token: server.token })
        }
        default:
          return failure('unknown-action', `Unknown action: ${action || '(empty)'}`)
      }
    } catch (error) {
      log(`action ${action} failed`, error)
      return failure('internal', error instanceof Error ? error.message : String(error), 500)
    }
  }

  /**
   * Streaming Messages proxy.
   * @param {Request} request
   */
  const messagesHandler = async (request) => {
    let body
    try {
      body = await request.json()
    } catch {
      return failure('bad-request', 'Request body must be JSON.')
    }
    try {
      const settings = await store.getSettings()
      const credential = await credentials.resolve(settings.credentialMode)
      if (credential.kind === 'none') {
        return failure('no-credential', 'No DeepSeek credential is available.', 401)
      }
      const upstream = await proxyMessages(credential, body ?? {}, request.signal)
      if (!upstream.ok) {
        const message = await upstreamMessage(upstream)
        const code = upstream.status === 401 || upstream.status === 403
          ? 'auth'
          : upstream.status === 429
            ? 'rate-limit'
            : 'upstream'
        return failure(code, message, 502)
      }
      if (!upstream.body) return failure('upstream', 'DeepSeek API returned an empty stream.', 502)
      return new Response(upstream.body, {
        status: 200,
        headers: {
          'content-type': 'text/event-stream; charset=utf-8',
          'cache-control': 'no-store, no-transform',
          'x-accel-buffering': 'no',
        },
      })
    } catch (error) {
      if (request.signal.aborted) return new Response(null, { status: 499 })
      log('messages request failed', error)
      return failure('upstream', error instanceof Error ? error.message : String(error), 502)
    }
  }

  /**
   * ZIP import route.
   * @param {Request} request
   */
  const importHandler = async (request) => {
    try {
      const declared = Number(request.headers.get('content-length') ?? '0')
      if (Number.isFinite(declared) && declared > MAX_IMPORT_BYTES) {
        return failure('too-large', `The archive exceeds ${MAX_IMPORT_BYTES} bytes.`, 413)
      }
      const buffer = await readBody(request, MAX_IMPORT_BYTES)
      const result = await importDeepSeekZip({ buffer, store })
      return json({ ok: true, ...result })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const code = message === 'archive-too-large' ? 'too-large' : message
      log('import failed', error)
      return failure(code, message, code === 'too-large' ? 413 : 400)
    }
  }

  ctx.effect(() => {
    const disposers = [
      ctx.connection.fetch.register({ path: API_PATH, methods: ['POST'], requestBody: 'buffered', fetch: apiHandler }),
      ctx.connection.fetch.register({ path: MESSAGES_PATH, methods: ['POST'], requestBody: 'buffered', fetch: messagesHandler }),
      ctx.connection.fetch.register({ path: IMPORT_PATH, methods: ['POST'], requestBody: 'streaming', fetch: importHandler }),
    ]
    return async () => {
      for (const dispose of disposers) await dispose()
      const server = await demoServer
      await server?.close()
    }
  }, 'work-or-chat: routes')
}
