import Event from '../../structs/MinecraftEvent'

const End: Event<'end'> = {
  name: 'end',
  once: false,

  async execute(minecraft) {
    minecraft.refreshBot()
  }
}

export default End
