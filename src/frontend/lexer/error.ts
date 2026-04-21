export type LexError =
  | { kind: 'unclosed string literal'; lexeme: string }
  | { kind: 'unknown char'; char: string }
