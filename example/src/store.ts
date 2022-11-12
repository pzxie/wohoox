import createStore, { useStore as useWohoox } from "wohoox";

const store = createStore({
  initState: {
    version: "1.x",
    details: {
      name: 'wohoox',
      other: 'xxx'
    }
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version;
    },
  },
  options: {
    strictMode: false
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
