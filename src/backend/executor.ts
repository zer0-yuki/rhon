import { Instruction } from './instruction.js'

type Node =
  | { kind: 'num'; value: number }
  | { kind: 'str'; value: string }
  | { kind: 'var'; name: string }
  | { kind: 'app'; left: number; right: number }

export class Executor {
  private codes: Instruction[]
  private stack: number[] = []
  private heap: Node[] = []

  constructor(codes: Instruction[]) {
    this.codes = codes
  }

  run() {
    for (const inst of this.codes) {
      this.execute(inst)
    }
    return this
  }

  private execute(inst: Instruction) {
    switch (inst.op) {
      case 'push_num': {
        const addr = this.allocate({ kind: 'num', value: inst.value })
        this.stack.push(addr)
        break
      }
      case 'push_str': {
        const addr = this.allocate({ kind: 'str', value: inst.value })
        this.stack.push(addr)
        break
      }
      case 'push_var': {
        const addr = this.allocate({ kind: 'var', name: inst.name })
        this.stack.push(addr)
        break
      }
      case 'mkap': {
        const left = this.stack.pop()!
        const right = this.stack.pop()!
        this.stack.push(this.allocate({ kind: 'app', left, right }))
        break
      }
      case 'eval': {
        this.unwind()
        break
      }
    }
  }

  private unwind() {
    let currentAddr = this.stack[this.stack.length - 1]
    let node = this.heap[currentAddr]
    console.log(node)

    switch (node.kind) {
      case 'num':
      case 'str':
        break
      case 'var':
        throw new Error('unimplemented')
    }
  }

  private allocate(node: Node): number {
    this.heap.push(node)
    return this.heap.length - 1
  }
}
