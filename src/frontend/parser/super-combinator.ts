import { Expr } from './expr.js'

export interface Supercombinator {
  name: string
  args: string[]
  body: Expr
}

export const Supercombinator = {
  from(name: string, args: string[], body: Expr): Supercombinator {
    return { name, args, body }
  },
  from_name(name: string): Supercombinator {
    return { name, args: [], body: Expr.error() }
  },
}
