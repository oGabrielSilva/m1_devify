import { recoveryJWTTokenPayloadIfValid } from '../auth/jwt'
import { Forbidden } from '../exceptions/exception'
import { getStringsByContext } from '../lang/handler'

export function jwtMiddleware(req: Req, res: Res, next: Next) {
  const bearer = req.headers.authorization

  if (!bearer || !bearer.startsWith('Bearer ')) {
    const strings = getStringsByContext(res)
    throw new Forbidden(strings.exception.forbidden, req)
  }

  const token = bearer.replace('Bearer ', '')
  const payload = recoveryJWTTokenPayloadIfValid(token)

  if (payload === null) {
    const strings = getStringsByContext(res)
    throw new Forbidden(strings.exception.forbidden, req)
  }

  res.locals.jwtPayload = payload
  next()
}
