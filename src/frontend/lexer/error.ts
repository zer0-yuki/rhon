export type LexError = UnclosedStringLiteralError | UnknownCharError

export interface BaseLexError {}

export interface UnclosedStringLiteralError extends BaseLexError {
  kind: 'unclosed string literal'
  lexeme: string
}

export interface UnknownCharError extends BaseLexError {
  kind: 'unknown char'
  char: string
}
