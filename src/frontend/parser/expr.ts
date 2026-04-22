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

export type PrefixKind = 'pos' | 'neg'

export interface PrefixExpr {
  readonly kind: PrefixKind
  readonly right: Expr
}

export type InfixKind = 'add' | 'sub' | 'mul' | 'div'

export interface InfixExpr {
  readonly kind: InfixKind
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
  prefix: (kind: PrefixKind, right: Expr): PrefixExpr => {
    return { kind, right }
  },
  infix: (kind: InfixKind, left: Expr, right: Expr): InfixExpr => {
    return { kind, left, right }
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
