import { describe, expect, it } from 'vitest'
import { checkOutgoingText } from './validate-outgoing-text'

describe('checkOutgoingText', () => {
  it('отклоняет пустую строку и пробелы', () => {
    expect(checkOutgoingText('')).toEqual({ ok: false, reason: 'empty' })
    expect(checkOutgoingText(' \n\t ')).toEqual({ ok: false, reason: 'empty' })
  })

  it('сохраняет края и эмодзи', () => {
    expect(checkOutgoingText('  привет 😃  ')).toEqual({ ok: true, text: '  привет 😃  ' })
  })

  it('пропускает 4096 символов и блокирует 4097', () => {
    const limit = 'а'.repeat(4096)
    expect(checkOutgoingText(limit)).toEqual({ ok: true, text: limit })
    expect(checkOutgoingText(`${limit}а`)).toEqual({ ok: false, reason: 'too-long' })
  })
})
