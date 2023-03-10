import { AIResponse } from '../../ai/ai.js'

export enum Stage {
  init = 'init',
  waitPassword = 'waitInitPassword',
  waitQuestion = 'waitQuestion',
  waitAnswer = 'waitAnswer',
}

export type ChatSession = {
  id: number
  stage: Stage
  hasAIDialog: boolean
  aiDialog: Partial<Omit<AIResponse, 'text'>>
}

export type ChatAIStage = Partial<Omit<AIResponse, 'text'>>

export class Chat {
  id: number
  stage: Stage = Stage.init
  hasAIDialog = false
  aiDialog: ChatAIStage = {}

  constructor (id: number) {
    this.id = id
  }

  setStage(stage: Stage) {
    this.stage = stage
  }

  setAIDialog(aiDialog: ChatAIStage) {
    this.hasAIDialog = true
    this.aiDialog.conversationId = aiDialog.conversationId
    this.aiDialog.id = aiDialog.id
  }

  reset() {
    this.hasAIDialog = false
    this.aiDialog.id = undefined
    this.aiDialog.conversationId = undefined
  }

  restore(session: ChatSession) {
    this.id = session.id
    this.stage = session.stage === Stage.waitAnswer ? Stage.waitQuestion : session.stage
    this.hasAIDialog = session.hasAIDialog
    this.aiDialog = session.aiDialog
  }

  backup(): ChatSession {
    return {
      id: this.id,
      stage: this.stage,
      hasAIDialog: this.hasAIDialog,
      aiDialog: this.aiDialog
    }
  }
}
