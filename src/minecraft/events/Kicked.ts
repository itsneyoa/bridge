import Event from '../../structs/MinecraftEvent'

const Kicked: Event<'kicked'> = {
  name: 'kicked',
  once: false,

  async execute(minecraft, reason) {
    minecraft.loggedIn = false

    try {
      const parsedReason = JSON.parse(reason)
      console.log(Object.values(parsedReason).join(', '))
    } catch {
      console.error(reason)
    }
  }
}

export default Kicked
