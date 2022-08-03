import { ApplicationCommandOptionType } from 'discord.js'
import DiscordCommand, { execute, reply } from '../../structs/DiscordCommand'
import { SimpleEmbed } from '../../utils/Embed'

const Demote: DiscordCommand = {
  name: 'demote',
  description: 'Demotes the given user by one guild rank',
  options: [
    {
      name: 'username',
      description: 'The user to demote',
      type: ApplicationCommandOptionType.String,
      minLength: 1,
      maxLength: 16,
      required: true
    }
  ],
  permission: 'staff',
  dmPermission: false,
  async execute(interaction, discord) {
    const user = interaction.options.getString('username')?.trim()

    if (!user) return reply(interaction, SimpleEmbed('failure', 'User argument not found'))
    if (user.match(/\s/g)) return reply(interaction, SimpleEmbed('failure', 'User argument cannot contain spaces'))

    const command = `/g demote ${user}`

    if (execute(command, discord.minecraft, interaction)) reply(interaction, SimpleEmbed('success', `Running \`${command}\``))
  }
}

export default Demote
