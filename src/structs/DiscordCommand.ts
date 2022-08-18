import { ChatInputApplicationCommandData, ChatInputCommandInteraction, CommandInteraction } from 'discord.js'
import { SimpleEmbed } from '../utils/Embed'
import Discord from '../discord'

export default interface DiscordCommand extends ChatInputApplicationCommandData {
  permission: 'all' | 'staff' | 'owner'
  execute: (command: ChatInputCommandInteraction, discord: Discord, log: ReturnType<typeof discord.log.create>) => Promise<unknown>
}

export function noResponse(interaction: CommandInteraction) {
  return async () => await interaction.editReply({ embeds: [SimpleEmbed('failure', 'Response not found')] })
}
