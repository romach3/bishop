import { Telegraf } from 'telegraf'

import { Command } from '../commands.js'
import { config } from '../../config.js'
import { Actions } from '../actions.js'

export class Reset implements Command {
  register(bot: Telegraf, actions: Actions) {
    bot.command(['reset', config.tgName + ' /reset'], async (ctx) => {
      const chatActions = actions.forChat(ctx)
      await chatActions.resetDialogAction()
    })
  }
}
