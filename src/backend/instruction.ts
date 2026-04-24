import { unreachable } from '../utils/utils.js'

export type Instruction =
  | { kind: 'update'; n: number }
  | { kind: 'pop'; n: number }
  | { kind: 'unwind' }
  | { kind: 'pushNum'; n: number }
  | { kind: 'pushStr'; str: string }
  | { kind: 'pushGlobal'; name: string }
  | { kind: 'pushArg'; n: number }
  | { kind: 'mkApp' }

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
  mkApp(): Instruction {
    return { kind: 'mkApp' }
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
      case 'mkApp':
        return `mkApp`
      default:
        return unreachable()
    }
  },
  fmtInsts(insts: Instruction[]): string {
    return insts.map((inst) => Instruction.fmt(inst)).join('\n')
  },
}
