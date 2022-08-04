import { APIEmbed } from 'discord.js'
import Discord from '../discord'

export default function createLogger(discord: Discord) {
  return class LogGroup {
    private static readonly discord = discord
    private logs: Log[] = []

    private constructor(startingLog: Log) {
      this.logs.unshift(startingLog)
    }

    public static create(type: LogType, message: string) {
      return new this({ type, message })
    }

    public add(type: LogType, message: string) {
      this.logs.push({ type, message })
      return this
    }

    public send() {
      const logs = this.logs.map(log => LogGroup.stringify(log))
      for (const shortMessage of logs) {
        console.log(shortMessage)
      }

      if (this.logs.length > 10) {
        return LogGroup.discord.sendLog([
          {
            author: { name: 'Too many logs to send in one message!' },
            description: logs.join('\n')
          }
        ])
      }

      return LogGroup.discord.sendLog(this.logs.map(log => LogGroup.buildEmbed(log)))
    }

    private static stringify(log: Log): string {
      return `[${LogTypes[log.type].title}]: ${log.message}`
    }

    private static buildEmbed(log: Log): APIEmbed {
      return {
        author: { name: LogTypes[log.type].title },
        color: LogTypes[log.type].color,
        description: log.message
      }
    }

    public static sendSingleLog(type: LogType, message: string) {
      console.log(this.stringify({ type, message }))
      this.discord.sendLog([this.buildEmbed({ type, message })])
    }
  }
}

interface Log {
  type: LogType
  message: string
}

type LogType = keyof typeof LogTypes

const LogTypes = {
  chat: {
    title: 'Chat Message',
    color: 0xffffff
  },
  command: {
    title: 'Command Run',
    color: 0x7fffd4
  },
  minecraft: {
    title: 'Minecraft Client',
    color: 0x55ff55
  },
  discord: {
    title: 'Discord Client',
    color: 0x5865f2
  },
  info: {
    title: 'Info',
    color: 0xff1493
  }
}
