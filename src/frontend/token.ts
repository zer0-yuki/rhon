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
  readonly kind: 'var'
  readonly lexeme: string
  readonly name: string
}

const symbolMap = {
  plus: '+',
  minus: '-',
  star: '*',
  slash: '/',
  lparen: '(',
  rparen: ')',
  equal: '=',
} as const
type SymbolKind = keyof typeof symbolMap

export type SymbolToken = {
  readonly [K in SymbolKind]: {
    readonly kind: K
    readonly lexeme: (typeof symbolMap)[K]
  }
}[SymbolKind]

/** To report something wrong in lexing you can use this */
export interface ErrorToken {
  readonly kind: 'error'
  readonly lexeme: string
  readonly message: string
}

export interface EOFToken {
  readonly kind: 'eof'
  readonly lexeme: ''
}

/** Definition of tokens */
export type Token = LitToken | IdentToken | SymbolToken | ErrorToken | EOFToken

/** Kinds of token */
export type TokenKind = Token['kind']

/** Narrow the token type by kind */
export type TokenOf<K extends TokenKind> = Extract<Token, { kind: K }>

export const Token = {
  number: (lexeme: string): NumberToken => {
    return { kind: 'number', lexeme, literal: Number(lexeme) }
  },
  string: (lexeme: string): StringToken => {
    return { kind: 'string', lexeme, literal: lexeme.slice(1, -1) }
  },
  ident: (lexeme: string): IdentToken => {
    return { kind: 'var', lexeme, name: lexeme }
  },
  symbol: <K extends SymbolKind>(kind: K): TokenOf<K> => {
    return {
      kind,
      lexeme: symbolMap[kind],
    } as TokenOf<K>
  },
  error: (lexeme: string, message: string): ErrorToken => {
    return { kind: 'error', lexeme, message }
  },
  eof: (): EOFToken => {
    return { kind: 'eof', lexeme: '' }
  },
  isKind: <K extends TokenKind>(token: Token, kind: K): token is TokenOf<K> => token.kind === kind,
  isError: (token: Token) => Token.isKind(token, 'error'),
  isEof: (token: Token) => Token.isKind(token, 'eof'),
} as const
