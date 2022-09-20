import { APIEmbed } from 'discord.js'
import {Colours} from './Styles'

export function SimpleEmbed(type: keyof typeof Colours, description: string): APIEmbed {
  return { color: Colours[type], description }
}

export function FullEmbed(type: keyof typeof Colours, data: APIEmbed): APIEmbed {
  return { ...data, ...{ color: Colours[type] } }
}

export function headUrl(username: string) {
  return `https://mc-heads.net/avatar/${username}/512`
}
