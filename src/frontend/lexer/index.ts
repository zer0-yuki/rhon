import { LexError } from './error.js'
import { Token } from './token.js'

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
function* getRawTokens(src: string, report: (error: LexError) => void): TokenGenerator {
  let currentPos = 0
  let startPos = 0
  let line = 1

  // utils that capture local vars above
  const advance = () => src.at(currentPos++) ?? ''
  const peek = () => src.at(currentPos) ?? ''
  const skipWhitespace = () => {
    while (isWhitespace(peek())) {
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
        report({ kind: 'unclosed string literal', lexeme: makeLexeme() })
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
      /** {@link symbolMap} */
      case '+':
        yield Token.symbol('plus')
        break
      case '-':
        yield Token.symbol('minus')
        break
      case '*':
        yield Token.symbol('star')
        break
      case '/':
        yield Token.symbol('slash')
        break
      case '(':
        yield Token.symbol('lparen')
        break
      case ')':
        yield Token.symbol('rparen')
        break
      case '=':
        yield Token.symbol('equal')
        break

      // EOF
      case '':
        // It is set to be the return value of the generator,
        // so no need to yield here.
        break

      default:
        if (isDigit(char)) {
          yield makeNumber()
        } else if (isIdentAlpha(char)) {
          yield makeIdent()
        } else if (isQuote(char)) {
          yield makeString()
        } else {
          report({ kind: 'unknown char', char })
        }

        break
    }
  }

  return Token.eof()
}

export class Lexer {
  private generator: TokenGenerator
  private curTok: Token
  private nextTok: Token
  private _errors: LexError[] = []

  /** Make token stream from source. At first {@link cur} is pointing to the first token. */
  constructor(src: string) {
    this.generator = getRawTokens(src, (error) => this._errors.push(error))
    this.curTok = this.next()
    this.nextTok = this.next()
  }

  get errors() {
    return this._errors
  }

  private next(): Token {
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
    this.nextTok = this.next()
    return res
  }
}
