import Chat from '../structs/Chat'

export default class Config {
  public readonly token: string
  public readonly ownerId: string
  public readonly channels: {
    [key in Chat]: string
  }
  public readonly staffRole: string

  constructor() {
    this.token = this.resolveEnv('DISCORD_TOKEN')
    this.ownerId = this.resolveEnv('OWNER_ID')
    this.channels = {
      guild: this.resolveEnv('GUILD_CHANNEL_ID'),
      officer: this.resolveEnv('OFFICER_CHANNEL_ID')
    }
    this.staffRole = this.resolveEnv('STAFF_ROLE_ID')
  }

  private resolveEnv(name: string): string {
    const env = process.env[name]
    if (!env) throw `Env ${name} missing from config.`
    return env
  }
}
