import { unreachable } from '../utils/utils.js'
import { PrimitiveKind } from './primitives.js'

export type Instruction =
  | { kind: 'update'; n: number }
  | { kind: 'pop'; n: number }
  | { kind: 'unwind' }
  | { kind: 'pushNum'; n: number }
  | { kind: 'pushStr'; str: string }
  | { kind: 'pushGlobal'; name: string }
  | { kind: 'pushArg'; n: number }
  | { kind: 'push'; n: number }
  | { kind: 'mkApp' }
  | { kind: 'eval' }
  | { kind: 'prim'; name: PrimitiveKind }

export const Instruction = {
  update(n: number): Instruction {
    return { kind: 'update', n }
  },
  pop(n: number): Instruction {
    return { kind: 'pop', n }
  },
  unwind(): Instruction {
    return { kind: 'unwind' }
  },
  pushNum(n: number): Instruction {
    return { kind: 'pushNum', n }
  },
  pushStr(str: string): Instruction {
    return { kind: 'pushStr', str }
  },
  pushGlobal(name: string): Instruction {
    return { kind: 'pushGlobal', name }
  },
  pushArg(n: number): Instruction {
    return { kind: 'pushArg', n }
  },
  push(n: number): Instruction {
    return { kind: 'push', n }
  },
  mkApp(): Instruction {
    return { kind: 'mkApp' }
  },
  eval(): Instruction {
    return { kind: 'eval' }
  },
  prim(name: PrimitiveKind): Instruction {
    return { kind: 'prim', name }
  },
  fmt(inst: Instruction): string {
    switch (inst.kind) {
      case 'update':
        return `update ${inst.n}`
      case 'pop':
        return `pop ${inst.n}`
      case 'unwind':
        return `unwind`
      case 'pushNum':
        return `pushNum ${inst.n}`
      case 'pushStr':
        return `pushStr ${inst.str}`
      case 'pushGlobal':
        return `pushGlobal ${inst.name}`
      case 'pushArg':
        return `pushArg ${inst.n}`
      case 'push':
        return `push ${inst.n}`
      case 'mkApp':
        return `mkApp`
      case 'eval':
        return `eval`
      case 'prim':
        return `prim ${inst.name}`
      default:
        return unreachable()
    }
  },
  fmtInsts(insts: Instruction[]): string {
    return insts.map((inst) => Instruction.fmt(inst)).join('\n')
  },
}
