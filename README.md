# wohoox

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

```` typescript
export declare type Actions = {
    [key: string]: ((...args: any) => any) | Actions;
};
export declare type Options = {
    strictMode?: boolean;
};

function createStore<T extends object, A extends Actions>({ name, initState, actions, options, }: {
    name?: string;
    initState: T;
    actions?: A;
    options?: Options;
}): {
    name: string;
    state: T;
    actions: A;
};
````

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
import createStore, { useStore } from 'wohoox';

const store = createStore({
  initState: {
    version: '1.x',
  },
  actions: {
    updateVersion(version: string) {
      store.state.version = version;
    },
  },
})

export const useStore
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
        updateVersion(version: string): void;
    };
}
````

### useStore

Get state of store by store name and callback

````typescript
export declare function useStore(storeName?: string): any;
export declare function useStore<T extends (state: any) => any>(getState?: T, storeName?: string): ReturnType<T>;
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
+ export function useStore<T extends (state: DefaultState) => any>(fn?: T, name?: string): ReturnType<T>;
+ export function useStore(fn?: any, name?: any) {
+  const state = useWoHoox(fn, name);
+
+  return state;
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

function example () {
  // Default to get 'default' store and return the hole state
  const userState = useStore()

  const version = useStore(state => state.version)

  return <div>
    <h2>Version</h2>
    {version}

    <button onclick={() => {actions.updateVersion(version + '_1')}}>click to update version</button>
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
    updateName(name: string) {
      store.state.name = name;
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
    updateAddress(address: typeof devInitState['address']) {
      store.state.name = payload;
    },
  },
})

export const userActions = userStore.actions
````

* Combine multi store  
You can combine all stores together. In order to be able to automatically infer the type based on state, useStore needs to be redefine
**If you do not use typescript, you can use `useStore` directly**

````typescript
/**
 * src/multiStore.ts
 */

const store = {
  default: store,
  department: devStore,
  user: userStore,
};

export function useStore(): AppState['default']['state'];
export function useStore<T extends keyof typeof store>(name: T): AppState[T]['state'];
export function useStore<T extends (state: AppState[N]['state']) => any, N extends keyof typeof store>(
  fn?: T,
  name?: N
): ReturnType<T>;
export default function useStore(fn?: any, name?: any) {
  const state = useWoHoox(fn, name);

  return state;
}

export const actions = Object.keys(store).reduce<Record<keyof typeof store, Actions>>((pre, current) => {
  pre[current as keyof typeof store] = store[current as keyof typeof store]['actions'];
  return pre;
}, {} as Record<keyof typeof store, Actions>);
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
  const userState = useStore(state => state.name, 'user')
  const devState = useStore(state => state.address, 'department')


  return <div>
    <h2>Default Version</h2>
    {defaultState.version}

    <h2>User Name</h2>
    {userState}

    <h2>Dev address</h2>
    {devState.province}
    {devState.city} 

    <button onclick={() => {actions.default.updateVersion(version + '_1')}}>click to update version</button>
    <button onclick={() => {actions.user.updateName(userState + '_1')}}>click to update name</button>
    <button onclick={() => {actions.department.updateAddress({...devState, city: devState.city + '_1'})}}>click to update version</button>
  </div>
}
````

### StrictMode

In order to make the code style more standardized.
**Strict mode is on by default**.

#### Turn on

Actions are the only valid way to modify data

````typescript
const Store = createStore({
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
    actions.default.updateVersion(state.version + '_1')
  }

  return <div>
    <h2>Default Version</h2>
    {state.version}

    <button onclick={updateVersion}>click to update version</button>
  </div>
}
`````

#### Turn off

Valid ways

* Actions
* state expression

````typescript
const Store = createStore({
  initState: {
    version: '1.X',
  },
  actions: {
    updateVersion(version: string) {
      store.state.version = version;
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
    actions.default.updateVersion(state.version + '_1')

    // OK
    state.version = state.version + '_1'
    // rerender by an action(it could be an empty function)
    actions.dispatch()
  }

  return <div>
    <h2>Default Version</h2>
    {state.version}

    <button onclick={updateVersion}>click to update version</button>
  </div>
}
`````

### Used in js/ts code

`useStore` is used in component. You can also use state in js and ts file, **but only read**

````typescript
/**
 * src/store.ts
 */

// export state from store.ts
+ export const state = store.state

````

````typescript
/**
 * request.ts
 */

import { state } from 'src/store'

function request () {
  // use state in other js/ts file
  return fetch(`/api/details?version=${state.version}`)
}
````
