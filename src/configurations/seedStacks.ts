import { User } from '@prisma/client'
import { getDBClient } from '../db/client'
import { props } from '../utils/props'

export async function seedStacks(rootUser?: User) {
  if (props.admin.stack.seed.length < 1) return

  const client = getDBClient()
  if (!rootUser) {
    rootUser =
      (await client.user.findUnique({
        where: { email: props.admin.rootUser.details.email },
      })) ?? void 0

    if (!rootUser) {
      console.log('Unable to seed stacks because root user does not exist')
      process.exit(1)
    }
  }

  try {
    const data = await client.stack.createMany({
      data: [
        ...props.admin.stack.seed.map((st) => ({
          ...st,
          createdByUserUid: rootUser.uid,
        })),
      ],
    })

    console.log(data.count + ' stacks created')
  } catch (error) {
    if ((error as any).code === 'P2002') {
      return
    }
    console.log(error)
    process.exit(1)
  }
}
