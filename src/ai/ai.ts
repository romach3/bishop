import { ChatGPTAPI, ChatMessage } from 'chatgpt'

export type AIResponse = {
  id: string
  conversationId: string
  text: string
}

export type AIRequest = AIResponse

export class AI {
  private readonly instance: ChatGPTAPI

  constructor (apiKey: string) {
    this.instance = new ChatGPTAPI({
      apiKey
    })
  }

  async question(request: AIRequest, progress: (message: ChatMessage) => Promise<void>|void): Promise<AIResponse> {
    const res = await this.instance.sendMessage(request.text, {
      conversationId: request.conversationId || undefined,
      parentMessageId: request.id || undefined,
      promptPrefix: 'use markdown for code',
      onProgress: (message: ChatMessage) => {
        void progress(message)
      }
    })
    return {
      id: res.id,
      conversationId: res.conversationId || '',
      text: res.text
    }
  }
}

