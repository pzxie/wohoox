import createStore, { useStore as useWohoox } from "wohoox";
import defaultStore from "./store";

const userStore = createStore({
  name: "user",
  initState: {
    name: "wohoox",
    description: "reactive store",
  },
  actions: {
    updateName(name: string) {
      userStore.state.name = name;
    },
  },
});

const devInitState = {
  name: "developer",
  address: {
    province: "sc",
    city: "cd",
  },
};

const devStore = createStore({
  name: "department",
  initState: devInitState,
  actions: {
    updateAddress(address: typeof devInitState["address"]) {
      devStore.state.address = address;
    },
  },
});

const store = {
  default: defaultStore,
  department: devStore,
  user: userStore,
};

type AppStore = typeof store;
type StoreActions = { [K in keyof AppStore]: AppStore[K]["actions"] };

export function useStore(): AppStore["default"]["state"];
export function useStore<T extends (state: AppStore["default"]["state"]) => any>(fn: T): ReturnType<T>;
export function useStore<T extends keyof AppStore>(name: T): AppStore[T]["state"];
export function useStore<
  N extends keyof AppStore,
  T extends (state: AppStore[N]["state"]) => any
>(name?: N, fn?: T): ReturnType<T>;
export function useStore(fn?: any, name?: any) {
  const state = useWohoox(fn, name);

  return state;
}

export const actions = Object.keys(store).reduce((pre, current) => {
  pre[current as "default"] = store[current as "default"]["actions"];
  return pre;
}, {} as StoreActions);
