import { ApplicationCommandPermissionsManager, ChatInputApplicationCommandData, ChatInputCommandInteraction, Guild } from 'discord.js'
import Discord from '../discord'

export default interface DiscordCommand extends ChatInputApplicationCommandData {
  permission: 'all' | 'staff' | 'owner'
  execute: (command: ChatInputCommandInteraction, discord: Discord) => Promise<any>
}
