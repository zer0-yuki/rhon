import { Expr } from '../expr.js'
import { Lexer } from '../lexer.js'
import { Token, TokenKind } from '../token.js'
import { ParseError } from './error.js'
import { Precedence } from './precedence.js'
import { getRule } from './rules.js'

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
