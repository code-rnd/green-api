import type { MessageStore } from '../../stores/message-store/message-store'
import { decideNotification } from './notification'

export function applyNotification(store: MessageStore, body: unknown): void {
  const decision = decideNotification(
    body,
    (idMessage) => store.findMessage(idMessage) !== undefined,
  )
  if (decision.action === 'append') {
    store.batch(() => {
      store.upsertChat({
        chatId: decision.message.chatId,
        title: decision.chatTitle,
        preview: decision.message.text,
        updatedAt: decision.message.timestamp,
      })
      store.appendMessage(decision.message.chatId, decision.message)
    })
    return
  }
  if (decision.action === 'fail') store.markFailed(decision.idMessage)
}
