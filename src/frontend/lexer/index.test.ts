import { describe, it, beforeEach } from 'node:test'
import assert from 'assert'
import { Lexer } from './index.js'
import { charToKind, Token } from './token.js'

describe('Lexer', () => {
  describe('single operators', () => {
    for (const [char, kind] of Object.entries(charToKind)) {
      it(`lexes '${char}' as ${kind} token`, () => {
        const lexer = new Lexer(char)
        const tokens = [...lexer]
        assert.deepStrictEqual(tokens, [Token.symbol(kind)])
      })
    }
  })
})
