<p align="center">
  <img style="width: 160px;" src="../../wohoox.png" alt="wohoox" />
</p>

<p align="center">
  English | <a href="./README_CN.md">中文</a>
</p>

- Lightweight and reactive state management
- Map, Set, WeakMap, WeakSet support
- Typescript support
- Plugins api support

## Required

- browser: only supports browsers with [native ES2015 support](https://caniuse.com/es6)

## Install

```bash
npm install -S wohoox
```

## Quick Start

1. create a store

```typescript
/**
 * src/store.ts
 */
import createStore from 'wohoox'

const store = createStore({
  initState: {
    version: '1.x',
    details: {
      name: 'wohoox',
      other: 'xxx',
    },
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version
    },
  },
})

export default store
```

2. use state

```jsx
/**
 * src/pages/example.tsx
 */
import store from 'src/store.ts'

function Example() {
  return (
    <div>
      <h2>Version: {store.state.version}</h2>

      <button
        onClick={() => {
          store.actions.updateVersion(version + '_1')
        }}
      >
        click to update version
      </button>
    </div>
  )
}
```

3. typescript support

wohoox is support typescript completely

## Advance

### Multi Store

> If you want to use multi store by module, look here.

#### Create multi store

- Create a store named 'user'

```typescript
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
      state.name = name
    },
  },
})

export const userActions = userStore.actions
```

- Create a store named 'department'

```typescript
/**
 * src/multiStore.ts
 */

const devInitState = {
  name: 'developer',
  address: {
    province: 'sc',
    city: 'cd',
  },
}

const devStore = createStore({
  name: 'department',
  initState: devInitState,
  actions: {
    updateAddress(state, address: typeof devInitState['address']) {
      state.address = address
    },
  },
})

export const devActions = devStore.actions
```

- Combine multi store

```typescript
/**
 * src/multiStore.ts
 */
import defaultStore from './store'
import { combineStores } from 'wohoox'

export const { store, actions } = combineStores(
  defaultStore,
  devStore,
  userStore,
)
```

#### usage

Use multi store is same as single store, just need to point the store name

```jsx
/**
 * src/pages/multiExample.tsx
 */
import { store } from 'src/multiStore.ts'

function example() {
  return (
    <div>
      <h2>Default Version</h2>
      {store.default.state.version}

      <h2>User Name</h2>
      {store.user.state.name}

      <h2>Dev address</h2>
      {store.department.address.province}
      {store.department.address.city}

      <button
        onClick={() => {
          store.default.actions.updateVersion(version + '_1')
        }}
      >
        click to update version
      </button>
      <button
        onClick={() => {
          store.user.actions.updateName(userState + '_1')
        }}
      >
        click to update name
      </button>
      <button
        onClick={() => {
          store.department.actions.updateAddress({
            ...devState,
            city: devState.city + '_1',
          })
        }}
      >
        click to update address
      </button>
    </div>
  )
}
```

### StrictMode

In order to make the code style more standardized.
**Strict mode is on by default. Which means actions is the only way to modify state**.

#### Turn on

Actions are the only valid way to modify data

```typescript
import createStore from 'wohoox'

const store = createStore({
  initState: {
    version: '1.X',
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

export default store
```

Modify data by actions

```jsx
import store from 'src/store.ts'

function exampleStrictMode() {
  const { state, actions } = store

  const updateVersion = () => {
    // Error when modify by state
    // state.version = state.version + '_1'

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
import createStore from 'wohoox'

const store = createStore({
  initState: {
    version: '1.X',
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

export default store
```

Modify data

```jsx
import store from 'src/store.ts'

function exampleStrictMode() {
  const { state, actions } = store

  const updateVersion = () => {
    // OK
    actions.updateVersion(state.version + '_1')

    // OK
    state.version = state.version + '_1'
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

### Used in js/ts code

```typescript
/**
 * request.ts
 */

import store from 'src/store'

const { state, actions } = store

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

### plugins

Plug-in options are provided to enhance the functionality of wohoox

wohoox plugin is a object who contains below methods

```jsx
import type { WohooxPlugin } from 'wohoox'

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
import type { WohooxPlugin } from 'wohoox'

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
import persistPlugin from './plugin/persist'

const store = createStore({
  initState: {
    version: '1.x',
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

### createStore

It is used to create a store.

#### Params

- `name:` default as `'default'`. name of store. it is used as an identifier to get store data.
- `initState:` Initial the data and use it as the data structure of the state.
- `actions:` Dispatch to change data. As the only valid way to modify data in strict mode, then it will caused by page rerender
- `plugins:` plugin list for store
- `options.strictMode:` default as `true`. Strict mode switch for store. Once the switch turn on, actions will be the only valid way to modify data, otherwise you can directly modify the data by state. `ex: state.age = 23`
- `options.proxySetDeep:` default as `false`. Type data of set will not be proxy for its child item. Cause there is no method to get item, child proxy is is not necessary to proxy. But if you want to proxy anyway, you can set it to true.

#### Usage

Create a store named 'default'

```typescript
/**
 * src/store.ts
 */
import createStore from 'wohoox'

const store = createStore({
  /**
   * default as 'default'
   */
  name: 'default',
  initState: {
    version: '1.x',
    details: {
      name: 'wohoox',
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
import { combineStores } from 'wohoox'

export const { store, actions } = combineStores(
  defaultStore,
  devStore,
  userStore,
)
```

## Notes

- Use strict mode if possible(use actions to modify state).
- Type data of Set will not be proxy for its child item。If you want to rerender when changed the child items properties, you can：
  - Delete the last item of Set and add it into Set again
  - Or set options `proxySetDeep: true`
