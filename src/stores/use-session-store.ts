import { create } from 'zustand'
import type { Session } from '../shared/session/session'

type SessionState = {
  session: Session | null
  connect: (session: Session) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  connect: (session) => set({ session }),
}))
