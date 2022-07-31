import { APIEmbed } from 'discord.js'
import Styles from './Styles'

export default function Embed(type: keyof typeof Styles.colours, data: APIEmbed): APIEmbed {
  return { ...data, ...{ color: Styles.colours[type] } }
}
