export function log<T>(item: T): T {
  console.dir(item)
  return item
}
