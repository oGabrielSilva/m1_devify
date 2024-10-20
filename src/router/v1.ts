import e, { Handler } from 'express'
import account from '../handlers/account'
import social from '../handlers/social'
import { jwtMiddleware } from '../middlewares/jwt'
import { Http } from '../utils/http'
import asyncHandler from './wrapper'

export function defineRouterV1(app: e.Application) {
  const router = e.Router()

  router.get('/health', (_, res) => {
    res.status(Http.OK).end()
  })

  // account
  router.post('/account/sign-up', asyncHandler(account.signUp))
  router.post('/account/session', asyncHandler(account.signIn))

  router.use(jwtMiddleware as Handler)

  // account
  router.get('/account', asyncHandler(account.whoAmI))
  router.patch('/account', asyncHandler(account.update))
  router.patch('/account/e-mail', asyncHandler(account.updateEmail))
  router.patch('/account/password', asyncHandler(account.updatePassword))

  // social
  router.post('/social', asyncHandler(social.post))
  router.patch('/social', asyncHandler(social.patch))
  router.delete('/social', asyncHandler(social.delete))

  //stack
  router.get('/stacks')
  router.get('/stack/:slug')
  router.post('/stack')
  router.patch('/stack')
  router.delete('/stack/:slug')

  app.use('/v1', router)
}
