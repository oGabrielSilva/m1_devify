import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prismaDBClient: PrismaClient
}

export function getDBClient() {
  if (!global.prismaDBClient) {
    global.prismaDBClient = new PrismaClient()
  }

  return global.prismaDBClient
}
