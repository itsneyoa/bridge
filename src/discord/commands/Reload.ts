import DiscordCommand from '../../structs/DiscordCommand'
import Embed from '../../utils/Embed'

const Reload: DiscordCommand = {
  name: 'reload',
  description: 'Reloads all Discord commands and events',
  options: [],
  permission: 'owner',
  dmPermission: true,
  async execute(command, discord) {
    const commands = await discord.loadCommands()
    await discord.publishCommands()

    try {
      return await command.reply({ embeds: [Embed('success', { description: `\`${commands}\` commands reloaded` })] })
    } catch (err) {
      console.error(err)
    }
  }
}

export default Reload
