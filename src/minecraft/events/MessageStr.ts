import Chat from '../../structs/Chat'
import Event from '../../structs/MinecraftEvent'

const MessageStr: Event<'messagestr'> = {
  name: 'messagestr',
  once: false,

  async execute(minecraft, message, position, json) {
    console.log(message)

    if (message.startsWith('Guild >')) {
      minecraft.discord.send(message, 'guild')
    }

    if (message.startsWith('Officer >')) {
      minecraft.discord.send(message, 'officer')
    }
  }
}

export default MessageStr
