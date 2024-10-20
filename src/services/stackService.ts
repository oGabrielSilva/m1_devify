import { Stack } from '@prisma/client'

export function stackToDTOJson(stack: Stack) {
  const { description, metaDescription, name, slug } = stack

  return { name, slug, description, metaDescription }
}
