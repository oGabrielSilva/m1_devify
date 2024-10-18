import e from 'express'
import { AccountController } from '../controllers/AccountController'
import { Http } from '../utils/http'
import asyncHandler from './wrapper'

export function defineRouterV1(app: e.Application) {
  const router = e.Router()

  router.get('/health', (_, res) => {
    res.status(Http.OK).end()
  })

  router.post('/account', asyncHandler(AccountController.signUp))
  router.post('/account/session', asyncHandler(AccountController.signIn))

  app.use('/v1', router)
}
