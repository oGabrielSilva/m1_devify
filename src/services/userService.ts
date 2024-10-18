import type { PrismaClient, User } from '@prisma/client'
import type { Request } from 'express'
import { Forbidden, NotFound } from '../exceptions/exception'
import { getStringsByContext } from '../lang/handler'

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

export function getCurrentUserDetails(response: Res) {
  if (!response.locals.jwtPayload || typeof response.locals.jwtPayload.uid !== 'string')
    return null

  return response.locals.jwtPayload
}

export function getCurrentUserDetailsOrThrowsForbidden(response: Res) {
  const p = getCurrentUserDetails(response)

  if (!p) {
    const s = getStringsByContext(response)
    throw new Forbidden(s.exception.forbidden, response.req)
  }

  return p
}

export async function fetchUserFromDB(
  uid: string,
  client: PrismaClient,
  req: Request,
  strings: AppLang,
) {
  const currentUser = await client.user.findUnique({ where: { uid } })

  if (!currentUser) throw new NotFound(strings.account.notFound, req)
  if (!currentUser.enabled || currentUser.locked) {
    throw new Forbidden(strings.account.disabledOrLocked, req)
  }

  return currentUser
}
