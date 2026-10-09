import type { MessageDirection } from '../../stores/message-store/message-store'

export type ThreadMessageView = {
  idMessage: string
  text: string
  direction: MessageDirection
  timeLabel: string
  failed: boolean
}
