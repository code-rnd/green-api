import { useSyncExternalStore } from 'react'
import { messageStore } from '../stores/message-store/message-store'

export function useMessageSnapshot() {
  return useSyncExternalStore(
    messageStore.subscribe,
    messageStore.getSnapshot,
    messageStore.getSnapshot,
  )
}
