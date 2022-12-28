# wohoox

![wohoox](./example/public/wohoox_211x176.png)

[English](./README.md) [中文](./README_CN.md)

* Lightweight and reactive state management
* Dependency collection automatic，components update exactly
* Easy to use. No HOC, only one API to use in components, its more intuitive to code
* React hooks support only now

## Required

* react: ">=16.8.0"
* browser: only supports browsers with [native ES2015 support](https://caniuse.com/es6)

## Install

```` bash
npm install -S wohoox
````

## Quick Start

1. create a store

````typescript
/**
 * src/store.ts
 */
import createStore from 'wohoox';

const store = createStore({
  initState: {
    version: '1.x',
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
})

export { useStore } from 'wohoox';
export const actions = store.actions
````

2. use state in component

````jsx
/**
 * src/pages/example.tsx
 */
import { actions, useStore } from 'src/store.ts'

function Example () {
  // Default to get 'default' store and return the hole state
  const userState = useStore()

  const version = useStore(state => state.version)

  return <div>
    <h2>Version: {version}</h2>
    <h2>Version: {userState.version}</h2>

    <button onClick={() => {actions.updateVersion(version + '_1')}}>click to update version</button>
  </div>
}
````

3. typescript support

In order to be able to automatically infer the type based on state, useStore needs to be redefine
**If you do not use typescript, you can use `useStore` directly**

````jsx
/**
 * diff src/store.ts
 */
- import createStore from 'wohoox';
+ import createStore, { useStore as useWoHoox } from 'wohoox';

+ type DefaultState = typeof store.state;

- export { useStore } from 'wohoox';

+ export function useStore(name?: string): DefaultState;
+ export function useStore<T extends (state: DefaultState) => any>(fn?: T): ReturnType<T>;
+ export function useStore<T extends (state: DefaultState) => any>(name?: string,fn?: T): ReturnType<T>;
+ export function useStore(name?: any, fn?: any) {
+   const state = useWohoox(name, fn);
+ 
+   return state;
+ }
````

````jsx
/**
 * src/store.ts
 */
import createStore, { useStore as useWoHoox } from 'wohoox';

const store = createStore({
  initState: {
    version: '1.x',
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
})

type DefaultState = typeof store.state;

export function useStore(name?: string): DefaultState;
export function useStore<T extends (state: DefaultState) => any>(fn?: T): ReturnType<T>;
export function useStore<T extends (state: DefaultState) => any>(name?: string,fn?: T): ReturnType<T>;
export function useStore(name?: any, fn?: any) {
  const state = useWohoox(name, fn);

  return state;
}

export const actions = store.actions
````

## Advance

### Multi Store

> If you want to use multi store by module, look here.

#### Create multi store

* Create a store named 'user'

````typescript
/**
 * src/multiStore.ts
 */

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
})

export const userActions = userStore.actions
````

* Create a store named 'department'

````typescript
/**
 * src/multiStore.ts
 */

const devInitState = {
  name: 'developer',
  address: {
    province: 'sc',
    city: 'cd'
  },
}

const devStore = createStore({
  name: 'department',
  initState: devInitState,
  actions: {
    updateAddress(state, address: typeof devInitState['address']) {
      state.address = address;
    },
  },
})

export const devActions = devStore.actions
````

* Combine multi store  
You can combine all stores together. In order to be able to automatically infer the type based on state, useStore needs to be redefine
**If you do not use typescript, you can use `useStore` directly**

````typescript
/**
 * src/multiStore.ts
 */
import defaultStore from './store'
import { combineStores } from 'wohoox';

export const { store, actions } = combineStores(defaultStore, devStore, userStore)

// same as manual to combine stores
// const store = {
//   default: defaultStore,
//   department: devStore,
//   user: userStore,
// };

type AppStore = typeof store;

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
````

#### usage

Use multi store is same as single store, just need to point the store name

````jsx
/**
 * src/pages/multiExample.tsx
 */
import { actions } from 'src/multiStore.ts'

function example () {
  const defaultState = useStore()
  const userState = useStore('user', state => state.name)
  const devState = useStore('department', state => state.address)


  return <div>
    <h2>Default Version</h2>
    {defaultState.version}

    <h2>User Name</h2>
    {userState}

    <h2>Dev address</h2>
    {devState.province}
    {devState.city} 

    <button onClick={() => {actions.default.updateVersion(version + '_1')}}>click to update version</button>
    <button onClick={() => {actions.user.updateName(userState + '_1')}}>click to update name</button>
    <button onClick={() => {actions.department.updateAddress({...devState, city: devState.city + '_1'})}}>click to update address</button>
  </div>
}
````

### StrictMode

In order to make the code style more standardized.
**Strict mode is on by default. Which means actions is the only way to modify state**.

#### Turn on

Actions are the only valid way to modify data

````typescript
const store = createStore({
  initState: {
    version: '1.X',
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version;
    },
  },
  options: {
    // default true
    strictMode: true
  }
})
````

Modify data by actions

````jsx
import { actions } from 'src/store.ts'


function exampleStrictMode () {
  const state = useStore()

  const updateVersion = () => {
    // Error when modify by state
    // state.version = state.version + '_1'
    // actions.dispatch()

    // OK
    actions.updateVersion(state.version + '_1')
  }

  return <div>
    <h2>Default Version</h2>
    {state.version}

    <button onClick={updateVersion}>click to update version</button>
  </div>
}
`````

#### Turn off

Valid ways

* Actions
* state expression + dispatch

````typescript
- import createStore, { useStore as useWohoox } from 'wohoox';
+ import createStore, { useStore as useWohoox, dispatch as wohooxDispatch } from 'wohoox';

const store = createStore({
  initState: {
    version: '1.X',
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version;
    },
  },
  options: {
-   strictMode: true
+   strictMode: false
  }
})

+ export function dispatch(storName?: keyof AppStore) {
+   wohooxDispatch(storName);
+ }
````

Modify data

````jsx
- import { actions } from 'src/store.ts'
+ import { actions, dispatch } from 'src/store.ts'

function exampleStrictMode () {
  const state = useStore()

  const updateVersion = () => {
    // OK
    actions.updateVersion(state.version + '_1')

    // OK
    state.version = state.version + '_1'
    dispatch()
  }

  return <div>
    <h2>Default Version</h2>
    {state.version}

    <button onClick={updateVersion}>click to update version</button>
  </div>
}
`````

### Used in js/ts code

`useStore` is used in component. You can also use state in js and ts file

````typescript
/**
 * src/store.ts
 */

// export state from store.ts
// important... do not use it in components, it can not to rerender
+ export const state = store.state

````

````typescript
/**
 * request.ts
 */

import { state, actions } from 'src/store'

function request () {
  // use state in other js/ts file
  return fetch(`/api/details?version=${state.version}`)
}

async function getVersion () {
  const res = await fetch('/api/version')
  const {version} = await res.json()

  actions.updateVersion(version);
}
````

### plugins

Plug-in options are provided to enhance the functionality of wohoox

wohoox plugin is a object who contains below methods

````jsx
import type { WohooxPlugin } from 'wohoox';

export const plugin: WohooxPlugin = {
  beforeInit(initState, actions) {
    // do something before store init, return new initState and actions
    return {
      initState,
      actions,
    };
  },
  
  onInit(store) {
    // do something after store inited
  },
  onAdd(storeName, value, keys) {
    // do something when state property has been added
  },
  onDelete(storeName, keys) {
    // do something when state property has been deleted
  },
  onChange(storeName, value, keys) {
    // do something when state changed
  },
  onGet(storeName, value, keys) {
    // do something when state has been gettled
    // do not to deal with count, it would be called multi times sometimes
  },
};
````

#### Example of persist

* create a plugin

````jsx
// src/plugin/persist.ts
import type { WohooxPlugin } from 'wohoox';

const persistPlugin: WohooxPlugin = {
  beforeInit(initState, actions) {
    return {
      initState: {
        ...initState,
        version: JSON.parse(localStorage.getItem('wohoox_version') || '""'),
      },
      actions,
    };
  },
  onChange(_name, value, keys) {
    if (keys.toString() === 'version')
      localStorage.setItem('wohoox_version', JSON.stringify(value));
  },
};

export default persistPlugin;
````

* add to plugin option

````jsx
import persistPlugin from './plugin/persist'

const store = createStore({
  initState: {
    version: "1.x",
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version;
    },
  },
  plugins: [persistPlugin],
});
````

## API

* [createStore](#createstore)
* [combineStores](#combinestores)
* [useStore](#usestore)
* [dispatch](#dispatch)
* [dispatchAll](#dispatchall)

### createStore

It is used to create a store.

#### Params

* `name:` default as `'default'`. name of store. it is used as an identifier to get store data.
* `initState:` Initial the data and use it as the data structure of the state.
* `actions:` Dispatch to change data. As the only valid way to modify data in strict mode, then it will caused by page rerender
* `plugins:` plugin list for store
* `options.strictMode:` default as `true`. Strict mode switch for store. Once the switch turn on, actions will be the only valid way to modify data, otherwise you can directly modify the data by state. `ex: state.age = 23`  
* `options.proxySetDeep:` default as `false`. Type data of set will not be proxy for its child item. Cause there is no method to get item, child proxy is is not necessary to proxy. But if you want to proxy anyway, you can set it to true.

#### Usage

Create a store named 'default'

````typescript
/**
 * src/store.ts
 */
import createStore from 'wohoox';

const store = createStore({
  /**
   * default as 'default'
   */
  name: 'default',
  initState: {
    version: '1.x',
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
  /**
   * default as { strictMode: true }
   */
  options: {
    strictMode: true
  }
})

````

### combineStores

combine multi stores to a new store

````jsx
import { combineStores } from 'wohoox';

export const { store, actions } = combineStores(defaultStore, devStore, userStore)
````

### useStore

A hooks to get the state of store by store name and callback

#### Params

* `name:` Optional, default as 'default'. Get state from store by name. `Note:` An error will be throw when the name does not exist.
* `callback:` return a detail state, you can use it as redux reselect, but it would be recalculate every time.

#### Usage

````jsx
/**
 * src/pages/example.tsx
 */
import { actions } from 'src/store.ts'

function Example () {
  // Default to get 'default' store and return the hole state
  const defaultStoreState = useStore()
  // same as useStore()
  const defaultStoreState = useStore('default')

  // get the state of store which named user
  const userStoreState = useStore('user')

  // get state field by callback and store name
  const version = useStore(state => state.version)
  const name = useStore(state => state.details.name)
  const details = useStore('default', state => state.details)

  ...
}
````

#### Typescript

In order to be able to automatically infer the type based on state, useStore needs to be redefine
**If you do not use typescript, you can use `useStore` directly**

````jsx
/**
 * src/store.ts
 */
import createStore, { useStore as useWoHoox } from 'wohoox';

const store = createStore({...})

type DefaultState = typeof store.state;

export function useStore(name?: string): DefaultState;
export function useStore<T extends (state: DefaultState) => any>(fn?: T): ReturnType<T>;
export function useStore<T extends (state: DefaultState) => any>(name?: string,fn?: T): ReturnType<T>;
export function useStore(name?: any, fn?: any) {
  const state = useWohoox(name, fn);

  return state;
}
````

### dispatch

dispatch action for non-strict mode. Same as defined in actions, like:

````typescript
actions: {
  dispatch(){}
}
````

#### Params

* `storeName:` default as 'default'. tell wohoox which store should be update

#### Usage

````typescript
import { useStore, dispatch } from "../store";

function exampleNonStrictMode () {
  const state = useStore()

  const updateVersion = () => {
    state.version = state.version + '_1'
    dispatch()
  }

  return <div>
    <h2>Non-Strict mode</h2>
    {state.version}

    <button onClick={updateVersion}>click to update version</button>
  </div>
}
````

#### Typescript

In order to be able to automatically infer the type based on store module, useStore needs to be redefine
**If you do not use typescript, you can use `dispatch` directly**

````typescript
export function dispatch(storName?: keyof AppStore) {
  wohooxDispatch(storName);
}
````

### dispatchAll

dispatch all store to rerender

````jsx
/**
 * src/pages/multiExample.tsx
 */
import { actions } from 'src/multiStore.ts'
import { dispatchAll } from 'wohoox'

function example () {
  const defaultState = useStore()
  const userState = useStore('user', state => state)
  const devState = useStore('department', state => state.address)


  return <div>
    <h2>Default Version</h2>
    {defaultState.version}

    <h2>User Name</h2>
    {userState.name}

    <h2>Dev address</h2>
    {devState.province}
    {devState.city} 

    <button onClick={() => {
      defaultState.version += '_1'
      devState.city += "_2"
      userState.name += '_3'

      dispatchAll()
      {/* same as below */}
      {/* dispatch() */}
      {/* dispatch('user') */}
      {/* dispatch('department') */}
    }}>click to update all</button>
  </div>
}
````

## Notes

* If you do not use `useStore` to get state, **components will not re-render**.
* Use strict mode if possible(use actions to modify state).
* Type data of Set will not be proxy for its child item。If you want to rerender when changed the child items properties, you can：
  * Delete the last item of Set and add it into Set again
  * Or set options `proxySetDeep: true`

## TODO

1. sync from server
2. persist
3. framework independence
