import { Telegraf } from 'telegraf'
import { Actions } from './actions'

export interface Command {
  register: (bot: Telegraf, actions: Actions) => void
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

  register(bot: Telegraf, actions: Actions) {
    this.commands.forEach((command) => command.register(bot, actions))
  }
}
