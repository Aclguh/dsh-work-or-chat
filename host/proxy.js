/**
 * Raw proxy for the official chat-demo client.
 *
 * The demo sends the same Anthropic-compatible Messages / Files requests and
 * speech requests that it would send to api.deepseek.com. The Host half keeps
 * the credential server-side and injects it here, so the iframe never receives
 * the DSH account token or API key.
 */
const UPSTREAM = 'https://api.deepseek.com'
const MAX_BODY_BYTES = 64 * 1024 * 1024

const errorResponse = (message, status = 401) => new Response(JSON.stringify({
  error: { message },
}), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
})

const forwardedResponseHeaders = [
  'content-type',
  'content-length',
  'content-disposition',
  'cache-control',
  'etag',
  'last-modified',
]

/**
 * @param {Request} request
 * @param {Buffer | undefined} body
 */
async function upstreamRequest(request, suffix, credential, body) {
  const headers = new Headers()
  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  const accept = request.headers.get('accept')
  if (accept) headers.set('accept', accept)
  const beta = request.headers.get('anthropic-beta')
  if (beta) headers.set('anthropic-beta', beta)

  const speech = suffix.startsWith('/v1/tools/')
  if (credential.kind === 'account') {
    headers.set('x-dsh-auth-token', credential.token)
    if (speech) headers.set('authorization', `Bearer ${credential.token}`)
  } else {
    headers.set('x-api-key', credential.key)
    headers.set('authorization', `Bearer ${credential.key}`)
  }

  return fetch(`${UPSTREAM}${suffix}`, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : body,
    signal: request.signal,
  })
}

/**
 * @param {{ store: import('./store.js').ChatStore, credentials: import('./credentials.js').Credentials, log: (message: string, error?: unknown) => void }} deps
 * @param {string} suffix upstream path beginning with /
 * @param {Request} request
 */
export async function proxyDemoRequest(deps, suffix, request) {
  let credential
  try {
    if (suffix.startsWith('/v1/tools/')) {
      // ASR/TTS are API-key endpoints; the DSH account grant is not accepted.
      const key = (await deps.credentials.pluginKey()) ?? (await deps.credentials.environmentKey())
      credential = key ? { kind: 'api-key', key, source: 'plugin' } : { kind: 'none' }
    } else {
      const settings = await deps.store.getSettings()
      credential = await deps.credentials.resolve(settings.credentialMode)
    }
  } catch (error) {
    deps.log('credential resolution failed', error)
    return errorResponse('No DeepSeek credential is available.', 401)
  }
  if (credential.kind === 'none') {
    return errorResponse('No DeepSeek credential is available.', 401)
  }

  let body
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      const declared = Number(request.headers.get('content-length') ?? '0')
      if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
        return errorResponse('Request body is too large.', 413)
      }
      body = Buffer.from(await request.arrayBuffer())
      if (body.byteLength > MAX_BODY_BYTES) {
        return errorResponse('Request body is too large.', 413)
      }
    } catch (error) {
      deps.log('request body read failed', error)
      return errorResponse('Request body could not be read.', 400)
    }
  }

  let upstream
  try {
    upstream = await upstreamRequest(request, suffix, credential, body)
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 })
    deps.log(`upstream ${suffix} failed`, error)
    return errorResponse(error instanceof Error ? error.message : String(error), 502)
  }

  const headers = new Headers()
  for (const name of forwardedResponseHeaders) {
    const value = upstream.headers.get(name)
    if (value) headers.set(name, value)
  }
  headers.set('cache-control', 'no-store')
  headers.set('x-content-type-options', 'nosniff')
  return new Response(upstream.body, { status: upstream.status, headers })
}

export { UPSTREAM }
