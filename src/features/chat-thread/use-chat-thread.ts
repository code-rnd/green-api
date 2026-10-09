import { formatMessageTime } from '../../shared/format-time'
import { useMessageSnapshot } from '../../hooks/use-message-snapshot'
import { useUiStore } from '../../stores/use-ui-store'
import type { ThreadMessageView } from './chat-thread.types'

export function useChatThread() {
  const snapshot = useMessageSnapshot()
  const selectedChatId = useUiStore((state) => state.selectedChatId)
  const chat = snapshot.chats.find((item) => item.chatId === selectedChatId) ?? null
  const messages: ThreadMessageView[] = snapshot.messages
    .filter((message) => message.chatId === selectedChatId)
    .slice()
    .sort((left, right) => left.timestamp - right.timestamp)
    .map((message) => ({
      idMessage: message.idMessage,
      text: message.text,
      direction: message.direction,
      timeLabel: formatMessageTime(message.timestamp),
      failed: message.failed,
    }))

  return { chat, messages, selectedChatId }
}
