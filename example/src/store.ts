import createStore, { useStore as useWohoox } from "wohoox";

const store = createStore({
  initState: {
    version: "1.x",
    details: {
      name: 'wohoox',
      other: 'xxx'
    },
    type: {
      number: 123,
      string: 'string',
      boolean: true,
      symbol: Symbol(123),
      null: null as null | boolean,
      undefined: undefined as undefined | boolean,
      object: {
        name: 'object',
        author: 'pzxie',
        reference: {
          key: 'name',
          value: 'wohoox'
        }
      },
      array: ['1', true, 3, {name: 'arrayObject'}, [11,22,33]] as [string, boolean, number, {name: string}, Array<number>],
      set: new Set<any>(),
      weakSet: new WeakSet(),
      map: new Map<any, any>([[{type: 'map'}, {'name': 123}]]),
      weakMap: new WeakMap()
    }
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version;
    },
  },
  options: {
    strictMode: false,
    proxySetDeep: true
  }
});

type DefaultState = typeof store.state;

export function useStore(name?: string): DefaultState;
export function useStore<T extends (state: DefaultState) => any>(fn?: T): ReturnType<T>;
export function useStore<T extends (state: DefaultState) => any>(name?: string,fn?: T): ReturnType<T>;
export function useStore(name?: any, fn?: any) {
  const state = useWohoox(name, fn);

  return state;
}

export const actions = store.actions;
export default store;
