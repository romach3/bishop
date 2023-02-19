import { Telegraf } from 'telegraf'

import { Command } from '../commands.js'
import { Actions } from '../actions.js'

export class Start implements Command {
  register(bot: Telegraf, actions: Actions) {
    bot.start(async (ctx) => {
      const chatActions = actions.forChat(ctx)
      await chatActions.startAction()
    })
  }
}
