import { type User } from '@prisma/client'

export function userToDTOJSON(user: User, bearerToken?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = { ...user } as any

  delete data.avatarFilePath
  delete data.enabled
  delete data.id
  delete data.password

  if (data.bio === null) data.bio = ''

  if (bearerToken) {
    return { user: data, bearerToken }
  }

  return data
}
