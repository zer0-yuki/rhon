export type LexDiagnostic = UnclosedStringLiteralDiagnostic | UnknownCharDiagnostic

export const LexDiagnostic = {
  unclosedString(lexeme: string): UnclosedStringLiteralDiagnostic {
    return {
      kind: 'unclosed string literal',
      lexeme,
    }
  },
  unknownChar(char: string): UnknownCharDiagnostic {
    return {
      kind: 'unknown char',
      char,
    }
  },
}

export interface BaseLexDiagnostic {}

export interface UnclosedStringLiteralDiagnostic extends BaseLexDiagnostic {
  kind: 'unclosed string literal'
  lexeme: string
}

export interface UnknownCharDiagnostic extends BaseLexDiagnostic {
  kind: 'unknown char'
  char: string
}
