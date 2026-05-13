import { Expr } from '../frontend/parser/expr.js'
import { Supercombinator } from '../frontend/parser/super-combinator.js'
import { internalError, unreachable } from '../utils/utils.js'
import { Instruction } from './instruction.js'
import { ScDef } from './sc-def.js'

export function compileSc(sc: Supercombinator): ScDef {
  const env = new Map<string, number>()
  sc.args.forEach((arg, i) => {
    env.set(arg, i)
  })

  return {
    name: sc.name,
    arity: sc.args.length,
    insts: compileBody(sc.body, env, sc.args.length),
  }
}

function compileBody(body: Expr, env: Map<string, number>, arity: number): Instruction[] {
  if (arity === 0) {
    return [...compileToGraph(body, env), Instruction.update(arity), Instruction.unwind()]
  } else {
    return [
      ...compileToGraph(body, env),
      Instruction.update(arity),
      Instruction.pop(arity),
      Instruction.unwind(),
    ]
  }
}

function compileToGraph(body: Expr, env: Map<string, number>): Instruction[] {
  switch (body.kind) {
    case 'number':
      return [Instruction.pushNum(body.literal)]
    case 'string':
      return [Instruction.pushStr(body.literal)]
    case 'var': {
      const n = env.get(body.name)
      if (n === undefined) {
        // TODO: should check if it is in global
        return [Instruction.pushGlobal(body.name)]
      } else {
        return [Instruction.pushArg(n)]
      }
    }
    case 'prefix': {
      const instArg = compileToGraph(body.right, env)
      if (body.op === 'pos') {
        // If positive, simply do nothing
        return instArg
      }
      return [
        ...instArg,
        Instruction.eval(), // Ensure evaluation before primitive operation
        Instruction.prim('neg'),
      ]
    }
    case 'infix': {
      // In functional languages we usually push args sequentially (ref arith2 implementation)
      const instArgLeft = compileToGraph(body.left, env)
      const instArgRight = compileToGraph(body.right, offsetEnv(env))
      return [
        ...instArgLeft,
        Instruction.eval(), // Ensure evaluation before primitive operation
        ...instArgRight,
        Instruction.eval(), // Ensure evaluation before primitive operation
        Instruction.prim(body.op),
      ]
    }
    case 'app': {
      const instArg = compileToGraph(body.right, env)
      // Arg is already in the stack,
      // so we should offest env mapping values by 1
      const instFn = compileToGraph(body.left, offsetEnv(env))
      // The order of instructions is important: first push arg, then push fn,
      // because:
      // - In runtime, when we encounter `mkApp` instruction,
      //   we expect the stack to be [..., argAddr, fnAddr] and pop nodes.
      return [...instArg, ...instFn, Instruction.mkApp()]
    }
    case 'error':
      return internalError('cannot compile error expression')
    case 'unknown':
      return internalError('cannot compile unknown expression')
    default:
      return unreachable()
  }
}

function offsetEnv(env: Map<string, number>): Map<string, number> {
  const offsetedEnv = new Map<string, number>()
  for (const [key, val] of env) {
    offsetedEnv.set(key, val + 1)
  }
  return offsetedEnv
}
