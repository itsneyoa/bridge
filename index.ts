import 'dotenv/config'
import Discord from './src/discord'

process.title = 'Chat Bridge'

Discord.create().catch(err => {
  console.error(err)
  process.exit(1)
})
