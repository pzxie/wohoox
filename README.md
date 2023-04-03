<p align="center">
  <img style="width: 160px;" src="./wohoox.png" alt="wohoox" />
</p>

<p align="center">
  Lightweight and reactive state management
</p>

## Why wohoox?

Wo hoo! Amazing! This is the original meaning for `wohoox` 😄

When i use state management libs in react, i always feel complicated. Like `HOC` and `complicated store define`

So, wohoox appeared, it will be easy to use and make you happy to codding

## Core libs

Docs for libs, click to get more

- [wohoox-react](./packages/wohoox-react/README.md)
- [wohoox](./packages/wohoox/README.md)

## Example

### store defined

```typescript
/**
 * @file src/store.ts
 */
import createStore from 'wohoox-react'

const store = createStore({
  initState: {
    name: 'wohoox',
  },
  actions: {
    updateName(state, name: string) {
      state.name = version
    },
  },
})

export const actins = store.actions
export { useStore } from 'wohoox-react'
```

### state use

```typescript
/**
 * @file src/pages/example.tsx
 */
import { useStore } from 'src/store.ts'

function Example() {
  const state = useStore()

  return (
    <div>
      <h2>Name: {state.name}</h2>

      <button
        onClick={() => {
          actions.updateName('wohoox updated')
        }}
      >
        click to update
      </button>
    </div>
  )
}
```
