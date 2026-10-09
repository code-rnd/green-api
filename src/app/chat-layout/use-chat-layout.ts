import { useUiStore } from '../../stores/use-ui-store'

export function useChatLayout() {
  return useUiStore((state) => state.linkError)
}
