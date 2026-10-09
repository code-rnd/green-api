import { useRef, useState } from 'react'
import { applyNotification } from '../../shared/notification/apply-notification'
import {
  createGreenApiClient,
  deleteNotificationUntilSuccess,
  describeRequestError,
} from '../../shared/green-api-client/green-api-client'
import { isAbortError } from '../../shared/green-api-client/delay'
import { startNotificationPoll } from '../../shared/notification/notification-poll'
import {
  DEFAULT_API_URL,
  normalizeSession,
  validateConnection,
  type ConnectionField,
  type Session,
} from '../../shared/session/session'
import { messageStore } from '../../stores/message-store/message-store'
import { useSessionStore } from '../../stores/use-session-store'
import { useUiStore } from '../../stores/use-ui-store'

const INITIAL_FIELDS: Session = {
  apiUrl: DEFAULT_API_URL,
  idInstance: '',
  apiTokenInstance: '',
}

export function useConnection() {
  const connect = useSessionStore((state) => state.connect)
  const [fields, setFields] = useState<Session>(INITIAL_FIELDS)
  const [missing, setMissing] = useState<ConnectionField[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const update = (field: keyof Session, value: string) => {
    setFields((current) => ({ ...current, [field]: value }))
    setMissing((current) => current.filter((item) => item !== field))
  }

  const submit = async () => {
    const gaps = validateConnection(fields)
    setMissing(gaps)
    setError(null)
    if (gaps.length > 0) return

    const session = normalizeSession(fields)
    const controller = new AbortController()
    abortRef.current?.abort()
    abortRef.current = controller
    setPending(true)

    try {
      const client = createGreenApiClient(session)
      const received = await client.receiveNotification(controller.signal)
      if (received) {
        applyNotification(messageStore, received.body)
        await deleteNotificationUntilSuccess(
          client,
          received.receiptId,
          controller.signal,
          setError,
        )
      }
      connect(session)
      startNotificationPoll(session, useUiStore.getState().setLinkError)
    } catch (caught) {
      if (!isAbortError(caught)) setError(describeRequestError(caught))
    } finally {
      if (!controller.signal.aborted) setPending(false)
    }
  }

  return { fields, update, submit, missing, error, pending }
}
