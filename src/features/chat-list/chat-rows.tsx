import styles from './chat-list.module.scss'
import { useChatList } from './use-chat-list'

export function ChatRows() {
  const { chats, selectedChatId, selectChat, formatTime } = useChatList()

  if (chats.length === 0) {
    return <p className={styles.empty}>Нет чатов. Укажите chatId, чтобы начать переписку.</p>
  }

  return (
    <ul className={styles.list}>
      {chats.map((chat) => (
        <li key={chat.chatId}>
          <button
            type="button"
            className={chat.chatId === selectedChatId ? styles.selected : styles.item}
            aria-current={chat.chatId === selectedChatId ? 'true' : undefined}
            onClick={() => selectChat(chat.chatId)}
          >
            <span className={styles.row}>
              <span className={styles.name}>{chat.title}</span>
              <time className={styles.time}>{formatTime(chat.updatedAt)}</time>
            </span>
            {chat.preview ? <span className={styles.preview}>{chat.preview}</span> : null}
          </button>
        </li>
      ))}
    </ul>
  )
}
