/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express'
import props from './application.props.json'
import { pt_BR } from './src/lang/locales/pt_BR'

export {}

declare global {
  type AppLang = typeof pt_BR

  interface Req<T = any> extends Request {
    body: T
  }
  interface Res extends Response {
    locals: {
      lang: typeof props.language.default
    }
  }
  type Next = NextFunction
}
