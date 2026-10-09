import { describe, expect, it, vi } from 'vitest'
import { useSessionStore } from '../../stores/use-session-store'
import { normalizeSession, validateConnection } from './session'

describe('сессия', () => {
  it('помечает пустые поля и убирает хвостовой слэш', () => {
    expect(validateConnection({ apiUrl: '  ', idInstance: '1', apiTokenInstance: '' })).toEqual([
      'apiUrl',
      'apiTokenInstance',
    ])
    expect(
      normalizeSession({
        apiUrl: 'https://api.green-api.com/',
        idInstance: ' 12 ',
        apiTokenInstance: ' abc ',
      }),
    ).toEqual({
      apiUrl: 'https://api.green-api.com',
      idInstance: '12',
      apiTokenInstance: 'abc',
    })
  })

  it('не пишет токен в localStorage', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    setItem.mockClear()
    useSessionStore.getState().connect({
      apiUrl: 'https://api.green-api.com',
      idInstance: '1',
      apiTokenInstance: 'secret-token',
    })
    expect(setItem).not.toHaveBeenCalled()
    expect(useSessionStore.getState().session?.apiTokenInstance).toBe('secret-token')
    useSessionStore.setState({ session: null })
    setItem.mockRestore()
  })
})
