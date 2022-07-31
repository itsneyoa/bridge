import { APIEmbed } from 'discord.js'
import DiscordCommand from '../../structs/DiscordCommand'
import Embed from '../../utils/Embed'

const Help: DiscordCommand = {
  name: 'help',
  description: 'Shows help for the bot!',
  options: [],
  permission: 'all',
  dmPermission: true,
  async execute(command, discord) {
    const discordCommands = [...discord.commands.values()]
      .sort()
      .map(command => `\`${command.name}\`: ${command.description}`)
      .join('\n')

    // const minecraftCommands =

    const embed: APIEmbed = {
      author: {
        name: 'Help!',
        icon_url: command.client.user?.avatarURL() ?? undefined
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
            `Version: \`${process.env['npm_package_version']}\``
          ].join('\n')
        }
      ],
      color: command.guild?.members.me?.displayColor,
      footer: {
        text: 'Created by neyoa#1572',
        icon_url: 'https://mc-heads.net/avatar/neyoa'
      }
    }

    try {
      return await command.reply({ embeds: [Embed('success', embed)] })
    } catch (err) {
      console.error(err)
    }
  }
}

export default Help
