import * as dotenv from 'dotenv'

export default defineNitroPlugin((nitro) => {
  dotenv.config()
  console.log('Loaded .env configuration from process.cwd()')
})
