import { CommandInteraction, GuildMemberRoleManager, InteractionReplyOptions } from 'discord.js'
import Event from '../../structs/DiscordEvent'
import Embed from '../../utils/Embed'

const InteractionCreate: Event<'interactionCreate'> = {
  name: 'interactionCreate',
  once: false,

  async execute(discord, interaction) {
    if (!interaction.isChatInputCommand()) return

    const command = discord.commands.get(interaction.commandName)

    if (!command) {
      console.error(`Command ${interaction.commandName} called but implementation not found`)
      return safeReply(interaction, {
        embeds: [Embed('failure', { description: `Command \`${interaction.commandName}\` could not be found` })],
        ephemeral: true
      })
    }

    switch (command.permission) {
      case 'staff':
        if (
          !(interaction.member?.roles instanceof GuildMemberRoleManager
            ? interaction.member?.roles.cache.has(discord.config.staffRole)
            : interaction.member?.roles.includes(discord.config.staffRole))
        )
          return safeReply(interaction, {
            embeds: [
              Embed('failure', {
                description: [`You don't have permission to do that.`, `Required permission: <@&${discord.config.staffRole}>`].join('\n')
              })
            ],
            ephemeral: true
          })
      case 'owner':
        if (interaction.user.id != process.env['OWNER_ID'])
          return safeReply(interaction, {
            embeds: [
              Embed('failure', {
                description: [
                  `You don't have permission to do that.`,
                  process.env['OWNER_ID'] ? `Required permission: <@!${process.env['OWNER_ID']}>` : `Owner ID not set in configuration`
                ].join('\n')
              })
            ],
            ephemeral: true
          })
    }

    try {
      return await command.execute(interaction, discord)
    } catch (error) {
      console.error(error)
      return safeReply(interaction, { embeds: [Embed('failure', { description: `Something went wrong while trying to run that` })] })
    }
  }
}

export default InteractionCreate

async function safeReply(interaction: CommandInteraction, message: InteractionReplyOptions) {
  try {
    return await interaction.reply(message)
  } catch {}
}
