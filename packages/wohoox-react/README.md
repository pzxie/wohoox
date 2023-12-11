# wohoox-react

English | [中文](./README_CN.md)

- Implementation based on [wohoox](../wohoox/README.md)
- Lightweight and reactive state management for react
- Dependency collection automatic，components update exactly
- Easy to use. No HOC
- Implementation and use based on React hooks
- Full Typescript support

## Table of Contents

- [wohoox-react](#wohoox-react)
  - [Table of Contents](#table-of-contents)
  - [Compatibility requirements](#compatibility-requirements)
  - [Install](#install)
  - [Quick Start](#quick-start)
  - [Advanced](#advanced)
    - [Key-Value by one action](#key-value-by-one-action)
    - [Reset state](#reset-state)
      - [initState is an object](#initstate-is-an-object)
      - [initState is a function](#initstate-is-a-function)
    - [Multiple Store](#multiple-store)
      - [Create multiple stores](#create-multiple-stores)
      - [How to use multiple modules](#how-to-use-multiple-modules)
    - [Strict mode](#strict-mode)
      - [Turn on strict mode](#turn-on-strict-mode)
      - [Turn off strict mode](#turn-off-strict-mode)
    - [Using in non-components](#using-in-non-components)
    - [Plug-in system](#plug-in-system)
      - [Customize a persistence plug-in](#customize-a-persistence-plug-in)
  - [API](#api)
    - [createStore](#createstore)
      - [Parameter description of createStore](#parameter-description-of-createstore)
      - [Return value of createStore](#return-value-of-createstore)
      - [How to use createStore](#how-to-use-createstore)
    - [combineStores](#combinestores)
      - [Parameter description of combineStores](#parameter-description-of-combinestores)
      - [Return value of combineStores](#return-value-of-combinestores)
      - [How to use combineStores](#how-to-use-combinestores)
    - [dispatch](#dispatch)
      - [dispatch parameter description](#dispatch-parameter-description)
      - [How to use dispatch](#how-to-use-dispatch)
      - [dispatch multi-module Typescript support](#dispatch-multi-module-typescript-support)
    - [dispatchAll](#dispatchall)
  - [Notice](#notice)

## Compatibility requirements

- react: ">=16.8.0"
- browser: All browsers that support [native ES2015 support](https://caniuse.com/es6)

## Install

```bash
npm install -S wohoox-react
```

## Quick Start

1. Create store

[api reference](#createstore)

```typescript
/**
 * src/store.ts
 */
import { createStore } from 'wohoox-react'

const { useStore, useWohooxState } = createStore({
  initState: {
    version: '2.x',
    details: {
      name: 'wohoox-react',
      other: 'xxx',
    },
  },
})

export { useStore, useWohooxState }
```

2. Use state

[Reference](#how-to-use-createstore)

```jsx
/**
 * src/pages/example.tsx
 */
import { useStore, useWohooxState } from 'src/store.ts'

function Example() {
  // Get the entire state in the store named [default] by default
  const { state } = useStore()
  // Get state directly through useWohooxState
  const version = useWohooxState(state => state.version)

  return (
    <div>
      <h2>Version: {version}</h2>
      <h2>Version: {state.version}</h2>
    </div>
  )
}
```

3. Update state

wohoox-react uses `action` to update the state, making the changes to the entire state more controllable and trackable.

```typescript
/**
  * src/store.ts
  */
import { createStore } from 'wohoox-react'

const { store, useStore } = createStore({
   initState: {...},
   //Initialize and define actions
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

export { useStore, store }
```

In addition to returning `state`, `useStore` can also return `actions` of the current store

```jsx
/**
 * src/pages/example.tsx
 */
import { useStore } from 'src/store.ts'

function Example() {
  const { state, actions } = useStore()
  const { state: version } = useStore(state => state.version)

  return (
    <div>
      <h2>Version: {version}</h2>
      <h2>Version: {state.version}</h2>
      <h2>Version: {state.details.name}</h2>

      <button
        onClick={() => {
          actions.updateVersion(version + '_1')
        }}
      >
        click to update version
      </button>

      <button
        onClick={() => {
          // You can update a deep field
          actions.updateDetailsName('wohoox-react-' + Math.random())
        }}
      >
        update name
      </button>

      <button
        onClick={() => {
          // You can also update the entire object
          actions.updateDetails({
            ...state.details,
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

`actions` can also be called through `store`

```jsx
/**
  * src/pages/example.tsx
  */
import { store, useStore } from 'src/store.ts'

function Example() {
  ...

   return (
     <div>
       ...
       <button
         onClick={() => {
           // Call via store
           store.actions.updateDetails({
             ...state.details,
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

## Advanced

### Key-Value by one action

It is common for a field to be updated with an `action`, for example `updateVersion` is used to update `version`. The common `Redux` and `mobx` are also often used in this way

> Using `wohoox-react`, you can define a generic `action`, which can simplify many templated `action` definitions

```typescript
/**
 * src/store.ts
 */

import { createStore } from 'wohoox-react'

type RevertObjectToArrayUnion<T extends object, K = keyof T> = K extends keyof T
  ? [K, T[K]]
  : unknown

const { store } = createStore({
  initState: {
    version: '2.x',
    details: {
      name: 'wohoox-react',
      other: 'xxx',
    },
  },
  actions: {
    //Define a common Key-Value action to simplify operations
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

### Reset state

wohoox-react has built-in `reset` action. You can use `reset` to reset `state`

> **Note:** `reset` is a built-in `action` of `wohoox-react`. Custom `reset` action will be ignored when creating the store. and the console will issue a warning

#### initState is an object

When initializing the store, if `initState` is an object, `reset` must pass in new initialization data

```typescript
import { createStore } from 'wohoox-react'

const { store } = createStore({
  initState: {
    name: 'wohoox-react',
    version: '1.x',
  },
})

/**
 * Reset state using incoming data
 * The reset parameter is required
 */
store.actions.reset({
  name: 'wohoox-react',
  version: '2.x',
})
```

#### initState is a function

When initializing the store, if `initState` is a factory function, the `reset` parameter is optional

- **When no parameters are passed**, the factory function will be called by default to return to the new initialization state.

- **When passing parameters**, use the incoming data as the new initialization state

```typescript
import { createStore } from 'wohoox-react'

const { store } = createStore({
  initState: () => ({
    name: 'wohoox-react',
    version: '1.x',
  }),
})

/**
 * Call the initial initState function to reset the state
 */
store.actions.reset()

/**
 * Reset state using incoming data
 */
store.actions.reset({
  name: 'wohoox-react',
  version: '2.x',
})
```

### Multiple Store

> wohoox-react supports the creation of multiple stores. These stores can be used independently, or multiple stores can be integrated through `combineStores`.

#### Create multiple stores

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

- Create a default store (name is not specified explicitly, default as 'default')

```typescript
/**
 * src/store/default.ts
 */

import { createStore } from 'wohoox-react'

type RevertObjectToArrayUnion<T extends object, K = keyof T> = K extends keyof T
  ? [K, T[K]]
  : unknown

export default createStore({
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

- Combine multiple stores

```typescript
/**
 * src/store/index.ts
 */

import { combineStores } from 'wohoox-react'

import defaultStore from './default'
import userStore from './user'

const { store, actions, useStore, useWohooxState } = combineStores(
  defaultStore.store,
  userStore.store,
)

export { store, actions, useStore, useWohooxState }
```

#### How to use multiple modules

Multi-modules are used in the same way as single modules, except that you need to specify the store name to obtain the state.

```jsx
/**
 * src/pages/multiExample.tsx
 */
import { useStore } from 'src/store'

function MultiExample() {
  const {
    state: defaultStoreVersion,
    actions: { updateByKeyValue },
  } = useStore('default', s => s.version)
  const {
    state: userStoreTime,
    actions: { updateBirthday },
  } = useStore('user', state => state.time)

  return (
    <div className="App">
      <div className="section">
        <h3>Default Store</h3>
        <div className="version">Version: {defaultStoreVersion}</div>
        <button
          className="button"
          onClick={() => {
            updateByKeyValue('version', `1.${Math.floor(Math.random() * 10)}`)
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
            updateBirthday(new Date().toLocaleString())
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

### Strict mode

In order to make the code style more unified and standardized, **strict mode is enabled by default**, which means that state can only be modified through `actions`.

#### Turn on strict mode

State can only be modified through actions

```typescript
/**
 * src/store.ts
 */
import { createStore } from 'wohoox-react'

const { store, useStore } = createStore({
  initState: {
    version: '2.X',
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version
    },
  },
  options: {
    // default as true
    strictMode: true,
  },
})

export { useStore, store }
```

Modify data through actions

```jsx
import { dispatch } from 'wohoox-react'
import { useStore } from 'src/store.ts'

function exampleStrictMode() {
  const { state, actions } = useStore()

  const updateVersion = () => {
    // Directly modifying state will report an error
    // state.version = state.version + '_1'
    // dispatch()

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

#### Turn off strict mode

Both methods are allowed

- Modify data through actions
- Directly modify data through expressions + dispatch

```typescript
import { createStore } from 'wohoox-react'

const { store, useStore } = createStore({
   initState: {
     version: '2.X',
   },
   actions: {
     updateVersion(state, version: string) {
       state.version = version
     },
   },
   options: {
-    strictMode: true,
+    strictMode: false,
   }
})

+ export { dispatch } from 'wohoox-react'
```

change the data

```jsx
- import { useStore } from 'src/store.ts'
+ import { useStore, dispatch } from 'src/store.ts'

function exampleStrictMode () {
   const { state, actions } = useStore()

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

### Using in non-components

`useStore` can only be used in functional components. It can be used in non-components through `store`

```typescript
/**
 * request.ts
 */

import { store } from 'src/store'

const { state, actions } = store

function request() {
  return fetch(`/api/details?version=${state.version}`)
}

async function getVersion() {
  const res = await fetch('/api/version')
  const { version } = await res.json()

  actions.updateVersion(version)
}
```

### Plug-in system

Plugin options are provided to enhance wohoox-react

The plugin of wohoox-react consists of the following methods

```jsx
import type { WohooxPlugin } from 'wohoox-react'

export const plugin: WohooxPlugin = {
  beforeInit(initState, actions) {
    // Before initializing the store, process initState and actions and return new initState and actions for initialization
    return {
      initState,
      actions,
    }
  },

  onInit(store) {
    // After store initialization
  },
  onAdd(storeName, value, keys) {
    //Callback when new attributes are added
  },
  onDelete(storeName, keys) {
    //Callback when the property is deleted
  },
  onChange(storeName, value, keys) {
    //Callback when state changes
  },
  onGet(storeName, value, keys) {
    //Callback when obtaining properties
  },
  onReset(storeName, state, originState) {
    //Reset state callback
  },
}
```

#### Customize a persistence plug-in

- Create a plugin

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
  onReset(_name, state) {
    localStorage.setItem('wohoox_version', JSON.stringify(state.version))
  },
}

export default persistPlugin
```

- Add plugins to plugins option

```jsx
/**
 * src/store.ts
 */

import persistPlugin from './plugin/persist'

const { store } = createStore({
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
- [dispatch](#dispatch)
- [dispatchAll](#dispatchall)

### createStore

Used to initialize and create a store and react hooks `useStore`, `useWohooxState`

> Note: If a store with the same name is registered, the store registered later will overwrite the store with the same name registered first. and the console will issue a warning

#### Parameter description of createStore

- `name`, store name, defaults to `'default'`. As a unique identifier of the store, this field is used to distinguish modules when there are multiple modules.
- `initState`, initializes data and uses the data structure of that data as typescript type inference
- `actions`, a way to modify data and prompt related components to re-render. In strict mode, it is the only way to legally modify data.
- `plugins`, plugin options
- `options`, configuration items
  - `options.strictMode`, strict mode switch. Defaults to `true`. In strict mode, actions are the only way to modify state. In non-strict mode, state can be modified directly. `ex: state.age = 23; dispatch()`
  - `options.proxySetDeep`, Type of set data depth proxy switch. Default `false`. By default, Set type data will not proxy its sub-data. Since there is no data acquisition, there is no need to proxy its sub-data. If you are sure you need a deep proxy, you can set it to true

#### Return value of createStore

- `store` can be used anywhere
  - `store.name`
  - `store.state`,
  - `store.actions`, actions including `reset`
- `useStore` is a hook used to obtain `state` and `actions` in functional components. **Using `useStore`, functional components can re-render components when the state changes**
  - **Parameters:** Optional, `(s) => any`
  - **Returns:** Object containing `state` and `actions`
    - `state`, the value is determined according to the parameters. If no parameters are passed, it is the entire state of the store. If a function is passed, it is the value returned by the function.
    - `actions`, same as store actions
- `useWohooxState` is a hook used to obtain `state` in functional components. **Using `useWohooxState`, functional components can re-render components when the state changes**
  - **Parameters:** Optional, `(s) => any`
  - **Return:** If no parameters are passed, it is the entire state of `store`. If a function is passed, it is the value returned by the function.

#### How to use createStore

Create a store named [default]

```typescript
/**
 * src/store.ts
 */
import { createStore } from 'wohoox-react'

const { store, useStore, useWohooxState } = createStore({
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
})

export { store, useStore, useWohooxState }
```

`store` is a simple object that can be used anywhere. **The state in the store is just an object, and the component cannot be re-rendered**

```jsx
import { store } from 'src/store'

function request() {
  return axios.get(`...?version=${store.state.version}`)
}

function Layout() {
  return (
    <div>
      {/* The version change here cannot actively cause the component to re-render*/}
      <header>version: {store.state.version}</header>
    </div>
  )
}
```

`useStore` is a hook used to obtain `state` and `actions`. The object returned contains two properties: `state` and `actions`.

```jsx
/**
  * src/pages/example.tsx
  */
import { useStore } from 'src/store.ts'

function Example () {
   // Return the entire state
   const { state, actions } = useStore()
   // Return the field obtained by the callback function
   const { state: version, actions } = useStore(state => state.version)
   ...
}
```

`useWohooxState` is a simplified version of `useStore`, which directly returns the corresponding state value

> For components that only need to read state, it is more convenient to use `useWohooxState`. No need to rename state

```jsx
/**
  * src/pages/example.tsx
  */
import { useWohooxState } from 'src/store.ts'

function Example () {
   // Return the entire state
   const state = useWohooxState()
   // Return the field obtained by the callback function
   const version = useWohooxState(state => state.version)
   ...
}
```

### combineStores

Combine multiple stores into a new store

#### Parameter description of combineStores

The number of parameters is variable, and it accepts the `store` returned by `createStore` as a parameter. ex:

```typescript
const { store: AStore } = createStore({...})
const { store: BStore } = createStore({...})
const { store: CStore } = createStore({...})

combineStores(AStore, BStore)
combineStores(AStore, BStore, CStore)
```

#### Return value of combineStores

- `store`, a collection of multiple `store` objects, such as { AStoreName: AStore, BStoreName: BStore, CStoreName: CStore }
- `actions`, a collection of `action` objects of multiple `store`, such as { AStoreName: AStore.actions, BStoreName: BStore.actions, CStoreName: CStore.actions }
- `useStore` is a hook used to obtain `state` and `action` in functional components. **Using `useStore`, functional components can re-render the component based on state changes**
  - **Parameters**
    - storeName, required
    - getStateFn, optional, `(s) => any`
  - **Return:** The state and actions of the store whose name is `storeName`
    - `state`, the value is determined according to the parameters. If `getStateFn` is not passed, it is the entire state of the selected store. If a function is passed, it is the value returned by the function.
    - `actions`, the actions of the selected store
- `useWohooxState` is a hook used to obtain `state` in functional components. **Using `useWohooxState`, functional components can re-render the component based on state changes**
  - **Parameters**
    - storeName, required
    - getStateFn, optional, `(s) => any`
  - **Returns:** The value is determined based on the parameters. If `getStateFn` is not passed, it is the entire state of the selected store. If a function is passed, it is the value returned by the function.

#### How to use combineStores

```typescript
/**
 * src/store.ts
 */
import { createStore, combineStores } from 'wohoox-react'

const { store: defaultStore } = createStore({
  initState: {
    type: 'default',
  },
  actions: {
    updateType(state, type: string) {
      state.type = type
    },
  },
})

const { store: userStore } = createStore({
  name: 'user',
  initState: {
    type: 'user',
  },
  actions: {
    updateType(state, type: string) {
      state.type = type
    },
  },
})

const { store, actions, useStore, useWohooxState } = combineStores(
  defaultStore,
  userStore,
)
```

Same as the store returned by `createStore`. It’s just that the store here combines multiple independent stores through objects

`store` is a collection of multiple stores and can be used anywhere. **The state in the store is just an object, and the component cannot be re-rendered**

```jsx
import { store } from 'src/store'

function request() {
  // Get the status of the default store
  return axios.get(`...?version=${store.default.state.type}`)
}

function Layout() {
  return (
    <div>
      {/* Get the status of user store */}
      {/* The version change here cannot actively cause the component to re-render*/}
      <header>version: {store.user.state.version}</header>
    </div>
  )
}
```

`useStore` is a hook used to obtain `state` and `actions`. The object returned contains two properties: `state` and `actions`.

`combineStores` is similar to `useStore` returned by `createStore`, the only difference is that `useStore` of `combineStores` needs to specify the store name

```jsx
/**
  * src/pages/example.tsx
  */
import { useStore } from 'src/store.ts'

function Example () {
   // Return the entire default state
   const { state, actions } = useStore('default')
   // Return the field obtained by the callback function
   const { state: type, actions } = useStore('default', state => state.type)

   // Return the entire user's state
   const { state, actions } = useStore('user')
   // Return the field obtained by the callback function
   const { state: type, actions } = useStore('user', state => state.type)
   ...
}
```

`useWohooxState` is a simplified version of `useStore`, which directly returns the corresponding state value

`useWohooxState` is similar to `useWohooxState` returned by `createStore`, the only difference is that `useWohooxState` of `combineStores` needs to specify the store name

> For components that only need to read state, it is more convenient to use `useWohooxState`. No need to rename state

```jsx
/**
  * src/pages/example.tsx
  */
import { useWohooxState } from 'src/store.ts'

function Example () {
   // Return the entire default state
   const state = useWohooxState('default')
   // Return the field obtained by the callback function
   const type = useWohooxState('default', state => state.type)

     // Return the entire user's state
   const state = useWohooxState('user')
   // Return the field obtained by the callback function
   const type = useWohooxState('user', state => state.type)
   ...
}
```

### dispatch

How to update components in non-strict mode. This can be understood indirectly as defining a `dispatch` in `action`, such as:

```typescript
actions: {
   dispatch(){}
}
```

> Although wohoox-react supports `dispatch` to make state modifications take effect and allow components to re-render, it is best to use actions for data updates.

#### dispatch parameter description

- `storeName`, defaults to `default`. Tell wohoox-react which store's component state needs to be updated

#### How to use dispatch

```typescript
/**
  * src/store.ts
  */

+ export { dispatch } from 'wohoox-react'
```

```typescript
import { useStore, dispatch } from 'src/store'

function exampleNonStrictMode() {
  const { state } = useStore()

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

#### dispatch multi-module Typescript support

To make dispatch support typescript, you need to redeclare it.
**If you don’t use typescript, you can directly use `dispatch`** exported by wohoox-react

```typescript
import { dispatch as wohooxDispatch } from 'wohoox-react'

const { store } = combineStores(AStore, BStore, CStore)

export function dispatch(storName?: keyof typeof store) {
  wohooxDispatch(storName)
}
```

### dispatchAll

Update the component status of all store modules at once. If there is only one store, use dispatch.

```jsx
/**
 * src/pages/multiExample.tsx
 */
import { actions } from 'src/store'
import { dispatchAll } from 'wohoox-react'

function example() {
  const { state: defaultState } = useStore()
  const { state: userState } = useStore('user', state => state)
  const { state: devState } = useStore('department', state => state.address)

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
            /*
               dispatch()
               dispatch('user')
               dispatch('department')
             */
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

- In the component, if you do not use `useStore`, `useWohooxState` to obtain data, **the component will not re-render after the data changes**
- Use strict mode possible (use actions to modify data)
- Set type data will not proxy sub-data by default. If you also want to re-render when you change the set sub-data:
  - After making changes, you can delete a sub-data first and then add the deleted one.
  - Or set `proxySetDeep: true`
