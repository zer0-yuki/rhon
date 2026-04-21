import { TokenKind } from '../lexer/token.js'

export type ParseError =
  | { kind: 'unexpected token'; expect: TokenKind; found: TokenKind }
  | { kind: 'not an expression'; found: TokenKind }
  | { kind: 'lex error'; message: string }
  | { kind: 'unclosed lparen' }
  | { kind: 'unclosed rparen' }
