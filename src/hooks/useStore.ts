import { useState, useEffect } from 'react';

import { storeMap } from '../global';

export function useStore(storeName: string) {
  const [store, setStore] = useState(() => storeMap.get(storeName));

  if (!store) {
    const storeKeys = [...storeMap.keys()];

    if (!storeKeys.length)
      throw new Error(
        'Please check the store has been initialized correctly. \nget store:【' +
          storeName +
          ('】\nexist stores:【' + [...storeMap.keys()] + '】'),
      );

    throw new Error(
      'cannot get the correct store。\nget store:【' +
        storeName +
        ('】\nexist stores:【' + [...storeMap.keys()] + '】'),
    );
  }

  useEffect(() => {
    // For dev environment more，
    // StoreName would not be changed normally.Unless manually changed in dev
    // or set dynamic storeName in production
    const newStore = storeMap.get(storeName);

    if (store === newStore) return;

    setStore(newStore);
  }, [storeName, store]);

  return store;
}
