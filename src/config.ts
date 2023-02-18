import dotenv from 'dotenv'

dotenv.config()

export const config = {
  openAIKey: process.env.OPENAI_KEY,
  tgKey: process.env.TG_KEY,
  tgName: process.env.TG_BOT_NAME,
  password: process.env.PASSWORD
}
