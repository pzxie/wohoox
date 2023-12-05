# wohoox-react

[English](./README.md) | 中文

- 基于 [wohoox](../wohoox/README_CN.md) 的 react 实现
- 轻量的响应式 React 状态管理
- 依赖自动收集，组件级精确更新
- 简单易用。不需要高阶组件，只需要在组件中使用一个 API 就够，更符合直觉的编程体验
- 基于 React hooks 的实现与使用

## 兼容要求

- react: ">=16.8.0"
- browser: 所有支持[native ES2015 support](https://caniuse.com/es6)的浏览器

## 安装

```bash
npm install -S wohoox-react
```

## 快速上手

1. 创建 store

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

2. 使用 state

```jsx
/**
 * src/pages/example.tsx
 */
import { useStore } from 'src/store.ts'

function Example() {
  // 默认获取名为【default】的 store 中的整个 state
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

3. 更新状态

wohoox-react 通过 `action` 来更新状态，从而使整个状态的变更更加可控，可追踪。

```typescript
/**
 * src/store.ts
 */
import { createStore } from 'wohoox-react'

const store = createStore({
  initState: {...},
  // 初始化定义 actions
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
  // 默认获取名为【default】的 store 中的整个 state
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
          // 可以更新深层某一个字段
          actions.updateDetailsName('wohoox-react-' + Math.random())
        }}
      >
        update name
      </button>

      <button
        onClick={() => {
          // 也可以更新整个对象
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

4. typescript 支持

为了能够完整使用 typescript 的类型推断, useStore 需要进行重新声明
**如果你不使用 typescript, 你可以直接使用 wohoox-react 导出的 `useStore`**

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
import { createStore, useStore as useWoHoox } from 'wohoox-react'

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
    updateDetailsName(state, name: string) {
      state.details.name = name;
    }
    updateDetails(state, details: typeof state.details) {
      state.details = details
    }
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

## 更多用法

### Key-Value by one action

> 一个字段用一个 `action` 进行更新是很常见的，比如 `updateVersion` 是用来更新 `version` 的。常见的 `Redux`、`mobx` 也经常这样使用
> `wohoox-react` 还允许你定义一个通用型的 `action`，这样就可以简化很多格式化的 `action` 定义

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
    // 定义一个通用的 Key-Value action，简化操作，也支持 typescript
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

### 多模块整合

> wohoox 同样支持按模块进行状态划分

#### 创建多个 store

- 创建一个名为 `user` 的 store

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

- 创建一个默认 store

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

- 将多个 store 组合起来

同样的，为了能够完整使用 typescript 的类型推断, `useStore` 需要进行重新声明
**如果你不使用 typescript, 你可以直接使用 `wohoox-react` 导出的 `useStore`**

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

#### 多模块使用方式

多模块的使用方式和单模块的一样，只是需要指明获取 state 的 store 名称

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

### 严格模式

为了使代码风格更加统一，以及使代码更加规范
**默认是开启了严格模式的，这意味着只能通过 `actions` 才能对 state 进行修改**.

#### 开启严格模式

只能通过 actions 才能对 state 进行修改

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

通过 actions 修改数据

```jsx
import { actions, useStore } from 'src/store.ts'

function exampleStrictMode() {
  const state = useStore()

  const updateVersion = () => {
    // 直接修改 state 会报错
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

#### 关闭严格模式

下面的方式都是被允许的

- 通过 actions 修改数据
- 通过表达式直接修改数据 + dispatch

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

修改数据

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

### 在纯 js/ts 文件中使用 wohoox-react

`useStore` 只能用在函数式组件中. 你也可以直接导出 state 进行使用

```typescript
/**
 * src/store.ts
 */

// 导出 state
// 重要提醒... 不要通过这种方式在组件中使用，该方式不会使组件重新渲染
+ export const state = store.state

```

```typescript
/**
 * request.ts
 */

import { state, actions } from 'src/store'

function request() {
  // 在其他文件中使用 state
  return fetch(`/api/details?version=${state.version}`)
}

async function getVersion() {
  const res = await fetch('/api/version')
  const { version } = await res.json()

  actions.updateVersion(version)
}
```

### 插件系统

提供了插件选项用于增强 wohoox-react 的功能

wohoox-react 的插件由以下一些方法构成

```jsx
import type { WohooxPlugin } from 'wohoox-react'

export const plugin: WohooxPlugin = {
  beforeInit(initState, actions) {
    // 在初始化 store 前，对 initState, actions 进行处理，并返回新的 initState 和 actions 用于初始化
    return {
      initState,
      actions,
    }
  },

  onInit(store) {
    // store 初始化后
  },
  onAdd(storeName, value, keys) {
    // 当有新属性增加时的回调
  },
  onDelete(storeName, keys) {
    // 当属性被删除时的回调
  },
  onChange(storeName, value, keys) {
    // 当 state 变更时的回调
  },
  onGet(storeName, value, keys) {
    // 属性获取时的回调
  },
}
```

#### 自定义一个持久化插件

- 创建一个插件

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

- 将插件添加到 plugins 选项中

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

他用来初始化并创建一个 store

#### createStore 参数说明

- `name:` store 名称，默认为`'default'`. 作为 store 的唯一标识符，在多模块的时候，该字段用于区分模块.
- `initState:` 初始化数据，并使用该数据的数据结构作为 typescript 类型推断
- `actions:` 修改数据的方式，并促使相关组件进行重新渲染。如果在严格模式下，是作为唯一合法修改数据的方式
- `plugins:` 插件选项
- `options.strictMode:` 严格模式开关。默认 `true`. 严格模式下，actions 是唯一可以修改 state 的方式。非严格模式下，还可以直接修改 state。 `ex: state.age = 23`
- `options.proxySetDeep:` 严格模式开关。默认 `false`. Set 类型的数据不会对将其子节点进行 proxy 处理。因其没有获取数据的情形，对其子节点进行 proxy 处理没有太大必要。不过如果你确定需要，你可以将其设置为 true

#### createStore 使用方式

创建一个名叫【default】的 store

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

将多个 store 组合成一个新的 store

```jsx
import { combineStores } from 'wohoox-react'

export const { store, actions } = combineStores(
  defaultStore,
  devStore,
  userStore,
)
```

### useStore

用来获取 state 的 hooks。如果所有参数都不传，将返回名为【default】的 store 的整个 state

#### useStore 参数说明

- `name:` 获取 state 的 store 名称。可选, 默认为 `default`. 如果传入了一个不存在的 store 名称，将会抛出错误.
- `callback:` 通过该参数返回具体的状态。

#### useStore 使用方式

```jsx
/**
 * src/pages/example.tsx
 */
import { actions } from 'src/store.ts'

function Example () {
  // 默认获取名为【default】的 store 的整个 state
  const defaultStoreState = useStore()
  // 和 useStore() 一样
  const defaultStoreState = useStore('default')

  // 获取名为【user】的 store 的整个 state
  const userStoreState = useStore('user')

  // 通过名称、callback 获取 state 里面的具体字段
  const version = useStore(state => state.version)
  const name = useStore(state => state.details.name)
  const details = useStore('default', state => state.details)

  ...
}
```

#### useStore 的 typescript 定义

为了能够完整使用 typescript 的类型推断, useStore 需要进行重新声明
**如果你不使用 typescript, 你可以直接使用 wohoox-react 导出的 `useStore`**

单个 store

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

[多个 store](#多模块整合)

### dispatch

非严格模式下的更新组件方式。可以间接将其理解为与在 action 里定义的 dispatch 差不多。如：

```typescript
actions: {
  dispatch(){}
}
```

#### dispatch 参数说明

- `storeName:` 默认为 `default`。 告诉 wohoox-react 需要更新哪个 store 的组件状态

#### dispatch 使用方式

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

#### dispatch 多模块 Typescript 支持

为了能够完整使用 typescript 的类型推断, dispatch 需要进行重新声明使用
**如果你不使用 typescript, 你可以直接使用 wohoox-react 导出的 `dispatch`**

```typescript
export function dispatch(storName?: keyof AppStore) {
  wohooxDispatch(storName)
}
```

### dispatchAll

用于多模块 store 类型。更新所有 store 模块的组件状态，如果只有一个 store, 使用 dispatch 即可

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

## 注意事项

- 在组件中，如果你不使用 `useStore` 获取数据，**数据改变后，组件将不会重新渲染**
- 尽可能使用严格模式（使用 actions 去修改数据）
- Set 类型的数据，默认不会对子数据做代理。如果改变 set 子数据时也想重新渲染：
  - 更改后可以先删除一个子数据，再把删除的添加进去
  - 或者设置 `proxySetDeep: true`
