# wohoox-react

English | [中文](./README_CN.md)

- Based on [wohoox](../wohoox/README.md)
- Lightweight and reactive state management for react
- Dependency collection automatic，components update exactly
- Easy to use. No HOC, only one API to use in components, its more intuitive to code
- React hooks support only now

## Required

- react: ">=16.8.0"
- browser: only supports browsers with [native ES2015 support](https://caniuse.com/es6)

## Install

```bash
npm install -S wohoox-react
```

## Quick Start

1. Create store

```typescript
/**
 * src/store.ts
 */
import { createStore } from 'wohoox-react'

createStore({
  initState: {
    version: '2.x',
    details: {
      name: 'wohoox-react',
      other: 'xxx',
    },
  },
})

export { useStore } from 'wohoox-react'
```

2. Use state

```jsx
/**
 * src/pages/example.tsx
 */
import { useStore } from 'src/store.ts'

function Example() {
  // Default to get 'default' store and return the hole state
  const userState = useStore()

  const version = useStore(state => state.version)

  return (
    <div>
      <h2>Version: {version}</h2>
      <h2>Version: {userState.version}</h2>
    </div>
  )
}
```

3. Update state

`wohoox-react` updates state by `action`. This will make the state changes more controllable and trackable

```typescript
/**
 * src/store.ts
 */
import { createStore } from 'wohoox-react'

const store = createStore({
  initState: {...},
  // init actions
  actions: {
    updateVersion(state, version: string) {
      state.version = version
    },
    updateDetailsName(state, name: string) {
      state.details.name = name;
    }
    updateDetails(state, details: typeof state.details) {
      state.details = details
    }
  },
})

export { useStore } from 'wohoox-react'
export const actions = store.actions
```

```jsx
/**
 * src/pages/example.tsx
 */
import { actions, useStore } from 'src/store.ts'

function Example() {
  const userState = useStore()

  const version = useStore(state => state.version)

  return (
    <div>
      <h2>Version: {version}</h2>
      <h2>Version: {userState.version}</h2>
      <h2>Version: {userState.details.name}</h2>

      <button
        onClick={() => {
          actions.updateVersion(version + '_1')
        }}
      >
        click to update version
      </button>

      <button
        onClick={() => {
          // update the deep field
          actions.updateDetailsName('wohoox-react-' + Math.random())
        }}
      >
        update name
      </button>

      <button
        onClick={() => {
          // update the object
          actions.updateDetails({
            ...userState.details,
            name: 'wohoox-react-' + Math.random(),
          })
        }}
      >
        update details
      </button>
    </div>
  )
}
```

4. Typescript support

In order to be able to automatically infer the type based on state, useStore needs to be redefine
**If you do not use typescript, you can use `useStore` directly**

```jsx
/**
 * diff src/store.ts
 */
- import { createStore } from 'wohoox-react'
+ import { createStore, useStore as useWoHoox } from 'wohoox-react'

+ type DefaultState = typeof store.state

- export { useStore } from 'wohoox-react'

+ export function useStore(name?: string): DefaultState
+ export function useStore<T extends (state: DefaultState) => any>(fn?: T): ReturnType<T>
+ export function useStore<T extends (state: DefaultState) => any>(name?: string,fn?: T): ReturnType<T>
+ export function useStore(name?: any, fn?: any) {
+   const state = useWohoox(name, fn)
+
+   return state
+ }
```

```jsx
/**
 * src/store.ts
 */
import { createStore, useStore as useWoHoox } from 'wohoox-react';

const store = createStore({
  initState: {
    version: '2.x',
    details: {
      name: 'wohoox-react',
      other: 'xxx',
    }
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version
    },
  },
})

type DefaultState = typeof store.state

export function useStore(name?: string): DefaultState
export function useStore<T extends (state: DefaultState) => any>(fn?: T): ReturnType<T>
export function useStore<T extends (state: DefaultState) => any>(name?: string,fn?: T): ReturnType<T>
export function useStore(name?: any, fn?: any) {
  const state = useWohoox(name, fn)

  return state
}

export const actions = store.actions
export default store
```

## Advanced

### Key-Value by one action

> It's common for an action to update one field. For example, `updateVersion` is used to update the `version`. `Redux` and `Mobx` are often used like this
> `wohoox-react` also allows you to update by defining a common action, thus simplifying the definition of the action

```typescript
/**
 * src/store.ts
 */

import { createStore } from 'wohoox'

type RevertObjectToArrayUnion<T extends object, K = keyof T> = K extends keyof T
  ? [K, T[K]]
  : unknown

const store = createStore({
  initState: {
    version: '2.x',
    details: {
      name: 'wohoox-react',
      other: 'xxx',
    },
  },
  actions: {
    // Use the key-value action for unified definition update, and typescript support
    updateByKeyValue(state, ...args: RevertObjectToArrayUnion<typeof state>) {
      const [key, value] = args as [keyof typeof state, any]
      state[key] = value
    },
  },
})

// OK
store.actions.updateByKeyValue('version', '2.0')
// OK
store.actions.updateByKeyValue('details', {
  name: 'wohoox-react',
  other: 'anything',
})
```

### Multi Store

> wohoox also supports division by module

#### Create multi store

- Create a store named `user`

```typescript
/**
 * src/store/user.ts
 */

import { createStore } from 'wohoox-react'

export default createStore({
  name: 'user',
  initState: {
    time: new Date().toLocaleString(),
  },
  actions: {
    updateBirthday(state, time: string) {
      state.time = time
    },
  },
})
```

- Create a default store

```typescript
/**
 * src/store/default.ts
 */

import { createStore } from 'wohoox-react'

type RevertObjectToArrayUnion<T extends object, K = keyof T> = K extends keyof T
  ? [K, T[K]]
  : unknown

const store = createStore({
  initState: {
    version: '2.x',
    details: {
      name: 'wohoox-react',
      other: 'xxx',
    },
  },
  actions: {
    updateByKeyValue(state, ...args: RevertObjectToArrayUnion<typeof state>) {
      const [key, value] = args as [keyof typeof state, any]
      state[key] = value
    },
  },
})
```

- Combine multi store  
  You can combine all stores together. In order to be able to automatically infer the type based on state, `useStore` needs to be redefine
  **If you do not use typescript, you can use `useStore` directly**

```typescript
/**
 * src/store/index.ts
 */

import { useStore as useWohoox, combineStores } from 'wohoox-react'

import defaultStore from './default'
import userStore from './user'

const { store, actions: combineActions } = combineStores(
  defaultStore,
  userStore,
)

type AppStore = typeof store
type StoreNames = keyof typeof store

export function useStore<N extends StoreNames = 'default'>(
  name?: N,
): AppStore[N]['state']
export function useStore<
  T extends (state: AppStore['default']['state']) => any,
>(fn?: T): ReturnType<T>
export function useStore<
  N extends StoreNames,
  T extends (state: AppStore[N]['state']) => any,
>(name?: N, fn?: T): ReturnType<T>
export function useStore(name?: any, fn?: any) {
  const state = useWohoox(name, fn)

  return state
}

export const actions = combineActions
export default store
```

#### Multi store usage

Use multi store is same as single store, just need to point the store name

```jsx
/**
 * src/pages/multiExample.tsx
 */
import { actions, useStore } from 'src/store'

function MultiExample() {
  const defaultStoreVersion = useStore(s => s.version)
  const userStoreTime = useStore('user', state => state.time)

  return (
    <div className="App">
      <div className="section">
        <h3>Default Store</h3>
        <div className="version">Version: {defaultStoreVersion}</div>
        <button
          className="button"
          onClick={() => {
            actions.default.updateByKeyValue(
              'version',
              `1.${Math.floor(Math.random() * 10)}`,
            )
          }}
        >
          update version
        </button>
      </div>
      <div className="section">
        <h3>User Store</h3>
        <div className="version">name: {userStoreTime}</div>
        <button
          className="button"
          onClick={() => {
            actions.user.updateBirthday(new Date().toLocaleString())
          }}
        >
          update time
        </button>
      </div>
    </div>
  )
}

export default MultiExample
```

### StrictMode

In order to make the code style more standardized.
**Strict mode is on by default. Which means `actions` is the only way to modify state**.

#### Turn on

Actions are the only valid way to modify data

```typescript
/**
 * src/store.ts
 */
import { useStore as useWohoox, createStore } from 'wohoox-react'

const store = createStore({
  initState: {
    version: '2.X',
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version
    },
  },
  options: {
    // default true
    strictMode: true,
  },
})

// ... useStore typescript define
export function useStore(name?: any, fn?: any) {
  const state = useWohoox(name, fn)

  return state
}
export const actions = store.actions
```

Modify data by actions

```jsx
import { actions, useStore } from 'src/store.ts'

function exampleStrictMode() {
  const state = useStore()

  const updateVersion = () => {
    // Error when modify by state
    // state.version = state.version + '_1'
    // actions.dispatch()

    // OK
    actions.updateVersion(state.version + '_1')
  }

  return (
    <div>
      <h2>Default Version</h2>
      {state.version}

      <button onClick={updateVersion}>click to update version</button>
    </div>
  )
}
```

#### Turn off

Valid ways

- Actions
- state expression + dispatch

```typescript
import { useStore as useWohoox, createStore } from 'wohoox-react'

const store = createStore({
  initState: {
    version: '2.X',
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version
    },
  },
  options: {
-   strictMode: true,
+   strictMode: false,
  }
})

// ... useStore typescript define
export function useStore(name?: any, fn?: any) {
  const state = useWohoox(name, fn)

  return state
}
+ export { dispatch } from 'wohoox-react'
export const actions = store.actions
```

Modify data

```jsx
- import { actions, useStore } from 'src/store.ts'
+ import { actions, useStore, dispatch } from 'src/store.ts'

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
```

### Used in js/ts code

`useStore` is used in component. You can also use state in js and ts file

```typescript
/**
 * src/store.ts
 */

// export state from store.ts
// important... do not use it in components, it can not to rerender
+ export const state = store.state

```

```typescript
/**
 * request.ts
 */

import { state, actions } from 'src/store'

function request() {
  // use state in other js/ts file
  return fetch(`/api/details?version=${state.version}`)
}

async function getVersion() {
  const res = await fetch('/api/version')
  const { version } = await res.json()

  actions.updateVersion(version)
}
```

### Plugins

Plug-in options are provided to enhance the functionality of wohoox-react

wohoox-react plugin is a object who contains below methods

```jsx
import type { WohooxPlugin } from 'wohoox-react'

export const plugin: WohooxPlugin = {
  beforeInit(initState, actions) {
    // do something before store init, return new initState and actions
    return {
      initState,
      actions,
    }
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
  },
}
```

#### Example of persist

- create a plugin

```jsx
// src/plugin/persist.ts
import type { WohooxPlugin } from 'wohoox-react'

const persistPlugin: WohooxPlugin = {
  beforeInit(initState, actions) {
    return {
      initState: {
        ...initState,
        version: JSON.parse(localStorage.getItem('wohoox_version') || '""'),
      },
      actions,
    }
  },
  onChange(_name, value, keys) {
    if (keys.toString() === 'version')
      localStorage.setItem('wohoox_version', JSON.stringify(value))
  },
}

export default persistPlugin
```

- add to plugin option

```jsx
/**
 * src/store.ts
 */

import persistPlugin from './plugin/persist'

const store = createStore({
  initState: {
    version: '2.x',
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version
    },
  },
  plugins: [persistPlugin],
})
```

## API

- [createStore](#createstore)
- [combineStores](#combinestores)
- [useStore](#usestore)
- [dispatch](#dispatch)
- [dispatchAll](#dispatchall)

### createStore

It is used to create a store.

#### Params of createStore

- `name:` default as `'default'`. name of store. it is used as an identifier to get store data.
- `initState:` Initial the data and use it as the data structure of the state.
- `actions:` Dispatch to change data. As the only valid way to modify data in strict mode, then it will caused by page rerender
- `plugins:` plugin list for store
- `options.strictMode:` default as `true`. Strict mode switch for store. Once the switch turn on, actions will be the only valid way to modify data, otherwise you can directly modify the data by state. `ex: state.age = 23`
- `options.proxySetDeep:` default as `false`. Type data of set will not be proxy for its child item. Cause there is no method to get item, child proxy is is not necessary to proxy. But if you want to proxy anyway, you can set it to true.

#### Usage for createStore

Create a store named 'default'

```typescript
/**
 * src/store.ts
 */
import { createStore } from 'wohoox-react'

const store = createStore({
  /**
   * default as 'default'
   */
  name: 'default',
  initState: {
    version: '2.x',
    details: {
      name: 'wohoox-react',
      other: 'xxx',
    },
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version
    },
  },
  /**
   * default as { strictMode: true }
   */
  options: {
    strictMode: true,
  },
})
```

### combineStores

combine multi stores to a new store

```jsx
import { combineStores } from 'wohoox-react'

export const { store, actions } = combineStores(
  defaultStore,
  devStore,
  userStore,
)
```

### useStore

A hooks to get the state of store by store name and callback

#### Params of useStore

- `name:` Optional, default as `default`. Get state from store by name. `Note:` An error will be throw when the name does not exist.
- `callback:` return a detail state, you can use it as redux reselect, but it would be recalculate every time.

#### Usage for useStore

```jsx
/**
 * src/pages/example.tsx
 */
import { useStore } from 'src/store'

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
```

#### Typescript for useStore

In order to be able to automatically infer the type based on state, useStore needs to be redefine
**If you do not use typescript, you can use `useStore` directly**

Single Store

```jsx
/**
 * src/store.ts
 */
import { createStore, useStore as useWoHoox } from 'wohoox-react'

const store = createStore({...})

type DefaultState = typeof store.state;

export function useStore(name?: string): DefaultState
export function useStore<T extends (state: DefaultState) => any>(fn?: T): ReturnType<T>
export function useStore<T extends (state: DefaultState) => any>(name?: string,fn?: T): ReturnType<T>
export function useStore(name?: any, fn?: any) {
  const state = useWohoox(name, fn)

  return state
}
```

[Multi Store](#multi-store)

### dispatch

dispatch action for non-strict mode. Same as defined in actions, like:

```typescript
actions: {
  dispatch(){}
}
```

#### Params of dispatch

- `storeName:` default as `default`. tell wohoox-react which store should be update

#### Usage for dispatch

```typescript
/**
 * src/store.ts
 */

+ export { dispatch } from 'wohoox-react'
```

```typescript
import { useStore, dispatch } from 'src/store'

function exampleNonStrictMode() {
  const state = useStore()

  const updateVersion = () => {
    state.version = state.version + '_1'
    dispatch()
  }

  return (
    <div>
      <h2>Non-Strict mode</h2>
      {state.version}

      <button onClick={updateVersion}>click to update version</button>
    </div>
  )
}
```

#### Multi module for dispatch typescript support

In order to be able to automatically infer the type based on store module, `dispatch` needs to be redefine
**If you do not use typescript, you can use `dispatch` directly**

```typescript
const { store } = combineStores(...)

export function dispatch(storName?: keyof typeof store) {
  wohooxDispatch(storName)
}
```

### dispatchAll

dispatch all store to rerender

```jsx
/**
 * src/pages/multiExample.tsx
 */
import { actions } from 'src/store'
import { dispatchAll } from 'wohoox-react'

function example() {
  const defaultState = useStore()
  const userState = useStore('user', state => state)
  const devState = useStore('department', state => state.address)

  return (
    <div>
      <h2>Default Version</h2>
      {defaultState.version}

      <h2>User Name</h2>
      {userState.name}

      <h2>Dev address</h2>
      {devState.province}
      {devState.city}

      <button
        onClick={() => {
          defaultState.version += '_1'
          devState.city += '_2'
          userState.name += '_3'

          dispatchAll()
          {
            /* same as below */
          }
          {
            /* dispatch() */
          }
          {
            /* dispatch('user') */
          }
          {
            /* dispatch('department') */
          }
        }}
      >
        click to update all
      </button>
    </div>
  )
}
```

## Notice

- If you do not use `useStore` to get state, **components will not re-render**.
- Use strict mode if possible(use actions to modify state).
- Type data of Set will not be proxy for its child item。If you want to rerender when changed the child items properties, you can：
  - Delete the last item of Set and add it into Set again
  - Or set options `proxySetDeep: true`
