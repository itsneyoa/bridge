import { ApplicationCommandOptionType, inlineCode } from 'discord.js'
import DiscordCommand, { noResponse } from '../../structs/DiscordCommand'
import { guildDefaults } from '../../utils/CommonRegex'
import { SimpleEmbed } from '../../utils/Embed'

const Mute: DiscordCommand = {
  name: 'mute',
  description: 'Mutes the given user for the given time period',
  options: [
    {
      name: 'username',
      description: 'The user to mute',
      type: ApplicationCommandOptionType.String,
      minLength: 1,
      maxLength: 16,
      required: true
    },
    {
      name: 'time',
      description: 'The time to mute for. Use m for minutes, h for hours, d for days (eg 30m)',
      type: ApplicationCommandOptionType.String,
      minLength: 1,
      maxLength: 3,
      required: true
    }
  ],
  permission: 'staff',
  dmPermission: false,
  async execute(interaction, bridge, log) {
    const user = interaction.options.getString('username')?.trim()
    const time = interaction.options.getString('time')?.replace(/\s/g, '')

    if (!user) return interaction.editReply({ embeds: [SimpleEmbed('failure', 'User argument not found')] })
    if (user.match(/\s/g)) return interaction.editReply({ embeds: [SimpleEmbed('failure', 'User argument cannot contain spaces')] })
    if (!time) return interaction.editReply({ embeds: [SimpleEmbed('failure', 'Time argument not found')] })

    const command = `/g mute ${user} ${time}`

    return bridge.minecraft.execute(
      {
        command,
        regex: [
          {
            exp: RegExp(`^(?:\\[.+?\\] )?(?:${bridge.minecraft.username}) has muted (?:\\[.+?\\] )?(${user}) for (\\d+\\w)$`, 'i'),
            exec: ([, username, time]) =>
              interaction.editReply({
                embeds: [SimpleEmbed('success', `${inlineCode(username)} has been muted for ${inlineCode(time)}`)]
              })
          },
          {
            exp: RegExp(`^(?:\\[.+?\\] )?(?:${bridge.minecraft.username}) has muted the guild chat for (\\d+\\w)$`),
            exec: () =>
              interaction.editReply({
                embeds: [SimpleEmbed('success', `Guild chat has been muted for ${inlineCode(time)}`)]
              })
          },
          {
            exp: /^This player is already muted!$/,
            exec: () => interaction.editReply({ embeds: [SimpleEmbed('failure', `${inlineCode(user)} is already muted`)] })
          },
          {
            exp: /^You cannot mute someone for more than one month$/,
            exec: () => interaction.editReply({ embeds: [SimpleEmbed('failure', `Mute length too long`)] })
          },
          {
            exp: /^You cannot mute someone for less than a minute$/,
            exec: () => interaction.editReply({ embeds: [SimpleEmbed('failure', `Mute length too short`)] })
          },
          {
            exp: /^Invalid time format! Try 7d, 1d, 6h, 1h$/,
            exec: () => interaction.editReply({ embeds: [SimpleEmbed('failure', 'Invalid mute length given')] })
          },
          ...guildDefaults(interaction, user)
        ],
        noResponse: noResponse(interaction)
      },
      log
    )
  }
}

export default Mute
