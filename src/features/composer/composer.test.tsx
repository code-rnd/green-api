import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetMemoryStoreForTests } from '../../stores/message-store/memory-message-store'
import { useSessionStore } from '../../stores/use-session-store'
import { useUiStore } from '../../stores/use-ui-store'
import { useComposer } from './use-composer'

describe('useComposer', () => {
  beforeEach(() => {
    resetMemoryStoreForTests()
    useSessionStore.setState({
      session: {
        apiUrl: 'https://api.green-api.com',
        idInstance: '1',
        apiTokenInstance: 'token',
      },
    })
    useUiStore.setState({ selectedChatId: '10000000', linkError: null })
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => undefined)),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    useSessionStore.setState({ session: null })
    useUiStore.setState({ selectedChatId: null, linkError: null })
  })

  it('отправляет одно сообщение на два быстрых вызова', () => {
    const { result } = renderHook(() => useComposer())
    act(() => {
      result.current.update('Привет')
    })

    act(() => {
      void result.current.send()
      void result.current.send()
    })

    const sendCalls = vi
      .mocked(fetch)
      .mock.calls.filter((call) => String(call[0]).includes('/sendMessage/'))
    expect(sendCalls).toHaveLength(1)
  })
})
