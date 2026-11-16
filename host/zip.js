/**
 * Minimal ZIP reader for DeepSeek chat exports.
 *
 * Reads the central directory, then inflates only requested entries with
 * `node:zlib`. Stored and deflated entries are supported; ZIP64, encryption,
 * and other compression methods are refused. Every entry is bounded so a
 * crafted archive cannot inflate without a limit.
 */
import { inflateRawSync } from 'node:zlib'

const EOCD = 0x06054b50
const CENTRAL = 0x02014b50
const LOCAL = 0x04034b50

const normalizeName = (name) => name.replace(/\\/g, '/').replace(/^\.\//, '')

/**
 * Open a ZIP archive held in memory.
 * @param {Buffer} buffer
 * @param {{ maxEntryBytes?: number, maxEntries?: number }} [limits]
 */
export function openZip(buffer, limits = {}) {
  const maxEntryBytes = limits.maxEntryBytes ?? 64 * 1024 * 1024
  const maxEntries = limits.maxEntries ?? 5_000
  if (!Buffer.isBuffer(buffer) || buffer.length < 22) throw new Error('zip-unreadable')
  let eocd = -1
  const floor = Math.max(0, buffer.length - 22 - 0xffff)
  for (let index = buffer.length - 22; index >= floor; index -= 1) {
    if (buffer.readUInt32LE(index) === EOCD) {
      eocd = index
      break
    }
  }
  if (eocd < 0) throw new Error('zip-unreadable')
  const count = buffer.readUInt16LE(eocd + 10)
  const directorySize = buffer.readUInt32LE(eocd + 12)
  const directoryOffset = buffer.readUInt32LE(eocd + 16)
  if (count === 0xffff || directoryOffset === 0xffffffff || directorySize === 0xffffffff) throw new Error('zip64-unsupported')
  if (count > maxEntries) throw new Error('zip-too-many-entries')
  if (directoryOffset + directorySize > buffer.length) throw new Error('zip-unreadable')

  const entries = new Map()
  let cursor = directoryOffset
  for (let index = 0; index < count; index += 1) {
    if (cursor + 46 > buffer.length || buffer.readUInt32LE(cursor) !== CENTRAL) throw new Error('zip-unreadable')
    const flags = buffer.readUInt16LE(cursor + 8)
    const method = buffer.readUInt16LE(cursor + 10)
    const compressedSize = buffer.readUInt32LE(cursor + 20)
    const uncompressedSize = buffer.readUInt32LE(cursor + 24)
    const nameLength = buffer.readUInt16LE(cursor + 28)
    const extraLength = buffer.readUInt16LE(cursor + 30)
    const commentLength = buffer.readUInt16LE(cursor + 32)
    const localOffset = buffer.readUInt32LE(cursor + 42)
    if (cursor + 46 + nameLength > buffer.length) throw new Error('zip-unreadable')
    const name = normalizeName(buffer.toString('utf8', cursor + 46, cursor + 46 + nameLength))
    if ((flags & 0x1) !== 0) throw new Error('zip-encrypted')
    if (method !== 0 && method !== 8) throw new Error('zip-method-unsupported')
    if (!entries.has(name)) {
      entries.set(name, { name, method, compressedSize, uncompressedSize, localOffset })
    }
    cursor += 46 + nameLength + extraLength + commentLength
  }

  /**
   * Read one entry, bounded by the configured uncompressed entry size.
   * @param {string} name
   * @returns {Buffer}
   */
  function read(name) {
    const entry = entries.get(normalizeName(name))
    if (!entry) throw new Error('zip-entry-missing')
    if (entry.uncompressedSize > maxEntryBytes) throw new Error('zip-entry-too-large')
    const offset = entry.localOffset
    if (offset + 30 > buffer.length || buffer.readUInt32LE(offset) !== LOCAL) throw new Error('zip-unreadable')
    const nameLength = buffer.readUInt16LE(offset + 26)
    const extraLength = buffer.readUInt16LE(offset + 28)
    const start = offset + 30 + nameLength + extraLength
    const end = start + entry.compressedSize
    if (end > buffer.length) throw new Error('zip-unreadable')
    const data = buffer.subarray(start, end)
    if (entry.method === 0) {
      if (data.length > maxEntryBytes) throw new Error('zip-entry-too-large')
      return Buffer.from(data)
    }
    try {
      return inflateRawSync(data, { maxOutputLength: maxEntryBytes })
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_BUFFER_TOO_LARGE') {
        throw new Error('zip-entry-too-large')
      }
      throw new Error('zip-inflate-failed')
    }
  }

  return {
    names: () => [...entries.keys()],
    has: (name) => entries.has(normalizeName(name)),
    read,
  }
}
