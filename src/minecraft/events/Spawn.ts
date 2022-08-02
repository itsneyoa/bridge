import Event from '../../structs/MinecraftEvent'

const Spawn: Event<'spawn'> = {
  name: 'spawn',
  once: true,

  async execute(minecraft) {
    minecraft.relogAttempts = 0
    console.log('mc ready')
  }
}

export default Spawn
