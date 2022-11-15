import { storeMap, defaultStoreName } from './global';

import { createStore } from './core/store';

export function dispatch(storeName?: string) {
  storeMap.get(storeName || defaultStoreName)?.dispatch();
}

export function dispatchAll() {
  Array.from(storeMap.values()).forEach(store => store.dispatch());
}

export default createStore;
export { useWohoox as useStore } from './hooks/useWohoox';
