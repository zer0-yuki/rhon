import { describe, it, beforeEach } from 'node:test'
import assert from 'assert'
import { Heap, Stack } from './data-structure.js'

describe('Stack', () => {
  let stack: Stack<number>
  beforeEach(() => {
    stack = new Stack()
    stack.push(1)
    stack.push(2)
  })

  describe('push and peek', () => {
    it('returns 2 for peek(0)', () => {
      assert.strictEqual(stack.peek(0), 2)
    })

    it('returns 1 for peek(1)', () => {
      assert.strictEqual(stack.peek(1), 1)
    })

    it('throws an error for peek(2)', () => {
      assert.throws(() => stack.peek(2), /peek out of bounds/)
    })
  })

  describe('pop', () => {
    it('returns 2 for the first pop', () => {
      assert.strictEqual(stack.pop(), 2)
    })

    it('throws an error when popping from an empty stack', () => {
      stack.pop() // pop 2
      stack.pop() // pop 1
      assert.throws(() => stack.pop(), /pop from empty stack/)
    })
  })

  describe('clone', () => {
    let stack: Stack<number>
    beforeEach(() => {
      stack = new Stack()
      stack.push(1)
      stack.push(2)
    })

    it('returns a new stack with the same elements', () => {
      const cloned = stack.clone()
      assert.strictEqual(cloned.peek(0), 2)
      assert.strictEqual(cloned.peek(1), 1)
    })

    it('modifying the original stack does not affect the cloned stack', () => {
      const cloned = stack.clone()
      stack.pop()
      assert.strictEqual(cloned.peek(0), 2)
      assert.strictEqual(cloned.peek(1), 1)
    })
  })
})

describe('Heap', () => {
  let heap: Heap<number>
  beforeEach(() => {
    heap = new Heap()
  })

  describe('alloc', () => {
    it('allocates a value and returns its address', () => {
      const addr = heap.alloc(42)
      assert.strictEqual(heap.visit(addr), 42)
    })
  })

  describe('visit', () => {
    it('throws an error for an invalid address', () => {
      assert.throws(() => heap.visit(999), /invalid heap address/)
    })
  })
})
