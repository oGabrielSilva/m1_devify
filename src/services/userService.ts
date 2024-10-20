import { Authority, PrismaClient, Social, User as U } from '@prisma/client'
import type { Request } from 'express'
import { JWTPayload } from '../auth/jwt'
import { Forbidden, NotFound } from '../exceptions/exception'
import { getStringsByContext } from '../lang/handler'
import { socialToJSONDTO } from './socialService'

type User = U & { social: Social[]; authorities: Authority[] }

export function userToDTOJSON(user: User, bearerToken?: string) {
  const data = { ...user } as any

  delete data.avatarFilePath
  delete data.enabled
  delete data.id
  delete data.password

  if (data.bio === null) data.bio = ''

  if (data.social) {
    data.social = user.social.map((social) => socialToJSONDTO(social))
  }

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
  strings?: AppLang,
) {
  if (!strings) {
    strings = getStringsByContext(req.res!)
  }

  const currentUser = await client.user.findUnique({ where: { uid } })

  if (!currentUser) throw new NotFound(strings.account.notFound, req)
  if (!currentUser.enabled || currentUser.locked) {
    throw new Forbidden(strings.account.disabledOrLocked, req)
  }

  return currentUser
}

export function isRoot(user: User | JWTPayload) {
  return !!user.authorities.find((at) => at === Authority.ROOT)
}

export function isAdmin(user: User | JWTPayload) {
  return !!user.authorities.find((at) => at === Authority.ROOT || at === Authority.ADMIN)
}
