/**
 * Static file route registration for the bundled chat-demo build.
 *
 * The demo is an iframe of the official chat-demo build. Every emitted file is
 * registered as an exact owner-only route so the iframe and its dynamic chunks
 * stay on the same origin as the Harness page (and therefore share its cookie
 * and IndexedDB origin).
 */
import { readFile } from 'node:fs/promises'
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const DEMO_PREFIX = '/api/work-or-chat/demo'

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

function walk(root) {
  const result = []
  const visit = (directory, relative = '') => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const nextRelative = relative ? `${relative}/${entry.name}` : entry.name
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        visit(absolute, nextRelative)
      } else if (entry.isFile()) {
        result.push({ relative: nextRelative, absolute, size: statSync(absolute).size })
      }
    }
  }
  visit(root)
  return result
}

/**
 * Register one exact GET/HEAD route per emitted file.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {string} root absolute path of the demo build
 */
export function registerDemoRoutes(ctx, root) {
  const files = walk(root)
  const byRelative = new Map(files.map((file) => [file.relative, file]))
  const cache = new Map()

  const handlerFor = (relative) => async (request) => {
    let file = cache.get(relative)
    if (!file) {
      const info = byRelative.get(relative)
      if (!info) return new Response('Not found', { status: 404 })
      file = { ...info, data: await readFile(info.absolute) }
      cache.set(relative, file)
    }
    return new Response(request.method === 'HEAD' ? null : file.data, {
      status: 200,
      headers: {
        'content-type': contentType(file.absolute),
        'content-length': String(file.data.byteLength),
        'cache-control': file.relative.startsWith('static/')
          ? 'public, max-age=31536000, immutable'
          : 'no-store',
        'x-content-type-options': 'nosniff',
      },
    })
  }

  const disposers = []
  const register = (routePath, relative) => {
    disposers.push(ctx.connection.fetch.register({
      path: routePath,
      methods: ['GET', 'HEAD'],
      fetch: handlerFor(relative),
    }))
  }

  for (const file of files) {
    register(`${DEMO_PREFIX}/${file.relative}`, file.relative)
  }
  register(DEMO_PREFIX, 'index.html')
  return disposers
}

export { DEMO_PREFIX }
