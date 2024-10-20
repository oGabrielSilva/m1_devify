import { hashPassword } from '../auth/password'
import { getDBClient } from '../db/client'
import { props } from '../utils/props'

export async function seedRootUser() {
  if (props.admin.rootUser.seedUser) {
    const client = getDBClient()
    const countRootUser = await client.user.count({
      where: { email: props.admin.rootUser.details.email },
    })

    if (countRootUser <= 0) {
      console.log('Seed root user...')
      const password = props.admin.rootUser.details.username + '@' + Date.now()
      const passwordHash = await hashPassword(password)

      if (!passwordHash) throw new Error('Error on hash password')

      const { email, name, username } = props.admin.rootUser.details
      const user = await client.user.create({
        data: { email, name, username, password: passwordHash, emailVerified: true },
      })

      console.log(`Root user created with password: ${password}`)
      return user
    }
  }
}
