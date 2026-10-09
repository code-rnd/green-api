import { useState } from 'react'
import { messageStore } from '../../../stores/message-store/message-store'
import { useUiStore } from '../../../stores/use-ui-store'

export function useOpenChatForm() {
  const selectChat = useUiStore((state) => state.selectChat)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  const openChat = () => {
    const chatId = draft.trim()
    if (chatId === '') {
      setError('Укажите chatId')
      return
    }
    setError(null)
    const existing = messageStore.listChats().some((chat) => chat.chatId === chatId)
    if (!existing) {
      messageStore.upsertChat({
        chatId,
        title: chatId,
        preview: '',
        updatedAt: Date.now() / 1000,
      })
    }
    selectChat(chatId)
    setDraft('')
  }

  return { draft, setDraft, openChat, error }
}
