import { Expr } from './expr.js'
import { Lexer } from '../lexer/index.js'
import { Token, TokenKind } from '../lexer/token.js'
import { ParseDiagnostic } from './error.js'
import { Precedence } from './precedence.js'
import { getRule } from './rules.js'

export class Parser {
  private lexer: Lexer
  private _diagnostics: ParseDiagnostic[] = []

  constructor(lexer: Lexer) {
    this.lexer = lexer
  }

  get diagnostics() {
    return this._diagnostics
  }

  parseExpr(): Expr {
    return this.parseExprBp(Precedence.LOWEST)
  }

  report(diag: ParseDiagnostic): void {
    this._diagnostics.push(diag)
  }

  /**
   * Consume expected token kind or advance to produce an error.
   */
  consume(expect: TokenKind, diag?: ParseDiagnostic): void {
    const cur = this.advance()
    if (cur.kind !== expect) {
      this.report(diag ?? ParseDiagnostic.unexpectedToken(expect, cur.kind))
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
      const error: ParseDiagnostic = Token.isKind(cur, 'rparen')
        ? ParseDiagnostic.unclosedRparen()
        : ParseDiagnostic.notAnExpression(cur.kind)
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
