import e, { Handler } from 'express'
import account from '../handlers/account'
import social from '../handlers/social'
import stack from '../handlers/stack'
import { isHelperMiddleware } from '../middlewares/isHelper'
import { isModeratorMiddleware } from '../middlewares/isModerator'
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

  // stack
  router.get('/stacks', asyncHandler(stack.getAll))
  router.get('/stack/:slugOrName', asyncHandler(stack.get))

  router.use(jwtMiddleware as Handler)

  // account
  router.get('/account', asyncHandler(account.whoAmI))
  router.patch('/account', asyncHandler(account.update))
  router.patch('/account/e-mail', asyncHandler(account.updateEmail))
  router.patch('/account/password', asyncHandler(account.updatePassword))

  //push authority
  router.post(
    '/account/authority',
    isModeratorMiddleware,
    asyncHandler(account.pushAuthority),
  )

  // social
  router.post('/social', asyncHandler(social.post))
  router.patch('/social', asyncHandler(social.patch))
  router.delete('/social', asyncHandler(social.delete))

  //stack
  router.post('/stack', isHelperMiddleware, asyncHandler(stack.post))
  router.put('/stack/:slug', isHelperMiddleware, asyncHandler(stack.put))
  router.delete('/stack/:slug', isHelperMiddleware, asyncHandler(stack.disable))
  router.patch('/stack/:slug', isHelperMiddleware, asyncHandler(stack.enable))

  app.use('/v1', router)
}
