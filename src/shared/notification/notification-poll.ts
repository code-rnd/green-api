import { applyNotification } from './apply-notification'
import {
  createGreenApiClient,
  deleteNotificationUntilSuccess,
  describeRequestError,
} from '../green-api-client/green-api-client'
import { delay, isAbortError } from '../green-api-client/delay'
import type { Session } from '../session/session'
import { messageStore } from '../../stores/message-store/message-store'

let controller: AbortController | null = null

export function startNotificationPoll(
  session: Session,
  onLinkError: (message: string | null) => void,
): void {
  if (controller) return
  const current = new AbortController()
  controller = current
  const client = createGreenApiClient(session)

  const run = async () => {
    while (controller === current) {
      try {
        const received = await client.receiveNotification(current.signal)
        if (controller !== current) return
        if (received) {
          applyNotification(messageStore, received.body)
          await deleteNotificationUntilSuccess(
            client,
            received.receiptId,
            current.signal,
            (message) => {
              if (controller === current) onLinkError(message)
            },
          )
        }
        if (controller === current) onLinkError(null)
      } catch (error) {
        if (controller !== current || isAbortError(error)) return
        onLinkError(describeRequestError(error))
        try {
          await delay(3000, current.signal)
        } catch {
          return
        }
      }
    }
  }

  void run()
}

export function stopNotificationPollForTests(): void {
  controller?.abort()
  controller = null
}
