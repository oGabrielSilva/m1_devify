import e, { Handler } from 'express'
import account from '../handlers/account'
import { jwtMiddleware } from '../middlewares/jwt'
import { Http } from '../utils/http'
import asyncHandler from './wrapper'

export function defineRouterV1(app: e.Application) {
  const router = e.Router()

  router.get('/health', (_, res) => {
    res.status(Http.OK).end()
  })

  router.post('/account/sign-up', asyncHandler(account.signUp))
  router.post('/account/session', asyncHandler(account.signIn))

  router.use(jwtMiddleware as Handler)

  router.get('/account', asyncHandler(account.whoAmI))
  router.patch('/account', asyncHandler(account.update))
  router.patch('/account/e-mail', asyncHandler(account.updateEmail))
  router.patch('/account/password', asyncHandler(account.updatePassword))

  app.use('/v1', router)
}
