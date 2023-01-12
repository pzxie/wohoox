const ignoreToStringifyKeys = new Set<any>([
  Symbol.toPrimitive,
  Symbol.toStringTag,
  Symbol.iterator,
])

export function isIgnoreToGetCallback(key) {
  if (ignoreToStringifyKeys.has(key)) return true

  return false
}
