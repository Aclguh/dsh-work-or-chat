/**
 * Credential resolution for chat mode.
 *
 * Order for `auto`: the signed-in DeepSeek account grant used by the Harness
 * account model route, then an API key stored by this plugin, then the
 * `DEEPSEEK_API_KEY` credential reference. `account` and `api-key` pin one
 * source. Secrets never leave the Host or reach the browser.
 */
const MESSAGES_URL = 'https://api.deepseek.com/anthropic/v1/messages'
const API_KEY_RECORD = 'dsh-work-or-chat/api-key'

/** Runtime shape of a resolved credential. */
/** @typedef {{ kind: 'account', token: string } | { kind: 'api-key', key: string, source: 'plugin' | 'env' } | { kind: 'none' }} Resolved */

export class Credentials {
  /** @param {import('@deepseek-ai/cordis').Context} ctx */
  constructor(ctx) {
    this.ctx = ctx
  }

  /** @returns {Promise<string | undefined>} */
  async accountToken() {
    const account = this.ctx.get('deepseekAccount')
    if (!account || typeof account.resolveToken !== 'function') return undefined
    try {
      const token = await account.resolveToken(MESSAGES_URL)
      return typeof token === 'string' && token.length > 0 ? token : undefined
    } catch {
      return undefined
    }
  }

  /** @returns {Promise<string | undefined>} */
  async pluginKey() {
    try {
      const record = await this.ctx.credentials.readRecord(API_KEY_RECORD)
      const key = record?.kind === 'grant' ? record.payload?.key : undefined
      return typeof key === 'string' && key.trim().length > 0 ? key.trim() : undefined
    } catch {
      return undefined
    }
  }

  /** @returns {Promise<string | undefined>} */
  async environmentKey() {
    try {
      const hit = await this.ctx.credentials.resolve('DEEPSEEK_API_KEY')
      const key = hit?.value
      return typeof key === 'string' && key.trim().length > 0 ? key.trim() : undefined
    } catch {
      return undefined
    }
  }

  /**
   * Resolve the credential used for the next request.
   * @param {'auto' | 'account' | 'api-key'} mode
   * @returns {Promise<Resolved>}
   */
  async resolve(mode) {
    if (mode !== 'api-key') {
      const token = await this.accountToken()
      if (token) return { kind: 'account', token }
    }
    if (mode !== 'account') {
      const key = await this.pluginKey()
      if (key) return { kind: 'api-key', key, source: 'plugin' }
      const env = await this.environmentKey()
      if (env) return { kind: 'api-key', key: env, source: 'env' }
    }
    return { kind: 'none' }
  }

  /**
   * Browser-safe description of what is available and what the mode selects.
   * @param {'auto' | 'account' | 'api-key'} mode
   */
  async describe(mode) {
    const [accountToken, pluginKey, environmentKey] = await Promise.all([
      this.accountToken(), this.pluginKey(), this.environmentKey(),
    ])
    let active = { kind: 'none', source: 'none' }
    if (mode !== 'api-key' && accountToken) active = { kind: 'account', source: 'account' }
    else if (mode !== 'account' && pluginKey) active = { kind: 'api-key', source: 'plugin' }
    else if (mode !== 'account' && environmentKey) active = { kind: 'api-key', source: 'env' }
    return {
      ...active,
      available: { account: Boolean(accountToken), pluginKey: Boolean(pluginKey), environmentKey: Boolean(environmentKey) },
    }
  }

  /** @param {string} key */
  async setApiKey(key) {
    await this.ctx.credentials.modifyRecord(API_KEY_RECORD, async () => ({
      kind: 'grant', payload: { key },
    }))
  }

  async clearApiKey() {
    await this.ctx.credentials.deleteRecord(API_KEY_RECORD)
  }
}
