import { Expr, InfixKind, PrefixKind } from '../frontend/parser/expr.js'
import { Instruction } from './instruction.js'

const infixCodes = (op: InfixKind, left: Expr, right: Expr): Instruction[] => [
  ...compile(right),
  ...compile(left),
  { op: 'push_var', name: 'current_dict' },
  { op: 'push_var', name: op },
  { op: 'mkap' },
  { op: 'mkap' },
  { op: 'mkap' },
]

const prefixCodes = (op: PrefixKind, right: Expr): Instruction[] => [
  ...compile(right),
  { op: 'push_var', name: 'current_dict' },
  { op: 'push_var', name: op },
  { op: 'mkap' },
  { op: 'mkap' },
  { op: 'mkap' },
]

export function compile(expr: Expr): Instruction[] {
  switch (expr.kind) {
    case 'number':
      return [{ op: 'push_num', value: expr.literal }]
    case 'string':
      return [{ op: 'push_str', value: expr.literal }]
    case 'var':
      return [{ op: 'push_var', name: expr.name }]
    case 'pos':
    case 'neg':
      return prefixCodes(expr.kind, expr.right)
    case 'add':
    case 'sub':
    case 'mul':
    case 'div':
      return infixCodes(expr.kind, expr.left, expr.right)
    case 'app':
      return [...compile(expr.right), ...compile(expr.left), { op: 'mkap' }]
    case 'unknown':
    case 'error':
      throw new Error('Unable to compile')
  }
}
