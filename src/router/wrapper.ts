import { RequestHandler } from 'express'

function asyncHandler(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (req: Req, res: Res, next: Next) => Promise<any>
): RequestHandler {
  return ((req: Req, res: Res, next: Next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }) as RequestHandler
}

export default asyncHandler
