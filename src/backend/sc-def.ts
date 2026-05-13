import { Instruction } from './instruction.js'

export interface ScDef {
  name: string
  arity: number
  insts: Instruction[]
}
