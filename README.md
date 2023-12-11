<p align="center">
  <img style="width: 160px;" src="./wohoox.png" alt="wohoox" />
</p>

<p align="center">
  Lightweight and reactive state management
</p>

## Why wohoox?

Wo hoo! Amazing! `wohoox`!

- Full Typescript support
- Lightweight and reactive state management
- [wohoox-react]Dependency collection automatic，components update exactly
- [wohoox-react]Easy to use. No HOC
- [wohoox-react]Implementation and use based on React hooks

## Core libs

Docs for libs, click to get more

- [wohoox-react](./packages/wohoox-react/README.md), Implementation and use based on React hooks and [wohoox](./packages/wohoox/README.md)
- [wohoox](./packages/wohoox/README.md), Lightweight and reactive state management

## Quick start for wohoox

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

## Quick Start for wohoox-react

1. Create store

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
