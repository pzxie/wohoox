import { useState, useEffect } from 'react'

import { getStoreByName, getStoreNames } from 'wohoox'

export function useStore(storeName: string) {
  const [store, setStore] = useState(() => getStoreByName(storeName))

  if (!store) {
    const storeKeys = getStoreNames()

    if (!storeKeys.length)
      throw new Error(
        'Please check the store has been initialized correctly. \nget store:【' +
          storeName +
          `】\nexist stores:【'${getStoreNames().toString()}'】`,
      )

    throw new Error(
      'cannot get the correct store。\nget store:【' +
        storeName +
        `】\nexist stores:【'${getStoreNames().toString()}'】`,
    )
  }

  useEffect(() => {
    // For dev environment more，
    // StoreName would not be changed normally.Unless manually changed in dev
    // or set dynamic storeName in production
    const newStore = getStoreByName(storeName)

    if (store === newStore) return

    setStore(newStore)
  }, [storeName, store])

  return store
}
