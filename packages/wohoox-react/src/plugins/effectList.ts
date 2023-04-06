import { WohooxPlugin, storeMap } from 'wohoox'

function addKeysToEffect(
  storeName: string,
  type: 'add' | 'delete' | 'set',
  keys: any[],
) {
  const store = storeMap.get(storeName)

  if (!store) return

  store.addKeyToEffectList(type, keys)
}

const effectListPlugin: WohooxPlugin = {
  onAdd(storeName, _value, keys) {
    addKeysToEffect(storeName, 'add', keys)
  },
  onDelete(storeName, keys) {
    addKeysToEffect(storeName, 'delete', keys)
  },
  onChange(storeName, _value, keys) {
    addKeysToEffect(storeName, 'set', keys)
  },
}

export default effectListPlugin
