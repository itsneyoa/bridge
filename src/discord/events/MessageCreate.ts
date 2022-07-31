import { Message } from 'discord.js'
import Discord from '..'
import Chat from '../../structs/Chat'
import Event from '../../structs/DiscordEvent'

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
  const content = message.cleanContent.trim()

  if (!content) return

  return discord.minecraft.execute(`${commands[chat]} ${message.member?.nickname ?? message.author.username}: ${content}`)
}

const commands: { [key in Chat]: `/${string}` } = {
  guild: '/gc',
  officer: '/oc'
}

export default InteractionCreate
