import { ApplicationCommandOptionType, inlineCode } from 'discord.js'
import DiscordCommand, { noResponse } from '../../structs/DiscordCommand'
import { noPermission, notInGuild, playerNotFound } from '../../utils/CommonRegex'
import { SimpleEmbed } from '../../utils/Embed'

const SetRank: DiscordCommand = {
  name: 'setrank',
  description: 'Sets the given users guild rank to the given value',
  options: [
    {
      name: 'username',
      description: 'The user to set the rank of',
      type: ApplicationCommandOptionType.String,
      minLength: 1,
      maxLength: 16,
      required: true
    },
    {
      name: 'rank',
      description: 'The rank to set the user to',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  permission: 'staff',
  dmPermission: false,
  async execute(interaction, discord, log) {
    const user = interaction.options.getString('username')?.trim()
    const rank = interaction.options.getString('rank')?.trim()

    if (!user) return interaction.editReply({ embeds: [SimpleEmbed('failure', 'User argument not found')] })
    if (user.match(/\s/g)) return interaction.editReply({ embeds: [SimpleEmbed('failure', 'User argument cannot contain spaces')] })
    if (!rank) return interaction.editReply({ embeds: [SimpleEmbed('failure', 'Rank argument not found')] })

    const command = `/g setrank ${user} ${rank}`

    return discord.minecraft.execute(
      {
        command,
        regex: [
          {
            exp: RegExp(`^(?:\\[.+?\\] )?(${user}) was (demoted|promoted) from (.+) to (.+)$`, 'i'),
            exec: ([, username, state, from, to]) =>
              interaction.editReply({
                embeds: [
                  SimpleEmbed(
                    state == 'promoted' ? 'success' : 'failure',
                    `${inlineCode(username)} has been ${state} from ${inlineCode(from)} to ${inlineCode(to)}`
                  )
                ]
              })
          },
          notInGuild(interaction),
          playerNotFound(interaction, user),
          {
            exp: RegExp(`^I couldn't find a rank by the name of '(${rank})'!$`, 'i'),
            exec: ([, rank]) => interaction.editReply({ embeds: [SimpleEmbed('failure', `Couldn't find a rank by the name of ${inlineCode(rank)}`)] })
          },
          {
            exp: /^They already have that rank!$/,
            exec: ([, username]) => interaction.editReply({ embeds: [SimpleEmbed('failure', `${inlineCode(username)} already has that rank`)] })
          },
          {
            exp: /^You can only (demote|promote) up to your own rank!$/,
            exec: () => interaction.editReply({ embeds: [SimpleEmbed('failure', `I don't have permission to do that`)] })
          },
          noPermission(interaction)
        ],
        noResponse: noResponse(interaction)
      },
      log
    )
  }
}

export default SetRank
