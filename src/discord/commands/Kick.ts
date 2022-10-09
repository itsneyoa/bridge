import { ApplicationCommandOptionType, inlineCode } from 'discord.js'
import DiscordCommand, { noResponse } from '../../structs/DiscordCommand'
import { guildDefaults } from '../../utils/CommonRegex'
import { SimpleEmbed } from '../../utils/Embed'

const Kick: DiscordCommand = {
  name: 'kick',
  description: 'Kicks the given user from the guild for the given reason',
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
      name: 'reason',
      description: 'The reason the user has been kicked',
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],
  permission: 'staff',
  dmPermission: false,
  async execute(interaction, bridge, log) {
    const user = interaction.options.getString('username')?.trim()
    const reason = interaction.options.getString('reason') ?? 'No reason specified'

    if (!user) return interaction.editReply({ embeds: [SimpleEmbed('failure', 'User argument not found')] })
    if (user.match(/\s/g)) return interaction.editReply({ embeds: [SimpleEmbed('failure', 'User argument cannot contain spaces')] })

    const command = `/g kick ${user} ${reason}`

    return bridge.minecraft.execute(
      {
        command,
        regex: [
          {
            exp: RegExp(`^(?:\\[.+?\\] )?(${user}) was kicked from the guild by (?:\\[.+?\\] )?(${bridge.minecraft.username})!$`, 'i'),
            exec: ([, username]) => interaction.editReply({ embeds: [SimpleEmbed('success', `${inlineCode(username)} was kicked from the guild`)] })
          },
          {
            exp: RegExp(`^Invalid usage! '\\/guild kick <player> <reason>'$`),
            exec: () => interaction.editReply({ embeds: [SimpleEmbed('failure', 'Missing reason')] })
          },
          ...guildDefaults(interaction, user)
        ],
        noResponse: noResponse(interaction)
      },
      log
    )
  }
}

export default Kick
