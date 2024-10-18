import { Request, Response } from 'express'
import { getStringsByContext } from '../lang/handler'

export class Exception extends Error {
  private readonly timestamp = new Date()

  constructor(
    readonly message: string,
    readonly status: number,
    private readonly request: Request
  ) {
    super(message)
  }

  public toJSON() {
    const { message, request, timestamp } = this

    return {
      message,
      method: request.method,
      url: request.url,
      timestamp,
    }
  }
}

export class BadRequest extends Exception {
  constructor(message: string, request: Request) {
    super(message, 400, request)
  }
}

export class Unauthorized extends Exception {
  constructor(message: string, request: Request) {
    super(message, 401, request)
  }
}

export class Forbidden extends Exception {
  constructor(message: string, request: Request) {
    super(message, 403, request)
  }
}

export class NotFound extends Exception {
  constructor(message: string, request: Request) {
    super(message, 404, request)
  }
}

export class MethodNotAllowed extends Exception {
  constructor(message: string, request: Request) {
    super(message, 405, request)
  }
}

export class Conflict extends Exception {
  constructor(message: string, request: Request) {
    super(message, 409, request)
  }
}

export class UnprocessableEntity extends Exception {
  constructor(message: string, request: Request) {
    super(message, 422, request)
  }
}

export class InternalServerError extends Exception {
  constructor(message: string, request: Request) {
    super(message, 500, request)
  }
}

export class NotImplemented extends Exception {
  constructor(message: string, request: Request) {
    super(message, 501, request)
  }
}

export class ServiceUnavailable extends Exception {
  constructor(message: string, request: Request) {
    super(message, 503, request)
  }
}

export function getExceptionByStatusCode(
  httpStatus: number,
  request: Request,
  response: Response
): Exception {
  const strings = getStringsByContext(response)

  switch (httpStatus) {
    case 400:
      return new BadRequest(strings.exception.badRequest, request)
    case 401:
      return new Unauthorized(strings.exception.unauthorized, request)
    case 403:
      return new Forbidden(strings.exception.forbidden, request)
    case 404:
      return new NotFound(strings.exception.notFound, request)
    case 405:
      return new MethodNotAllowed(strings.exception.methodNotAllowed, request)
    case 409:
      return new Conflict(strings.exception.conflict, request)
    case 422:
      return new UnprocessableEntity(strings.exception.unprocessableEntity, request)
    case 500:
      return new InternalServerError(strings.exception.internalServerError, request)
    case 501:
      return new NotImplemented(strings.exception.notImplemented, request)
    case 503:
      return new ServiceUnavailable(strings.exception.serviceUnavailable, request)
    default:
      return new Exception('Unknown error', httpStatus, request)
  }
}
