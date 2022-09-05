import Event from '../../structs/MinecraftEvent'

const End: Event<'error'> = {
  name: 'error',
  once: false,

  async execute(bridge, error) {
    bridge.log.sendErrorLog(error)
  }
}

export default End
