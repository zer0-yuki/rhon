import { describe, it, beforeEach } from 'node:test'
import assert from 'assert'
import { Lexer } from './index.js'
import { charToKind, NumberToken, Token } from './token.js'

describe('Lexer', () => {
  describe('single operators', () => {
    for (const [char, kind] of Object.entries(charToKind)) {
      it(`lexes '${char}' as ${kind} token`, () => {
        const tokens = [...new Lexer(char)]
        assert.deepStrictEqual(tokens, [Token.symbol(kind)])
      })
    }
  })

  describe('number literals', () => {
    const testCases: [string, NumberToken][] = [
      ['42', Token.number('42')],
      ['+42', Token.number('+42')],
      ['-42', Token.number('-42')],
      [' +42', Token.number('+42')],
      [' -42', Token.number('-42')],
    ]
    testCases.forEach(([input, expected]) => {
      it(`lexes '${input}' as number token`, () => {
        const tokens = [...new Lexer(input)]
        assert.deepStrictEqual(tokens, [expected])
      })
    })
  })
})
