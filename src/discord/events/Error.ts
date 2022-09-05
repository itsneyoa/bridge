import { codeBlock } from 'discord.js'
import Event from '../../structs/DiscordEvent'

const InteractionCreate: Event<'error'> = {
  name: 'error',
  once: false,

  async execute(bridge, error) {
    try {
      bridge.log.sendSingleLog('info', `${error.name}: ${codeBlock(error.message)}`)
    } finally {
      console.error(error)
    }
  }
}

export default InteractionCreate
