import { ApplicationCommandOptionType, inlineCode } from 'discord.js'
import DiscordCommand, { noResponse } from '../../structs/DiscordCommand'
import { noPermission, notInGuild, playerNotFound } from '../../utils/CommonRegex'
import { SimpleEmbed } from '../../utils/Embed'

const Promote: DiscordCommand = {
  name: 'promote',
  description: 'Promotes the given user by one guild rank',
  options: [
    {
      name: 'username',
      description: 'The user to promote',
      type: ApplicationCommandOptionType.String,
      minLength: 1,
      maxLength: 16,
      required: true
    }
  ],
  permission: 'staff',
  dmPermission: false,
  async execute(interaction, discord, log) {
    const user = interaction.options.getString('username')?.trim()

    if (!user) return interaction.reply({ embeds: [SimpleEmbed('failure', 'User argument not found')] })
    if (user.match(/\s/g)) return interaction.reply({ embeds: [SimpleEmbed('failure', 'User argument cannot contain spaces')] })

    const command = `/g promote ${user}`

    return discord.minecraft.execute(
      {
        command,
        regex: [
          {
            exp: RegExp(`^(?:\\[.+?\\] )?(${user}) was promoted from (.+) to (.+)$`, 'i'),
            exec: ([, username, from, to]) =>
              interaction.editReply({
                embeds: [SimpleEmbed('success', `${inlineCode(username)} has been promoted from ${inlineCode(from)} to ${inlineCode(to)}`)]
              })
          },
          notInGuild(interaction),
          playerNotFound(interaction, user),
          {
            exp: RegExp(`^(?:\\[.+?\\] )?(${user}) is already the highest rank you've created!$`, 'i'),
            exec: ([, username]) => interaction.editReply({ embeds: [SimpleEmbed('failure', `${inlineCode(username)} is already the highest guild ran`)] })
          },
          {
            exp: /^(?:You can only promote up to your own rank!|(?:\[.+?\] )?(\w+) is the guild master so can't be promoted anymore!)$/,
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

export default Promote
