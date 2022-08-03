import { ApplicationCommandOptionType } from 'discord.js'
import DiscordCommand, { execute, reply } from '../../structs/DiscordCommand'
import {SimpleEmbed} from '../../utils/Embed'

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
      required: false
    }
  ],
  permission: 'staff',
  dmPermission: false,
  async execute(interaction, discord) {
    const user = interaction.options.getString('username')?.trim()
    const rank = interaction.options.getString('rank')?.trim()

    if (!user) return reply(interaction, SimpleEmbed('failure', 'User argument not found'))
    if (user.match(/\s/g)) return reply(interaction, SimpleEmbed('failure', 'User argument cannot contain spaces'))
    if (!rank) return reply(interaction, SimpleEmbed('failure', 'Rank argument not found'))

    const command = `/g setrank ${user} ${rank}`

    if (execute(command, discord.minecraft, interaction)) reply(interaction, SimpleEmbed('success', `Running \`${command}\``))
  }
}

export default SetRank
