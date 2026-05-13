import { Instruction } from './instruction.js'

export const primitiveNames = ['add', 'sub', 'mul', 'div', 'neg'] as const
export type PrimitiveKind = (typeof primitiveNames)[number]

export const primitives: Record<
  PrimitiveKind,
  {
    arity: number
    insts: Instruction[]
  }
> = {
  add: {
    arity: 2,
    insts: [
      Instruction.push(1),
      Instruction.eval(),
      Instruction.push(1),
      Instruction.eval(),
      Instruction.prim('add'),
      Instruction.update(2),
      Instruction.pop(2),
      Instruction.unwind(),
    ],
  },
  sub: {
    arity: 2,
    insts: [
      Instruction.push(1),
      Instruction.eval(),
      Instruction.push(1),
      Instruction.eval(),
      Instruction.prim('sub'),
      Instruction.update(2),
      Instruction.pop(2),
      Instruction.unwind(),
    ],
  },
  mul: {
    arity: 2,
    insts: [
      Instruction.push(1),
      Instruction.eval(),
      Instruction.push(1),
      Instruction.eval(),
      Instruction.prim('mul'),
      Instruction.update(2),
      Instruction.pop(2),
      Instruction.unwind(),
    ],
  },
  div: {
    arity: 2,
    insts: [
      Instruction.push(1),
      Instruction.eval(),
      Instruction.push(1),
      Instruction.eval(),
      Instruction.prim('div'),
      Instruction.update(2),
      Instruction.pop(2),
      Instruction.unwind(),
    ],
  },
  neg: {
    arity: 1,
    insts: [
      Instruction.push(0),
      Instruction.eval(),
      Instruction.prim('neg'),
      Instruction.update(1),
      Instruction.pop(1),
      Instruction.unwind(),
    ],
  },
}
