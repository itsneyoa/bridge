import { inlineCode, Message } from 'discord.js'
import Bridge from '../../structs/Bridge'
import Chat from '../../structs/Chat'
import Event from '../../structs/DiscordEvent'
import cleanContent from '../../utils/CleanDiscordContent'
import { Warnings } from '../../utils/Styles'
import { cleanString, containsInvalidCharacters } from '../../utils/ValidMinecraftCharacters'

const MessageCreate: Event<'messageCreate'> = {
  name: 'messageCreate',
  once: false,

  async execute(bridge, message) {
    if (message.author.id == bridge.discord.user.id || message.author.system || message.webhookId || message.author.bot) return

    switch (message.channelId) {
      case bridge.config.channels.guild:
        return handleMessage(bridge, message, 'guild')

      case bridge.config.channels.officer:
        return handleMessage(bridge, message, 'officer')
    }
  }
}

function handleMessage(bridge: Bridge, message: Message, chat: Chat) {
  let prefix = message.member?.nickname ?? message.author.username
  let content = cleanContent(message.content, message.channel).trim()

  const invalidContent = containsInvalidCharacters(content)
  const invalidPrefix = containsInvalidCharacters(prefix)

  const log = bridge.log.create('chat', `${inlineCode(prefix)}: ${inlineCode(content)}`)

  try {
    if (invalidContent) content = cleanString(content)

    if (!content) {
      log.add('chat', 'Message had no content after clearning')
      return message.react(Warnings.emptyMessage.emoji)
    }

    if (invalidPrefix) prefix = cleanString(prefix)

    if (!prefix) prefix = 'Unknown'

    if (invalidContent || invalidPrefix) message.react(Warnings.invalidMessage.emoji)

    return bridge.minecraft.execute(
      {
        command: `${commands[chat]} ${prefix}: ${content}`,
        regex: [
          {
            exp: RegExp(`^(?:Guild|Officer) > (?:\\[.+?\\] )?${bridge.minecraft.username}(?: \\[.+?\\])?: ${prefix}: .*`),
            exec: () => undefined
          },
          {
            exp: /^You cannot say the same message twice!$/,
            exec: () => message.react(Warnings.repeatMessage.emoji)
          },
          {
            exp: /^We blocked your comment ".+"/,
            exec: () => message.react(Warnings.blocked.emoji)
          },
          {
            exp: /^Advertising is against the rules. You will receive a punishment on the server if you attempt to advertise.$/,
            exec: () => message.react(Warnings.blocked.emoji)
          }
        ],
        noResponse: () => message.react(Warnings.timedOut.emoji)
      },
      log
    )
  } finally {
    log.send()
  }
}

const commands: { [key in Chat]: `/${string}` } = {
  guild: '/gc',
  officer: '/oc'
}

export default MessageCreate
