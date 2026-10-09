import { useRef, useState } from 'react'
import {
  createGreenApiClient,
  describeRequestError,
} from '../../shared/green-api-client/green-api-client'
import { isAbortError } from '../../shared/green-api-client/delay'
import { checkOutgoingText } from '../../shared/validate-outgoing-text/validate-outgoing-text'
import type { ComposerNotice } from './composer.types'
import { messageStore } from '../../stores/message-store/message-store'
import { useSessionStore } from '../../stores/use-session-store'
import { useUiStore } from '../../stores/use-ui-store'

const TOO_LONG = 'Сообщение длиннее 4096 символов'

export function useComposer() {
  const session = useSessionStore((state) => state.session)
  const selectedChatId = useUiStore((state) => state.selectedChatId)
  const [text, setText] = useState('')
  const [notice, setNotice] = useState<ComposerNotice>(null)
  const [sending, setSending] = useState(false)
  const sendingRef = useRef(false)

  const update = (value: string) => {
    setText(value)
    setNotice(value.length > 4096 ? TOO_LONG : null)
  }

  const send = async () => {
    if (!session || !selectedChatId || sendingRef.current) return
    const check = checkOutgoingText(text)
    if (!check.ok) {
      setNotice(check.reason === 'too-long' ? TOO_LONG : null)
      return
    }

    sendingRef.current = true
    setSending(true)
    setNotice(null)
    try {
      const client = createGreenApiClient(session)
      const idMessage = await client.sendMessage(selectedChatId, check.text)
      messageStore.appendMessage(selectedChatId, {
        idMessage,
        chatId: selectedChatId,
        text: check.text,
        direction: 'outgoing',
        timestamp: Math.floor(Date.now() / 1000),
        failed: false,
      })
      setText('')
    } catch (error) {
      if (!isAbortError(error)) setNotice(describeRequestError(error))
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }

  const blocked = !selectedChatId || sending || text.trim() === '' || text.length > 4096

  return { text, update, send, notice, blocked, enabled: Boolean(selectedChatId) }
}
