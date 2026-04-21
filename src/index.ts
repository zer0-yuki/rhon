import { Instruction } from './backend/instruction.js'
import { compile } from './backend/compiler.js'
import { TokenStream } from './frontend/lexer.js'
import { Parser } from './frontend/parser.js'
import { Executor } from './backend/executor.js'

const src = `
(1 + 2) * 3 - 4
`
console.log(src)

const tokenStream = new TokenStream(src)
const p = new Parser(tokenStream)
const expr = p.parse()

console.dir(expr)
console.log('Errors:', p.diagnostics)

const insts = compile(expr)
console.log('Instructions:')
for (const inst of insts) {
  console.log(Instruction.stringify(inst))
}
const executor = new Executor([...insts, { op: 'eval' }])
console.log(executor.run())

console.log('-'.repeat(20))
