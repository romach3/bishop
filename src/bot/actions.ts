import { Context } from 'telegraf'
import { throttle } from 'throttle-typescript'
import { Message } from 'typegram'

import { Chat, Stage } from './sessions/chat.js'
import { AI } from '../ai/ai.js'
import { Sessions } from './sessions/sessions.js'
import { config } from '../config.js'

export class Actions {
  private readonly sessions: Sessions
  private readonly ai: AI

  constructor (ai: AI, sessions: Sessions) {
    this.sessions = sessions
    this.ai = ai
  }

  forChat(ctx: Context): ChatActions {
    return new ChatActions(ctx, this.sessions, this.ai)
  }
}

export class ChatActions {
  private readonly ctx: Context
  private readonly ai: AI
  readonly chat: Chat
  readonly message: string
  readonly type: 'private' | 'group'

  constructor (ctx: Context, sessions: Sessions, ai: AI) {
    this.ctx = ctx
    this.ai = ai
    this.chat = sessions.restore(ctx.chat.id)
    this.message = (ctx.message as Message.TextMessage).text
    this.type = ctx.chat.type === 'private' ? 'private' : 'group'
  }

  get stage(): Stage {
    return this.chat.stage
  }

  set stage(stage: Stage) {
    this.chat.setStage(stage)
  }

  async startAction() {
    if (this.stage !== Stage.init) {
      await this.reply('Вы уже зарегистрированы. Выйдите и войдите.')
    } else {
      this.stage = Stage.waitPassword
      await this.reply('Что нужно сказать?')
    }
  }

  async resetDialogAction() {
    this.chat.reset()
    await this.ctx.reply('Начинаем разговор заново.')
    this.stage = Stage.waitQuestion
  }

  async checkPasswordAction() {
    if (this.message !== config.password && this.message !== config.tgName + ' ' + config.password) {
      await this.reply('Что нужно сказать?')
      this.stage = Stage.waitPassword
    } else {
      this.stage = Stage.waitQuestion
      await this.reply(`Можешь задавать свои вопросы.`)
    }
  }

  async waitLastAction() {
    await this.reply('* звук мигающих лампочек намекает, что нужно подождать *')
  }

  async sendQuestionToAiAction () {
    this.stage = Stage.waitAnswer
    const message = await this.ctx.replyWithMarkdownV2('⏳')
    try {
      let lastMessageText = ''
      const answer = await this.ai.question({
        text: this.message,
        conversationId: this.chat.aiDialog.conversationId,
        id: this.chat.aiDialog.id,
      }, async (aiMessage) => {
        await this.typeText()
        if (lastMessageText !== aiMessage.text && aiMessage.text.length > 5) {
          lastMessageText = aiMessage.text
          await this.editMessage(message.message_id, aiMessage.text + ' ✍️')
        }
      })
      this.chat.setAIDialog({
        conversationId: answer.conversationId,
        id: answer.id,
      })
      this.stage = Stage.waitQuestion
      await this.ctx.telegram.editMessageText(this.chat.id, message.message_id,
        message.message_id.toString(), answer.text, {
          parse_mode: answer.text.includes('```') ? 'Markdown' : undefined,
        })
    }
    catch (e) {
      console.error(e)
      this.stage = Stage.waitQuestion
      await this.reply('* лампочки потухли, звук пропал, приходите завтра *')
    }
  }

  async reply(text: string): Promise<void> {
    await this.ctx.reply(text)
  }

  private editMessage = throttle(
    async (messageId: number, text: string) => {
      await this.ctx.telegram.editMessageText(this.chat.id, messageId, messageId.toString(),
        text)
    }, 3000)

  private typeText = throttle(async () => {
    await this.ctx.sendChatAction('typing')
  }, 5000)
}
