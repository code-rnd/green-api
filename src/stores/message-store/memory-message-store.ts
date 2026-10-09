import type { Chat, ChatMessage, MessageSnapshot, MessageStore } from './message-store'

const emptySnapshot: MessageSnapshot = { chats: [], messages: [] }

export function createMemoryMessageStore(): MessageStore & { resetForTests(): void } {
  let chats: Chat[] = []
  let messages: ChatMessage[] = []
  let snapshot: MessageSnapshot = emptySnapshot
  let batchDepth = 0
  let pendingNotify = false
  const listeners = new Set<() => void>()

  const emit = () => {
    listeners.forEach((listener) => listener())
  }

  const publish = () => {
    snapshot = {
      chats: [...chats].sort(
        (left, right) =>
          right.updatedAt - left.updatedAt || left.chatId.localeCompare(right.chatId),
      ),
      messages: [...messages],
    }
    if (batchDepth > 0) {
      pendingNotify = true
      return
    }
    emit()
  }

  const store: MessageStore & { resetForTests(): void } = {
    listChats: () => snapshot.chats,
    getMessages: (chatId) => snapshot.messages.filter((message) => message.chatId === chatId),
    upsertChat: (chat) => {
      const index = chats.findIndex((item) => item.chatId === chat.chatId)
      if (index === -1) {
        chats.push(chat)
      } else {
        const current = chats[index]
        chats[index] = {
          ...current,
          title: chat.title.trim() !== '' ? chat.title : current.title,
          preview: chat.preview !== '' ? chat.preview : current.preview,
          updatedAt: Math.max(current.updatedAt, chat.updatedAt),
        }
      }
      publish()
    },
    appendMessage: (chatId, message) => {
      if (messages.some((item) => item.idMessage === message.idMessage)) return
      const stored: ChatMessage = { ...message, chatId }
      messages.push(stored)
      const index = chats.findIndex((item) => item.chatId === chatId)
      if (index === -1) {
        chats.push({
          chatId,
          title: chatId,
          preview: stored.text,
          updatedAt: stored.timestamp,
        })
      } else if (stored.timestamp >= chats[index].updatedAt) {
        chats[index] = {
          ...chats[index],
          preview: stored.text,
          updatedAt: stored.timestamp,
        }
      }
      publish()
    },
    findMessage: (idMessage) => messages.find((item) => item.idMessage === idMessage),
    markFailed: (idMessage) => {
      const index = messages.findIndex((item) => item.idMessage === idMessage)
      if (index === -1 || messages[index].failed) return
      messages[index] = { ...messages[index], failed: true }
      publish()
    },
    batch: (run) => {
      batchDepth += 1
      try {
        run()
      } finally {
        batchDepth -= 1
        if (batchDepth === 0 && pendingNotify) {
          pendingNotify = false
          emit()
        }
      }
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot: () => snapshot,
    resetForTests: () => {
      chats = []
      messages = []
      publish()
    },
  }

  return store
}

const created = createMemoryMessageStore()

export const messageStore: MessageStore = created

export function resetMemoryStoreForTests(): void {
  created.resetForTests()
}
