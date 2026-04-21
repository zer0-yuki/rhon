import { Expr, InfixKind, PrefixKind } from './expr.js'
import { Lexer } from './lexer.js'
import { Token, TokenKind, TokenOf } from './token.js'

export const enum Precedence {
  LOWEST = 0,
  ASSIGNMENT = 10,
  // logic operation
  LOGICAL_OR = 20,
  LOGICAL_AND = 30,
  BITWISE_OR = 40,
  BITWISE_XOR = 50,
  BITWISE_AND = 60,
  EQUALITY = 70,
  RELATIONA = 80,
  // number operation
  SUM = 90,
  PRODUCT = 100,
  PREFIX = 110,

  CALL = 120,

  MEMBER = 130,
}

/** Null denominator */
type NudFn<K = string> = K extends TokenKind
  ? (ctx: { p: Parser; token: TokenOf<K> }) => Expr
  : (ctx: { p: Parser; token: Token }) => Expr
/** Left denominator */
type LedFn<K = string> = K extends TokenKind
  ? (ctx: { p: Parser; token: TokenOf<K>; left: Expr }) => Expr
  : (ctx: { p: Parser; token: Token; left: Expr }) => Expr

interface ParseRule<K = string> {
  nud?: NudFn<K>
  binding?: {
    led: LedFn<K>
    bp: number
  }
}

const prefix = (kind: PrefixKind): NudFn => {
  return ({ p }) => {
    p.advance()
    return Expr.prefix(kind, p.parseBp(Precedence.PREFIX))
  }
}

const infix = (kind: InfixKind, precedence: Precedence): LedFn => {
  return ({ p, left }) => {
    p.advance()
    return Expr.infix(kind, left, p.parseBp(precedence))
  }
}

const app: LedFn = ({ p, left }) => Expr.app(left, p.parseBp(Precedence.CALL))

const rules: { [K in TokenKind]: ParseRule<K> } = {
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

const getRule = (kind: TokenKind) => rules[kind] as ParseRule

export type ParseError =
  | { kind: 'expect token'; expect: TokenKind; found: TokenKind }
  | { kind: 'not an expression'; found: TokenKind }
  | { kind: 'lex error'; message: string }
  | { kind: 'unclosed lparen' }
  | { kind: 'unclosed rparen' }

export class Parser {
  private lexer: Lexer
  private errors: ParseError[] = []

  constructor(lexer: Lexer) {
    this.lexer = lexer
  }

  get diagnostics() {
    return this.errors
  }

  parse(): Expr {
    return this.parseBp(Precedence.LOWEST)
  }

  consume(expect: TokenKind, error?: ParseError) {
    const cur = this.advance()
    if (cur.kind !== expect) {
      this.report(error ?? { kind: 'expect token', expect, found: cur.kind })
    }
  }

  report(error: ParseError): void {
    this.errors.push(error)
  }

  advance(): Token {
    return this.lexer.advance()
  }

  parseBp(minBp: number): Expr {
    const cur = this.advance()
    const nud = getRule(cur.kind).nud

    let left: Expr
    if (!nud) {
      const error: ParseError = Token.isKind(cur, 'rparen')
        ? { kind: 'unclosed rparen' }
        : Token.isError(cur)
          ? { kind: 'lex error', message: cur.message }
          : { kind: 'not an expression', found: cur.kind }
      this.report(error)
      left = Expr.error()
    } else {
      left = nud({ p: this, token: cur })
    }

    while (true) {
      const op = this.lexer.cur
      if (Token.isError(op)) {
        this.report({ kind: 'lex error', message: op.message })
        // cosume the error token and skip to parse next
        this.advance()
        continue
      }

      const binding = getRule(op.kind).binding
      if (!binding || minBp >= binding.bp) {
        break
      }

      // Let led to decide whether advance or not
      left = binding.led({ p: this, token: op, left })
    }

    return left
  }
}
