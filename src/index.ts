import { compile } from './backend/compiler.js'
import { Lexer } from './frontend/lexer/index.js'
import { Parser } from './frontend/parser/index.js'
import { Executor } from './backend/executor.js'

const src = `
()
(1 + 2) * 3 - 4
`
console.log(src)

const l = new Lexer(src)
const p = new Parser(l)
const expr = p.parseExpr()

console.log('Lexing diags:', l.diagnostics)
console.log('Parsing diags:', p.diagnostics)
console.dir(expr)

const insts = compile(expr)
const executor = new Executor([...insts, { op: 'eval' }])
console.log(executor.run())

console.log('-'.repeat(20))
