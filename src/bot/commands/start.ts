import { Telegraf } from 'telegraf'

import { Command } from '../commands.js'
import { Sessions } from '../sessions/sessions.js'
import { Stage } from '../sessions/chat.js'

export class Start implements Command {
  register(bot: Telegraf, sessions: Sessions) {
    bot.start(async (ctx) => {
      const chat = sessions.restore(ctx.chat.id)
      if (chat.stage !== Stage.init) {
        await ctx.reply('Вы уже зарегистрированы. Выйдите и войдите.')
      } else {
        chat.setStage(Stage.waitPassword)
        await ctx.reply('Что нужно сказать?')
      }
    })
  }
}
