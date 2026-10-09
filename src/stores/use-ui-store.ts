import { create } from 'zustand'

type UiState = {
  selectedChatId: string | null
  linkError: string | null
  selectChat: (chatId: string) => void
  setLinkError: (linkError: string | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  selectedChatId: null,
  linkError: null,
  selectChat: (selectedChatId) => set({ selectedChatId }),
  setLinkError: (linkError) => set({ linkError }),
}))
