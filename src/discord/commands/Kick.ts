import { ApplicationCommandOptionType } from 'discord.js'
import DiscordCommand, { reply } from '../../structs/DiscordCommand'
import Embed from '../../utils/Embed'

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
  async execute(interaction, discord) {
    const user = interaction.options.getString('username')?.trim()
    const reason = interaction.options.getString('reason') ?? 'No reason specified'

    if (!user) return reply(interaction, Embed('failure', 'User argument not found'))
    if (user.match(/\s/g)) return reply(interaction, Embed('failure', 'User argument cannot contain spaces'))

    const command = `/g kick ${user} ${reason}`

    discord.minecraft.execute(command)
    return reply(interaction, Embed('success', `Running \`${command}\``))
  }
}

export default Kick