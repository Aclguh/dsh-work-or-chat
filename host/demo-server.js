/**
 * Local asset + API server for the bundled chat-demo app.
 *
 * The demo is served from 127.0.0.1 on a stable port. Keeping a fixed port keeps
 * the demo's own IndexedDB (history, drafts, settings) on a stable origin, while
 * the iframe remains isolated from the Harness page's CSS and React tree.
 *
 * `/api/*` is proxied to api.deepseek.com with the Host plugin's credential;
 * the browser never receives the DSH account token or API key. A per-process
 * random token protects the local proxy from other localhost pages.
 */
import http from 'node:http'
import crypto from 'node:crypto'
import { closeSync, mkdirSync, openSync, readSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { dataRoot } from './paths.js'
import { proxyDemoRequest } from './proxy.js'

const START_PORT = 24210
const PORT_RETRIES = 60
const PORT_RETRY_DELAY = 500
const MAX_BODY_BYTES = 64 * 1024 * 1024
const PORT_FILE = 'demo-server.json'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
}

const contentType = (file) => MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream'

const writePort = (port) => {
  try {
    mkdirSync(dataRoot(), { recursive: true })
    writeFileSync(path.join(dataRoot(), PORT_FILE), JSON.stringify({ port }), 'utf8')
  } catch {
    // The port preference is only an optimization for a stable storage origin.
  }
}

const readBody = (req) => new Promise((resolve, reject) => {
  const chunks = []
  let total = 0
  req.on('data', (chunk) => {
    total += chunk.length
    if (total > MAX_BODY_BYTES) {
      reject(new Error('request-too-large'))
      req.destroy()
      return
    }
    chunks.push(chunk)
  })
  req.on('end', () => resolve(Buffer.concat(chunks)))
  req.on('error', reject)
})

const writeResponse = async (res, response) => {
  const headers = {}
  for (const [name, value] of response.headers) headers[name] = value
  res.writeHead(response.status, headers)
  if (!response.body) {
    res.end()
    return
  }
  try {
    for await (const chunk of response.body) {
      res.write(Buffer.from(chunk))
    }
    res.end()
  } catch {
    res.destroy()
  }
}

const jsonError = (res, status, message) => {
  const body = Buffer.from(JSON.stringify({ error: { message } }))
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': String(body.byteLength),
    'cache-control': 'no-store',
  })
  res.end(body)
}

/**
 * @param {{
 *   root: string,
 *   store: import('./store.js').ChatStore,
 *   credentials: import('./credentials.js').Credentials,
 *   log: (message: string, error?: unknown) => void,
 * }} options
 */
export function startDemoServer({ root, store, credentials, log }) {
  const token = crypto.randomBytes(24).toString('hex')
  const files = new Map()
  const walk = (directory, relative = '') => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const next = relative ? `${relative}/${entry.name}` : entry.name
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        walk(absolute, next)
      } else if (entry.isFile()) {
        files.set(next, { absolute, size: statSync(absolute).size })
      }
    }
  }
  walk(root)

  const serveFile = (res, relative, headOnly) => {
    const info = files.get(relative)
    if (!info) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('Not found')
      return
    }
    res.writeHead(200, {
      'content-type': contentType(info.absolute),
      'content-length': String(info.size),
      'cache-control': relative.startsWith('static/')
        ? 'public, max-age=31536000, immutable'
        : 'no-store',
      'x-content-type-options': 'nosniff',
    })
    if (headOnly) {
      res.end()
      return
    }
    const fd = openSync(info.absolute, 'r')
    // Stream the file in chunks so the 3+ MB font assets are not duplicated in
    // a single Buffer per request.
    const buffer = Buffer.allocUnsafe(64 * 1024)
    try {
      for (;;) {
        const bytes = readSync(fd, buffer, 0, buffer.length, null)
        if (bytes <= 0) break
        res.write(Buffer.from(buffer.subarray(0, bytes)))
      }
    } finally {
      closeSync(fd)
      res.end()
    }
  }

  const handler = async (req, res) => {
    let url
    try {
      url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`)
    } catch {
      res.writeHead(400)
      res.end()
      return
    }

    if (url.pathname.startsWith('/api/')) {
      if (req.headers['x-dsh-demo-token'] !== token) {
        jsonError(res, 401, 'Invalid demo session token.')
        return
      }
      let body
      try {
        body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await readBody(req)
      } catch (error) {
        jsonError(res, 413, error instanceof Error ? error.message : String(error))
        return
      }
      const suffix = url.pathname.slice('/api'.length)
      const headers = new Headers()
      for (const name of ['content-type', 'accept', 'anthropic-beta']) {
        const value = req.headers[name]
        if (typeof value === 'string') headers.set(name, value)
      }
      const request = new Request(`http://127.0.0.1:${port}${url.pathname}`, {
        method: req.method,
        headers,
        body,
      })
      try {
        const response = await proxyDemoRequest({ store, credentials, log }, suffix, request)
        await writeResponse(res, response)
      } catch (error) {
        log('demo proxy failed', error)
        jsonError(res, 502, error instanceof Error ? error.message : String(error))
      }
      return
    }

    const pathname = decodeURIComponent(url.pathname)
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
    if (relative.includes('..') || relative.includes('\0')) {
      res.writeHead(400)
      res.end()
      return
    }
    serveFile(res, relative, req.method === 'HEAD')
  }

  const port = START_PORT
  let server
  let resolveReady
  const ready = new Promise((resolve) => { resolveReady = resolve })
  let attempts = 0

  const listen = () => {
    server = http.createServer((req, res) => {
      handler(req, res).catch((error) => {
        log('demo server request failed', error)
        if (!res.headersSent) jsonError(res, 500, 'Demo server error.')
        else res.destroy()
      })
    })
    server.on('error', (error) => {
      if (error?.code === 'EADDRINUSE' && attempts < PORT_RETRIES) {
        attempts += 1
        setTimeout(() => {
          server?.close()
          listen()
        }, PORT_RETRY_DELAY)
        return
      }
      log('demo server failed to listen', error)
      resolveReady(null)
    })
    server.listen(port, '127.0.0.1', () => {
      writePort(port)
      resolveReady({
        url: `http://127.0.0.1:${port}`,
        token,
        close: () => new Promise((resolve) => {
          server.closeAllConnections?.()
          server.close(() => resolve())
        }),
      })
    })
  }
  listen()

  return ready
}

export { START_PORT }
