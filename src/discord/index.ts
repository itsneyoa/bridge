import { APIEmbed, Client, MessageOptions } from 'discord.js'
import { readdirSync } from 'fs'
import { join } from 'path'
import Command from '../structs/DiscordCommand'
import Dev from '../utils/Dev'
import Config from '../utils/Config'
import Minecraft from '../minecraft'
import Chat from '../structs/Chat'
import createLogger from '../structs/Logger'

export default class Discord {
  private readonly client: Client<true>
  public readonly log = createLogger(this)
  public minecraft: Minecraft
  public readonly config: Config
  public commands = new Map<string, Command>()

  get user() {
    return this.client.user
  }

  private constructor(client: Client<true>, config: Config) {
    this.client = client
    this.config = config
    this.minecraft = new Minecraft(this)
  }

  public static async create(): Promise<Discord> {
    const config = new Config()

    return new Promise((res, rej) => {
      const client = new Client({ intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildWebhooks'] })

      client.login(config.token).catch(err => {
        console.error(err)
        rej(err)
      })

      client.once('ready', async client => {
        const discord = new this(client, config)

        await discord.registerEvents()
        await discord.loadCommands()
        await discord.publishCommands()

        discord.log.sendSingleLog('discord', `Ready, logged in as \`${client.user.tag}\``)
        res(discord)
      })
    })
  }

  private async registerEvents() {
    let c = 0
    for (const path of readdirSync(join(__dirname, 'events')).map(fileName => join(__dirname, 'events', fileName))) {
      const event = (await import(path)).default
      this.client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(this, ...args))
      c++
    }
    this.log.sendSingleLog('discord', `\`${c}\` events loaded`)
  }

  public async loadCommands() {
    this.commands.clear()
    let c = 0
    for (const path of readdirSync(join(__dirname, 'commands')).map(fileName => join(__dirname, 'commands', fileName))) {
      delete require.cache[path]
      const command: Command = (await import(path)).default
      if (Dev) command.description += ' (Dev)'
      this.commands.set(command.name, command)
      c++
    }
    this.log.sendSingleLog('discord', `\`${c}\` commands loaded`)
    return c
  }

  public async publishCommands() {
    // This can be made much better lmao
    if (Dev && process.env['DEV_SERVER_ID']) {
      return await this.client.application.commands.set([...this.commands.values()], process.env['DEV_SERVER_ID'])
    } else {
      return await this.client.application.commands.set([...this.commands.values()])
    }
  }

  private async sendToChannel(content: MessageOptions, destination: string) {
    const channel = this.client.channels.cache.get(destination) ?? (await this.client.channels.fetch(destination))

    if (channel?.isTextBased()) {
      return await channel.send({ ...content, ...{ allowedMentions: { parse: [] } } }).catch(reason => this.log.sendErrorLog(reason))
    }
  }

  public async sendChatMessage({ username, message }: { username: string; message: string }, destination: Chat) {
    return this.sendToChannel({ content: `${username}: ${message}` }, this.config.channels[destination])
  }

  public async sendEmbed(embed: APIEmbed, destination: Chat | 'both') {
    if (destination == 'both') {
      return await Promise.all([
        this.sendToChannel({ embeds: [embed] }, this.config.channels['guild']),
        this.sendToChannel({ embeds: [embed] }, this.config.channels['officer'])
      ])
    }

    return await this.sendToChannel({ embeds: [embed] }, this.config.channels[destination])
  }

  public async sendLog(embeds: APIEmbed[]) {
    if (this.config.logChannel) {
      this.sendToChannel({ embeds }, this.config.logChannel)
    }
  }
}
