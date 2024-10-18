import type { Authority, User } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { props } from '../utils/props'

export type JWTPayload = {
  uid: string
  name: string
  username: string
  authorities: Omit<Authority, 'id' | 'userId'>[]
  sub: string
  verified: boolean
}

const secret = process.env.JWT_SECRET as string

export function signJWT(user: User, authorities: Authority[]) {
  if (typeof secret !== 'string') {
    throw new Error('JWT secret not found')
  }

  const token = jwt.sign(getJWTPayload(user, authorities), secret, {
    algorithm: 'HS256',
    issuer: props.details.url,
    audience: props.appName,
    expiresIn: '2 days',
    subject: user.email,
  })

  return token
}

export function recoveryJWTTokenPayloadIfValid(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      audience: props.appName,
      issuer: props.details.url,
    }) as jwt.JwtPayload & JWTPayload

    return {
      authorities: payload.authorities,
      name: payload.name,
      sub: payload.sub,
      uid: payload.uid,
      username: payload.username,
      verified: payload.verified,
    }
  } catch (error) {
    console.log(error)
    return null
  }
}

function getJWTPayload(user: User, authorities: Authority[]) {
  return {
    uid: user.uid,
    name: user.name,
    username: user.username,
    authorities: authorities.map((a) => ({ descriptor: a.descriptor })),
    verified: user.emailVerified,
  } as JWTPayload
}
