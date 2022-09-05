import { GuildMemberRoleManager, inlineCode } from 'discord.js'
import Event from '../../structs/DiscordEvent'
import { SimpleEmbed } from '../../utils/Embed'

const InteractionCreate: Event<'interactionCreate'> = {
  name: 'interactionCreate',
  once: false,

  async execute(bridge, interaction) {
    if (!interaction.isChatInputCommand()) return

    const log = bridge.log.create('command', `${inlineCode(interaction.user.tag)} ran ${inlineCode(interaction.commandName)}`, {
      name: 'Arguments',
      value: interaction.options.data.map(({ name, value }) => `${inlineCode(name)}: ${inlineCode(String(value))}`).join('\n'),
      inline: true
    })

    try {
      const command = bridge.discord.commands.get(interaction.commandName)

      if (!command) {
        log.add('error', `Command ${interaction.commandName} called but implementation not found`)
        return interaction.reply({ embeds: [SimpleEmbed('failure', `Command ${inlineCode(interaction.commandName)} could not be found`)], ephemeral: true })
      }

      switch (command.permission) {
        case 'staff':
          if (
            !(interaction.member?.roles instanceof GuildMemberRoleManager
              ? interaction.member?.roles.cache.has(bridge.config.staffRole)
              : interaction.member?.roles.includes(bridge.config.staffRole))
          ) {
            return interaction.reply({
              embeds: [SimpleEmbed('failure', [`You don't have permission to do that.`, `Required permission: <@&${bridge.config.staffRole}>`].join('\n'))],
              ephemeral: true
            })
          }
          break
        case 'owner':
          if (interaction.user.id != process.env['OWNER_ID']) {
            return interaction.reply({
              embeds: [
                SimpleEmbed(
                  'failure',
                  [
                    `You don't have permission to do that.`,
                    process.env['OWNER_ID'] ? `Required permission: <@!${process.env['OWNER_ID']}>` : `Owner ID not set in configuration`
                  ].join('\n')
                )
              ],
              ephemeral: true
            })
          }
          break
      }

      await interaction.deferReply()

      try {
        return await command.execute(interaction, bridge, log)
      } catch (error) {
        if (error instanceof Error) {
          log.add('error', [error.name, error.stack].join('\n'))
        } else {
          log.add('error', String(error))
        }
        return interaction.reply({ embeds: [SimpleEmbed('failure', `Something went wrong while trying to run that`)], ephemeral: true })
      }
    } finally {
      log.send()
    }
  }
}

export default InteractionCreate
