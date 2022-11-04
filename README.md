# wohoox

<img style="width: 100px;" src="./example/public/wohoox.png" alt="wohoox" />

Easy, high performance reactive store by react hooks.

## Required

````plain
react: ">=16.8.0"
````

## Install

```` bash
npm install -S wohoox
````

## API

* [createStore](#createstore)
* [useStore](#usestore)

### createStore

It is used to create a store.

#### Params explain

* `name:` default as `'default'`. name of store. it is used as an identifier to get store data.
* `initState:` Initial the data and use it as the data structure of the state.
* `actions:` Dispatch to change data. As the only valid way to modify data in strict mode, then it will caused by page rerender
* `options.strictMode:` default as `true`. Strict mode switch for store. Once the switch turn on, actions will be the only valid way to modify data, otherwise you can directly modify the data by state. `ex: state.age = 23`  

#### Usage

Create a store named 'default'

````typescript
/**
 * src/store.ts
 */
import createStore, { useStore as useWohoox } from 'wohoox';

const store = createStore({
  initState: {
    version: '1.x',
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version;
    },
  },
})

export const useStore = useWohoox
export const actions = store.actions
````

````typescript
// type of store
{
    name: string;
    state: {
        version: string;
    };
    actions: {
        updateVersion(state: { version: string }, version: string): void;
    };
}
````

### useStore

Get state of store by store name and callback

````typescript
export declare function useStore(storeName?: string): any;
export declare function useStore<T extends (state: any) => any>(getState?: T): ReturnType<T>;
export declare function useStore<T extends (state: any) => any>(storeName: string, getState: T): ReturnType<T>;
````

#### Typescript

In order to be able to automatically infer the type based on state, useStore needs to be redefine
**If you do not use typescript, you can use `useStore` directly**

````jsx
/**
 * src/store.ts
 */
- import createStore, { useStore } from 'wohoox';
+ import createStore, { useStore as useWoHoox } from 'wohoox';

+ type DefaultState = typeof store.state;

- export const useStore

+ export function useStore(name?: string): DefaultState;
+ export function useStore<T extends (state: DefaultState) => any>(fn?: T): ReturnType<T>;
+ export function useStore<T extends (state: DefaultState) => any>(name?: string,fn?: T): ReturnType<T>;
+ export function useStore(name?: any, fn?: any) {
+   const state = useWohoox(name, fn);
+ 
+   return state;
+ }
````

#### Params

* `name:` Optional, default as 'default'. Get state from store by name. `Note:` An error will be throw when the name does not exist.
* `callback:` return a detail state, you can use it as redux reselect, but it would be recalculate every time.

#### Used in components

````jsx
/**
 * src/pages/example.tsx
 */
import { actions } from 'src/store.ts'

function Example () {
  // Default to get 'default' store and return the hole state
  const userState = useStore()

  const version = useStore(state => state.version)

  return <div>
    <h2>Version</h2>
    {version}

    <button onClick={() => {actions.updateVersion(version + '_1')}}>click to update version</button>
  </div>
}

````

## Advance

### Multi Store

> Sometimes, you may want to use multi store, you can look here.

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
import { Actions } from 'wohoox';
import defaultStore from './store'

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
export function useStore(name?: any, fn?: any) {
  const state = useWohoox(name, fn);

  return state;
}

/**
 * pick up actions
 */
export const actions = Object.keys(store).reduce((pre, current) => {
  pre[current as "default"] = store[current as "default"]["actions"];
  return pre;
}, {} as StoreActions);
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
**Strict mode is on by default**.

#### Turn on

Actions are the only valid way to modify data

````typescript
const store = createStore({
  initState: {
    version: '1.X',
  },
  actions: {
    updateVersion(version: string) {
      store.state.version = version;
    },
    dispatch (){}
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
* state expression

````typescript
const store = createStore({
  initState: {
    version: '1.X',
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version;
    },
+   // rerender component
+   dispatch (){}
  },
  options: {
-   strictMode: true
+   strictMode: false
  }
})
````

Modify data

````jsx
import { actions } from 'src/store.ts'


function exampleStrictMode () {
  const state = useStore()

  const updateVersion = () => {
    // OK
    actions.updateVersion(state.version + '_1')

    // OK
    state.version = state.version + '_1'
    // rerender by an action(it could be an empty function)
    actions.dispatch()
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

## Notes

* If you do not use `useStore` to get state, **components will not re-render**.
* Use strict mode if possible(use actions to modify state).

## TODO

1. unit test
2. add createMultiStore
