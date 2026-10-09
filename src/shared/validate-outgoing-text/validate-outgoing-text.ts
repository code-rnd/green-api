export const MAX_MESSAGE_LENGTH = 4096

export type OutgoingTextCheck =
  { ok: true; text: string } | { ok: false; reason: 'empty' | 'too-long' }

export function checkOutgoingText(raw: string): OutgoingTextCheck {
  if (raw.trim() === '') return { ok: false, reason: 'empty' }
  if (raw.length > MAX_MESSAGE_LENGTH) return { ok: false, reason: 'too-long' }
  return { ok: true, text: raw }
}
