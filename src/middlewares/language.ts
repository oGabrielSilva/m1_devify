import { getLanguageByRequest } from '../utils/lang'

export async function languageMiddleware(req: Req, res: Res, next: Next) {
  const lang = getLanguageByRequest(req)
  res.locals.lang = lang

  next()
}
