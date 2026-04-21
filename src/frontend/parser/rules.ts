import { Expr, InfixKind, PrefixKind } from '../expr.js'
import { Token, TokenKind, TokenOf } from '../token.js'
import { Parser } from './index.js'
import { Precedence } from './precedence.js'

export interface ParseRule<K = string> {
  nud?: NudFn<K>
  binding?: {
    led: LedFn<K>
    bp: number
  }
}

/** Null denominator */
export type NudFn<K = string> = K extends TokenKind
  ? (ctx: { p: Parser; token: TokenOf<K> }) => Expr
  : (ctx: { p: Parser; token: Token }) => Expr

/** Left denominator */
export type LedFn<K = string> = K extends TokenKind
  ? (ctx: { p: Parser; token: TokenOf<K>; left: Expr }) => Expr
  : (ctx: { p: Parser; token: Token; left: Expr }) => Expr

export const prefix = (kind: PrefixKind): NudFn => {
  return ({ p }) => {
    p.advance()
    return Expr.prefix(kind, p.parseBp(Precedence.PREFIX))
  }
}

export const infix = (kind: InfixKind, precedence: Precedence): LedFn => {
  return ({ p, left }) => {
    p.advance()
    return Expr.infix(kind, left, p.parseBp(precedence))
  }
}

export const app: LedFn = ({ p, left }) => Expr.app(left, p.parseBp(Precedence.CALL))

export const getRule = (kind: TokenKind) => rules[kind] as ParseRule

export const rules: {
  [K in TokenKind]: ParseRule<K>
} = {
  number: {
    nud: ({ token }) => Expr.number(token.literal),
    binding: {
      bp: Precedence.CALL,
      led: app,
    },
  },
  string: {
    nud: ({ token }) => Expr.string(token.literal),
    binding: {
      bp: Precedence.CALL,
      led: app,
    },
  },
  var: {
    nud: ({ token }) => Expr.var(token.name),
    binding: {
      bp: Precedence.CALL,
      led: app,
    },
  },
  plus: {
    nud: prefix('pos'),
    binding: {
      bp: Precedence.SUM,
      led: infix('add', Precedence.SUM),
    },
  },
  minus: {
    nud: prefix('neg'),
    binding: {
      bp: Precedence.SUM,
      led: infix('sub', Precedence.SUM),
    },
  },
  star: {
    binding: {
      bp: Precedence.PRODUCT,
      led: infix('mul', Precedence.PRODUCT),
    },
  },
  slash: {
    binding: {
      bp: Precedence.PRODUCT,
      led: infix('div', Precedence.PRODUCT),
    },
  },
  lparen: {
    nud: ({ p }) => {
      const expr = p.parseBp(Precedence.LOWEST)
      p.consume('rparen', { kind: 'unclosed rparen' })
      return expr
    },
    binding: {
      bp: Precedence.CALL,
      led: app,
    },
  },
  rparen: {},

  equal: {},
  error: {},
  eof: {},
}
