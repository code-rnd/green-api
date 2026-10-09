import { formatMessageTime } from '../../shared/format-time'
import { useMessageSnapshot } from '../../hooks/use-message-snapshot'
import { useUiStore } from '../../stores/use-ui-store'
import type { ChatListItem } from './chat-list.types'

export function useChatList() {
  const snapshot = useMessageSnapshot()
  const selectedChatId = useUiStore((state) => state.selectedChatId)
  const selectChat = useUiStore((state) => state.selectChat)

  const chats: ChatListItem[] = snapshot.chats.map((chat) => ({
    chatId: chat.chatId,
    title: chat.title,
    preview: chat.preview,
    updatedAt: chat.updatedAt,
  }))

  return {
    chats,
    selectedChatId,
    selectChat,
    formatTime: formatMessageTime,
  }
}
