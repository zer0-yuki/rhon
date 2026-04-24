import { Heap, Stack } from '../utils/data-structure.js'
import { internalError } from '../utils/utils.js'
import { Instruction } from './instruction.js'
import { Node } from './node.js'
import { ScDef } from './sc-def.js'

interface Snapshot {
  stack: Stack<number>
  insts: Instruction[]
}

export class Executer {
  private stack = new Stack<number>()
  private heap = new Heap<Node>()
  private globals = new Map<string, number>()
  private insts: Instruction[]
  private dump: Snapshot[] = []

  constructor(scDefs: ScDef[]) {
    for (const scDef of scDefs) {
      const addr = this.heap.alloc(Node.global(scDef))
      this.globals.set(scDef.name, addr)
    }
    this.insts = [Instruction.pushGlobal('main'), Instruction.unwind()]
  }

  execute(): Node {
    while (this.step()) {
      // step until no instruction is left
    }
    return this.heap.visit(this.stack.pop())
  }

  private step(): boolean {
    const inst = this.consumeInst()
    if (inst === undefined) {
      return false
    }

    switch (inst.kind) {
      case 'update':
        this.update(inst.n)
        break
      case 'pop':
        this.pop(inst.n)
        break
      case 'unwind':
        this.unwind()
        break
      case 'pushNum':
        this.pushNum(inst.n)
        break
      case 'pushStr':
        this.pushStr(inst.str)
        break
      case 'pushGlobal':
        this.pushGlobal(inst.name)
        break
      case 'pushArg':
        this.pushArg(inst.n)
        break
      case 'mkApp':
        this.mkApp()
        break
    }
    return true
  }

  private consumeInst(): Instruction | undefined {
    if (this.insts.length === 0) {
      return undefined
    }
    const [first, ...rest] = this.insts
    this.insts = rest
    return first
  }

  private putInsts(insts: Instruction[]) {
    this.insts = [...insts, ...this.insts]
  }

  private update(n: number): void {
    const addr = this.stack.pop()
    const redex = this.stack.peek(n)
    this.heap.set(redex, Node.ind(addr))
  }
  private pop(n: number): void {
    for (let i = 0; i < n; i++) {
      this.stack.pop()
    }
  }
  private unwind(): void {
    const addr = this.stack.pop()
    const node = this.heap.visit(addr)
    switch (node.kind) {
      case 'number':
        this.stack.push(addr)
        break
      case 'string':
        this.stack.push(addr)
        break
      case 'app':
        this.stack.push(addr)
        this.stack.push(node.fnAddr)
        this.putInsts([Instruction.unwind()])
        break
      case 'global': // only this branch can increase instructions
        this.stack.push(addr)
        this.putInsts(node.def.insts)
        break
      case 'ind':
        this.stack.push(node.addr)
        this.putInsts([Instruction.unwind()])
        break
    }
  }
  private pushNum(n: number): void {
    const addr = this.heap.alloc(Node.number(n))
    this.stack.push(addr)
  }
  private pushStr(str: string): void {
    const addr = this.heap.alloc(Node.string(str))
    this.stack.push(addr)
  }
  private pushGlobal(name: string): void {
    const addr = this.globals.get(name) ?? internalError()
    this.stack.push(addr)
  }
  private pushArg(n: number): void {
    const appAddr = this.stack.peek(n + 1)
    const appNode = this.heap.visit(appAddr)
    if (appNode.kind !== 'app') {
      return internalError()
    }
    this.stack.push(appNode.argAddr)
  }
  private mkApp(): void {
    const fnAddr = this.stack.pop()
    const argAddr = this.stack.pop()
    const appAddr = this.heap.alloc(Node.app(fnAddr, argAddr))
    this.stack.push(appAddr)
  }
}
