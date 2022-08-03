import { Client } from 'discord.js'
import { readdirSync } from 'fs'
import { join } from 'path'
import Event from '../structs/DiscordEvent'
import Command from '../structs/DiscordCommand'
import Dev from '../utils/Dev'
import Config from '../utils/Config'
import Minecraft from '../minecraft'

export default class Discord {
  private readonly client: Client<true>
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

    return new Promise(async (res, rej) => {
      const client = new Client({ intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildWebhooks'] })

      console.log('Logging into discord')
      client.login(config.token).catch(err => {
        console.error(err)
        rej(err)
      })

      client.once('ready', async client => {
        console.log('doin discord setup')
        const discord = new this(client, config)

        await discord.registerEvents()
        await discord.loadCommands()
        await discord.publishCommands()

        console.log(`Discord client ready, logged in as ${client.user.tag}`)
        res(discord)
      })
    })
  }

  private async registerEvents() {
    let c = 0
    for (const path of readdirSync(join(__dirname, 'events')).map(fileName => join(__dirname, 'events', fileName))) {
      const event: Event<any> = (await import(path)).default
      this.client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(this, ...args))
      c++
    }
    console.log(`${c} Discord events loaded`)
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
    console.log(`${c} Discord commands loaded`)
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

  public async send({ username, message }: { username: string; message: string }, destination: 'guild' | 'officer') {
    const channel = await this.client.channels.fetch(this.config.channels[destination])

    if (channel?.isTextBased()) {
      return await channel.send({ content: `${username}: ${message}`, allowedMentions: { parse: [] } })
    }
  }
}
