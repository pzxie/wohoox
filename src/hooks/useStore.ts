import { useState } from 'react';
import useUpdate from './common/useUpdate';

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

  useUpdate(() => {
    // 只在 component update 时调用，否则，会造成初始化时。渲染两次的问题

    // 主要用于开发环境，
    // 只有开发环境下，才可能手动变更 storeName ，导致 store 变更，需要重新进行数据代理设置
    // 生产环境下，storeName 除非动态获取，否则不会变更
    const newStore = storeMap.get(storeName);

    if (store === newStore) return;

    setStore(newStore);
  }, [storeName, store]);

  return store;
}
