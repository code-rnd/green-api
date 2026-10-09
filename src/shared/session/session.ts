export const DEFAULT_API_URL = 'https://api.green-api.com'

export type Session = {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export type ConnectionField = 'apiUrl' | 'idInstance' | 'apiTokenInstance'

export function validateConnection(input: Session): ConnectionField[] {
  const missing: ConnectionField[] = []
  if (input.apiUrl.trim() === '') missing.push('apiUrl')
  if (input.idInstance.trim() === '') missing.push('idInstance')
  if (input.apiTokenInstance.trim() === '') missing.push('apiTokenInstance')
  return missing
}

export function normalizeSession(input: Session): Session {
  return {
    apiUrl: input.apiUrl.trim().replace(/\/+$/, ''),
    idInstance: input.idInstance.trim(),
    apiTokenInstance: input.apiTokenInstance.trim(),
  }
}
