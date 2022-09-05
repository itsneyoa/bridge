import { ApplicationCommandOptionType, inlineCode } from 'discord.js'
import DiscordCommand, { noResponse } from '../../structs/DiscordCommand'
import { noPermission, notInGuild, playerNotFound } from '../../utils/CommonRegex'
import { SimpleEmbed } from '../../utils/Embed'

const Unmute: DiscordCommand = {
  name: 'unmute',
  description: 'Unmutes the given user',
  options: [
    {
      name: 'username',
      description: 'The user to unmute',
      type: ApplicationCommandOptionType.String,
      minLength: 1,
      maxLength: 16,
      required: true
    }
  ],
  permission: 'staff',
  dmPermission: false,
  async execute(interaction, discord, log) {
    const user = interaction.options.getString('username')

    if (!user) return interaction.editReply({ embeds: [SimpleEmbed('failure', 'User argument not found')] })
    if (user.match(/\s/g)) return interaction.editReply({ embeds: [SimpleEmbed('failure', 'User argument cannot contain spaces')] })

    const command = `/g unmute ${user}`

    return discord.minecraft.execute(
      {
        command,
        regex: [
          {
            exp: RegExp(`^(?:\\[.+?\\] )?(?:${discord.minecraft.username}) has unmuted (?:\\[.+?\\] )?(${user})$`, 'i'),
            exec: ([, username]) =>
              interaction.editReply({
                embeds: [SimpleEmbed('success', `${inlineCode(username)} has been unmuted`)]
              })
          },
          {
            exp: RegExp(`^(?:\\[.+?\\] )?(${discord.minecraft.username}) has unmuted the guild chat!$`),
            exec: () =>
              interaction.editReply({
                embeds: [SimpleEmbed('success', `Guild chat has been unmuted`)]
              })
          },
          notInGuild(interaction),
          playerNotFound(interaction, user),
          {
            exp: /^This player is not muted!$/,
            exec: () => interaction.editReply({ embeds: [SimpleEmbed('failure', `${inlineCode(user)} is not muted`)] })
          },
          noPermission(interaction)
        ],
        noResponse: noResponse(interaction)
      },
      log
    )
  }
}

export default Unmute
