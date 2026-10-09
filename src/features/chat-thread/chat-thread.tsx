import styles from './chat-thread.module.scss'
import { useChatThread } from './use-chat-thread'

export function ChatThread() {
  const { chat, messages, selectedChatId } = useChatThread()

  if (!chat) {
    return (
      <section className={styles.empty} aria-label="Переписка">
        Выберите чат или укажите chatId
      </section>
    )
  }

  return (
    <section className={styles.thread} aria-label="Переписка">
      <header className={styles.header}>{chat.title}</header>
      <div className={styles.messages}>
        {messages.length === 0 ? <p className={styles.placeholder}>Сообщений пока нет</p> : null}
        {messages.map((message) => (
          <article
            key={message.idMessage}
            className={message.direction === 'outgoing' ? styles.outgoing : styles.incoming}
          >
            <p className={styles.text}>{message.text}</p>
            <span className={styles.meta}>
              <time>{message.timeLabel}</time>
              {message.failed ? <span className={styles.failed}>Не доставлено</span> : null}
            </span>
          </article>
        ))}
        <div
          key={`${selectedChatId}:${messages.length}`}
          ref={(node) => {
            node?.scrollIntoView({ block: 'end' })
          }}
        />
      </div>
    </section>
  )
}
