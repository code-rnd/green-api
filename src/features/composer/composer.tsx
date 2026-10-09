import styles from './composer.module.scss'
import { useComposer } from './use-composer'

export function Composer() {
  const { text, update, send, notice, blocked, enabled } = useComposer()

  return (
    <form
      className={styles.bar}
      onSubmit={(event) => {
        event.preventDefault()
        void send()
      }}
    >
      <label className={styles.label}>
        Текст сообщения
        <textarea
          value={text}
          disabled={!enabled}
          rows={1}
          onChange={(event) => update(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              if (!blocked) void send()
            }
          }}
        />
      </label>
      <button type="submit" aria-label="Отправить" disabled={blocked}>
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M3.4 20.6 21 12 3.4 3.4l.8 6.9L16 12 4.2 13.7l-.8 6.9Z" />
        </svg>
      </button>
      {notice ? (
        <p className={styles.notice} role="alert">
          {notice}
        </p>
      ) : null}
    </form>
  )
}
