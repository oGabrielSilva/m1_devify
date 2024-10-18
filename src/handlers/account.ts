import { User } from '@prisma/client'
import { signJWT } from '../auth/jwt'
import { hashPassword, passwordMatch } from '../auth/password'
import { getDBClient } from '../db/client'
import {
  BadRequest,
  Conflict,
  Forbidden,
  InternalServerError,
  NotFound,
  Unauthorized,
} from '../exceptions/exception'
import { getStringsByContext } from '../lang/handler'
import {
  fetchUserFromDB,
  getCurrentUserDetailsOrThrowsForbidden,
  userToDTOJSON,
} from '../services/userService'
import { Http } from '../utils/http'
import {
  isEmailValid,
  isNameValid,
  isPasswordValid,
  normalizeText,
} from '../utils/validation'

async function whoAmI(req: Req, res: Res) {
  const uid = res.locals.jwtPayload?.uid
  const strings = getStringsByContext(res)

  if (!uid) {
    throw new Forbidden(strings.exception.forbidden, req)
  }

  const client = getDBClient()

  const user = await client.user.findUnique({
    where: { uid },
    include: { authorities: true, social: true },
  })

  if (!user) {
    throw new NotFound(strings.account.notFound, req)
  }

  if (!user.enabled || user.locked) {
    throw new Forbidden(strings.account.disabledOrLocked, req)
  }

  res.status(Http.OK).json(userToDTOJSON(user))
}

export type SignInDTO = {
  email: string
  password: string
}

async function signIn(req: Req<SignInDTO>, res: Res) {
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
    include: { authorities: true, social: true },
  })

  if (!user) {
    throw new NotFound(strings.account.notFound, req)
  }

  if (!user.enabled || user.locked) {
    throw new Forbidden(strings.account.disabledOrLocked, req)
  }

  if (!(await passwordMatch(req.body.password, user.password))) {
    throw new Unauthorized(strings.account.unauthorized, req)
  }

  const token = signJWT(user, user.authorities)

  res.status(Http.OK).json(userToDTOJSON(user, token)).end()
}

export type SignUpDTO = {
  name: string
  username: string
} & SignInDTO

async function signUp(req: Req<SignUpDTO>, res: Res) {
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
    include: { authorities: true, social: true },
  })

  const token = signJWT(user, user.authorities)

  res.status(Http.CREATED).json(userToDTOJSON(user, token)).end()
}

type UpdateAccountDTO = {
  name: string
  username: string
  bio: string
}

async function update(req: Req<UpdateAccountDTO>, res: Res) {
  const userDetails = getCurrentUserDetailsOrThrowsForbidden(res)
  const details = {} as User
  const strings = getStringsByContext(res)

  if (
    req.body.username !== userDetails.username &&
    typeof req.body.username === 'string'
  ) {
    if (!isNameValid(req.body.username)) {
      throw new BadRequest(strings.account.invalidUsername, req)
    }

    details.username = normalizeText(req.body.username)
  }

  if (req.body.name !== userDetails.name && typeof req.body.name === 'string') {
    if (!isNameValid(req.body.name)) {
      throw new BadRequest(strings.account.invalidName, req)
    }

    details.name = normalizeText(req.body.name)
  }

  if (typeof req.body.bio === 'string') {
    details.bio = req.body.bio
  }

  if (Object.keys(details).length < 0) {
    res.status(Http.NO_CONTENT).end()
    return
  }

  const client = getDBClient()
  if (
    details.username &&
    (await client.user.count({ where: { username: details.username } })) > 0
  ) {
    throw new Conflict(strings.account.usernameExist, req)
  }

  const currentUser = await client.user.findUnique({ where: { uid: userDetails.uid } })
  if (!currentUser) throw new NotFound(strings.account.notFound, req)

  if (!currentUser.enabled || currentUser.locked) {
    throw new Forbidden(strings.account.disabledOrLocked, req)
  }

  const user = await client.user.update({
    where: { uid: userDetails.uid },
    data: { ...details },
    include: { authorities: true, social: true },
  })

  const t = signJWT(user, user.authorities)
  res.status(Http.OK).json(userToDTOJSON(user, t)).end()
}

type UpdateEmailDTO = {
  newEmail: string
} & SignInDTO

async function updateEmail(req: Req<UpdateEmailDTO>, res: Res) {
  const strings = getStringsByContext(res)

  if (!isEmailValid(req.body.email) || !isEmailValid(req.body.newEmail)) {
    throw new BadRequest(strings.account.invalidEmail, req)
  }

  if (!isPasswordValid(req.body.password)) {
    throw new BadRequest(strings.account.invalidPassword, req)
  }

  if (req.body.email === req.body.newEmail) {
    throw new BadRequest(strings.account.newEmailBeDifferent, req)
  }

  const newEmail = normalizeText(req.body.newEmail)
  const userDetails = getCurrentUserDetailsOrThrowsForbidden(res)

  if (req.body.email !== userDetails.sub) {
    throw new Unauthorized(strings.account.unauthorized, req)
  }

  if (newEmail === userDetails.sub) {
    res.status(Http.NO_CONTENT).end()
    return
  }

  const client = getDBClient()
  const currentUser = await client.user.findUnique({ where: { uid: userDetails.uid } })
  if (!currentUser) throw new NotFound(strings.account.notFound, req)

  if (!(await passwordMatch(req.body.password, currentUser.password))) {
    throw new Unauthorized(strings.account.unauthorized, req)
  }

  if ((await client.user.count({ where: { email: newEmail } })) > 0) {
    throw new Conflict(strings.account.emailExist, req)
  }

  if (!currentUser.enabled || currentUser.locked) {
    throw new Forbidden(strings.account.disabledOrLocked, req)
  }

  const user = await client.user.update({
    where: { uid: userDetails.uid },
    data: { email: newEmail, emailVerified: false },
    include: { authorities: true },
  })

  const t = signJWT(user, user.authorities)
  res.status(Http.OK).json({ token: t }).end()
}

type UpdatePasswordDTO = { newPassword: string } & SignInDTO

export async function updatePassword(req: Req<UpdatePasswordDTO>, res: Res) {
  const strings = getStringsByContext(res)

  const email = normalizeText(req.body.email)
  if (!isEmailValid(email)) {
    throw new BadRequest(strings.account.invalidEmail, req)
  }

  if (!isPasswordValid(req.body.password) || !isPasswordValid(req.body.newPassword)) {
    throw new BadRequest(strings.account.invalidPassword, req)
  }

  const userDetails = getCurrentUserDetailsOrThrowsForbidden(res)
  if (userDetails.sub !== email) {
    throw new Unauthorized(strings.account.unauthorized, req)
  }

  const client = getDBClient()
  const currentUser = await fetchUserFromDB(userDetails.uid, client, req, strings)

  if (!(await passwordMatch(req.body.password, currentUser.password))) {
    throw new Unauthorized(strings.account.unauthorized, req)
  }

  if (await passwordMatch(req.body.newPassword, currentUser.password)) {
    throw new BadRequest(strings.account.newPasswordBeDifferent, req)
  }

  const password = await hashPassword(req.body.newPassword)
  if (!password) {
    throw new InternalServerError(strings.exception.internalServerError, req)
  }

  const updatedUser = await client.user.update({
    data: { password },
    where: { id: currentUser.id },
    include: { authorities: true, social: true },
  })
  const t = signJWT(updatedUser, updatedUser.authorities)

  res.status(Http.OK).json(userToDTOJSON(updatedUser, t)).end()
}

export default {
  signIn,
  signUp,
  whoAmI,
  update,
  updateEmail,
  updatePassword,
}
