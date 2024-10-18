import { Request } from 'express'
import { props } from './props'

export function getLanguageByRequest(request: Request) {
  const code = request.headers[props.language.headerName.toLowerCase()] as string
  return props.language.all.find((l) => l.code === code) ?? props.language.default
}
