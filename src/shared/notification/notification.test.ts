import { describe, expect, it, vi } from 'vitest'
import { applyNotification } from './apply-notification'
import { decideNotification, readReceivePayload } from './notification'
import { createMemoryMessageStore } from '../../stores/message-store/memory-message-store'

function textBody(
  typeWebhook: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    typeWebhook,
    timestamp: 1_700_000_000,
    idMessage: 'm-1',
    senderData: {
      chatId: '10000000',
      chatName: 'Василиса',
    },
    messageData: {
      typeMessage: 'textMessage',
      textMessageData: { textMessage: 'Привет' },
    },
    ...overrides,
  }
}

describe('decideNotification', () => {
  it('разбирает входящий текст', () => {
    const decision = decideNotification(textBody('incomingMessageReceived'), () => false)
    expect(decision).toMatchObject({
      action: 'append',
      chatTitle: 'Василиса',
      message: {
        direction: 'incoming',
        text: 'Привет',
        chatId: '10000000',
        idMessage: 'm-1',
      },
    })
  })

  it('разбирает исходящий текст с телефона', () => {
    const decision = decideNotification(textBody('outgoingMessageReceived'), () => false)
    expect(decision).toMatchObject({
      action: 'append',
      message: { direction: 'outgoing' },
    })
  })

  it('разбирает исходящий текст из API', () => {
    const decision = decideNotification(textBody('outgoingAPIMessageReceived'), () => false)
    expect(decision).toMatchObject({
      action: 'append',
      message: { direction: 'outgoing', idMessage: 'm-1' },
    })
  })

  it('не дублирует исходящее из API с уже известным idMessage', () => {
    expect(decideNotification(textBody('outgoingAPIMessageReceived'), () => true)).toEqual({
      action: 'ignore',
    })
  })

  it('пропускает не-текст и сохраняет receiptId для удаления', () => {
    const payload = readReceivePayload({
      receiptId: 77,
      body: textBody('incomingMessageReceived', {
        messageData: { typeMessage: 'imageMessage' },
      }),
    })
    expect(payload?.receiptId).toBe(77)
    expect(decideNotification(payload?.body, () => false)).toEqual({ action: 'ignore' })
  })

  it('помечает failed и игнорирует прочие статусы', () => {
    expect(
      decideNotification(
        { typeWebhook: 'outgoingMessageStatus', idMessage: 'm-1', status: 'failed' },
        () => true,
      ),
    ).toEqual({ action: 'fail', idMessage: 'm-1' })
    expect(
      decideNotification(
        { typeWebhook: 'outgoingMessageStatus', idMessage: 'm-1', status: 'delivered' },
        () => true,
      ),
    ).toEqual({ action: 'ignore' })
  })

  it('берёт chatId, если имя чата пустое', () => {
    const decision = decideNotification(
      textBody('incomingMessageReceived', {
        senderData: { chatId: '-100', chatName: '  ' },
      }),
      () => false,
    )
    expect(decision).toMatchObject({ action: 'append', chatTitle: '-100' })
  })
})

describe('applyNotification', () => {
  it('не добавляет вторую копию сообщения', () => {
    const store = createMemoryMessageStore()
    const body = textBody('outgoingAPIMessageReceived')
    applyNotification(store, body)
    applyNotification(store, body)
    expect(store.getMessages('10000000')).toHaveLength(1)
  })

  it('уведомляет подписчика один раз на текстовое тело', () => {
    const store = createMemoryMessageStore()
    const listener = vi.fn()
    store.subscribe(listener)
    applyNotification(store, textBody('incomingMessageReceived'))
    expect(listener).toHaveBeenCalledTimes(1)
    expect(store.listChats()[0]).toMatchObject({ title: 'Василиса', preview: 'Привет' })
    expect(store.getMessages('10000000')).toHaveLength(1)
  })
})
