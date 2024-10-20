import { Request, Response } from 'express'
import { Unauthorized } from '../exceptions/exception'
import { getStringsByContext } from '../lang/handler'
import { isModerator } from '../services/userService'

export function isModeratorMiddleware(req: Request, res: Response, next: Next) {
  const userDetails = res.locals.jwtPayload

  if (!userDetails || !isModerator(userDetails)) {
    const strings = getStringsByContext(res)
    throw new Unauthorized(strings.account.insufficientPermissions, req)
  }

  next()
}
