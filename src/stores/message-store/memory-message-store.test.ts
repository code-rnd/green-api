import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryMessageStore } from './memory-message-store'
import type { ChatMessage } from './message-store'

function message(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    idMessage: 'm-1',
    chatId: '1',
    text: 'Привет',
    direction: 'outgoing',
    timestamp: 10,
    failed: false,
    ...overrides,
  }
}

describe('memory message store', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('не создаёт второй чат с тем же chatId', () => {
    const store = createMemoryMessageStore()
    store.upsertChat({ chatId: '1', title: 'А', preview: '', updatedAt: 1 })
    store.upsertChat({ chatId: '1', title: 'Б', preview: 'текст', updatedAt: 2 })
    expect(store.listChats()).toHaveLength(1)
    expect(store.listChats()[0]).toMatchObject({ title: 'Б', preview: 'текст' })
  })

  it('не пишет и не читает localStorage', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const getItem = vi.spyOn(Storage.prototype, 'getItem')
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem')
    const clear = vi.spyOn(Storage.prototype, 'clear')
    setItem.mockClear()
    getItem.mockClear()
    removeItem.mockClear()
    clear.mockClear()

    const store = createMemoryMessageStore()
    store.upsertChat({ chatId: '1', title: 'А', preview: '', updatedAt: 1 })
    store.appendMessage('1', message())
    store.markFailed('m-1')
    store.listChats()
    store.getMessages('1')
    store.findMessage('m-1')
    store.getSnapshot()

    expect(setItem).not.toHaveBeenCalled()
    expect(getItem).not.toHaveBeenCalled()
    expect(removeItem).not.toHaveBeenCalled()
    expect(clear).not.toHaveBeenCalled()
  })

  it('не дублирует сообщение и помечает failed', () => {
    const store = createMemoryMessageStore()
    store.appendMessage('1', message())
    store.appendMessage('1', message())
    expect(store.getMessages('1')).toHaveLength(1)
    store.markFailed('m-1')
    expect(store.findMessage('m-1')?.failed).toBe(true)
  })

  it('публикует один снимок на пакет изменений', () => {
    const store = createMemoryMessageStore()
    const listener = vi.fn()
    store.subscribe(listener)
    store.batch(() => {
      store.upsertChat({ chatId: '1', title: 'Василиса', preview: 'Привет', updatedAt: 10 })
      store.appendMessage('1', message({ text: 'Привет', timestamp: 10 }))
    })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(store.getSnapshot().chats[0]).toMatchObject({ title: 'Василиса', preview: 'Привет' })
    expect(store.getSnapshot().messages).toHaveLength(1)
  })

  it('публикует каждый upsert вне пакета', () => {
    const store = createMemoryMessageStore()
    const listener = vi.fn()
    store.subscribe(listener)
    store.upsertChat({ chatId: '1', title: 'А', preview: '', updatedAt: 1 })
    store.upsertChat({ chatId: '1', title: 'Б', preview: '', updatedAt: 2 })
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
