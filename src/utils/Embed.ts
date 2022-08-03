import { APIEmbed } from 'discord.js'
import Styles from './Styles'

export function SimpleEmbed(type: keyof typeof Styles.colours, description: string): APIEmbed {
  return { color: Styles.colours[type], description }
}

export function FullEmbed(type: keyof typeof Styles.colours, data: APIEmbed): APIEmbed {
  return { ...data, ...{ color: Styles.colours[type] } }
}
