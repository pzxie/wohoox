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

1. Create store

```typescript
/**
 * src/store.ts
 */
import { createStore } from 'wohoox'

const store = createStore({
  initState: {
    version: '2.x',
    details: {
      name: 'wohoox',
      other: 'xxx',
    },
  },
})

export default store
```

2. Use state

```typescript
/**
 * request.ts
 */

import store from 'src/store'

const { state, actions } = store

function request() {
  // 使用 state
  return fetch(`/api/details?version=${state.version}`)
}

async function getVersion() {
  const res = await fetch('/api/version')
  const { version } = await res.json()

  console.log(version)
}
```

3. Update state

`wohoox` updates state by `action`. This will make the state changes more controllable and trackable

```typescript
/**
 * src/store.ts
 */
import { createStore } from 'wohoox'

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

export default store
```

```typescript
/**
 * request.ts
 */

import store from 'src/store'

const { state, actions } = store

function request() {
  return fetch(`/api/details?version=${state.version}`)
}

async function getVersion() {
  const res = await fetch('/api/version')
  const { version, details } = await res.json()

  // update version by action
  actions.updateVersion(version)
  console.log(state.version)

  // update the object
  actions.updateDetails(details)
  console.log(state.details)

  // update the deep field
  actions.updateDetailsName(details.name)
  console.log(state.details)
}
```

## Advance

### Key-Value by one action

> It's common for an action to update one field. For example, `updateVersion` is used to update the `version`. `Redux` and `Mobx` are often used like this
> `wohoox` also allows you to update by defining a common action, thus simplifying the definition of the action

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
      name: 'wohoox',
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
store.actions.updateByKeyValue('details', { name: 'wohoox', other: 'anything' })

export default store
```

### Reset store

There is a built-in action named [reset]. You can use it to reset the state.

#### initState is object

The reset params is required, if the store's initState is an object.

```typescript
import { createStore } from 'wohoox'

const store = createStore({
  initState: {
    name: 'wohoox',
    version: '1.x',
  },
})

/**
 * reset by new object
 * reset params is required
 */
store.actions.reset({
  name: 'wohoox',
  version: '2.x',
})
```

#### initState is factory function

The reset params is optional, if the store's initState is an factory function.

- **If set params,** wohoox will use the factory function to reset the state.

- **If no params,** wohoox will use the params to reset the state.

```typescript
import { createStore } from 'wohoox'

const store = createStore({
  initState: () => ({
    name: 'wohoox',
    version: '1.x',
  }),
})

/**
 * reset by initState of factory function
 */
store.actions.reset()

/**
 * reset by new object
 */
store.actions.reset({
  name: 'wohoox',
  version: '2.x',
})
```

**Note:** `reset` is a built-in action for wohoox. If you declared `reset` in actions, your `reset` will be ignored.

### Multi Store

> If you want to split store by modules, look here.

#### Create multi store

- Create a store named 'user'

```typescript
/**
 * src/store/user.ts
 */

import { createStore } from 'wohoox'

export default createStore({
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
```

- Create a store named 'department'

```typescript
/**
 * src/store/department.ts
 */

import { createStore } from 'wohoox'

export default createStore({
  name: 'department',
  initState: {
    name: 'developer',
    address: {
      province: 'sc',
      city: 'cd',
    },
  },
  actions: {
    updateAddress(state, address: typeof state.address) {
      state.address = address
    },
  },
})
```

- Combine multi store

```typescript
/**
 * src/store/index.ts
 */

import { combineStores } from 'wohoox'

import defaultStore from './default'
import userStore from './user'

const { store } = combineStores(defaultStore, userStore)

export default store
```

#### usage

Use multi store is same as single store, just need to point the store name

```typescript
/**
 * src/App.ts
 */
import store from './store'

function requestUserInfo() {
  return fetch(`/api/details?version=${store.user.state.name}`)
}

async function updateUserName() {
  const res = await requestUserInfo()
  const { name } = await res.json()

  store.user.actions.updateName(name)
}

function printAddress() {
  console.log(JSON.stringify(store.department.state.address))
}

function updateAddress() {
  store.department.actions.updateAddress({
    province: 'sc',
    city: store.department.state.address.city + '_up',
  })
}
```

### StrictMode

In order to make the code style more standardized.
**Strict mode is on by default. Which means actions is the only way to modify state**.

#### Turn on

Actions are the only valid way to modify data

```typescript
import { createStore } from 'wohoox'

const store = createStore({
  initState: {
    version: '2.x',
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

```typescript
import store from 'src/store.ts'

function exampleStrictMode() {
  const { state, actions } = store

  const updateVersion = () => {
    // Error when modify by state
    // state.version = state.version + '_1'

    // OK
    actions.updateVersion(state.version + '_1')
  }
}
```

#### Turn off

Valid ways

- Actions
- state expression

```typescript
import { createStore } from 'wohoox'

const store = createStore({
  initState: {
    version: '2.x',
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

```typescript
import store from 'src/store.ts'

function exampleStrictMode() {
  const { state, actions } = store

  const updateVersion = () => {
    // OK
    actions.updateVersion(state.version + '_1')

    // OK
    state.version = state.version + '_1'
  }
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
import { createStore } from 'wohoox'

const store = createStore({
  /**
   * default as 'default'
   */
  name: 'default',
  initState: {
    version: '2.x',
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
