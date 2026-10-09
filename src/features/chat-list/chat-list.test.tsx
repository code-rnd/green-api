import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetMemoryStoreForTests } from '../../stores/message-store/memory-message-store'
import { useUiStore } from '../../stores/use-ui-store'
import { ChatList } from './chat-list'

const chatRowsRender = vi.hoisted(() => vi.fn())

vi.mock('./chat-rows', async () => {
  const actual = await vi.importActual<typeof import('./chat-rows')>('./chat-rows')
  return {
    ChatRows: () => {
      chatRowsRender()
      return actual.ChatRows()
    },
  }
})

describe('ChatList', () => {
  beforeEach(() => {
    chatRowsRender.mockClear()
    resetMemoryStoreForTests()
    useUiStore.setState({ selectedChatId: null, linkError: null })
  })

  afterEach(() => {
    cleanup()
  })

  it('не перерисовывает строки при вводе chatId', () => {
    render(<ChatList />)
    const before = chatRowsRender.mock.calls.length
    fireEvent.change(screen.getByLabelText('Идентификатор чата'), { target: { value: '1' } })
    expect(chatRowsRender.mock.calls.length).toBe(before)
    expect(before).toBeGreaterThan(0)
  })

  it('показывает строку после открытия чата', () => {
    render(<ChatList />)
    fireEvent.change(screen.getByLabelText('Идентификатор чата'), {
      target: { value: '10000000' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Открыть чат' }))
    expect(screen.getByRole('button', { name: /10000000/ })).toBeInTheDocument()
  })
})
