const ignoreToStringifyKeys = new Set<any>([
  Symbol.toPrimitive,
  Symbol.toStringTag,
  Symbol.iterator,
])

export function isIgnoreCacheKey(key) {
  if (ignoreToStringifyKeys.has(key)) return true

  return false
}
