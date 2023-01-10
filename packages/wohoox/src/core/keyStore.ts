import { guid } from '../utils'

const sourceMap = new Map<any, string>()

const stringifiedKeySourceMap = new Map<string, any>()

const keyJoinSymbol = '__$$__'

export const ignoreToStringifyKeys = new Set<any>([
  Symbol.toPrimitive,
  Symbol.toStringTag,
  Symbol.iterator,
])

export function getStringifyKey(obj: any, key: any, force?: boolean): string {
  if (typeof key === 'string') return key

  if (ignoreToStringifyKeys.has(key)) return ''

  let keyId = sourceMap.get(key)
  let objId = sourceMap.get(obj)

  if (!force && (!keyId || !objId)) return ''

  if (!keyId) {
    keyId = guid()
    sourceMap.set(key, keyId)
  }
  if (!objId) {
    objId = guid()
    sourceMap.set(obj, objId)
  }

  const id = objId + keyJoinSymbol + keyId
  if (!stringifiedKeySourceMap.has(id)) stringifiedKeySourceMap.set(id, key)

  return id
}

export function getSourceByStringifyKey(stringifyKey: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return stringifiedKeySourceMap.get(stringifyKey)
}

export function getKeyBySource(source) {
  return sourceMap.get(source)
}
