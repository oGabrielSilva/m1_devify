import { signJWT } from '../auth/jwt'
import { hashPassword, passwordMatch } from '../auth/password'
import { getDBClient } from '../db/client'
import {
  BadRequest,
  Conflict,
  InternalServerError,
  NotFound,
  Unauthorized,
} from '../exceptions/exception'
import { getStringsByContext } from '../lang/handler'
import { userToDTOJSON } from '../services/userService'
import { Http } from '../utils/http'
import {
  isEmailValid,
  isNameValid,
  isPasswordValid,
  normalizeText,
} from '../utils/validation'

export type SignInDTO = {
  email: string
  password: string
}

export type SignUpDTO = {
  name: string
  username: string
} & SignInDTO

export class AccountController {
  public static async signIn(req: Req<SignInDTO>, res: Res) {
    const strings = getStringsByContext(res)

    if (!isEmailValid(req.body.email)) {
      throw new BadRequest(strings.account.invalidEmail, req)
    }

    if (!isPasswordValid(req.body.password)) {
      throw new BadRequest(strings.account.invalidPassword, req)
    }

    req.body.email = normalizeText(req.body.email)
    const client = getDBClient()

    const user = await client.user.findUnique({
      where: { email: req.body.email },
      include: { authorities: true },
    })

    if (user === null) {
      throw new NotFound(strings.account.notFound, req)
    }

    if (!(await passwordMatch(req.body.password, user.password))) {
      throw new Unauthorized(strings.account.unauthorized, req)
    }

    const token = signJWT(user, user.authorities)

    res.status(Http.OK).json(userToDTOJSON(user, token)).end()
  }

  public static async signUp(req: Req<SignUpDTO>, res: Res) {
    const strings = getStringsByContext(res)

    if (!isNameValid(req.body.name)) {
      throw new BadRequest(strings.account.invalidName, req)
    }

    if (!isEmailValid(req.body.email)) {
      throw new BadRequest(strings.account.invalidEmail, req)
    }

    if (!isPasswordValid(req.body.password)) {
      throw new BadRequest(strings.account.invalidPassword, req)
    }

    if (!isNameValid(req.body.username)) {
      throw new BadRequest(strings.account.invalidUsername, req)
    }

    req.body.name = normalizeText(req.body.name)
    req.body.email = normalizeText(req.body.email)
    req.body.username = normalizeText(req.body.username)

    const client = getDBClient()

    const userByUsername = await client.user.count({
      where: { username: req.body.username },
    })

    if (userByUsername > 0) {
      throw new Conflict(strings.account.usernameExist, req)
    }

    const userByEmail = await client.user.count({ where: { email: req.body.email } })

    if (userByEmail > 0) {
      throw new Conflict(strings.account.emailExist, req)
    }

    const password = await hashPassword(req.body.password)

    if (password === null) {
      throw new InternalServerError(strings.exception.internalServerError, req)
    }

    const user = await client.user.create({
      data: {
        email: req.body.email,
        name: req.body.name,
        username: req.body.username,
        password,
      },
      include: { authorities: true },
    })

    const token = signJWT(user, user.authorities)

    res.status(Http.CREATED).json(userToDTOJSON(user, token)).end()
  }
}
