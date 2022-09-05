import Event from '../../structs/MinecraftEvent'

const End: Event<'end'> = {
  name: 'end',
  once: false,

  async execute(bridge) {
    bridge.minecraft.loggedIn = false
    bridge.minecraft.refreshBot()
  }
}

export default End
