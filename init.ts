import { constants, copyFileSync, existsSync } from 'fs'

if (!existsSync('.env')) {
  copyFileSync('.env.example', '.env', constants.COPYFILE_EXCL)
}
