import { Expr } from './expr.js'
import { Lexer } from '../lexer/index.js'
import { Token, TokenKind, TokenOf } from '../lexer/token.js'
import { ParseDiagnostic } from './error.js'
import { Precedence } from './precedence.js'
import { getRule } from './rules.js'

export class Parser {
  private lexer: Lexer
  private _diagnostics: ParseDiagnostic[] = []

  constructor(lexer: Lexer) {
    this.lexer = lexer
  }

  // diagnostic ----------------

  get diagnostics() {
    return this._diagnostics
  }

  report(diag: ParseDiagnostic): void {
    this._diagnostics.push(diag)
  }

  // raw method ----------------

  eat(): Token {
    return this.lexer.advance()
  }

  peek(): Token {
    return this.lexer.cur
  }

  // checker ----------------

  check<K extends TokenKind>(expect: K): TokenOf<K> | undefined {
    const cur = this.peek()
    if (Token.isEof(cur)) {
      // make it a method ???
      this.report(ParseDiagnostic.unexpectedToken(expect, 'eof'))
      return undefined
    }
    return Token.isKind(cur, expect) ? cur : undefined
  }

  checkOrHandle<K extends TokenKind>(
    expect: K,
    handler: (cur: Token) => void
  ): TokenOf<K> | undefined {
    const cur = this.peek()
    if (Token.isEof(cur)) {
      this.report(ParseDiagnostic.unexpectedToken(expect, 'eof'))
      return undefined
    }
    if (Token.isKind(cur, expect)) {
      return cur
    } else {
      handler(cur)
      return undefined
    }
  }

  checkOrReport<K extends TokenKind>(expect: K, diag: ParseDiagnostic): TokenOf<K> | undefined {
    return this.checkOrHandle(expect, () => this.report(diag))
  }

  // consumer ----------------

  consumeOrHandle<K extends TokenKind>(
    expect: K,
    handler: (cur: Token) => void
  ): TokenOf<K> | undefined {
    const cur = this.peek()
    if (Token.isEof(cur)) {
      this.report(ParseDiagnostic.unexpectedToken(expect, 'eof'))
      return undefined
    }
    if (Token.isKind(cur, expect)) {
      return this.eat() as TokenOf<K>
    } else {
      handler(cur)
      return undefined
    }
  }

  /**
   * Consume expected token kind produce an error.
   */
  consumeOrReport<K extends TokenKind>(expect: K, diag: ParseDiagnostic): TokenOf<K> | undefined {
    return this.consumeOrHandle(expect, () => this.report(diag))
  }

  // parsing ----------------

  parseExpr(): Expr {
    return this.parseExprBp(Precedence.LOWEST)
  }

  /**
   * Parse with binding power.
   * It's the core of **Pratt parser**.
   */
  parseExprBp(minBp: number): Expr {
    const cur = this.eat()
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
      const op = this.peek()

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
