import styles from './chat-list.module.scss'
import { ChatRows } from './chat-rows'
import { OpenChatForm } from './open-chat-form/open-chat-form'

export function ChatList() {
  return (
    <aside className={styles.panel} aria-label="Список чатов">
      <h2 className={styles.title}>Чаты</h2>
      <OpenChatForm />
      <ChatRows />
    </aside>
  )
}
