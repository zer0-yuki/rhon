export function log<T>(item: T): T {
  console.dir(item)
  return item
}

export function internalError(): never {
  throw new Error('internal error')
}

export function unreachable(): never {
  throw new Error('Unreachable branch')
}
