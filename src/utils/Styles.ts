export default {
  colours: {
    success: 0x47f04a,
    warning: 0xff8c00,
    failure: 0xf04a47
  },
  warnings: {
    invalidMessage: {
      emoji: '✂️',
      explanation: `The message you sent was invalid and had to be trimmed. This is usually because your message was more than 256 characters or your message/nickname contains invalid characters`
    },
    emptyMessage: {
      emoji: '❌',
      explanation: `The message had no content once the input was sanitised.`
    },
    blocked: {
      emoji: '⛔',
      explanation: `The message was blocked by Hypixel's chat filter`
    }
  }
}
