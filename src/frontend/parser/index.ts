import { Expr } from './expr.js'
import { Lexer } from '../lexer/index.js'
import { Token } from '../lexer/token.js'
import { ParseDiagnostic } from './error.js'
import { Precedence } from './precedence.js'
import { getRule } from './rules.js'
import { Supercombinator } from './super-combinator.js'

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

  // parsing ----------------

  parse(): Supercombinator[] {
    const scs: Supercombinator[] = []
    while (this.peek().kind !== 'eof') {
      const sc = this.parseSc()
      if (sc !== undefined) {
        scs.push(sc)
      }
    }
    return scs
  }

  parseSc(): Supercombinator | undefined {
    let isIdentFirst = true
    let name: string
    while (true) {
      const cur = this.peek()
      if (cur.kind === 'eof') {
        // There will be no more tokens
        this.report(ParseDiagnostic.notABinding())
        this.eat()
        return undefined
      }
      if (cur.kind === 'semicolon') {
        // There is only a semicolon, can't be a binding
        this.report(ParseDiagnostic.notABinding())
        this.eat()
        return undefined
      }
      if (cur.kind !== 'ident') {
        // Can't be a beginning of sc,
        // but we will report it out of the loop
        isIdentFirst = false
        this.eat()
        continue
      }
      // Or it is exactly an ident
      name = cur.name
      this.eat()
      break
    }

    if (!isIdentFirst) {
      this.report(ParseDiagnostic.notABinding())
    }

    const args: string[] = []
    while (true) {
      const cur = this.peek()
      if (cur.kind === 'eof') {
        // There will be no more tokens,
        // but we know its name
        this.report(ParseDiagnostic.unexpectedToken(['ident', 'colon'], cur.kind))
        this.eat()
        return Supercombinator.from_name(name)
      }
      if (cur.kind === 'semicolon') {
        // There is an unfinished binding,
        // but we know its name
        this.report(ParseDiagnostic.unexpectedToken(['ident', 'colon'], cur.kind))
        this.eat()
        return Supercombinator.from_name(name)
      }
      if (cur.kind === 'equal') {
        // no more args are provided
        this.eat()
        break
      }
      if (cur.kind !== 'ident') {
        this.report(ParseDiagnostic.unexpectedToken(['ident', 'colon'], cur.kind))
        this.eat()
        continue
      }
      args.push(cur.name)
      this.eat()
    }

    const body = this.parseExpr()

    const cur = this.eat()
    if (cur.kind !== 'semicolon') {
      this.report(ParseDiagnostic.unexpectedToken(['colon'], cur.kind))
    }

    return {
      name,
      args,
      body,
    }
  }

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
      const error: ParseDiagnostic =
        cur.kind === 'rparen'
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
