import { inlineCode } from 'discord.js'
import Event from '../../structs/MinecraftEvent'
import { FullEmbed } from '../../utils/Embed'

const Spawn: Event<'spawn'> = {
  name: 'spawn',
  once: false,

  async execute(minecraft) {
    minecraft.loggedIn = true
    minecraft.relogAttempts = 0

    if (minecraft.lastStatusMessage == 'logout') {
      minecraft.lastStatusMessage = 'login'
      minecraft.discord.sendEmbed(
        FullEmbed('success', {
          author: {
            name: 'Chat Bridge is Online'
          },
          description: `Connected as ${inlineCode(minecraft.username)} on version ${inlineCode(minecraft.version)}`
        }),
        'both'
      )
    }

    minecraft.priorityExecute('/locraw')
    return minecraft.loop()
  }
}

export default Spawn
