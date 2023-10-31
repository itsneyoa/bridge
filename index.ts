import 'dotenv/config'
import Bridge from './src/structs/Bridge'
import { createServer } from 'http'

process.title = 'Chat Bridge'

new Bridge().start()

const server = createServer((_, res) => {
  res.writeHead(200)
  res.end()
})

server.listen(8080)
