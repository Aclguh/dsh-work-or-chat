/**
 * Local conversation store for chat mode.
 *
 * One JSON document per conversation under `<DSH_HOME>/work-or-chat/sessions`,
 * plus an index for the sidebar and a small settings document. Writes are
 * serialized and published by atomic rename so a crash cannot leave a
 * half-written conversation or index.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { dataRoot } from './paths.js'

const INDEX_VERSION = 1
const SESSION_VERSION = 1
const MAX_SESSION_BYTES = 8 * 1024 * 1024
const ID_RE = /^[A-Za-z0-9_-]{8,80}$/
const MODELS = new Set(['deepseek-flash', 'deepseek-v4-pro'])
const MODES = new Set(['auto', 'account', 'api-key'])

/** @typedef {'deepseek-flash' | 'deepseek-v4-pro'} Model */
/** @typedef {'auto' | 'account' | 'api-key'} CredentialMode */

const text = (value, max = 200_000) => typeof value === 'string' ? value.slice(0, max) : ''
const finite = (value, fallback) => typeof value === 'number' && Number.isFinite(value) ? value : fallback

/** Defaults written when a settings document is absent or incomplete. */
export const DEFAULT_SETTINGS = Object.freeze({ model: 'deepseek-flash', credentialMode: 'auto' })

/**
 * Reduce an incoming block to the small shape the renderer understands.
 * Unknown blocks are dropped; oversized text is bounded.
 * @param {unknown} raw
 * @returns {object | undefined}
 */
function normalizeBlock(raw) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const block = /** @type {Record<string, unknown>} */ (raw)
  switch (block.type) {
    case 'text': {
      const citations = Array.isArray(block.citations)
        ? block.citations.slice(0, 50).flatMap((item) => {
          if (item === null || typeof item !== 'object') return []
          const citation = /** @type {Record<string, unknown>} */ (item)
          const url = text(citation.url, 2_000)
          if (!url) return []
          return [{ url, title: text(citation.title, 500) || null }]
        })
        : []
      return { type: 'text', text: text(block.text), ...(citations.length > 0 ? { citations } : {}) }
    }
    case 'thinking':
      return {
        type: 'thinking',
        thinking: text(block.thinking),
        ...(typeof block.signature === 'string' ? { signature: text(block.signature, 20_000) } : {}),
        ...(typeof block.elapsed === 'number' ? { elapsed: finite(block.elapsed, 0) } : {}),
      }
    case 'search': {
      const queries = Array.isArray(block.queries) ? block.queries.slice(0, 10).map((q) => text(q, 300)) : []
      const results = Array.isArray(block.results)
        ? block.results.slice(0, 20).flatMap((item) => {
          if (item === null || typeof item !== 'object') return []
          const result = /** @type {Record<string, unknown>} */ (item)
          const url = text(result.url, 2_000)
          if (!url) return []
          return [{ title: text(result.title, 500) || url, url, snippet: text(result.snippet, 1_000) }]
        })
        : []
      return { type: 'search', queries, results }
    }
    case 'open':
      return {
        type: 'open',
        url: text(block.url, 2_000),
        title: text(block.title, 500) || text(block.url, 2_000),
      }
    case 'links': {
      const links = Array.isArray(block.links)
        ? block.links.slice(0, 20).flatMap((item) => {
          if (item === null || typeof item !== 'object') return []
          const link = /** @type {Record<string, unknown>} */ (item)
          const url = text(link.url, 2_000)
          if (!url) return []
          return [{ url, title: text(link.title, 500) || url }]
        })
        : []
      return { type: 'links', links }
    }
    default:
      return undefined
  }
}

/**
 * Validate one message and rebuild it from known fields only.
 * @param {unknown} raw
 * @returns {object | undefined}
 */
function normalizeMessage(raw) {
  if (raw === null || typeof raw !== 'object') return undefined
  const message = /** @type {Record<string, unknown>} */ (raw)
  const role = message.role === 'assistant' ? 'assistant' : message.role === 'user' ? 'user' : undefined
  if (!role) return undefined
  const blocks = Array.isArray(message.blocks)
    ? message.blocks.slice(0, 100).map(normalizeBlock).filter(Boolean)
    : []
  return {
    id: text(message.id, 80) || `${role}-${Math.random().toString(36).slice(2, 10)}`,
    role,
    createdAt: finite(message.createdAt, Date.now()),
    status: typeof message.status === 'string' ? text(message.status, 20) : role === 'assistant' ? 'done' : undefined,
    blocks,
    ...(typeof message.error === 'string' ? { error: text(message.error, 2_000) } : {}),
  }
}

/**
 * Validate one conversation document.
 * @param {unknown} raw
 * @returns {object}
 */
function normalizeSession(raw) {
  if (raw === null || typeof raw !== 'object') throw new Error('invalid-session')
  const input = /** @type {Record<string, unknown>} */ (raw)
  const id = text(input.id, 80)
  if (!ID_RE.test(id)) throw new Error('invalid-session-id')
  const messages = Array.isArray(input.messages)
    ? input.messages.slice(-500).map(normalizeMessage).filter(Boolean)
    : []
  const createdAt = finite(input.createdAt, Date.now())
  return {
    version: SESSION_VERSION,
    id,
    title: text(input.title, 200),
    createdAt,
    updatedAt: finite(input.updatedAt, createdAt),
    model: MODELS.has(/** @type {string} */ (input.model)) ? input.model : DEFAULT_SETTINGS.model,
    thinking: input.thinking === true,
    search: input.search === true,
    ...(typeof input.remoteId === 'string' && input.remoteId ? { remoteId: text(input.remoteId, 200) } : {}),
    messages,
  }
}

/** One sidebar row derived from a conversation. */
function summarize(session) {
  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    messageCount: session.messages.length,
    model: session.model,
    ...(session.remoteId ? { remoteId: session.remoteId } : {}),
  }
}

const byUpdated = (a, b) => b.updatedAt - a.updatedAt

export class ChatStore {
  /** @param {import('@deepseek-ai/cordis').Context} ctx */
  constructor(ctx) {
    this.ctx = ctx
    this.root = dataRoot()
    this.sessionsDir = path.join(this.root, 'sessions')
    this.indexPath = path.join(this.root, 'index.json')
    this.settingsPath = path.join(this.root, 'settings.json')
    this.index = null
    this.settings = null
    this.queue = Promise.resolve()
  }

  /** Serialize every public operation so index and files cannot interleave. */
  enqueue(task) {
    const run = this.queue.then(task, task)
    this.queue = run.then(() => undefined, () => undefined)
    return run
  }

  async ensure() {
    if (this.index !== null) return
    await fs.mkdir(this.sessionsDir, { recursive: true })
    this.index = await this.readIndex()
    this.settings = await this.readSettings()
  }

  async readIndex() {
    try {
      const parsed = JSON.parse(await fs.readFile(this.indexPath, 'utf8'))
      if (parsed?.version === INDEX_VERSION && Array.isArray(parsed.sessions)) {
        return parsed.sessions
          .filter((item) => item && ID_RE.test(String(item.id)))
          .map((item) => ({
            id: String(item.id),
            title: text(item.title, 200),
            createdAt: finite(item.createdAt, 0),
            updatedAt: finite(item.updatedAt, 0),
            messageCount: finite(item.messageCount, 0),
            model: MODELS.has(item.model) ? item.model : DEFAULT_SETTINGS.model,
            ...(item.remoteId ? { remoteId: text(item.remoteId, 200) } : {}),
          }))
          .sort(byUpdated)
      }
    } catch {
      // A missing or damaged index is rebuilt from the conversation files.
    }
    return this.rebuildIndex()
  }

  async rebuildIndex() {
    const entries = []
    let names = []
    try {
      names = await fs.readdir(this.sessionsDir)
    } catch {
      return entries
    }
    for (const name of names) {
      if (!name.endsWith('.json')) continue
      try {
        const session = normalizeSession(JSON.parse(await fs.readFile(path.join(this.sessionsDir, name), 'utf8')))
        entries.push(summarize(session))
      } catch {
        // Skip a damaged conversation rather than failing the whole list.
      }
    }
    entries.sort(byUpdated)
    await this.writeIndex(entries)
    return entries
  }

  async writeIndex(sessions = this.index ?? []) {
    await this.atomicWrite(this.indexPath, JSON.stringify({ version: INDEX_VERSION, sessions }))
  }

  async readSettings() {
    try {
      const parsed = JSON.parse(await fs.readFile(this.settingsPath, 'utf8'))
      return {
        model: MODELS.has(parsed?.model) ? parsed.model : DEFAULT_SETTINGS.model,
        credentialMode: MODES.has(parsed?.credentialMode) ? parsed.credentialMode : DEFAULT_SETTINGS.credentialMode,
      }
    } catch {
      return { ...DEFAULT_SETTINGS }
    }
  }

  async atomicWrite(file, contents) {
    const temporary = `${file}.${process.pid}.${Date.now()}.tmp`
    await fs.writeFile(temporary, contents, 'utf8')
    await fs.rename(temporary, file)
  }

  async list() {
    return this.enqueue(async () => {
      await this.ensure()
      return this.index.map((item) => ({ ...item }))
    })
  }

  async get(id) {
    return this.enqueue(async () => {
      await this.ensure()
      if (!ID_RE.test(String(id))) throw new Error('invalid-session-id')
      try {
        const session = normalizeSession(JSON.parse(await fs.readFile(path.join(this.sessionsDir, `${id}.json`), 'utf8')))
        return session
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return null
        throw error
      }
    })
  }

  async save(raw) {
    return this.enqueue(async () => {
      await this.ensure()
      const session = normalizeSession(raw)
      const json = JSON.stringify(session)
      if (Buffer.byteLength(json, 'utf8') > MAX_SESSION_BYTES) throw new Error('session-too-large')
      await this.atomicWrite(path.join(this.sessionsDir, `${session.id}.json`), json)
      const summary = summarize(session)
      this.index = this.index.filter((item) => item.id !== session.id).concat(summary).sort(byUpdated)
      await this.writeIndex()
      return summary
    })
  }

  async remove(id) {
    return this.enqueue(async () => {
      await this.ensure()
      if (!ID_RE.test(String(id))) throw new Error('invalid-session-id')
      await fs.rm(path.join(this.sessionsDir, `${id}.json`), { force: true })
      this.index = this.index.filter((item) => item.id !== id)
      await this.writeIndex()
      return true
    })
  }

  async clear() {
    return this.enqueue(async () => {
      await this.ensure()
      let names = []
      try {
        names = await fs.readdir(this.sessionsDir)
      } catch {
        names = []
      }
      for (const name of names) {
        if (name.endsWith('.json')) await fs.rm(path.join(this.sessionsDir, name), { force: true })
      }
      this.index = []
      await this.writeIndex()
      return true
    })
  }

  async getSettings() {
    return this.enqueue(async () => {
      await this.ensure()
      return { ...this.settings }
    })
  }

  async saveSettings(patch) {
    return this.enqueue(async () => {
      await this.ensure()
      const next = {
        model: MODELS.has(patch?.model) ? patch.model : this.settings.model,
        credentialMode: MODES.has(patch?.credentialMode) ? patch.credentialMode : this.settings.credentialMode,
      }
      this.settings = next
      await this.atomicWrite(this.settingsPath, JSON.stringify(next))
      return { ...next }
    })
  }

  /**
   * Whether a conversation imported from the same website export already exists.
   * @param {string} remoteId
   */
  hasRemote(remoteId) {
    return this.index?.some((item) => item.remoteId === remoteId) ?? false
  }

  /**
   * Write a batch of imported conversations and publish the index once.
   * @param {object[]} sessions
   * @returns {Promise<{ imported: number, skipped: number }>}
   */
  async importMany(sessions) {
    return this.enqueue(async () => {
      await this.ensure()
      let imported = 0
      let skipped = 0
      const summaries = []
      for (const raw of sessions) {
        try {
          const session = normalizeSession(raw)
          if (session.remoteId && this.hasRemote(session.remoteId)) {
            skipped += 1
            continue
          }
          const json = JSON.stringify(session)
          if (Buffer.byteLength(json, 'utf8') > MAX_SESSION_BYTES) {
            skipped += 1
            continue
          }
          await this.atomicWrite(path.join(this.sessionsDir, `${session.id}.json`), json)
          summaries.push(summarize(session))
          imported += 1
        } catch {
          skipped += 1
        }
      }
      if (summaries.length > 0) {
        this.index = this.index
          .filter((item) => !summaries.some((summary) => summary.id === item.id))
          .concat(summaries)
          .sort(byUpdated)
        await this.writeIndex()
      }
      return { imported, skipped }
    })
  }
}
