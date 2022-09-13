const regex = /[^\w!@#$%^&*()+\-=[\]{};':"\\|,.<>/? ]/g

export function cleanString(str: string): string {
  return str.normalize().replace(regex, '')
}

export function containsInvalidCharacters(str: string): boolean {
  return regex.test(str.normalize())
}