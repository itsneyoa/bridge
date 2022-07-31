import { ApplicationCommandOptionType } from 'discord.js'
import DiscordCommand from '../../structs/DiscordCommand'
import Embed from '../../utils/Embed'

const Invite: DiscordCommand = {
  name: 'invite',
  description: 'Invite a member to the guild!',
  options: [{ name: 'username', description: 'The user to invite', minLength: 1, maxLength: 16, required: true, type: ApplicationCommandOptionType.String }],
  permission: 'staff',
  dmPermission: false,
  async execute(command, discord) {
    const user = command.options.getString('username')

    try {
      return await command.reply({ embeds: [Embed('success', { description: `Would run /g invite ${user}` })] })
    } catch (err) {
      console.error(err)
    }
  }
}

export default Invite
