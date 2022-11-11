import createStore, { useStore as useWohoox, dispatch as wohooxDispatch } from 'wohoox';
import defaultStore from './store';

const userStore = createStore({
  name: 'user',
  initState: {
    name: 'wohoox',
    description: 'reactive store',
  },
  actions: {
    updateName(state, name: string) {
      state.name = name;
    },
  },
});

const devInitState = {
  name: 'developer',
  address: {
    province: 'sc',
    city: 'cd',
    test: {
      deep: 'deep',
    },
  },
};

const devStore = createStore({
  name: 'department',
  initState: devInitState,
  actions: {
    updateAddress(state, address: typeof devInitState['address']) {
      state.address = address;
    },
    updateCity(state, city: string) {
      state.address.city = city;
    },
    updateTest(state, deep: string) {
      state.address.test.deep = deep;
    },
  },
  options: { strictMode: false },
});

const store = {
  default: defaultStore,
  department: devStore,
  user: userStore,
};

type AppStore = typeof store;
type StoreActions = { [K in keyof AppStore]: AppStore[K]['actions'] };

export function useStore(): AppStore['default']['state'];
export function useStore<T extends (state: AppStore['default']['state']) => any>(
  fn: T,
): ReturnType<T>;
export function useStore<T extends keyof AppStore>(name: T): AppStore[T]['state'];
export function useStore<N extends keyof AppStore, T extends (state: AppStore[N]['state']) => any>(
  name?: N,
  fn?: T,
): ReturnType<T>;
export function useStore(fn?: any, name?: any) {
  const state = useWohoox(fn, name);

  return state;
}

export function dispatch(storName?: keyof AppStore) {
  wohooxDispatch(storName);
}

export { dispatchAll } from 'wohoox';

export const actions = Object.keys(store).reduce((pre, current) => {
  pre[current as 'default'] = store[current as 'default']['actions'];
  return pre;
}, {} as StoreActions);
