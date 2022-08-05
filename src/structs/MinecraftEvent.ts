import { BotEvents } from 'mineflayer'
import Minecraft from '../minecraft'

export default interface DiscordEvent<K extends keyof BotEvents> {
  name: K
  once: boolean

  execute(minecraft: Minecraft, ...args: Parameters<BotEvents[K]>): Promise<unknown>
}
