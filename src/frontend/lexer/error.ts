export type LexDiagnostic = UnclosedStringLiteralDiagnostic | UnknownCharDiagnostic

export interface BaseLexDiagnostic {}

export interface UnclosedStringLiteralDiagnostic extends BaseLexDiagnostic {
  kind: 'unclosed string literal'
  lexeme: string
}

export interface UnknownCharDiagnostic extends BaseLexDiagnostic {
  kind: 'unknown char'
  char: string
}
