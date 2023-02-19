import { Telegraf } from 'telegraf'

import { Commands } from './commands.js'
import { Sessions } from './sessions/sessions.js'
import { AI } from '../ai/ai.js'
import { Actions } from './actions.js'

export type BotProps = {
  key: string
  commands: Commands
  sessions: Sessions
  ai: AI
}

export class Bot {
  private readonly instance: Telegraf
  private readonly commands: Commands
  private readonly sessions: Sessions

  constructor (props: BotProps) {
    const { commands, sessions, ai, key } = props
    this.instance = new Telegraf(key)
    this.commands = commands
    this.sessions = sessions
    this.commands.register(this.instance, new Actions(ai, sessions))
    process.once('SIGINT', () => this.instance.stop('SIGINT'))
    process.once('SIGTERM', () => this.instance.stop('SIGTERM'))
  }

  async launch(): Promise<void> {
    await this.instance.launch()
  }
}
