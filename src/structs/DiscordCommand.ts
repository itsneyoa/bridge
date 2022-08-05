import { APIEmbed, ChatInputApplicationCommandData, ChatInputCommandInteraction } from 'discord.js'
import Discord from '../discord'
import Minecraft from '../minecraft'
import { SimpleEmbed } from '../utils/Embed'

export default interface DiscordCommand extends ChatInputApplicationCommandData {
  permission: 'all' | 'staff' | 'owner'
  execute: (command: ChatInputCommandInteraction, discord: Discord) => Promise<unknown>
}

export async function reply(interaction: ChatInputCommandInteraction, embed: APIEmbed, ephemeral = false) {
  if (interaction.isRepliable()) {
    return await interaction[interaction.replied ? 'editReply' : 'reply']({ embeds: [embed], ephemeral, allowedMentions: { parse: [] } })
  }
}

export function execute(command: string, minecraft: Minecraft, interaction: ChatInputCommandInteraction) {
  if (!minecraft.loggedIn) {
    reply(interaction, SimpleEmbed('failure', 'The bot is currently disconnected from the server, please try again later'))
    return false
  }

  minecraft.execute(command)
  return true
}
