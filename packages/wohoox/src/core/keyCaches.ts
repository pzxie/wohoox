import { guid } from 'wohoox-utils'

export const keyCaches_SourceMap = new Map<any, string>()

export const keyCaches_StringifiedKeySourceMap = new Map<string, any>()

export const keyCaches_KeyJoinSymbol = '__$$__'

const ignoreToStringifyKeys = new Set<any>([
  Symbol.toPrimitive,
  Symbol.toStringTag,
  Symbol.iterator,
])

export function getStringifyKey(obj: any, key: any, force?: boolean): string {
  if (typeof key === 'string') return key

  if (ignoreToStringifyKeys.has(key)) return ''

  let keyId = keyCaches_SourceMap.get(key)
  let objId = keyCaches_SourceMap.get(obj)

  if (!force && (!keyId || !objId)) return ''

  if (!keyId) {
    keyId = guid()
    keyCaches_SourceMap.set(key, keyId)
  }
  if (!objId) {
    objId = guid()
    keyCaches_SourceMap.set(obj, objId)
  }

  const id = objId + keyCaches_KeyJoinSymbol + keyId
  if (!keyCaches_StringifiedKeySourceMap.has(id))
    keyCaches_StringifiedKeySourceMap.set(id, key)

  return id
}

export function getSourceByStringifyKey(stringifyKey: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return keyCaches_StringifiedKeySourceMap.get(stringifyKey)
}

export function getKeyBySource(source) {
  return keyCaches_SourceMap.get(source)
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.__keyCaches_SourceMap = keyCaches_SourceMap
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.__keyCaches_StringifiedKeySourceMap = keyCaches_StringifiedKeySourceMap
