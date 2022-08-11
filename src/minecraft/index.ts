import Discord from '../discord'
import { Bot, createBot as mineflayerCreateBot } from 'mineflayer'
import Dev from '../utils/Dev'
import { readdirSync } from 'fs'
import { join } from 'path'
import { FullEmbed } from '../utils/Embed'
import { inlineCode } from 'discord.js'

export default class Minecraft {
  public readonly discord: Discord
  private bot: Bot
  public lastStatusMessage: 'logout' | 'login' = 'logout'
  public relogAttempts = 0
  public loggedIn = false

  constructor(discord: Discord) {
    this.discord = discord

    this.bot = this.createBot()
  }

  public get username() {
    return this.bot.username
  }

  public get version() {
    return this.bot.version
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
      const event = (await import(path)).default
      bot[event.once ? 'once' : 'on'](event.name, (...args: never[]) => event.execute(this, ...args))
      c++
    }
    this.discord.log.sendSingleLog('info', `${inlineCode(c.toString())} Minecraft events loaded`)
  }

  public refreshBot() {
    const delay = this.relogAttempts < 24 ? ++this.relogAttempts * 5 : 24

    this.discord.log.sendSingleLog('info', `Minecraft bot disconnected from the server! Relogging in ${inlineCode(delay.toString())} seconds.`)

    if (this.lastStatusMessage == 'login') {
      this.lastStatusMessage = 'logout'
      this.discord.sendEmbed(
        FullEmbed('failure', {
          author: {
            name: 'Chat Bridge is Offline'
          },
          description: [`I have been kicked from the server, attempting to reconnect`, `Last login: <t:${Math.floor(Date.now() / 1000)}:R>`].join('\n')
        }),
        'both'
      )
    }

    setTimeout(() => {
      this.bot = this.createBot()
    }, delay * 1000)
  }

  public execute(command: string, log?: ReturnType<typeof this.discord.log.create>) {
    command = command.trim()
    if (!command.startsWith('/')) {
      command = '/' + command
    }

    if (command.length > 256) {
      this.discord.log.sendErrorLog(Error(`Command ${command} length is greater than 256, truncating`))
      command = command.slice(0, 256)
    }

    log?.add('command', `${inlineCode(command)}`)

    return this.bot.chat(command)
  }
}
