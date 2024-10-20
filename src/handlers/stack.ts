import { Stack } from '@prisma/client'
import { getDBClient } from '../db/client'
import {
  BadRequest,
  Conflict,
  Forbidden,
  getExceptionByStatusCode,
  NotFound,
} from '../exceptions/exception'
import { getStringsByContext } from '../lang/handler'
import { stackToDTOJson } from '../services/stackService'
import { Http } from '../utils/http'
import {
  isMetaDescriptionValid,
  isNameValid,
  normalizeText,
  slugify,
} from '../utils/validation'

async function getAll(req: Req, res: Res) {
  const client = getDBClient()

  const take = Number.isNaN(Number(req.query.take)) ? 25 : Number(req.query.take)
  const skip = Number.isNaN(Number(req.query.skip)) ? 0 : Number(req.query.skip)

  const stacks = await client.stack.findMany({ take, skip, where: { enabled: true } })

  res
    .status(Http.OK)
    .json(stacks.map((st) => stackToDTOJson(st)))
    .end()
}

async function get(req: Req, res: Res) {
  const { slugOrName } = req.params
  const strings = getStringsByContext(res)

  if (!slugOrName) {
    throw new BadRequest(strings.stack.slugOrNameNotSent, req)
  }

  const client = getDBClient()
  const entity = await client.stack.findFirst({
    where: { OR: [{ slug: slugOrName }, { name: slugOrName }] },
  })

  // !Enabled
  if (!entity || !entity.enabled) throw new NotFound(strings.exception.notFound, req)

  res.status(Http.OK).json(stackToDTOJson(entity)).end()
}

type StackDTO = {
  name: string
  description: string
  metaDescription: string
}

async function post(req: Req<StackDTO>, res: Res) {
  const name = normalizeText(req.body.name)

  const strings = getStringsByContext(res)
  if (!isNameValid(name))
    throw new BadRequest(strings.exception.invalidCustomField('nome'), req)

  const slug = slugify(name)
  const client = getDBClient()

  const stackByNameOrSlug = await client.stack.findFirst({
    where: { OR: [{ name }, { slug }] },
  })

  if (stackByNameOrSlug) {
    throw new Conflict(
      stackByNameOrSlug.name === name
        ? strings.exception.conflictEntityAlreadyExists
        : strings.stack.slugAlreadyExists,
      req,
    )
  }

  const createdByUserUid = res.locals.jwtPayload?.uid ?? ''
  if (!createdByUserUid) {
    throw new Forbidden(strings.exception.forbidden, req)
  }

  const stack = await client.stack.create({
    data: {
      name,
      slug,
      description: normalizeText(req.body.description),
      metaDescription: normalizeText(req.body.metaDescription),
      createdByUserUid,
    },
  })

  res.status(Http.CREATED).json(stackToDTOJson(stack)).end()
}

async function put(req: Req<StackDTO>, res: Res) {
  const strings = getStringsByContext(res)
  const { slug } = req.params

  if (typeof slug !== 'string' || slug.length > 100) {
    throw new NotFound(strings.exception.notFound, req)
  }

  const client = getDBClient()
  const stack = await client.stack.findUnique({ where: { slug } })

  if (!stack || !stack.enabled) {
    throw new NotFound(strings.exception.notFound, req)
  }
  const data = {} as Stack

  const name = normalizeText(req.body.name)

  if (name.length > 0 && name !== stack.name) {
    if (!isNameValid(name)) throw new BadRequest(strings.account.invalidName, req)
    data.name = name
    data.slug = slugify(name)

    const stackByNameOrSlug = await client.stack.findFirst({
      where: { OR: [{ name: data.name }, { slug: data.slug }] },
    })

    if (stackByNameOrSlug) {
      throw new Conflict(
        stackByNameOrSlug.name === data.name
          ? strings.exception.conflictEntityAlreadyExists
          : strings.stack.slugAlreadyExists,
        req,
      )
    }
  }

  const description = req.body.description
  if (typeof description === 'string' && description !== stack.description) {
    data.description = description
  }

  const metaDescription = normalizeText(req.body.metaDescription)
  if (
    isMetaDescriptionValid(metaDescription) &&
    metaDescription !== stack.metaDescription
  ) {
    data.metaDescription = metaDescription
  }

  if (Object.keys(data).length > 0) {
    const updated = await client.stack.update({
      where: { id: stack.id },
      data,
    })

    res.status(Http.OK).json(stackToDTOJson(updated)).end()
    return
  }

  res.status(Http.NO_CONTENT).end()
}

async function disable(req: Req, res: Res) {
  const strings = getStringsByContext(res)
  const { slug } = req.params

  if (typeof slug !== 'string' || slug.length > 100) {
    throw new NotFound(strings.exception.notFound, req)
  }

  const client = getDBClient()
  try {
    await client.stack.update({
      where: {
        slug,
        enabled: true,
      },
      data: { enabled: false },
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

async function enable(req: Req, res: Res) {
  const strings = getStringsByContext(res)
  const { slug } = req.params

  if (typeof slug !== 'string' || slug.length > 100) {
    throw new NotFound(strings.exception.notFound, req)
  }

  const client = getDBClient()
  try {
    await client.stack.update({
      where: {
        slug,
        enabled: false,
      },
      data: { enabled: true },
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

export default { getAll, get, post, put, disable, enable }
