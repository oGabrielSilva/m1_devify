const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const URLRegex =
  /(https:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/

export function isURLValid(url: string) {
  return typeof url === 'string' && !url.startsWith('http:') && URLRegex.test(url)
}

export function isNameValid(name: string) {
  return typeof name === 'string' && name.trim().length >= 2
}

export function isEmailValid(email: string) {
  return typeof email === 'string' && emailRegex.test(email.trim())
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

export function normalizeText(text: string) {
  return typeof text === 'string' ? text.trim() : ''
}

export function normalizeURI(uri: string) {
  return typeof uri === 'string' ? encodeURI(uri) : ''
}
