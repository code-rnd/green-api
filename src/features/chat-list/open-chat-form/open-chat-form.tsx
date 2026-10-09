import styles from '../chat-list.module.scss'
import { useOpenChatForm } from './use-open-chat-form'

export function OpenChatForm() {
  const { draft, setDraft, openChat, error } = useOpenChatForm()

  return (
    <form
      className={styles.create}
      onSubmit={(event) => {
        event.preventDefault()
        openChat()
      }}
    >
      <label className={styles.label}>
        Идентификатор чата
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="10000000 или 79991234567@c.us"
        />
      </label>
      <button type="submit">Открыть чат</button>
      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </form>
  )
}
