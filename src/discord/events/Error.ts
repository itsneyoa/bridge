import Event from '../../structs/DiscordEvent'

const InteractionCreate: Event<'error'> = {
  name: 'error',
  once: false,

  async execute(discord, error) {
    try {
      discord.log.sendSingleLog('info', `${error.name}: ${error.message}`)
    } finally {
      console.error(error)
    }
  }
}

export default InteractionCreate
