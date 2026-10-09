import type { ChatMessage, MessageDirection } from '../../stores/message-store/message-store'

const TEXT_WEBHOOKS = new Set([
  'incomingMessageReceived',
  'outgoingMessageReceived',
  'outgoingAPIMessageReceived',
])

export type NotificationDecision =
  | { action: 'append'; message: ChatMessage; chatTitle: string }
  | { action: 'fail'; idMessage: string }
  | { action: 'ignore' }

export type ReceivePayload = {
  receiptId: number
  body: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readId(value: unknown): string | null {
  if (typeof value === 'string' && value !== '') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

export function readReceivePayload(data: unknown): ReceivePayload | null {
  if (!isRecord(data)) return null
  const receiptId = data.receiptId
  if (typeof receiptId !== 'number' || !Number.isFinite(receiptId)) return null
  return { receiptId, body: data.body }
}

export function decideNotification(
  body: unknown,
  hasMessage: (idMessage: string) => boolean,
): NotificationDecision {
  if (!isRecord(body)) return { action: 'ignore' }

  const typeWebhook = body.typeWebhook
  if (typeWebhook === 'outgoingMessageStatus') {
    const idMessage = readId(body.idMessage)
    if (body.status === 'failed' && idMessage) return { action: 'fail', idMessage }
    return { action: 'ignore' }
  }

  if (typeof typeWebhook !== 'string' || !TEXT_WEBHOOKS.has(typeWebhook)) {
    return { action: 'ignore' }
  }

  const messageData = isRecord(body.messageData) ? body.messageData : null
  const textData =
    messageData && isRecord(messageData.textMessageData) ? messageData.textMessageData : null
  const text = textData?.textMessage
  const senderData = isRecord(body.senderData) ? body.senderData : null
  const chatId = senderData ? readId(senderData.chatId) : null
  const idMessage = readId(body.idMessage)

  if (
    messageData?.typeMessage !== 'textMessage' ||
    typeof text !== 'string' ||
    text.length === 0 ||
    !chatId ||
    !idMessage
  ) {
    return { action: 'ignore' }
  }

  if (hasMessage(idMessage)) return { action: 'ignore' }

  const chatName = senderData?.chatName
  const chatTitle = typeof chatName === 'string' && chatName.trim() !== '' ? chatName : chatId
  const timestamp =
    typeof body.timestamp === 'number' && Number.isFinite(body.timestamp)
      ? body.timestamp
      : Math.floor(Date.now() / 1000)

  const direction: MessageDirection =
    typeWebhook === 'incomingMessageReceived' ? 'incoming' : 'outgoing'

  return {
    action: 'append',
    chatTitle,
    message: {
      idMessage,
      chatId,
      text,
      direction,
      timestamp,
      failed: false,
    },
  }
}
