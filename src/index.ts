import { compileSc } from './backend/compiler.js'
import { Executer } from './backend/executor.js'
import { Instruction } from './backend/instruction.js'
import { Lexer } from './frontend/lexer/index.js'
import { Parser } from './frontend/parser/index.js'

const src = `
square x = x * x;
add x y = x + y;
id x = x;
main = id 5;
`
// (1 + 2) * 3 - 4
console.log(src)

const l = new Lexer(src)
const p = new Parser(l)
const program = p.parse()

if (l.diagnostics.length !== 0 || p.diagnostics.length !== 0) {
  console.log('Lexing diags:', l.diagnostics)
  console.log('Parsing diags:', p.diagnostics)
}
// console.dir(program)

const scDefs = program.map((sc) => compileSc(sc))
for (const scDef of scDefs) {
  console.log(`${scDef.name}:`)
  console.log('-'.repeat(10))
  console.log(Instruction.fmtInsts(scDef.insts))
  console.log('-'.repeat(10))
}

const executer = new Executer(scDefs)
const result = executer.execute()
console.log(result)

console.log('-'.repeat(20))
