export type Instruction =
  | { op: 'push_num'; value: number }
  | { op: 'push_str'; value: string }
  | { op: 'push_var'; name: string }
  | { op: 'mkap' }
  | { op: 'eval' }

export const Instruction = {
  stringify: (inst: Instruction) => {
    switch (inst.op) {
      case 'push_num':
        return `${inst.op} ${inst.value}`
      case 'push_str':
        return `${inst.op} "${inst.value}"`
      case 'push_var':
        return `${inst.op} ${inst.name}`
      default:
        return inst.op
    }
  },
}
