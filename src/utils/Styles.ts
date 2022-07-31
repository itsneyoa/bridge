export default {
  colours: {
    success: 0x47f04a,
    warning: 0xff8c00,
    failure: 0xf04a47
  },
  emojis: {
    tooLong: {
      character: '✂️',
      explanation: `The message sent was too long (More than 256 characters)`
    },
    unlinked: {
      character: '❓',
      explanation: `Couldn't figure out who you are, try linking with the bot`
    },
    blocked: {
      character: '⛔',
      explanation: `The message was blocked by Hypixel's chat filter`
    }
  }
}
