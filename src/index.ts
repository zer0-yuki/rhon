import { Lexer } from './frontend/lexer/index.js'
import { Parser } from './frontend/parser/index.js'

const src = `
square x = x * x;
add1 x = x + 1;
main = square (add1 3);
`
// (1 + 2) * 3 - 4
console.log(src)

const l = new Lexer(src)
const p = new Parser(l)
const program = p.parse()

console.log('Lexing diags:', l.diagnostics)
console.log('Parsing diags:', p.diagnostics)
console.dir(program)

// const insts = compile(program)
// const executor = new Executor([...insts, { op: 'eval' }])
// console.log(executor.run())

console.log('-'.repeat(20))
