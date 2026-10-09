import { FIELD_ERRORS, FIELD_LABELS, type ConnectionField } from './connection.types'
import styles from './connection.module.scss'
import { useConnection } from './use-connection'

const FIELDS: ConnectionField[] = ['apiUrl', 'idInstance', 'apiTokenInstance']

export function Connection() {
  const { fields, update, submit, missing, error, pending } = useConnection()

  return (
    <main className={styles.screen}>
      <form
        className={styles.card}
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <h1 className={styles.title}>Чат Telegram</h1>
        <p className={styles.lead}>
          Подключите инстанс GREEN-API, чтобы отправлять и получать текст.
        </p>
        {FIELDS.map((field) => (
          <label key={field} className={styles.field}>
            <span>{FIELD_LABELS[field]}</span>
            <input
              name={field}
              type={field === 'apiTokenInstance' ? 'password' : 'text'}
              autoComplete="off"
              value={fields[field]}
              onChange={(event) => update(field, event.target.value)}
            />
            {missing.includes(field) ? (
              <span className={styles.fieldError} role="alert">
                {FIELD_ERRORS[field]}
              </span>
            ) : null}
          </label>
        ))}
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <button className={styles.submit} type="submit" disabled={pending}>
          {pending ? 'Подключение…' : 'Подключить'}
        </button>
      </form>
    </main>
  )
}
