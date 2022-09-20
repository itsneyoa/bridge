import { APIEmbed, inlineCode } from 'discord.js'
import DiscordCommand from '../../structs/DiscordCommand'
import { headUrl } from '../../utils/Embed'
import Styles from '../../utils/Styles'

const Help: DiscordCommand = {
  name: 'help',
  description: 'Shows help for the bot!',
  options: [],
  permission: 'all',
  dmPermission: true,
  async execute(interaction, bridge) {
    const discordCommands = [...bridge.discord.commands.values()]
      .sort()
      .map(command => `${inlineCode(command.name)}: ${command.description}`)
      .join('\n')

    // const minecraftCommands =

    const embed: APIEmbed = {
      author: {
        name: 'Help!',
        icon_url: interaction.client.user?.avatarURL() ?? undefined
      },
      fields: [
        {
          name: 'Discord Commands',
          value: discordCommands ?? 'None found!'
        },
        {
          name: 'Emojis',
          value: Object.values(Styles.warnings)
            .map(({ emoji, explanation }) => `${inlineCode(emoji)}: ${explanation}}`)
            .join('\n'),
        },
        {
          name: 'Info',
          value: [
            `Guild Channel: <#${bridge.config.channels.guild}>`,
            `Officer Channel: <#${bridge.config.channels.officer}>`,
            `Staff Role: <@&${bridge.config.staffRole}>`,
            `Version: ${inlineCode(process.env['npm_package_version'] ?? 'Unknown')}`
          ].join('\n'),
        }
      ],
      color: interaction.guild?.members.me?.displayColor,
      footer: {
        text: 'Created by neyoa#1572',
        icon_url: headUrl('neyoa')
      }
    }

    return interaction.editReply({ embeds: [embed] })
  }
}

export default Help
