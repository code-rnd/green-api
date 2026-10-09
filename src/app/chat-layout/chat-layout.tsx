import { ChatList } from '../../features/chat-list/chat-list'
import { ChatThread } from '../../features/chat-thread/chat-thread'
import { Composer } from '../../features/composer/composer'
import styles from './chat-layout.module.scss'
import { useChatLayout } from './use-chat-layout'

export function ChatLayout() {
  const linkError = useChatLayout()

  return (
    <div className={styles.shell}>
      <ChatList />
      <div className={styles.conversation}>
        {linkError ? (
          <p className={styles.banner} role="status">
            {linkError}
          </p>
        ) : null}
        <ChatThread />
        <Composer />
      </div>
    </div>
  )
}
