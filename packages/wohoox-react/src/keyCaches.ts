import {
  keyCaches_SourceMap,
  keyCaches_StringifiedKeySourceMap,
  keyCaches_KeyJoinSymbol,
} from 'wohoox'

const usedStringifyKeys = new Map<string, string[]>()

function removeUnusedKeys() {
  const keysArr = [...usedStringifyKeys.values()].flat()
  const keysSet = new Set()

  const usedKeysSet = new Set()

  keysArr.forEach(key => {
    key.split('.').forEach(item => {
      keysSet.add(item)

      const [objectKey, originKey] = item.split(keyCaches_KeyJoinSymbol)

      if (!objectKey || !originKey) return

      usedKeysSet.add(objectKey)
      usedKeysSet.add(originKey)
    })
  })

  keyCaches_StringifiedKeySourceMap.forEach((_, item) => {
    if (!keysSet.has(item)) keyCaches_StringifiedKeySourceMap.delete(item)
  })

  keyCaches_SourceMap.forEach((stringifyKey, originKey) => {
    !usedKeysSet.has(stringifyKey) && keyCaches_SourceMap.delete(originKey)
  })
}

export function tagAsUsedStringifyKeys(componentId: string, keys: string[]) {
  usedStringifyKeys.set(componentId, keys)
}

export function removeAsUnusedStringifyKeys(componentId: string) {
  usedStringifyKeys.delete(componentId)
  removeUnusedKeys()
}
