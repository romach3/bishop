import { Chat, ChatSession, Stage } from './chat.js'
import fs from 'node:fs'

export class Sessions {
  private items: {[k in number]: Chat} = {}

  restore(id: number): Chat {
    if (this.items[id] == undefined) {
      this.items[id] = new Chat(id)
      this.items[id].stage = Stage.init
    }
    return this.items[id]
  }

  save() {
    try {
      const sessions = Object.values(this.items)
      .reduce((storage, chat) => ([...storage, chat.backup()]), [] as ChatSession[])
      sessions.length > 0 && fs.writeFileSync(process.cwd() + '/storage.json', JSON.stringify(sessions))
    } catch (e) {
      console.error(e)
    }
  }

  load(): this {
    try {
      const storage = JSON.parse(fs.readFileSync(process.cwd() + '/storage.json').toString()) as ChatSession[]
      storage.forEach((session) => {
        const chat = new Chat(session.id)
        chat.restore(session)
        this.items[session.id] = chat
      })
    } catch (e) {
      console.error('Сессии не были загружены.')
    }
    return this
  }

}
