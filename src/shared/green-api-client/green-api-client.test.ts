import { describe, expect, it, vi } from 'vitest'
import { buildMethodUrl, createGreenApiClient, GreenApiRequestError } from './green-api-client'
import type { Session } from '../session/session'

const session: Session = {
  apiUrl: 'https://api.green-api.com/',
  idInstance: '110100001',
  apiTokenInstance: 'token',
}

describe('green api client', () => {
  it('собирает адреса только для трёх методов', () => {
    expect(buildMethodUrl(session, 'sendMessage')).toBe(
      'https://api.green-api.com/waInstance110100001/sendMessage/token',
    )
    expect(buildMethodUrl(session, 'receiveNotification', '?receiveTimeout=20')).toBe(
      'https://api.green-api.com/waInstance110100001/receiveNotification/token?receiveTimeout=20',
    )
    expect(buildMethodUrl(session, 'deleteNotification', '/15')).toBe(
      'https://api.green-api.com/waInstance110100001/deleteNotification/token/15',
    )
  })

  it('отправляет исходный текст и читает idMessage', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ idMessage: 'mid' }),
    })
    const client = createGreenApiClient(session, fetchImpl as typeof fetch)
    await expect(client.sendMessage('10000000', '  привет 😃  ')).resolves.toBe('mid')
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance110100001/sendMessage/token',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ chatId: '10000000', message: '  привет 😃  ' }),
      }),
    )
  })

  it('считает пустой ответ очереди пустым', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, text: async () => '' })
    const client = createGreenApiClient(session, fetchImpl as typeof fetch)
    await expect(client.receiveNotification()).resolves.toBeNull()
  })

  it('показывает текст ошибки webhook', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'custom webhook url is set',
    })
    const client = createGreenApiClient(session, fetchImpl as typeof fetch)
    await expect(client.receiveNotification()).rejects.toMatchObject({
      message: 'custom webhook url is set',
      webhookBlocked: true,
    })
    await expect(client.receiveNotification()).rejects.toBeInstanceOf(GreenApiRequestError)
  })
})
