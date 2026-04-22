import { Expr } from './expr.js'

export interface Supercombinator {
  name: string
  args: string
  body: Expr
}
