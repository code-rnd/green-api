import { Connection } from '../features/connection/connection'
import { useSessionStore } from '../stores/use-session-store'
import { ChatLayout } from './chat-layout/chat-layout'

export function App() {
  const session = useSessionStore((state) => state.session)
  if (!session) return <Connection />
  return <ChatLayout />
}
