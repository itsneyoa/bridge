import { ApplicationCommandOptionType, inlineCode } from 'discord.js'
import DiscordCommand, { execute, reply } from '../../structs/DiscordCommand'
import { SimpleEmbed } from '../../utils/Embed'

const Execute: DiscordCommand = {
  name: 'execute',
  description: 'Executes the given command as the minecraft bot',
  options: [
    {
      name: 'command',
      description: 'The command to execute',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  permission: 'owner',
  dmPermission: false,
  async execute(interaction, discord) {
    let command = interaction.options.getString('command')?.trim()

    if (!command) return reply(interaction, SimpleEmbed('failure', 'Command argument not found'))

    if (!command.startsWith('/')) command = '/' + command

    if (execute(command, discord.minecraft, interaction)) reply(interaction, SimpleEmbed('success', `Running ${inlineCode(command)}`))
  }
}

export default Execute
