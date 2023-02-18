import { Telegraf } from 'telegraf'

import { Command } from '../commands.js'
import { Sessions } from '../sessions/sessions.js'
import { config } from '../../config.js'

export class Reset implements Command {
  register(bot: Telegraf, sessions: Sessions) {
    bot.command(['reset', config.tgName + ' /reset'], async (ctx) => {
      const chat = sessions.restore(ctx.chat.id)
      chat.reset()
      await ctx.reply('Начинаем разговор заново.')
    })
  }
}
