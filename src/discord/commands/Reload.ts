import { inlineCode } from 'discord.js'
import DiscordCommand from '../../structs/DiscordCommand'
import { SimpleEmbed } from '../../utils/Embed'

const Reload: DiscordCommand = {
  name: 'reload',
  description: 'Reloads all Discord commands and events',
  options: [],
  permission: 'owner',
  dmPermission: true,
  async execute(interaction, discord) {
    const commands = await discord.loadCommands()
    await discord.publishCommands()

    return interaction.editReply({ embeds: [SimpleEmbed('success', `${inlineCode(commands.toString())} commands reloaded`)] })
  }
}

export default Reload
