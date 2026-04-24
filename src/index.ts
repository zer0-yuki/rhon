import { compileSc } from './backend/compiler.js'
import { Instruction } from './backend/instruction.js'
import { Lexer } from './frontend/lexer/index.js'
import { Parser } from './frontend/parser/index.js'

const src = `
square x = x * x;
add x y = x + y;
main = square (add 3 4);
`
// (1 + 2) * 3 - 4
console.log(src)

const l = new Lexer(src)
const p = new Parser(l)
const program = p.parse()

console.log('Lexing diags:', l.diagnostics)
console.log('Parsing diags:', p.diagnostics)
console.dir(program)

const scDefs = program.map((sc) => compileSc(sc))
for (const scDef of scDefs) {
  console.log(`${scDef.name}:`)
  console.log('-'.repeat(10))
  console.log(Instruction.fmtInsts(scDef.insts))
  console.log('-'.repeat(10))
}

console.log('-'.repeat(20))
