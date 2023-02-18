import { Telegraf } from 'telegraf'
import { Sessions } from './sessions/sessions.js'
import { AI } from '../ai/ai.js'

export interface Command {
  register: (bot: Telegraf, sessions: Sessions, ai: AI) => void
}

export class Commands {
  private readonly commands: Array<Command> = []

  constructor () {
    this.commands = []
  }

  add(command: Command): this {
    this.commands.push(command)
    return this
  }

  register(bot: Telegraf, sessions: Sessions, ai: AI) {
    this.commands.forEach((command) => command.register(bot, sessions, ai))
  }
}
