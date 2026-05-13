export function log<T>(item: T): T {
  console.dir(item)
  return item
}

export function internalError(what?: string): never {
  throw new Error(`Internal error${what ? `: ${what}` : ''}`)
}

export function unreachable(): never {
  throw new Error('Unreachable branch')
}
