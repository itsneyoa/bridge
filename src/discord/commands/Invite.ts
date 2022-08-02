import { ApplicationCommandOptionType } from 'discord.js'
import DiscordCommand, { execute, reply } from '../../structs/DiscordCommand'
import Embed from '../../utils/Embed'

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
  async execute(interaction, discord) {
    const user = interaction.options.getString('username')

    if (!user) return reply(interaction, Embed('failure', 'User argument not found'))
    if (user.match(/\s/g)) return reply(interaction, Embed('failure', 'User argument cannot contain spaces'))

    const command = `/g invite ${user}`

    if (execute(command, discord.minecraft, interaction)) reply(interaction, Embed('success', `Running \`${command}\``))
  }
}

export default Invite
