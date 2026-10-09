import type { ConnectionField } from '../../shared/session/session'

export type { ConnectionField }

export const FIELD_LABELS: Record<ConnectionField, string> = {
  apiUrl: 'Адрес API',
  idInstance: 'ID инстанса',
  apiTokenInstance: 'Токен инстанса',
}

export const FIELD_ERRORS: Record<ConnectionField, string> = {
  apiUrl: 'Укажите адрес API',
  idInstance: 'Укажите ID инстанса',
  apiTokenInstance: 'Укажите токен инстанса',
}
