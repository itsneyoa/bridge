import Event from '../../structs/MinecraftEvent'

const Error: Event<'error'> = {
  name: 'error',
  once: false,

  async execute(bridge, error) {
    try {
      bridge.log.sendErrorLog(error)
    } finally {
      console.error(error)
    }
  }
}

export default Error
