<p align="center">
  <img style="width: 160px;" src="./wohoox.png" alt="wohoox" />
</p>

<p align="center">
  Lightweight and reactive state management
</p>

## Why wohoox?

Wo hoo! `wohoox`!

- Full Typescript support
- Lightweight and reactive state management
- [wohoox-react]Dependency collection automatic，components update exactly
- [wohoox-react]Easy to use. No HOC
- [wohoox-react]Implementation and use based on React hooks

## Core libs

- [wohoox](./packages/wohoox/README.md), Lightweight and reactive state management
- [wohoox-react](./packages/wohoox-react/README.md), Implementation and use based on React hooks and [wohoox](./packages/wohoox/README.md)

## Quick start

**Create store**

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

**Get state**

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

**Update state**

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
