import Event from '../../structs/MinecraftEvent'

const MessageStr: Event<'messagestr'> = {
  name: 'messagestr',
  once: false,

  async execute(minecraft, message, position, json) {
    console.log(message)

    const match = message.match(/^(Guild|Officer) > (?:\[.+?\] )?(\w+?)(?: \[.+?\])?: (.+)$/)

    if (match) {
      const [chat, username, message] = [match[1].toLowerCase(), match[2], match[3]]

      if (chat != 'guild' && chat != 'officer') return
      return minecraft.discord.send({ username, message }, chat)
    }
  }
}

export default MessageStr
