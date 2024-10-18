import bcrypt from 'bcrypt'

export async function hashPassword(p: string) {
  const saltRounds = 10

  try {
    const hash = await bcrypt.hash(p, saltRounds)
    return hash
  } catch (error) {
    console.log(error)
    return null
  }
}

export async function passwordMatch(password: string, hash: string) {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.log(error)
    return false
  }
}
