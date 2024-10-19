import { Social } from '@prisma/client'
import { getDBClient } from '../db/client'
import {
  BadRequest,
  Forbidden,
  getExceptionByStatusCode,
  NotFound,
} from '../exceptions/exception'
import { getStringsByContext } from '../lang/handler'
import { socialToJSONDTO } from '../services/socialService'
import {
  fetchUserFromDB,
  getCurrentUserDetailsOrThrowsForbidden,
} from '../services/userService'
import { Http } from '../utils/http'
import {
  isSocialDetailsValid,
  isSocialIndetifierValid,
  isURLValid,
  normalizeText,
} from '../utils/validation'

type SocialDTO = {
  identifier: string
  url: string
  details?: string
}

async function post(req: Req<SocialDTO>, res: Res) {
  const strings = getStringsByContext(res)

  const identifier = normalizeText(req.body.identifier)
  const url = normalizeText(req.body.url)
  const details = normalizeText(req.body.details)

  if (!isSocialIndetifierValid(identifier)) {
    throw new BadRequest(strings.social.invalidIdentifer, req)
  }

  if (!isURLValid(url)) {
    throw new BadRequest(strings.invalidURL, req)
  }

  if (!isSocialDetailsValid(details)) {
    throw new BadRequest(strings.social.invalidDetails, req)
  }

  const client = getDBClient()
  const user = getCurrentUserDetailsOrThrowsForbidden(res)

  const currentUser = await fetchUserFromDB(user.uid, client, req, strings)

  if (
    (await client.social.count({
      where: { identifier, AND: { userId: currentUser.id } },
    })) > 0
  ) {
    const social = await client.social.update({
      data: { details, url },
      where: { identifier, AND: { userId: currentUser.id } },
    })

    res.status(Http.OK).json(socialToJSONDTO(social)).end()
    return
  }

  const social = await client.social.create({
    data: { identifier, details, url, userId: currentUser.id },
  })

  res.status(Http.CREATED).json(socialToJSONDTO(social)).end()
}

async function patch(req: Req<SocialDTO>, res: Res) {
  const { identifier } = req.body
  const strings = getStringsByContext(res)

  if (!isSocialIndetifierValid(identifier)) {
    throw new BadRequest(strings.social.invalidIdentifer, req)
  }

  const client = getDBClient()
  const userDetails = getCurrentUserDetailsOrThrowsForbidden(res)
  const user = await client.user.findUnique({
    where: { uid: userDetails.uid },
    include: { social: { where: { identifier } } },
  })

  if (!user) throw new NotFound(strings.account.notFound, req)
  if (!user.enabled || user.locked) {
    throw new Forbidden(strings.account.disabledOrLocked, req)
  }

  if (user.social.length < 1) {
    throw new NotFound(strings.exception.notFound, req)
  }

  const social = user.social.find((s) => s.identifier === identifier)
  if (!social) {
    throw new NotFound(strings.exception.notFound, req)
  }

  const data = {} as Social
  const details = normalizeText(req.body.details)

  if (details && details !== social.details) {
    if (!isSocialDetailsValid(details)) {
      throw new BadRequest(strings.social.invalidDetails, req)
    }
    data.details = details
  }

  if (req.body.url && req.body.url !== social.url) {
    if (!isURLValid(req.body.url)) {
      throw new BadRequest(strings.invalidURL, req)
    }
    data.url = req.body.url
  }

  if (Object.keys(data).length > 0) {
    const s = await client.social.update({ where: { id: social.id }, data })
    res.status(Http.OK).json(socialToJSONDTO(s)).end()
    return
  }

  res.status(Http.NO_CONTENT).end()
}

type DeleteSocialDTO = {
  identifier: string
}

async function deleteFn(req: Req<DeleteSocialDTO>, res: Res) {
  const { identifier } = req.body

  const client = getDBClient()
  const userDetails = getCurrentUserDetailsOrThrowsForbidden(res)
  const user = await fetchUserFromDB(userDetails.uid, client, req)

  try {
    await client.social.delete({
      where: {
        identifier,
        AND: {
          userId: user.id,
        },
      },
    })

    res.status(Http.NO_CONTENT).end()
  } catch (error) {
    if ((error as any).code === 'P2025') {
      res
        .status(Http.NOT_FOUND)
        .json(getExceptionByStatusCode(Http.NOT_FOUND, req, res))
        .end()
      return
    }
    console.log(error)

    res
      .status(Http.INTERNAL_SERVER_ERROR)
      .json(getExceptionByStatusCode(Http.INTERNAL_SERVER_ERROR, req, res))
      .end()
  }
}

export default {
  post,
  patch,
  delete: deleteFn,
}
