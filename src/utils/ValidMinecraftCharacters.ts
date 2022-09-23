const regex = /[^\p{Letter}\p{Number}\p{Punctuation}\p{Space_Separator}\p{Math_Symbol}\p{Currency_Symbol}\p{Modifier_Symbol}\u2700-\u27BF]/gu

export function cleanString(str: string): string {
  return str.normalize().replace(regex, '')
}

export function containsInvalidCharacters(str: string): boolean {
  return regex.test(str.normalize())
}
