import { CommandInteraction, inlineCode } from 'discord.js'
import { ChatTrigger } from '../minecraft'
import { SimpleEmbed } from './Embed'

export function notInGuild(interaction: CommandInteraction): ChatTrigger {
  return {
    exp: /^(?:\[.+?\] )?(\w+) is not in your guild!$/,
    exec: ([, username]) => interaction.editReply({ embeds: [SimpleEmbed('failure', `${inlineCode(username)} is not in the guild`)] })
  }
}

const noPermissionMessages = [
  'You must be the Guild Master to use that command!',
  'You do not have permission to use this command!',
  `I'm sorry, but you do not have permission to perform this command. Please contact the server administrators if you believe that this is in error.`
]
export function noPermission(interaction: CommandInteraction): ChatTrigger {
  return {
    exp: RegExp(`^${noPermissionMessages.map(msg => msg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}`),
    exec: () => interaction.editReply({ embeds: [SimpleEmbed('failure', `I don't have permission to run that command`)] })
  }
}

export function playerNotFound(interaction: CommandInteraction, username: string): ChatTrigger {
  return {
    exp: RegExp(`^Can't find a player by the name of '${username}'$`, 'i'),
    exec: () => interaction.editReply({ embeds: [SimpleEmbed('failure', `Could not find player ${inlineCode(username)}`)] })
  }
}
