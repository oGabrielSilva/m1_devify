const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const URLRegex = /^((https):\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/

export function isURLValid(url: string) {
  return typeof url === 'string' && !url.startsWith('http:') && URLRegex.test(url)
}

export function isNameValid(name: string) {
  if (typeof name !== 'string') return false
  name = name.trim()
  return name.length >= 2 && name.length <= 55
}

export function isEmailValid(email: string) {
  return typeof email === 'string' && email.length <= 150 && emailRegex.test(email.trim())
}

export function isPasswordValid(password: string): boolean {
  if (typeof password !== 'string') {
    return false
  }

  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber
}

export function normalizeText(text?: string) {
  return typeof text === 'string' ? text.trim() : ''
}

export function normalizeURI(uri: string) {
  return typeof uri === 'string' ? encodeURI(uri) : ''
}

export function isSocialIndetifierValid(descriptor: string) {
  if (typeof descriptor !== 'string') return false

  descriptor = descriptor.trim()
  return descriptor.length > 0 && descriptor.length <= 50
}

export function isSocialDetailsValid(details: string) {
  if (typeof details !== 'string') return false

  details = details.trim()
  return details.length <= 30
}
