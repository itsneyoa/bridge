import { Message } from 'discord.js'
import Discord from '..'
import Chat from '../../structs/Chat'
import Event from '../../structs/DiscordEvent'
import cleanContent from '../../utils/CleanDiscordContent'
import Styles from '../../utils/Styles'
import { cleanString, containsInvalidCharacters } from '../../utils/ValidMinecraftCharacters'

const InteractionCreate: Event<'messageCreate'> = {
  name: 'messageCreate',
  once: false,

  async execute(discord, message) {
    if (message.author.id == discord.user.id || message.author.system || message.webhookId) return

    switch (message.channelId) {
      case discord.config.channels.guild:
        return handleMessage(discord, message, 'guild')
      case discord.config.channels.officer:
        return handleMessage(discord, message, 'officer')
    }
  }
}

function handleMessage(discord: Discord, message: Message, chat: Chat) {
  let prefix = message.member?.nickname ?? message.author.username
  let content = cleanContent(message.content, message.channel).trim()

  const invalidContent = containsInvalidCharacters(content)
  const invalidPrefix = containsInvalidCharacters(prefix)

  if (invalidContent) content = cleanString(content)

  if (!content) return message.react(Styles.warnings.emptyMessage.emoji)

  if (invalidPrefix) prefix = cleanString(prefix)

  if (!prefix) prefix = 'Unknown'

  if (invalidContent || invalidPrefix) message.react(Styles.warnings.invalidMessage.emoji)

  return discord.minecraft.execute(`${commands[chat]} ${prefix}: ${content}`)
}

const commands: { [key in Chat]: `/${string}` } = {
  guild: '/gc',
  officer: '/oc'
}

export default InteractionCreate
