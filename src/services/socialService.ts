import type { Social } from '@prisma/client'

export function socialToJSONDTO(social: Social) {
  const { details, identifier, url } = social
  return { identifier, details, url }
}
