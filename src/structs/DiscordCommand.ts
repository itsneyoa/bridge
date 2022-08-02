import { APIEmbed, ChatInputApplicationCommandData, ChatInputCommandInteraction } from 'discord.js'
import Discord from '../discord'

export default interface DiscordCommand extends ChatInputApplicationCommandData {
  permission: 'all' | 'staff' | 'owner'
  execute: (command: ChatInputCommandInteraction, discord: Discord) => Promise<any>
}

export async function reply(interaction: ChatInputCommandInteraction, embed: APIEmbed, ephemeral = false) {
  if (interaction.isRepliable()) {
    try {
      return await interaction[interaction.replied ? 'editReply' : 'reply']({ embeds: [embed], ephemeral })
    } catch (err) {
      console.error(err)
    }
  }
}
