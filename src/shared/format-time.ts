export function formatMessageTime(timestampSeconds: number): string {
  return new Date(timestampSeconds * 1000).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
