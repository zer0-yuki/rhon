// token types ----------------

export interface NumberToken {
  readonly kind: 'number'
  readonly lexeme: string
  readonly literal: number
}
export interface StringToken {
  readonly kind: 'string'
  readonly lexeme: string
  readonly literal: string
}

export type LitToken = NumberToken | StringToken

export interface IdentToken {
  readonly kind: 'ident'
  readonly lexeme: string
  readonly name: string
}

export const kindToChar = {
  plus: '+',
  minus: '-',
  star: '*',
  slash: '/',
  lparen: '(',
  rparen: ')',
  equal: '=',
  colon: ':',
  semicolon: ';',
} as const
type SymbolKind = keyof typeof kindToChar

/** Reverse mapping: lexeme -> SymbolKind */
export const charToKind: { [lexeme: string]: SymbolKind } = {}
for (const [kind, lexeme] of Object.entries(kindToChar)) {
  charToKind[lexeme] = kind as SymbolKind
}

export type SymbolToken = {
  readonly [K in SymbolKind]: {
    readonly kind: K
    readonly lexeme: (typeof kindToChar)[K]
  }
}[SymbolKind]

export interface EOFToken {
  readonly kind: 'eof'
  readonly lexeme: ''
}

/** Definition of tokens */
export type Token = LitToken | IdentToken | SymbolToken | EOFToken

// useful types ----------------

/** Kinds of token */
export type TokenKind = Token['kind']

/** Narrow the token type by kind */
export type TokenOf<K extends TokenKind> = Extract<Token, { kind: K }>

// constructors and utils ----------------
export const Token = {
  number: (lexeme: string): NumberToken => {
    return { kind: 'number', lexeme, literal: Number(lexeme) }
  },
  string: (lexeme: string): StringToken => {
    return { kind: 'string', lexeme, literal: lexeme.slice(1, -1) }
  },
  ident: (lexeme: string): IdentToken => {
    return { kind: 'ident', lexeme, name: lexeme }
  },
  symbol: <K extends SymbolKind>(kind: K): TokenOf<K> => {
    return {
      kind,
      lexeme: kindToChar[kind],
    } as TokenOf<K>
  },
  eof: (): EOFToken => {
    return { kind: 'eof', lexeme: '' }
  },
} as const
