import Discord from '../discord'
import { Bot, createBot as mineflayerCreateBot } from 'mineflayer'
import Dev from '../utils/Dev'
import { readdirSync } from 'fs'
import { join } from 'path'
import { FullEmbed } from '../utils/Embed'
import { inlineCode } from 'discord.js'
import { setTimeout as sleep } from 'timers/promises'

export default class Minecraft {
  public readonly discord: Discord
  private readonly queue: Array<CommandToRun> = []
  private looping = false
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

  public execute(fullCommand: CommandToRun, log: ReturnType<typeof this.discord.log.create>) {
    let command = fullCommand.command.trim()
    if (!command.startsWith('/')) command = '/' + command

    if (command.length > 256) {
      const warningMessage = `Command ${command} length is greater than 256, truncating`
      log?.add('error', warningMessage) ?? this.discord.log.sendErrorLog(Error(warningMessage))
      command = command.slice(0, 256)
    }

    this.queue.push(fullCommand)
    const logMessage = `${inlineCode(command)} added to command queue - current position: ${inlineCode(this.queue.length.toString())}`
    log?.add('command', logMessage) ?? this.discord.log.sendSingleLog('command', logMessage)

    console.log(this.looping)

    this.loop()
  }

  public priorityExecute(command: string) {
    this.queue.unshift({ command })
    this.loop()
  }

  public async loop(): Promise<unknown> {
    if (this.looping) return
    if (!this.queue.length || !this.loggedIn) return (this.looping = false)

    try {
      this.looping = true

      const currentCommand = this.queue.shift()

      if (!currentCommand) return

      const { command, regex, noResponse } = currentCommand

      this.discord.log.sendSingleLog('command', `Running ${inlineCode(command)}`)
      this.bot.chat(command)

      if (regex?.length) {
        const response = await Promise.race([this.bot.awaitMessage(...regex.map(({ exp }) => exp)), sleep(10 * 1000)]) // Either we get a valid response after 10 seconds or we reject

        if (response) {
          for (const { exp, exec } of regex) {
            const match = response.match(exp)

            if (!match) continue

            return exec(match)
          }
        } else {
          if (noResponse) return noResponse()
        }
      }
    } finally {
      // await sleep(500)
      this.looping = false
      this.loop()
    }
  }
}

interface CommandToRun {
  command: string
  regex?: Array<ChatTrigger>
  noResponse?: () => unknown,
}

export type ChatTrigger = { exp: RegExp; exec: (reason: RegExpMatchArray) => unknown }
