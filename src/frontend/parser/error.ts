import { TokenKind } from '../lexer/token.js'

export type ParseDiagnostic =
  | UnexpectedTokenDiagnostic
  | NotAnExpressionDiagnostic
  | UnclosedLparenDiagnostic
  | UnclosedRparenDiagnostic
  | NotAbindingDiagnostic

export const ParseDiagnostic = {
  unexpectedToken(expect: TokenKind, found: TokenKind): UnexpectedTokenDiagnostic {
    return {
      kind: 'unexpected token',
      expect,
      found,
    }
  },
  notAnExpression(found: TokenKind): NotAnExpressionDiagnostic {
    return {
      kind: 'not an expression',
      found,
    }
  },
  unclosedLparen(): UnclosedLparenDiagnostic {
    return {
      kind: 'unclosed lparen',
    }
  },
  unclosedRparen(): UnclosedRparenDiagnostic {
    return {
      kind: 'unclosed rparen',
    }
  },
  notABinding(): NotAbindingDiagnostic {
    return {
      kind: 'not a binding',
    }
  },
}

export interface BaseParseDiagnostic {}

export interface UnexpectedTokenDiagnostic extends BaseParseDiagnostic {
  kind: 'unexpected token'
  expect: TokenKind
  found: TokenKind
}

export interface NotAnExpressionDiagnostic extends BaseParseDiagnostic {
  kind: 'not an expression'
  found: TokenKind
}

export interface UnclosedLparenDiagnostic extends BaseParseDiagnostic {
  kind: 'unclosed lparen'
}

export interface UnclosedRparenDiagnostic extends BaseParseDiagnostic {
  kind: 'unclosed rparen'
}

export interface NotAbindingDiagnostic extends BaseParseDiagnostic {
  kind: 'not a binding'
}
