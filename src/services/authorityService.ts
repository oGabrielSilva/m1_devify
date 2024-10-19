import type { Authority } from '@prisma/client'

export function authorityToDTOJSON(a: Authority) {
  const { descriptor } = a
  return { descriptor }
}
