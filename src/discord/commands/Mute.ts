import { ApplicationCommandOptionType } from 'discord.js'
import DiscordCommand, { execute, reply } from '../../structs/DiscordCommand'
import { SimpleEmbed } from '../../utils/Embed'

const Mute: DiscordCommand = {
  name: 'mute',
  description: 'Mutes the given user for the given time period',
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
      name: 'time',
      description: 'The time to mute for. Use m for minutes, h for hours, d for days (eg 30m)',
      type: ApplicationCommandOptionType.String,
      minLength: 1,
      maxLength: 3,
      required: true
    }
  ],
  permission: 'staff',
  dmPermission: false,
  async execute(interaction, discord) {
    const user = interaction.options.getString('username')?.trim()
    const time = interaction.options.getString('time')?.replace(/\s/g, '')

    if (!user) return reply(interaction, SimpleEmbed('failure', 'User argument not found'))
    if (user.match(/\s/g)) return reply(interaction, SimpleEmbed('failure', 'User argument cannot contain spaces'))
    if (!time) return reply(interaction, SimpleEmbed('failure', 'Time argument not found'))

    const command = `/g mute ${user} ${time}`

    if (execute(command, discord.minecraft, interaction)) reply(interaction, SimpleEmbed('success', `Running \`${command}\``))
  }
}

export default Mute
