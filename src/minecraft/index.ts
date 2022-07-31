import Discord from '../discord'
import { Bot, createBot as mineflayerCreateBot } from 'mineflayer'
import Dev from '../utils/Dev'
import { readdirSync } from 'fs'
import { join } from 'path'
import Event from '../structs/MinecraftEvent'

export default class Minecraft {
  public readonly discord: Discord
  private bot: Bot

  constructor(discord: Discord) {
    this.discord = discord

    this.bot = this.createBot()
  }

  private createBot() {
    const bot = mineflayerCreateBot({
      viewDistance: 'tiny',
      chatLengthLimit: 256,
      auth: Dev ? undefined : 'microsoft',
      username: 'Bridge',
      defaultChatPatterns: false,
      host: Dev ? 'localhost' : 'mc.hypixel.io',
      profilesFolder: './.minecraft/profiles'
    })

    this.registerEvents(bot)

    return bot
  }

  private async registerEvents(bot: Bot) {
    let c = 0
    for (const path of readdirSync(join(__dirname, 'events')).map(fileName => join(__dirname, 'events', fileName))) {
      const event: Event<any> = (await import(path)).default
      bot[event.once ? 'once' : 'on'](event.name, (...args: any) => event.execute(this, ...args))
      c++
    }
    console.log(`${c} Minecraft events loaded`)
  }

  public refreshBot() {
    this.bot = this.createBot()
  }

  public execute(command: string) {
    command = command.trim()
    if (!command.startsWith('/')) {
      command = '/' + command
      console.warn(`Command "${command}" ran without leading slash`)
    }

    if (command.length > 256) {
      console.warn(`Command ${command} length is greater than 256, truncating`)
      command = command.slice(0, 256)
    }

    return this.bot.chat(command)
  }
}
