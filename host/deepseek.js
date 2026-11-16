/**
 * Official DeepSeek Messages API (Anthropic-compatible) transport.
 *
 * Chat mode is intentionally stateless on the API side: every request carries
 * the local conversation so no server-side chat session, tool, or file state
 * is created. The only server tools are DeepSeek's own search and link reader.
 */
const MESSAGES_URL = 'https://api.deepseek.com/anthropic/v1/messages'
const MODELS_URL = 'https://api.deepseek.com/models'
const MODELS = new Set(['deepseek-flash', 'deepseek-v4-pro'])
const MAX_MESSAGES = 200
const MAX_TOTAL_CHARS = 400_000
const SYSTEM_PROMPT = '该助手为DeepSeek，由深度求索公司创造。'

/** Headers shared by both credential kinds. */
const baseHeaders = {
  'content-type': 'application/json',
  accept: 'text/event-stream',
}

/**
 * Validate and rebuild the outbound request body from a small allowlist.
 * @param {Record<string, unknown>} input
 */
export function buildRequestBody(input) {
  const model = MODELS.has(/** @type {string} */ (input.model)) ? input.model : 'deepseek-flash'
  const rawMessages = Array.isArray(input.messages) ? input.messages : []
  if (rawMessages.length === 0) throw new Error('empty-messages')
  if (rawMessages.length > MAX_MESSAGES) throw new Error('too-many-messages')
  let total = 0
  const messages = rawMessages.map((raw) => {
    if (raw === null || typeof raw !== 'object') throw new Error('invalid-message')
    const message = /** @type {Record<string, unknown>} */ (raw)
    const role = message.role === 'assistant' ? 'assistant' : message.role === 'user' ? 'user' : undefined
    const content = typeof message.content === 'string' ? message.content : ''
    if (!role) throw new Error('invalid-role')
    if (!content.trim()) throw new Error('empty-message')
    total += content.length
    return { role, content }
  })
  if (total > MAX_TOTAL_CHARS) throw new Error('conversation-too-long')
  const thinking = input.thinking === true
  const search = input.search === true
  const tools = [{ type: 'deepseek_read_url', name: 'deepseek_read_url' }]
  if (search) tools.push({ type: 'deepseek_web_search', name: 'deepseek_web_search' })
  return {
    model,
    system: SYSTEM_PROMPT,
    messages,
    thinking: { type: thinking ? 'enabled' : 'disabled' },
    safety_check: { level: 'high' },
    tools,
    ...(input.title === true ? { title: { enabled: true } } : {}),
    stream: true,
  }
}

/**
 * Forward one streaming request to the official endpoint.
 * @param {{ kind: 'account', token: string } | { kind: 'api-key', key: string }} credential
 * @param {Record<string, unknown>} input
 * @param {AbortSignal} signal
 * @returns {Promise<Response>}
 */
export function proxyMessages(credential, input, signal) {
  const body = buildRequestBody(input)
  const headers = {
    ...baseHeaders,
    ...(credential.kind === 'account'
      ? { 'x-dsh-auth-token': credential.token }
      : { 'x-api-key': credential.key }),
  }
  return fetch(MESSAGES_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  })
}

/**
 * Check an API key without spending model tokens.
 * @param {string} key
 * @returns {Promise<{ ok: true } | { ok: false, status: number, message: string }>}
 */
export async function validateApiKey(key) {
  let response
  try {
    response = await fetch(MODELS_URL, {
      headers: { authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(20_000),
    })
  } catch (error) {
    return { ok: false, status: 0, message: error instanceof Error ? error.message : String(error) }
  }
  if (response.ok) return { ok: true }
  let message = `HTTP ${response.status}`
  try {
    const text = await response.text()
    if (text.trim()) message = text.slice(0, 500)
  } catch {
    // Keep the status-only message.
  }
  return { ok: false, status: response.status, message }
}

/** Endpoint and model constants shared with the route layer. */
export const DEEPSEEK = { MESSAGES_URL, MODELS_URL, MODELS }
