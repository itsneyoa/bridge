import { APIEmbed, Client, MessageOptions, inlineCode } from 'discord.js'
import { readdirSync } from 'fs'
import { join } from 'path'
import Command from '../structs/DiscordCommand'
import Dev from '../utils/Dev'
import Config from '../utils/Config'
import Chat from '../structs/Chat'
import Bridge from '../structs/Bridge'

export default class Discord {
  private readonly client: Client<true>
  public readonly bridge: Bridge
  public commands = new Map<string, Command>()

  get user() {
    return this.client.user
  }

  constructor(bridge: Bridge) {
    this.bridge = bridge
    this.client = new Client({ intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildWebhooks'] })
  }

  public async init() {
    const config = new Config()

    await this.client.login(config.token)

    this.client.once('ready', async client => {
      await this.registerEvents()
      await this.loadCommands()
      await this.publishCommands()

      this.bridge.log.sendSingleLog('info', `Discord client ready, logged in as ${inlineCode(client.user.tag)}`)
      this.bridge.log.sendDemoLogs()
    })
  }

  private async registerEvents() {
    let c = 0
    for (const path of readdirSync(join(__dirname, 'events')).map(fileName => join(__dirname, 'events', fileName))) {
      const event = (await import(path)).default
      this.client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(this.bridge, ...args))
      c++
    }
    this.bridge.log.sendSingleLog('info', `${inlineCode(c.toString())} Discord events loaded`)
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
    this.bridge.log.sendSingleLog('info', `${inlineCode(c.toString())} Discord commands loaded`)
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

    if (channel?.isTextBased() && this.client.isReady()) {
      return await channel.send({ ...content, ...{ allowedMentions: { parse: [] } } }).catch(reason => this.bridge.log.sendErrorLog(reason))
    }
  }

  public async sendChatMessage({ username, message }: { username: string; message: string }, destination: Chat) {
    return this.sendToChannel({ content: `${username}: ${message}` }, this.bridge.config.channels[destination])
  }

  public async sendEmbed(embed: APIEmbed, destination: Chat | 'both') {
    if (destination == 'both') {
      return await Promise.all([
        this.sendToChannel({ embeds: [embed] }, this.bridge.config.channels['guild']),
        this.sendToChannel({ embeds: [embed] }, this.bridge.config.channels['officer'])
      ])
    }

    return await this.sendToChannel({ embeds: [embed] }, this.bridge.config.channels[destination])
  }

  public async sendLog(embeds: APIEmbed[]) {
    if (this.bridge.config.logChannel) {
      this.sendToChannel({ embeds }, this.bridge.config.logChannel)
    }
  }
}
