import Event from '../../structs/MinecraftEvent'

const MessageStr: Event<'messagestr'> = {
  name: 'messagestr',
  once: false,

  async execute(minecraft, message, position, json) {
    const log = minecraft.discord.log.create('chat', message)

    try {
      const match = message.match(/^(Guild|Officer) > (?:\[.+?\] )?(\w+?)(?: \[.+?\])?: (.+)$/)

      if (match) {
        const [chat, username, message] = [match[1].toLowerCase(), match[2], match[3]]

        if (chat != 'guild' && chat != 'officer') return

        log.add('minecraft', `${username}: ${message}`)
        return minecraft.discord.sendChatMessage({ username, message }, chat)
      }
    } finally {
      log.send()
    }
  }
}

export default MessageStr
