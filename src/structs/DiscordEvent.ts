import { ClientEvents } from 'discord.js'
import Discord from '../discord'

export default interface DiscordEvent<K extends keyof ClientEvents> {
  name: K
  once: boolean

  execute(discord: Discord, ...args: ClientEvents[K]): Promise<unknown>
}
