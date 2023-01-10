import guid from './utils/uuid'

const sourceMap = new Map<any, string>()

const stringifiedKeySourceMap = new Map<string, any>()

const usedStringifyKeys = new Map<string, string[]>()

const keyJoinSymbol = '__$$__'

export const ignoreToStringifyKeys = new Set<any>([
  Symbol.toPrimitive,
  Symbol.toStringTag,
  Symbol.iterator,
])

function removeUnusedKeys() {
  const keysArr = [...usedStringifyKeys.values()].flat()
  const keysSet = new Set()

  const usedKeysSet = new Set()

  keysArr.forEach(key => {
    key.split('.').forEach(item => {
      keysSet.add(item)

      const [objectKey, originKey] = item.split(keyJoinSymbol)

      if (!objectKey || !originKey) return

      usedKeysSet.add(objectKey)
      usedKeysSet.add(originKey)
    })
  })

  stringifiedKeySourceMap.forEach((_, item) => {
    if (!keysSet.has(item)) stringifiedKeySourceMap.delete(item)
  })

  sourceMap.forEach((stringifyKey, originKey) => {
    !usedKeysSet.has(stringifyKey) && sourceMap.delete(originKey)
  })
}

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

export function tagAsUsedStringifyKeys(componentId: string, keys: string[]) {
  usedStringifyKeys.set(componentId, keys)
}

export function removeAsUnusedStringifyKeys(componentId: string) {
  usedStringifyKeys.delete(componentId)
  removeUnusedKeys()
}
