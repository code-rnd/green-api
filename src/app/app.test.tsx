import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './app'
import {
  stopNotificationPollForTests,
  startNotificationPoll,
} from '../shared/notification/notification-poll'
import { resetMemoryStoreForTests } from '../stores/message-store/memory-message-store'
import { useSessionStore } from '../stores/use-session-store'
import { useUiStore } from '../stores/use-ui-store'

describe('App', () => {
  beforeEach(() => {
    stopNotificationPollForTests()
    useSessionStore.setState({ session: null })
    useUiStore.setState({ selectedChatId: null, linkError: null })
    resetMemoryStoreForTests()
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => undefined)),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('показывает пустое поле и не вызывает API', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Токен инстанса'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Подключить' }))
    expect(screen.getByText('Укажите токен инстанса')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
    expect(screen.queryByRole('complementary', { name: 'Список чатов' })).not.toBeInTheDocument()
  })

  it('после входа показывает две колонки, а без чата не отправляет текст', () => {
    const session = {
      apiUrl: 'https://api.green-api.com',
      idInstance: '1',
      apiTokenInstance: 'token',
    }
    useSessionStore.getState().connect(session)
    startNotificationPoll(session, useUiStore.getState().setLinkError)
    render(<App />)
    expect(screen.getByRole('complementary', { name: 'Список чатов' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Переписка' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Отправить' })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Идентификатор чата'), {
      target: { value: '10000000' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Открыть чат' }))
    expect(screen.getByRole('button', { name: /10000000/ })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Текст сообщения'), { target: { value: '   ' } })
    expect(screen.getByRole('button', { name: 'Отправить' })).toBeDisabled()
    expect(fetch).toHaveBeenCalledTimes(1)
    const receiveUrl = String(vi.mocked(fetch).mock.calls[0][0])
    expect(receiveUrl).toContain('/receiveNotification/')
    expect(receiveUrl).not.toContain('/sendMessage/')
  })
})
