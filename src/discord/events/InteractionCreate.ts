import { GuildMemberRoleManager } from 'discord.js'
import { reply } from '../../structs/DiscordCommand'
import Event from '../../structs/DiscordEvent'
import { SimpleEmbed } from '../../utils/Embed'

const InteractionCreate: Event<'interactionCreate'> = {
  name: 'interactionCreate',
  once: false,

  async execute(discord, interaction) {
    if (!interaction.isChatInputCommand()) return

    const command = discord.commands.get(interaction.commandName)

    if (!command) {
      console.error(`Command ${interaction.commandName} called but implementation not found`)
      return reply(interaction, SimpleEmbed('failure', `Command \`${interaction.commandName}\` could not be found`), true)
    }

    switch (command.permission) {
      case 'staff':
        if (
          !(interaction.member?.roles instanceof GuildMemberRoleManager
            ? interaction.member?.roles.cache.has(discord.config.staffRole)
            : interaction.member?.roles.includes(discord.config.staffRole))
        )
          return reply(
            interaction,
            SimpleEmbed('failure', [`You don't have permission to do that.`, `Required permission: <@&${discord.config.staffRole}>`].join('\n')),
            true
          )
      case 'owner':
        if (interaction.user.id != process.env['OWNER_ID'])
          return reply(
            interaction,
            SimpleEmbed(
              'failure',
              [
                `You don't have permission to do that.`,
                process.env['OWNER_ID'] ? `Required permission: <@!${process.env['OWNER_ID']}>` : `Owner ID not set in configuration`
              ].join('\n')
            ),
            true
          )
    }

    try {
      return await command.execute(interaction, discord)
    } catch (error) {
      console.error(error)
      return reply(interaction, SimpleEmbed('failure', `Something went wrong while trying to run that`))
    }
  }
}

export default InteractionCreate
