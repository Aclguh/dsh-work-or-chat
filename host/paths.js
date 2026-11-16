/** Filesystem locations owned by the work-or-chat plugin. */
import { homedir } from 'node:os'
import path from 'node:path'

/**
 * Directory holding local chat-mode conversations and settings.
 * @returns absolute path below the Harness home.
 */
export function dataRoot() {
  const home = process.env.DSH_HOME || path.join(homedir(), '.dsh')
  return path.join(home, 'work-or-chat')
}
