import { Expr } from './expr.js'
import { Lexer } from '../lexer/index.js'
import { Token, TokenKind } from '../lexer/token.js'
import { ParseError } from './error.js'
import { Precedence } from './precedence.js'
import { getRule } from './rules.js'

export class Parser {
  private lexer: Lexer
  private _errors: ParseError[] = []

  constructor(lexer: Lexer) {
    this.lexer = lexer
  }

  get errors() {
    return this._errors
  }

  parseExpr(): Expr {
    return this.parseExprBp(Precedence.LOWEST)
  }

  report(error: ParseError): void {
    this._errors.push(error)
  }

  /**
   * Consume expected token kind or produce an error.
   */
  consume(expect: TokenKind, error?: ParseError): void {
    const cur = this.advance()
    if (cur.kind !== expect) {
      this.report(error ?? { kind: 'unexpected token', expect, found: cur.kind })
    }
  }

  advance(): Token {
    return this.lexer.advance()
  }

  /**
   * Parse with binding power.
   * It's the core of **Pratt parser**.
   */
  parseExprBp(minBp: number): Expr {
    const cur = this.advance()
    const nud = getRule(cur.kind).nud

    let left: Expr
    if (!nud) {
      // In any time a token without nud can't be an expression
      const error: ParseError = Token.isKind(cur, 'rparen')
        ? { kind: 'unclosed rparen' }
        : { kind: 'not an expression', found: cur.kind }
      this.report(error)
      left = Expr.error()
    } else {
      left = nud({ p: this, token: cur })
    }

    while (true) {
      const op = this.lexer.cur

      const binding = getRule(op.kind).binding
      if (!binding || minBp >= binding.bp) {
        // That means this expression can't accept this kind of op.
        //
        // e.g.   2 * 3 + 1
        // minBp ---^   ^--- binding.bp
        // grouped as (2 * 3) + 1
        // binding power: "+" < "*"
        //
        // e.g.   2 - 3 + 1
        // minBp ---^   ^--- binding.bp
        // binding power: "+" == "-"
        // grouped as (2 - 3) + 1
        break
      }

      // Let led to decide whether advance or not
      left = binding.led({ p: this, token: op, left })
    }

    return left
  }
}
