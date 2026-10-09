/**
 * Порт ленты чатов. Экраны зависят от этого контракта.
 * Сейчас его закрывает память вкладки. Позже та же форма примет кольцевой буфер,
 * метод appendMessage останется местом вытеснения старых записей.
 */
export type MessageDirection = 'incoming' | 'outgoing'

export type Chat = {
  chatId: string
  title: string
  preview: string
  updatedAt: number
}

export type ChatMessage = {
  idMessage: string
  chatId: string
  text: string
  direction: MessageDirection
  timestamp: number
  failed: boolean
}

export type MessageSnapshot = {
  chats: readonly Chat[]
  messages: readonly ChatMessage[]
}

export type MessageStore = {
  listChats(): readonly Chat[]
  getMessages(chatId: string): readonly ChatMessage[]
  upsertChat(chat: Chat): void
  appendMessage(chatId: string, message: ChatMessage): void
  findMessage(idMessage: string): ChatMessage | undefined
  markFailed(idMessage: string): void
  batch(run: () => void): void
  subscribe(listener: () => void): () => void
  getSnapshot(): MessageSnapshot
}

export { messageStore } from './memory-message-store'
