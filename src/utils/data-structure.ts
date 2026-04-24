import { internalError } from './utils.js'

export class Stack<T> {
  private stack: T[] = []

  push(val: T): void {
    this.stack.push(val)
  }

  pop(): T {
    return this.stack.pop() ?? internalError()
  }

  peek(n: number): T {
    return this.stack[this.stack.length - (1 + n)] ?? internalError()
  }
}

export class Heap<T> {
  private count = 0
  private heap: Map<number, T> = new Map()

  alloc(val: T): number {
    const addr = this.count
    this.count++
    this.heap.set(addr, val)
    return addr
  }

  visit(addr: number): T {
    return this.heap.get(addr) ?? internalError()
  }

  set(addr: number, val: T) {
    this.heap.set(addr, val)
  }

  free(addr: number): void {
    this.heap.delete(addr)
  }
}
