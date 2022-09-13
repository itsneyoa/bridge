import { ApplicationCommandOptionType, inlineCode } from 'discord.js'
import DiscordCommand, { noResponse } from '../../structs/DiscordCommand'
import { noPermission, playerNotFound, unknownCommand } from '../../utils/CommonRegex'
import { SimpleEmbed } from '../../utils/Embed'

const Invite: DiscordCommand = {
  name: 'invite',
  description: 'Invites the given user to the guild',
  options: [
    {
      name: 'username',
      description: 'The user to invite',
      type: ApplicationCommandOptionType.String,
      minLength: 1,
      maxLength: 16,
      required: true
    }
  ],
  permission: 'staff',
  dmPermission: false,
  async execute(interaction, bridge, log) {
    const user = interaction.options.getString('username')

    if (!user) return interaction.editReply({ embeds: [SimpleEmbed('failure', 'User argument not found')] })
    if (user.match(/\s/g)) return interaction.editReply({ embeds: [SimpleEmbed('failure', 'User argument cannot contain spaces')] })

    const command = `/g invite ${user}`

    return bridge.minecraft.execute(
      {
        command,
        regex: [
          {
            exp: RegExp(`^You invited (?:\\[.+?\\] )?(${user}) to your guild. They have 5 minutes to accept\\.$`, 'i'),
            exec: ([, username]) => interaction.editReply({ embeds: [SimpleEmbed('success', `${inlineCode(username)} has been invited to the guild`)] })
          },
          {
            exp: RegExp(`^You sent an offline invite to (?:\\[.+?\\] )?(${user})! They will have 5 minutes to accept once they come online!$`, 'i'),
            exec: ([, username]) => interaction.editReply({ embeds: [SimpleEmbed('success', `${inlineCode(username)} has been offline invited to the guild`)] })
          },
          {
            exp: RegExp(`^(?:\\[.+?\\] )?(${user}) is already in another guild!$`, 'i'),
            exec: ([, username]) => interaction.editReply({ embeds: [SimpleEmbed('failure', `${inlineCode(username)} is in another guild`)] })
          },
          playerNotFound(interaction, user),
          {
            exp: RegExp(`^You've already invited (?:\\[.+?\\] )?(${user}) to your guild. Wait for them to accept!$`, 'i'),
            exec: ([, username]) => interaction.editReply({ embeds: [SimpleEmbed('failure', `${inlineCode(username)} already has a pending guild invite`)] })
          },
          {
            exp: RegExp(`^(?:\\[.+?\\] )?(${user}) is already in your guild!$`, 'i'),
            exec: ([, username]) => interaction.editReply({ embeds: [SimpleEmbed('failure', `${inlineCode(username)} is already in the guild`)] })
          },
          {
            exp: /^Your guild is full!$/,
            exec: () => interaction.editReply({ embeds: [SimpleEmbed('failure', `The guild is full`)] })
          },
          {
            exp: /^You cannot invite this player to your guild!$/,
            exec: () => interaction.editReply({ embeds: [SimpleEmbed('failure', `${inlineCode(user)} has guild invites disabled`)] })
          },
          noPermission(interaction),
          unknownCommand(interaction)
        ],
        noResponse: noResponse(interaction)
      },
      log
    )
  }
}

export default Invite
