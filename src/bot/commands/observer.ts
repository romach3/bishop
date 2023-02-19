import { Telegraf } from 'telegraf'

import { Command } from '../commands.js'
import { Stage } from '../sessions/chat.js'
import { config } from '../../config.js'
import { Actions, ChatActions } from '../actions.js'

export class Observer implements Command {
  register (bot: Telegraf, actions: Actions) {
    bot.on('text', async (ctx) => {
      const chatActions = actions.forChat(ctx)
      if (await this.textCommands(chatActions)) {
        return
      }
      if (chatActions.type === 'private' || chatActions.message.includes(config.tgName)) {
        switch (chatActions.stage) {
          case Stage.waitQuestion:
            await chatActions.sendQuestionToAiAction()
            break
          case Stage.waitAnswer:
            await chatActions.waitLastAction()
            break
          case Stage.waitPassword:
          default:
            await chatActions.checkPasswordAction()
        }
      }
    })
  }

  private async textCommands(chatActions: ChatActions): Promise<boolean> {
    const command = chatActions.message.replace(config.tgName, '').trim()
    switch (command) {
      case '/reset':
        await chatActions.resetDialogAction()
        return true
    }
    return false
  }
}
