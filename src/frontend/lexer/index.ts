import { LexDiagnostic } from './error.js'
import { Token, charToKind } from './token.js'

// utils
const isDigit = (s: string) => /\d/.test(s)
const isIdentAlpha = (s: string) => /[_a-zA-Z]/.test(s)
const isQuote = (s: string) => s === '"'
const isWhitespace = (s: string) => /\s/.test(s)
const isEOF = (s: string) => s === ''
const isLinebreak = (s: string) => s === '\n'

/**
 * It will return an token (actually eof) when it ends.
 */
export type TokenGenerator = Generator<Token, Token>

/**
 * Get a token generator from source.
 * The lexing logic is right here.
 */
function* getRawTokens(src: string, report: (diag: LexDiagnostic) => void): TokenGenerator {
  let currentPos = 0
  let startPos = 0
  let line = 1
  let prevIsWhitespace = false

  // utils that capture local vars above
  const advance = () => src.at(currentPos++) ?? ''
  const peek = () => src.at(currentPos) ?? ''
  const skipWhitespace = () => {
    prevIsWhitespace = false
    while (isWhitespace(peek())) {
      prevIsWhitespace = true
      if (isLinebreak(advance())) {
        line++
      }
    }
  }
  // constructors with states
  const makeLexeme = (): string => src.slice(startPos, currentPos)
  const makeNumber = (): Token => {
    while (isDigit(peek())) {
      advance()
    }
    return Token.number(makeLexeme())
  }
  const makeIdent = (): Token => {
    while (isDigit(peek()) || isIdentAlpha(peek())) {
      advance()
    }
    return Token.ident(makeLexeme())
  }
  const makeString = (): Token => {
    while (!isQuote(peek())) {
      if (isEOF(advance())) {
        report(LexDiagnostic.unclosedString(makeLexeme()))
      }
    }
    advance()
    return Token.string(makeLexeme())
  }

  // lexing logic
  while (currentPos < src.length) {
    skipWhitespace()
    startPos = currentPos
    const char = advance()

    switch (char) {
      case '+':
        if (isDigit(peek()) && (prevIsWhitespace || startPos === 0)) {
          // Positive literal: followed by digit; '+' is part of the number token
          yield makeNumber()
        } else {
          yield Token.symbol('plus')
        }
        break
      case '-':
        if (isDigit(peek()) && (prevIsWhitespace || startPos === 0)) {
          // Negative literal: followed by digit; '-' is part of the number token
          yield makeNumber()
        } else {
          yield Token.symbol('minus')
        }
        break
      // EOF
      case '':
        // It is set to be the return value of the generator,
        // so no need to yield here.
        break

      default: {
        const symbolKind = charToKind[char]
        if (symbolKind !== undefined) {
          yield Token.symbol(symbolKind)
        } else if (isDigit(char)) {
          yield makeNumber()
        } else if (isIdentAlpha(char)) {
          yield makeIdent()
        } else if (isQuote(char)) {
          yield makeString()
        } else {
          report(LexDiagnostic.unknownChar(char))
        }

        break
      }
    }
  }

  return Token.eof()
}

export class Lexer implements Iterable<Token> {
  private generator: TokenGenerator
  private curTok: Token
  private nextTok: Token
  private _diagnostics: LexDiagnostic[] = []

  /** Make token stream from source. At first {@link cur} is pointing to the first token. */
  constructor(src: string) {
    this.generator = getRawTokens(src, (error) => this._diagnostics.push(error))
    this.curTok = this.fetchNext()
    this.nextTok = this.fetchNext()
  }

  [Symbol.iterator]() {
    return this
  }

  next(): IteratorResult<Token> {
    const token = this.curTok
    if (token.kind !== 'eof') {
      this.advance()
    }
    return { value: token, done: token.kind === 'eof' }
  }

  get diagnostics() {
    return this._diagnostics
  }

  private fetchNext(): Token {
    // this.generator.next().value can be undefined when it reaches the end
    return (this.generator.next().value as Token | undefined) ?? Token.eof()
  }

  get cur(): Token {
    return this.curTok
  }

  /** Move to next token and return {@link cur} before moving */
  advance(): Token {
    const res = this.cur
    this.curTok = this.nextTok
    this.nextTok = this.fetchNext()
    return res
  }
}
