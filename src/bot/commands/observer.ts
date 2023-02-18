import { Context, Telegraf } from 'telegraf'
import { throttle } from 'throttle-typescript'

import { Command } from '../commands.js'
import { Sessions } from '../sessions/sessions.js'
import { Chat, Stage } from '../sessions/chat.js'
import { config } from '../../config.js'
import { AI } from '../../ai/ai.js'

const editMessage = throttle(
  async (ctx: Context, chatId: number, messageId: number, text: string) => {
    await ctx.telegram.editMessageText(chatId, messageId, messageId.toString(),
      text)
  }, 3000)
const typeText = throttle(async (ctx: Context) => {
  await ctx.sendChatAction('typing')
}, 5000)

export class Observer implements Command {
  register (bot: Telegraf, sessions: Sessions, ai: AI) {
    bot.on('text', async (ctx) => {
      const chat = sessions.restore(ctx.chat.id)
      const message = ctx.message.text
      if (ctx.chat.type === 'private' ||
        message.includes(config.tgName)) {
        switch (chat.stage) {
          case Stage.waitQuestion:
            await this.sendQuestionToAi(message, chat, ctx, ai)
            break
          case Stage.waitAnswer:
            await ctx.reply(
              '* звук мигающих лампочек намекает тебе, что нужно подождать *')
            break
          case Stage.waitPassword:
          default:
            if (message !== config.password && message !== config.tgName + ' ' + config.password) {
              await ctx.reply('Что нужно сказать?')
              chat.setStage(Stage.waitPassword)
            }
            else {
              chat.setStage(Stage.waitQuestion)
              await ctx.reply(`Можешь задавать свои вопросы ID ${chat.id}.`)
            }
        }
      }
    })
  }

  private async sendQuestionToAi (
    text: string, chat: Chat, ctx: Context, ai: AI) {
    chat.setStage(Stage.waitAnswer)
    const message = await ctx.replyWithMarkdownV2('wait')
    try {
      let lastMessageText = ''
      const answer = await ai.question({
        text,
        conversationId: chat.aiDialog.conversationId,
        id: chat.aiDialog.id,
      }, async (aiMessage) => {
        await typeText(ctx)
        if (lastMessageText !== aiMessage.text && aiMessage.text.length > 5) {
          console.log(aiMessage.text)
          lastMessageText = aiMessage.text
          await editMessage(ctx, chat.id, message.message_id,
            aiMessage.text + ' |')
        }
      })
      chat.setAIDialog({
        conversationId: answer.conversationId,
        id: answer.id,
      })
      chat.setStage(Stage.waitQuestion)
      await ctx.telegram.editMessageText(chat.id, message.message_id,
        message.message_id.toString(), answer.text, {
          parse_mode: answer.text.includes('```') ? 'Markdown' : undefined,
        })
    }
    catch (e) {
      console.error(e)
      chat.setStage(Stage.waitQuestion)
      await ctx.reply('* лампочки потухли, звук пропал, приходите завтра *')
    }
  }
}
