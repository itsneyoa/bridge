import 'dotenv/config'
import Bridge from './src/structs/Bridge'

process.title = 'Chat Bridge'

new Bridge().start()
