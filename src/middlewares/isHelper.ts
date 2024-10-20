import { Request, Response } from 'express'
import { Unauthorized } from '../exceptions/exception'
import { getStringsByContext } from '../lang/handler'
import { isHelper } from '../services/userService'

export function isHelperMiddleware(req: Request, res: Response, next: Next) {
  const userDetails = res.locals.jwtPayload

  if (!userDetails || !isHelper(userDetails)) {
    const strings = getStringsByContext(res)
    throw new Unauthorized(strings.account.insufficientPermissions, req)
  }

  next()
}
