import { Heap, Stack } from '../utils/data-structure.js'
import { internalError } from '../utils/utils.js'
import { Instruction } from './instruction.js'
import { Node } from './node.js'
import { ScDef } from './sc-def.js'

interface Snapshot {
  stack: Stack<number>
  insts: Instruction[]
}

export class Executor {
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
      case 'push':
        this.push(inst.n)
        break
      case 'mkApp':
        this.mkApp()
        break
      case 'eval':
        this.eval()
        break
      case 'prim':
        this.prim(inst.name)
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

  private putDump(stack: Stack<number>, insts: Instruction[]) {
    this.dump.push({ stack, insts })
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
      case 'string':
        if (this.dump.length !== 0) {
          const { stack, insts } = this.dump.pop() ?? internalError('empty dump')
          this.stack = stack
          this.insts = insts
        }
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
    const addr = this.globals.get(name) ?? internalError(`undefined global: ${name}`)
    this.stack.push(addr)
  }
  private pushArg(n: number): void {
    const appAddr = this.stack.peek(n + 1)
    const appNode = this.heap.visit(appAddr)
    if (appNode.kind !== 'app') {
      return internalError('expected app node')
    }
    this.stack.push(appNode.argAddr)
  }
  private push(n: number): void {
    const addr = this.stack.peek(n)
    this.stack.push(addr)
  }
  private mkApp(): void {
    const fnAddr = this.stack.pop()
    const argAddr = this.stack.pop()
    const appAddr = this.heap.alloc(Node.app(fnAddr, argAddr))
    this.stack.push(appAddr)
  }
  private eval(): void {
    const addr = this.stack.pop()
    this.putDump(this.stack.clone(), this.insts)
    this.stack.clear()
    this.stack.push(addr)
    this.putInsts([Instruction.unwind()])
  }
  private prim(name: string): void {
    switch (name) {
      case 'neg':
        this.negate()
        break
      case 'add':
        this.arith2((a, b) => a + b)
        break
      case 'sub':
        this.arith2((a, b) => a - b)
        break
      case 'mul':
        this.arith2((a, b) => a * b)
        break
      case 'div':
        this.arith2((a, b) => a / b)
        break
    }
  }

  private negate(): void {
    const addr = this.stack.pop()
    const node = this.heap.visit(addr)
    if (node.kind !== 'number') {
      return internalError('expected number node')
    }
    const negAddr = this.heap.alloc(Node.number(-node.value))
    this.stack.push(negAddr)
  }

  private arith2(op: (a: number, b: number) => number): void {
    const addr2 = this.stack.pop()
    const addr1 = this.stack.pop()
    const node1 = this.heap.visit(addr1)
    const node2 = this.heap.visit(addr2)
    if (node1.kind !== 'number' || node2.kind !== 'number') {
      return internalError('expected number nodes')
    }
    const resAddr = this.heap.alloc(Node.number(op(node1.value, node2.value)))
    this.stack.push(resAddr)
  }
}
