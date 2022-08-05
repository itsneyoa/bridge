import Event from '../../structs/MinecraftEvent'

const End: Event<'error'> = {
  name: 'error',
  once: false,

  async execute(minecraft, error) {
    minecraft.discord.log.sendErrorLog(error)
  }
}

export default End
