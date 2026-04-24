import { Expr, InfixKind, PrefixKind } from './expr.js'
import { Token, TokenKind, TokenOf } from '../lexer/token.js'
import { Parser } from './index.js'
import { Precedence } from './precedence.js'
import { ParseDiagnostic } from './error.js'

export interface ParseRule<K = string> {
  nud?: NudFn<K>
  binding?: {
    led: LedFn<K>
    bp: number
  }
}

/**
 * Null denotation.
 *
 * It means what the op express when it **has no left oprand**.
 *
 * e.g. `1 + 2`
 */
export type NudFn<K = string> = K extends TokenKind
  ? // specific type when K is provided
    (ctx: { p: Parser; token: TokenOf<K> }) => Expr
  : // general type when K is not provided
    (ctx: { p: Parser; token: Token }) => Expr

/**
 * Left denotation.
 *
 * It means what the op express when it **has left oprand**.
 *
 * e.g. `-2`
 */
export type LedFn<K = string> = K extends TokenKind
  ? // specific type when K is provided
    (ctx: { p: Parser; token: TokenOf<K>; left: Expr }) => Expr
  : // general type when K is not provided
    (ctx: { p: Parser; token: Token; left: Expr }) => Expr

const makeNud = (kind: PrefixKind): NudFn => {
  return ({ p }) => {
    p.eat()
    return Expr.prefix(kind, p.parseExprBp(Precedence.PREFIX))
  }
}

const makeLed = (kind: InfixKind, precedence: Precedence): LedFn => {
  return ({ p, left }) => {
    p.eat()
    return Expr.infix(kind, left, p.parseExprBp(precedence))
  }
}

const appLed: LedFn = ({ p, left }) => Expr.app(left, p.parseExprBp(Precedence.CALL))

export const getRule = (kind: TokenKind) => rules[kind] as ParseRule

export const rules: {
  [K in TokenKind]: ParseRule<K>
} = {
  number: {
    nud: ({ token }) => Expr.number(token.literal),
    binding: {
      bp: Precedence.CALL,
      led: appLed,
    },
  },
  string: {
    nud: ({ token }) => Expr.string(token.literal),
    binding: {
      bp: Precedence.CALL,
      led: appLed,
    },
  },
  ident: {
    nud: ({ token }) => Expr.var(token.name),
    binding: {
      bp: Precedence.CALL,
      led: appLed,
    },
  },
  plus: {
    nud: makeNud('pos'),
    binding: {
      bp: Precedence.SUM,
      led: makeLed('add', Precedence.SUM),
    },
  },
  minus: {
    nud: makeNud('neg'),
    binding: {
      bp: Precedence.SUM,
      led: makeLed('sub', Precedence.SUM),
    },
  },
  star: {
    // not a prefix
    binding: {
      bp: Precedence.PRODUCT,
      led: makeLed('mul', Precedence.PRODUCT),
    },
  },
  slash: {
    // not a prefix
    binding: {
      bp: Precedence.PRODUCT,
      led: makeLed('div', Precedence.PRODUCT),
    },
  },
  lparen: {
    nud: ({ p }) => {
      const expr = p.parseExprBp(Precedence.LOWEST)
      const cur = p.eat()
      if (cur.kind !== 'rparen') {
        p.report(ParseDiagnostic.unclosedLparen())
      }
      return expr
    },
    binding: {
      bp: Precedence.CALL,
      led: appLed,
    },
  },
  rparen: {
    // It's a terminator
  },

  equal: {},
  colon: {},
  semicolon: {
    // It's a terminator
  },
  eof: {},
}
