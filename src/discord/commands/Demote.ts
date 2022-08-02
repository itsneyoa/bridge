import { ApplicationCommandOptionType } from 'discord.js'
import DiscordCommand, { execute, reply } from '../../structs/DiscordCommand'
import Embed from '../../utils/Embed'

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

    if (!user) return reply(interaction, Embed('failure', 'User argument not found'))
    if (user.match(/\s/g)) return reply(interaction, Embed('failure', 'User argument cannot contain spaces'))

    const command = `/g demote ${user}`

    if (execute(command, discord.minecraft, interaction)) reply(interaction, Embed('success', `Running \`${command}\``))
  }
}

export default Demote
