import { TokenKind } from '../lexer/token.js'

export type ParseError =
  | UnexpectedTokenError
  | NotAnExpressionError
  | UnclosedLparenError
  | UnclosedRparenError

export interface BaseParseError {}

export interface UnexpectedTokenError extends BaseParseError {
  kind: 'unexpected token'
  expect: TokenKind
  found: TokenKind
}

export interface NotAnExpressionError extends BaseParseError {
  kind: 'not an expression'
  found: TokenKind
}

export interface UnclosedLparenError extends BaseParseError {
  kind: 'unclosed lparen'
}

export interface UnclosedRparenError extends BaseParseError {
  kind: 'unclosed rparen'
}
