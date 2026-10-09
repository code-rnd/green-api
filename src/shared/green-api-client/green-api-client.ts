import type { Session } from '../session/session'
import { delay, isAbortError } from './delay'
import { readReceivePayload, type ReceivePayload } from '../notification/notification'

export const RECEIVE_TIMEOUT_SECONDS = 20

type ApiMethod = 'sendMessage' | 'receiveNotification' | 'deleteNotification'

export class GreenApiRequestError extends Error {
  readonly status: number
  readonly webhookBlocked: boolean

  constructor(message: string, status: number) {
    super(message)
    this.name = 'GreenApiRequestError'
    this.status = status
    this.webhookBlocked = status === 400 && /webhook/i.test(message)
  }
}

export function describeRequestError(error: unknown): string {
  if (error instanceof GreenApiRequestError) {
    return error.message || 'Запрос к GREEN-API не выполнен'
  }
  return 'Нет связи с GREEN-API'
}

export function buildMethodUrl(session: Session, method: ApiMethod, suffix = ''): string {
  const apiUrl = session.apiUrl.replace(/\/+$/, '')
  const idInstance = encodeURIComponent(session.idInstance)
  const apiTokenInstance = encodeURIComponent(session.apiTokenInstance)
  return `${apiUrl}/waInstance${idInstance}/${method}/${apiTokenInstance}${suffix}`
}

export type GreenApiClient = {
  sendMessage(chatId: string, message: string, signal?: AbortSignal): Promise<string>
  receiveNotification(signal?: AbortSignal): Promise<ReceivePayload | null>
  deleteNotification(receiptId: number, signal?: AbortSignal): Promise<void>
}

export function createGreenApiClient(
  session: Session,
  fetchImpl: typeof fetch = fetch,
): GreenApiClient {
  const request = async (url: string, init: RequestInit): Promise<string> => {
    let response: Response
    try {
      response = await fetchImpl(url, init)
    } catch (error) {
      if (isAbortError(error)) throw error
      throw new GreenApiRequestError('Нет связи с GREEN-API', 0)
    }

    const text = await response.text()
    if (!response.ok) {
      throw new GreenApiRequestError(text.trim() || `Ошибка ${response.status}`, response.status)
    }
    return text
  }

  return {
    async sendMessage(chatId, message, signal) {
      const text = await request(buildMethodUrl(session, 'sendMessage'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message }),
        signal,
      })
      let data: unknown
      try {
        data = JSON.parse(text) as unknown
      } catch {
        throw new GreenApiRequestError('Не удалось прочитать ответ GREEN-API', 200)
      }
      if (
        typeof data !== 'object' ||
        data === null ||
        typeof (data as { idMessage?: unknown }).idMessage !== 'string' ||
        (data as { idMessage: string }).idMessage === ''
      ) {
        throw new GreenApiRequestError('В ответе нет idMessage', 200)
      }
      return (data as { idMessage: string }).idMessage
    },

    async receiveNotification(signal) {
      const text = await request(
        buildMethodUrl(
          session,
          'receiveNotification',
          `?receiveTimeout=${RECEIVE_TIMEOUT_SECONDS}`,
        ),
        { method: 'GET', signal },
      )
      if (text.trim() === '' || text.trim() === 'null') return null
      let data: unknown
      try {
        data = JSON.parse(text) as unknown
      } catch {
        throw new GreenApiRequestError('Не удалось прочитать ответ GREEN-API', 200)
      }
      if (data === null) return null
      const payload = readReceivePayload(data)
      if (!payload) throw new GreenApiRequestError('В ответе нет receiptId', 200)
      return payload
    },

    async deleteNotification(receiptId, signal) {
      await request(buildMethodUrl(session, 'deleteNotification', `/${receiptId}`), {
        method: 'DELETE',
        signal,
      })
    },
  }
}

export async function deleteNotificationUntilSuccess(
  client: GreenApiClient,
  receiptId: number,
  signal: AbortSignal,
  onError: (message: string) => void,
): Promise<void> {
  for (;;) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
    try {
      await client.deleteNotification(receiptId, signal)
      return
    } catch (error) {
      if (isAbortError(error)) throw error
      onError(describeRequestError(error))
      await delay(3000, signal)
    }
  }
}
