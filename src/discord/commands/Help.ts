import { APIEmbed, inlineCode } from 'discord.js'
import DiscordCommand from '../../structs/DiscordCommand'
import { headUrl } from '../../utils/Embed'

const Help: DiscordCommand = {
  name: 'help',
  description: 'Shows help for the bot!',
  options: [],
  permission: 'all',
  dmPermission: true,
  async execute(interaction, discord) {
    const discordCommands = [...discord.commands.values()]
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
          value: discordCommands
        },
        {
          name: 'Minecraft Commands',
          value: 'abcdefg'
        },
        {
          name: 'Info',
          value: [
            `Guild Channel: <#${discord.config.channels.guild}>`,
            `Officer Channel: <#${discord.config.channels.officer}>`,
            `Staff Role: <@&${discord.config.staffRole}>`,
            `Version: ${inlineCode(process.env['npm_package_version'] ?? 'Unknown')}`
          ].join('\n')
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
