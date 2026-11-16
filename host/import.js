/**
 * Import a DeepSeek website export ZIP (`deepseek_data-*.zip`) into the local
 * chat-mode store.
 *
 * The archive's active message branch becomes one local conversation. Search
 * and opened-link fragments become display blocks; Harness never re-sends
 * imported search payloads to the model. Conversations already imported from
 * the same website conversation id are skipped.
 */
import { randomUUID } from 'node:crypto'
import { openZip } from './zip.js'

const SUPPORTED_VERSION = 3
const MAX_IMPORT_BYTES = 256 * 1024 * 1024
const MAX_ENTRY_BYTES = 32 * 1024 * 1024
const MAX_SESSIONS = 200

/** @param {unknown} value */
const asText = (value, max = 200_000) => typeof value === 'string' ? value.slice(0, max) : ''

/** @param {unknown} value */
function parseTime(value) {
  if (typeof value !== 'string') return undefined
  const time = Date.parse(value)
  return Number.isSafeInteger(time) && time >= 0 ? time : undefined
}

/** Merge adjacent text or thinking fragments so rendering has fewer blocks. */
function pushBlock(blocks, block) {
  const last = blocks[blocks.length - 1]
  if (block.type === 'text' && last?.type === 'text') {
    last.text += block.text
    return
  }
  if (block.type === 'thinking' && last?.type === 'thinking') {
    last.thinking += block.thinking
    return
  }
  blocks.push(block)
}

/**
 * Convert one website conversation into a local conversation.
 * @param {Record<string, unknown>} file
 * @param {{ inserted_at?: string, updated_at?: string }} indexRow
 * @returns {object | null}
 */
export function convertConversation(file, indexRow) {
  if (file === null || typeof file !== 'object') return null
  const remoteId = asText(file.id, 200)
  if (!remoteId) return null
  const rawMessages = Array.isArray(file.messages) ? file.messages : []
  if (rawMessages.length === 0) return null
  /** @type {Map<number, Record<string, unknown>>} */
  const byId = new Map()
  let greatest = -1
  for (const message of rawMessages) {
    if (message === null || typeof message !== 'object') continue
    const id = Number(message.id)
    if (!Number.isSafeInteger(id) || id < 0) continue
    byId.set(id, message)
    if (id > greatest) greatest = id
  }
  if (byId.size === 0) return null
  const requested = Number(file.current_message_id)
  let current = Number.isSafeInteger(requested) && byId.has(requested) ? requested : greatest
  const chain = []
  const seen = new Set()
  while (Number.isSafeInteger(current) && byId.has(current) && !seen.has(current)) {
    seen.add(current)
    const message = byId.get(current)
    chain.push(message)
    const parent = message.parent_id
    current = typeof parent === 'number' && Number.isSafeInteger(parent) ? parent : -1
  }
  chain.reverse()
  if (chain.length === 0) return null

  const firstTime = parseTime(indexRow.inserted_at) ?? parseTime(chain[0].inserted_at) ?? Date.now()
  const lastTime = parseTime(indexRow.updated_at) ?? firstTime
  /** @type {object[]} */
  const messages = []
  /** @type {Record<string, unknown> | null} */
  let pendingUser = null

  for (const message of chain) {
    const role = message.role === 'ASSISTANT' ? 'assistant' : message.role === 'USER' ? 'user' : undefined
    if (!role) continue
    const fragments = Array.isArray(message.fragments) ? message.fragments : []
    if (role === 'user') {
      const parts = fragments
        .filter((fragment) => fragment?.type === 'REQUEST')
        .map((fragment) => asText(fragment.content))
        .filter(Boolean)
      const body = parts.join('\n').trim()
      pendingUser = {
        id: `u-${String(message.id)}`,
        role: 'user',
        createdAt: parseTime(message.inserted_at) ?? firstTime,
        blocks: body ? [{ type: 'text', text: body }] : [],
      }
      continue
    }

    const status = asText(message.status, 40).toUpperCase()
    if (status === 'CONTENT_FILTER') {
      // The website hides the question together with the withdrawn reply.
      pendingUser = null
      continue
    }
    /** @type {object[]} */
    const blocks = []
    for (const fragment of fragments) {
      switch (fragment?.type) {
        case 'THINK': {
          const thinking = asText(fragment.content)
          if (thinking) {
            pushBlock(blocks, {
              type: 'thinking',
              thinking,
              ...(typeof fragment.elapsed_secs === 'number' ? { elapsed: Math.max(0, fragment.elapsed_secs) } : {}),
            })
          }
          break
        }
        case 'RESPONSE': {
          const text = asText(fragment.content)
          if (text) pushBlock(blocks, { type: 'text', text })
          break
        }
        case 'TOOL_SEARCH': {
          const results = Array.isArray(fragment.results)
            ? fragment.results.slice(0, 20).flatMap((result) => {
              const url = asText(result?.url, 2_000)
              if (!url) return []
              return [{ title: asText(result?.title, 500) || url, url, snippet: asText(result?.snippet, 1_000) }]
            })
            : []
          if (results.length > 0) {
            pushBlock(blocks, {
              type: 'search',
              queries: Array.isArray(fragment.queries) ? fragment.queries.slice(0, 10).map((q) => asText(q, 300)) : [],
              results,
            })
          }
          break
        }
        case 'TOOL_OPEN': {
          const url = asText(fragment.url, 2_000)
          if (url) pushBlock(blocks, { type: 'open', url, title: asText(fragment.title, 500) || url })
          break
        }
        case 'READ_LINK': {
          const links = Array.isArray(fragment.results)
            ? fragment.results.slice(0, 20).flatMap((link) => {
              const url = asText(link?.url, 2_000)
              if (!url) return []
              return [{ url, title: asText(link?.title, 500) || url }]
            })
            : []
          if (links.length > 0) pushBlock(blocks, { type: 'links', links })
          break
        }
        default:
          break
      }
    }
    if (!pendingUser || pendingUser.blocks.length === 0) {
      pendingUser = null
      continue
    }
    if (blocks.length === 0) continue
    messages.push(pendingUser)
    messages.push({
      id: `a-${String(message.id)}`,
      role: 'assistant',
      createdAt: parseTime(message.inserted_at) ?? firstTime,
      status: 'done',
      blocks,
    })
    pendingUser = null
  }
  if (!messages.some((message) => message.role === 'user' && message.blocks.length > 0)) return null
  const question = messages.find((message) => message.role === 'user' && message.blocks.length > 0)
  const firstText = question?.blocks?.find((block) => block.type === 'text')?.text ?? ''
  const title = (asText(file.title, 200).trim() || firstText.trim().slice(0, 40)) || 'Imported chat'
  return {
    id: randomUUID(),
    remoteId,
    title,
    createdAt: firstTime,
    updatedAt: lastTime,
    model: 'deepseek-flash',
    thinking: false,
    search: false,
    messages,
  }
}

/**
 * Import selected conversations from an export archive.
 * @param {{ buffer: Buffer, store: import('./store.js').ChatStore, maxSessions?: number }} options
 * @returns {Promise<{ imported: number, skipped: number, total: number, selected: number }>}
 */
export async function importDeepSeekZip({ buffer, store, maxSessions = MAX_SESSIONS }) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) throw new Error('empty-archive')
  if (buffer.length > MAX_IMPORT_BYTES) throw new Error('archive-too-large')
  const zip = openZip(buffer, { maxEntryBytes: MAX_ENTRY_BYTES, maxEntries: 20_000 })
  if (!zip.has('manifest.json')) throw new Error('missing-manifest')
  let manifest
  try {
    manifest = JSON.parse(zip.read('manifest.json').toString('utf8'))
  } catch {
    throw new Error('missing-manifest')
  }
  if (Number(manifest?.export_format_version) !== SUPPORTED_VERSION) throw new Error('unsupported-version')
  if (!zip.has('chat_session_index.json')) throw new Error('missing-index')
  let parsedIndex
  try {
    parsedIndex = JSON.parse(zip.read('chat_session_index.json').toString('utf8'))
  } catch {
    throw new Error('missing-index')
  }
  const index = Array.isArray(parsedIndex)
    ? parsedIndex
    : Array.isArray(parsedIndex?.chat_sessions)
      ? parsedIndex.chat_sessions
      : null
  if (index === null) throw new Error('missing-index')
  const rows = index
    .filter((row) => row && typeof row.id === 'string' && row.id.length > 0)
    .map((row) => ({
      id: row.id,
      inserted: parseTime(row.inserted_at) ?? 0,
      updated: parseTime(row.updated_at) ?? parseTime(row.inserted_at) ?? 0,
    }))
    .sort((a, b) => b.updated - a.updated)
  if (rows.length === 0) throw new Error('no-conversations')

  // Ensure the store index is loaded before deduplicating by remote id.
  await store.list()
  const chosen = rows.slice(0, Math.max(1, maxSessions))
  const sessions = []
  let skipped = 0
  for (const row of chosen) {
    if (store.hasRemote(row.id)) {
      skipped += 1
      continue
    }
    const entry = `chat_sessions/${row.id}.json`
    if (!zip.has(entry)) {
      skipped += 1
      continue
    }
    try {
      const file = JSON.parse(zip.read(entry).toString('utf8'))
      const session = convertConversation(file, { inserted_at: new Date(row.inserted).toISOString(), updated_at: new Date(row.updated).toISOString() })
      if (!session) {
        skipped += 1
        continue
      }
      sessions.push(session)
    } catch {
      skipped += 1
    }
  }
  const result = await store.importMany(sessions)
  return {
    imported: result.imported,
    skipped: skipped + result.skipped,
    total: rows.length,
    selected: chosen.length,
  }
}
