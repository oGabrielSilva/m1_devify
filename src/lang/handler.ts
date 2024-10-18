import type { Response } from 'express'
import { pt_BR } from './locales/pt_BR'

export function getStringsByContext(response: Response): AppLang {
  if (!response.locals.lang || typeof response.locals.lang.code !== 'string') return pt_BR

  switch (response.locals.lang.code) {
    case 'pt-BR':
      return pt_BR
    default:
      return pt_BR
  }
}
