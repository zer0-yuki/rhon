import { ScDef } from './sc-def.js'

export type Node =
  | { kind: 'number'; value: number }
  | { kind: 'string'; value: string }
  | { kind: 'app'; fnAddr: number; argAddr: number }
  | { kind: 'global'; def: ScDef }
  | { kind: 'ind'; addr: number }

export const Node = {
  number(n: number): Node {
    return { kind: 'number', value: n }
  },
  string(str: string): Node {
    return { kind: 'string', value: str }
  },
  app(fnAddr: number, argAddr: number): Node {
    return { kind: 'app', fnAddr, argAddr }
  },
  global(def: ScDef): Node {
    return { kind: 'global', def }
  },
  ind(addr: number): Node {
    return { kind: 'ind', addr }
  },
}
