import Minecraft from '..'
import Chat from '../../structs/Chat'
import Event from '../../structs/MinecraftEvent'
import { FullEmbed, SimpleEmbed, headUrl } from '../../utils/Embed'
import { inlineCode } from 'discord.js'

const MessageStr: Event<'messagestr'> = {
  name: 'messagestr',
  once: false,

  async execute(minecraft, message /*, position, json*/) {
    const log = minecraft.discord.log.create('chat', message)

    message = message.replaceAll(/-/g, '')
    if (!message) return

    try {
      for (const exec of messages) {
        if (exec(message, minecraft, log)) return
      }
    } finally {
      log.send()
    }
  }
}

const messages: Array<(message: string, minecraft: Minecraft, log: ReturnType<typeof minecraft.discord.log.create>) => boolean> = [
  // /locraw feedback for limbo detection
  (message, minecraft, log) => {
    try {
      const json = JSON.parse(message)
      if (!json['server']) return false

      if (json['server'] == 'limbo') {
        log.add('info', `Minecraft bot successfully sent to limbo`)
      } else {
        minecraft.priorityExecute('/ac §')
        log.add('info', [`Lobby detected, sending to limbo`, ...Object.entries(json).map(([key, value]) => `${key}: ${inlineCode(String(value))}`)].join('\n'))
      }
      return true
    } catch {
      return false
    }
  },

  // Guild / Officer chat messages
  (fullmessage, minecraft, log) => {
    const match = fullmessage.match(/^(Guild|Officer) > (?:\[.+?\] )?(\w+)(?: \[.+?\])?: (.+)$/)

    if (!match) return false

    const [chat, username, message] = [match[1].toLowerCase(), match[2], match[3]]

    if (username === minecraft.username) return false

    if (chat != 'guild' && chat != 'officer') return false

    // Ingame commands can be added here if needed

    log.add('event', `${username}: ${message}`)
    minecraft.discord.sendChatMessage({ username, message }, chat)
    return true
  },

  // Login/logouts
  (message, minecraft, log) => {
    const match = message.match(/^Guild > (\w+) (joined|left)\.$/)

    if (!match) return false

    const [, username, status] = match

    log.add('event', `${username} ${status}.`)
    minecraft.discord.sendEmbed(SimpleEmbed(status == 'joined' ? 'success' : 'failure', `${username} ${status}`), 'guild')
    return true
  },

  // Guild events
  (message, minecraft, log) => {
    for (const [regexp, exec] of events) {
      const match = message.match(regexp)
      if (!match) continue

      exec(match, minecraft, log)
      return true
    }

    return false
  }
]

const events: Array<[RegExp, (match: RegExpMatchArray, minecraft: Minecraft, log: ReturnType<typeof minecraft.discord.log.create>) => Promise<unknown>]> = [
  // Player joined guild
  [
    /^(?:\[.+?\] )?(\w+) joined the guild!$/,
    ([, user], minecraft, log) => {
      const description = `${inlineCode(user)} joined the guild`
      log.add('event', description)
      return minecraft.discord.sendEmbed(FullEmbed('success', { description, author: { name: `Member Joined!`, icon_url: headUrl(user) } }), 'both')
    }
  ],

  // Player left guild
  [
    /^(?:\[.+?\] )?(\w+) left the guild!$/,
    ([, user], minecraft, log) => {
      const description = `${inlineCode(user)} left the guild`
      log.add('event', description)
      return minecraft.discord.sendEmbed(FullEmbed('failure', { description, author: { name: `Member Left!`, icon_url: headUrl(user) } }), 'both')
    }
  ],

  // Player was kicked from guild by Player
  [
    /^(?:\[.+?\] )?(\w+) was kicked from the guild by (?:\[.+?\] )?(\w+)!$/,
    ([, user, by], minecraft, log) => {
      const baseDescription = `${inlineCode(user)} was kicked from the guild`
      const fullDescription = [baseDescription, `by ${inlineCode(by)}`].join(' ')
      log.add('event', fullDescription)
      return Promise.all(
        (['guild', 'officer'] as Chat[]).map(chat =>
          minecraft.discord.sendEmbed(
            FullEmbed('failure', {
              description: chat == 'officer' ? fullDescription : baseDescription,
              author: { name: `Member Kicked!`, icon_url: headUrl(user) }
            }),
            chat
          )
        )
      )
    }
  ],

  // Player was promoted from x to y
  [
    /^(?:\[.+?\] )?(\w+) was promoted from (.+) to (.+)$/,
    ([, user, from, to], minecraft, log) => {
      const description = `${inlineCode(user)} was promoted from ${inlineCode(from)} to ${inlineCode(to)}`
      log.add('event', description)
      return minecraft.discord.sendEmbed(FullEmbed('success', { description }), 'both')
    }
  ],

  // Player has been demoted from y to x
  [
    /^(?:\[.+?\] )?(\w+) was demoted from (.+) to (.+)$/,
    ([, user, from, to], minecraft, log) => {
      const description = `${inlineCode(user)} was demoted from ${inlineCode(from)} to ${inlineCode(to)}`
      log.add('event', description)
      return minecraft.discord.sendEmbed(FullEmbed('failure', { description }), 'both')
    }
  ],

  // Player has muted Player for x
  [
    /^(?:\[.+?\] )?(\w+) has muted (?:\[.+?\] )?(\w+) for (\w+)$/,
    ([, by, user, time], minecraft, log) => {
      const description = `${inlineCode(user)} has been muted for ${inlineCode(time)} by ${inlineCode(by)}`
      log.add('event', description)
      return minecraft.discord.sendEmbed(FullEmbed('failure', { description }), 'officer')
    }
  ],

  // Player has been unmuted by
  [
    /^(?:\[.+?\] )?(\w+) has unmuted (?:\[.+?\] )?(\w+)$/,
    ([, by, user], minecraft, log) => {
      const description = `${inlineCode(user)} has been unmuted by ${inlineCode(by)}`
      log.add('event', description)
      return minecraft.discord.sendEmbed(FullEmbed('success', { description }), 'officer')
    }
  ],

  // Guild Chat has been muted for x
  [
    /^(?:\[.+?\] )?(\w+) has muted the guild chat for (\w+)$/,
    ([, by, time], minecraft, log) => {
      const baseDescription = `Guild Chat has been muted for ${inlineCode(time)}`
      const fullDescription = [baseDescription, `by ${inlineCode(by)}`].join(' ')
      log.add('event', fullDescription)
      return Promise.all(
        (['guild', 'officer'] as Chat[]).map(chat =>
          minecraft.discord.sendEmbed(FullEmbed('failure', { description: chat == 'officer' ? fullDescription : baseDescription }), chat)
        )
      )
    }
  ],

  // Guild Chat has been unmuted
  [
    /^(?:\[.+?\] )?(\w+) has unmuted the guild chat!$/,
    ([, by], minecraft, log) => {
      const baseDescription = `Guild Chat has been unmuted`
      const fullDescription = [baseDescription, `by ${inlineCode(by)}`].join(' ')
      log.add('event', fullDescription)
      return Promise.all(
        (['guild', 'officer'] as Chat[]).map(chat =>
          minecraft.discord.sendEmbed(FullEmbed('failure', { description: chat == 'officer' ? fullDescription : baseDescription }), chat)
        )
      )
    }
  ]
]

export default MessageStr
