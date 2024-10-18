// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env' })

import bodyParser from 'body-parser'
import express, { type NextFunction, type Request, type Response } from 'express'
import morgan from 'morgan'
import { getDBClient } from './db/client'
import { Exception, getExceptionByStatusCode } from './exceptions/exception'
import { getStringsByContext } from './lang/handler'
import { languageMiddleware } from './middlewares/language'
import { defineRouterV1 } from './router/v1'
import asyncHandler from './router/wrapper'
import { Http } from './utils/http'
import { props } from './utils/props'

async function main() {
  const app = express()

  app.use(morgan(props.api.isDev ? 'dev' : 'tiny'))
  app.use(bodyParser.json({ limit: '3mb' }))
  app.use(bodyParser.urlencoded({ extended: true, limit: '3mb' }))

  app.use(asyncHandler(languageMiddleware))

  defineRouterV1(app)

  app.use((req, res, next) => {
    const strs = getStringsByContext(res)
    res
      .status(Http.NOT_FOUND)
      .json(new Exception(strs.exception.notFound, Http.NOT_FOUND, req).toJSON())
    next()
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof Exception) {
      res.status(err.status).json(err.toJSON()).end()
      return
    }
    if (typeof err.status === 'number') {
      res
        .status(err.status)
        .json(getExceptionByStatusCode(err.status, req, res).toJSON())
        .end()
      return
    }
    res
      .status(Http.INTERNAL_SERVER_ERROR)
      .json(
        new Exception(
          getStringsByContext(res).exception.internalServerError,
          Http.INTERNAL_SERVER_ERROR,
          req
        ).toJSON()
      )
      .end()
    console.log(err)
  })

  app.listen(props.api.port, () =>
    console.log(`Application on: http://127.0.0.1:${props.api.port}\n`)
  )
}

main()
  .then(async () => {
    const prisma = getDBClient()
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    const prisma = getDBClient()
    await prisma.$disconnect()

    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
