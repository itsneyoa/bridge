import { APIEmbed, Client, MessageOptions, inlineCode, Webhook, TextChannel } from 'discord.js'
import { readdirSync } from 'fs'
import { join } from 'path'
import Command from '../structs/DiscordCommand'
import Dev from '../utils/Dev'
import Config from '../utils/Config'
import Chat from '../structs/Chat'
import Bridge from '../structs/Bridge'
import { headUrl } from '../utils/Embed'

export default class Discord {
  private readonly client: Client<true>
  private ready?: (valid: PromiseLike<void> | void) => void
  private isReady: Promise<void>
  public readonly bridge: Bridge
  public commands = new Map<string, Command>()
  private webhookCache: {
    [id: string]: Webhook
  } = {}

  get user() {
    return this.client.user
  }

  constructor(bridge: Bridge) {
    this.bridge = bridge
    this.client = new Client({ intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildWebhooks'] })
    this.isReady = new Promise(resolve => {
      this.ready = resolve
    })
  }

  public async init() {
    const config = new Config()

    this.client.login(config.token)

    this.client.once('ready', async client => {
      await Promise.all(
        [this.bridge.config.channels.guild, this.bridge.config.channels.officer, this.bridge.config.logChannel].map(id => id && this.resolveWebhook(id))
      )

      await this.registerEvents()
      await this.loadCommands()
      await this.publishCommands()

      if (Dev) this.bridge.log.sendDemoLogs()
      this.bridge.log.sendSingleLog('info', `Discord client ready, logged in as ${inlineCode(client.user.tag)}`)
      if (this.ready) this.ready()
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
      await Promise.all(
        Object.values(this.bridge.config.channels).map(async channelId => {
          if (!channelId) return
          const channel = await this.client.channels.fetch(channelId)

          if (channel?.isTextBased() && !channel.isDMBased()) return this.client.application.commands.set([], channel.guild.id)
        })
      )

      return await this.client.application.commands.set([...this.commands.values()])
    }
  }

  private async sendToChannel(content: MessageOptions, destination: string, webhookOptions?: webhookOptions) {
    await this.isReady
    const channel = await this.client.channels.fetch(destination)

    const payload: MessageOptions = { ...content, ...{ allowedMentions: { parse: [] } } }

    if (webhookOptions) {
      const { username, avatar } = webhookOptions
      return (await this.resolveWebhook(destination))
        .send({ ...payload, username: username, avatarURL: avatar ? headUrl(username) : undefined })
        .catch(this.bridge.log.sendErrorLog)
    } else {
      if (channel?.isTextBased() && this.client.isReady()) {
        return await channel.send(payload).catch(this.bridge.log.sendErrorLog)
      }
    }
  }

  public async sendChatMessage({ username, message }: { username: string; message: string }, destination: Chat) {
    return this.sendToChannel({ content: message }, this.bridge.config.channels[destination], { username, avatar: true })
  }

  public async sendEmbed(embed: APIEmbed, destination: Chat | 'both', webhookOptions?: webhookOptions) {
    if (destination == 'both') {
      return await Promise.all([
        this.sendToChannel({ embeds: [embed] }, this.bridge.config.channels['guild'], webhookOptions),
        this.sendToChannel({ embeds: [embed] }, this.bridge.config.channels['officer'], webhookOptions)
      ])
    }

    return await this.sendToChannel({ embeds: [embed] }, this.bridge.config.channels[destination], webhookOptions)
  }

  public async sendLog(embeds: APIEmbed[]) {
    if (this.bridge.config.logChannel) {
      this.sendToChannel({ embeds }, this.bridge.config.logChannel, { username: 'Bridge Logs', avatar: false })
    }
  }

  private async resolveWebhook(id: string): Promise<Webhook> {
    if (this.webhookCache[id]) return this.webhookCache[id]

    const channel = await this.client.channels.fetch(id)

    if (!channel) throw `Channel ${id} not found`
    if (!(channel instanceof TextChannel)) throw `Channel "${channel?.toString()}" is a text channel`

    return (await this.fetchWebhook(channel)) || (await this.createWebhook(channel))
  }

  private async fetchWebhook(channel: TextChannel) {
    const webhook = (await channel.fetchWebhooks()).filter(channel => channel.owner?.id == this.client.user.id).first()
    if (webhook) {
      this.webhookCache[channel.id] = webhook
      this.bridge.log.sendSingleLog('info', `Webhook found in #${channel.name}`)
    }
    return webhook
  }

  private async createWebhook(channel: TextChannel) {
    const webhook = await channel.createWebhook({
      name: 'Chat Bridge',
      avatar: this.client.user.avatarURL(),
      reason: 'Chat Bridge Webhook - Used to render player skin as avatar or for logging'
    })

    this.webhookCache[channel.id] = webhook
    this.bridge.log.sendSingleLog('info', `Webhook created in #${channel.name}`)
    return webhook
  }
}

type webhookOptions = { username: string; avatar?: boolean }
