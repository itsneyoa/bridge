import DiscordCommand, { reply } from '../../structs/DiscordCommand'
import Embed from '../../utils/Embed'

const Reload: DiscordCommand = {
  name: 'reload',
  description: 'Reloads all Discord commands and events',
  options: [],
  permission: 'owner',
  dmPermission: true,
  async execute(interaction, discord) {
    const commands = await discord.loadCommands()
    await discord.publishCommands()

    reply(interaction, Embed('success', `\`${commands}\` commands reloaded`))
  }
}

export default Reload
