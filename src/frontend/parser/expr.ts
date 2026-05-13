// expr types ----------------
export interface NumberExpr {
  readonly kind: 'number'
  readonly literal: number
}
export interface StringExpr {
  readonly kind: 'string'
  readonly literal: string
}

export interface VarExpr {
  readonly kind: 'var'
  readonly name: string
}

export type PrefixOpKind = 'pos' | 'neg'

export interface PrefixExpr {
  readonly kind: 'prefix'
  readonly op: PrefixOpKind
  readonly right: Expr
}

export type InfixOpKind = 'add' | 'sub' | 'mul' | 'div'

export interface InfixExpr {
  readonly kind: 'infix'
  readonly op: InfixOpKind
  readonly left: Expr
  readonly right: Expr
}

export interface AppExpr {
  readonly kind: 'app'
  readonly left: Expr
  readonly right: Expr
}

export interface UnknownExpr {
  readonly kind: 'unknown'
}

export interface ErrorExpr {
  readonly kind: 'error'
}

export type LitExpr = NumberExpr | StringExpr

export type OpExpr = PrefixExpr | InfixExpr

export type Expr = LitExpr | VarExpr | OpExpr | AppExpr | UnknownExpr | ErrorExpr

// constructors
export const Expr = {
  number: (literal: number): NumberExpr => {
    return { kind: 'number', literal }
  },
  string: (literal: string): StringExpr => {
    return { kind: 'string', literal }
  },
  var: (name: string): VarExpr => {
    return { kind: 'var', name }
  },
  prefix: (op: PrefixOpKind, right: Expr): PrefixExpr => {
    return { kind: 'prefix', op, right }
  },
  infix: (op: InfixOpKind, left: Expr, right: Expr): InfixExpr => {
    return { kind: 'infix', op, left, right }
  },
  app: (left: Expr, right: Expr): AppExpr => {
    return { kind: 'app', left, right }
  },
  unknown: (): UnknownExpr => {
    return { kind: 'unknown' }
  },
  error: (): ErrorExpr => {
    return { kind: 'error' }
  },
}
