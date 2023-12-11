# wohoox-react

[English](./README.md) | 中文

- 基于 [wohoox](../wohoox/README_CN.md) 的 react 实现
- 轻量的响应式 React 状态管理
- 依赖自动收集，组件级精确更新
- 简单易用。不需要高阶组件，只需要在组件中使用一个 API 就够，更符合直觉的编程体验
- 基于 React hooks 的实现与使用
- 完整的 Typescript 支持

## 目录

- [wohoox-react](#wohoox-react)
  - [目录](#目录)
  - [兼容要求](#兼容要求)
  - [安装](#安装)
  - [快速上手](#快速上手)
  - [更多用法](#更多用法)
    - [Key-Value by one action](#key-value-by-one-action)
    - [Reset state](#reset-state)
      - [initState 是个对象](#initstate-是个对象)
      - [initState 是个函数](#initstate-是个函数)
    - [多模块整合](#多模块整合)
      - [创建多个 store](#创建多个-store)
      - [多模块使用方式](#多模块使用方式)
    - [严格模式](#严格模式)
      - [开启严格模式](#开启严格模式)
      - [关闭严格模式](#关闭严格模式)
    - [在非组件中使用 wohoox-react](#在非组件中使用-wohoox-react)
    - [插件系统](#插件系统)
      - [自定义一个持久化插件](#自定义一个持久化插件)
  - [API](#api)
    - [createStore](#createstore)
      - [createStore 参数说明](#createstore-参数说明)
      - [createStore 返回](#createstore-返回)
      - [如何使用 createStore](#如何使用-createstore)
    - [combineStores](#combinestores)
      - [combineStores 参数说明](#combinestores-参数说明)
      - [combineStores 返回](#combinestores-返回)
      - [如何使用 combineStores](#如何使用-combinestores)
    - [dispatch](#dispatch)
      - [dispatch 参数说明](#dispatch-参数说明)
      - [dispatch 使用方式](#dispatch-使用方式)
      - [dispatch 多模块 Typescript 支持](#dispatch-多模块-typescript-支持)
    - [dispatchAll](#dispatchall)
  - [注意事项](#注意事项)

## 兼容要求

- react: ">=16.8.0"
- browser: 所有支持[native ES2015 support](https://caniuse.com/es6)的浏览器

## 安装

```bash
npm install -S wohoox-react
```

## 快速上手

1. 创建 store

[api 参考](#createstore)

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

2. 使用 state

[参考](#如何使用-createstore)

```jsx
/**
 * src/pages/example.tsx
 */
import { useStore, useWohooxState } from 'src/store.ts'

function Example() {
  // 默认获取名为【default】的 store 中的整个 state
  const { state } = useStore()
  // 通过 useWohooxState 直接获取 state
  const version = useWohooxState(state => state.version)

  return (
    <div>
      <h2>Version: {version}</h2>
      <h2>Version: {state.version}</h2>
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

const { store, useStore } = createStore({
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

export { useStore, store }
```

`useStore` 除了能返回 `state`，还能返回当前 store 的 `actions`

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

`actions` 也可以通过 `store` 进行调用

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
          // 通过 store 进行调用
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

## 更多用法

### Key-Value by one action

> 一个字段用一个 `action` 进行更新是很常见的，比如 `updateVersion` 是用来更新 `version` 的。常见的 `Redux`、`mobx` 也经常这样使用
> 使用 `wohoox-react`，你可以定义一个通用型的 `action`，这样可以简少很多模板化的 `action` 定义

```typescript
/**
 * src/store.ts
 */

import { createStore } from 'wohoox'

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
    // 定义一个通用的 Key-Value action，简化操作
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

wohoox-react 内置了 `reset` action。你可以使用 `reset` 去重置 `state`

> **注意:** `reset` 是 `wohoox-react` 的内置 `action`. 在创建 store 时自定义的 `reset` action 将会被忽略。并且控制台会发出警告

#### initState 是个对象

当初始化 store 时，`initState`如果是个对象，则 `reset` 必须传入新的初始化数据

```typescript
import { createStore } from 'wohoox-react'

const { store } = createStore({
  initState: {
    name: 'wohoox-react',
    version: '1.x',
  },
})

/**
 * 使用传入的数据重置状态
 * reset 的参数是必需的
 */
store.actions.reset({
  name: 'wohoox-react',
  version: '2.x',
})
```

#### initState 是个函数

当初始化 store 时，`initState` 如果是个工厂函数，则 `reset` 参数是可选的

- **不传参数时，**则默认调用工厂函数返回新的初始化状态

- **传参数时，**则使用传入的数据作为新的初始化状态

```typescript
import { createStore } from 'wohoox-react'

const { store } = createStore({
  initState: () => ({
    name: 'wohoox-react',
    version: '1.x',
  }),
})

/**
 * 调用初始的 initState 函数重置状态
 */
store.actions.reset()

/**
 * 使用传入的数据重置状态
 */
store.actions.reset({
  name: 'wohoox-react',
  version: '2.x',
})
```

### 多模块整合

> wohoox-react 支持创建多个 store，这些 store 可以独立使用，也可以通过 `combineStores` 将多个 store 整合使用。

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

- 创建一个默认 store（未明确指明 name, 默认为 default）

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

- 将多个 store 组合起来

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

#### 多模块使用方式

多模块的使用方式和单模块的一样，只是需要指明获取 state 的 store 名称

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

### 严格模式

为了使代码风格更加统一、更加规范，**默认是开启了严格模式的，这意味着只能通过 `actions` 才能对 state 进行修改**.

#### 开启严格模式

只能通过 actions 才能对 state 进行修改

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

通过 actions 修改数据

```jsx
import { dispatch } from 'wohoox-react'
import { useStore } from 'src/store.ts'

function exampleStrictMode() {
  const { state, actions } = useStore()

  const updateVersion = () => {
    // 直接修改 state 会报错
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

#### 关闭严格模式

两种方式都是被允许的

- 通过 actions 修改数据
- 通过表达式直接修改数据 + dispatch

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
-   strictMode: true,
+   strictMode: false,
  }
})

+ export { dispatch } from 'wohoox-react'
```

修改数据

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

### 在非组件中使用 wohoox-react

`useStore` 只能用在函数式组件中. 在非组件中可以通过 `store` 进行使用

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

### 插件系统

提供了插件选项用于增强 wohoox-react

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
  onReset(storeName, state, originState) {
    // 重置 state 的回调
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
  onReset(_name, state) {
    localStorage.setItem('wohoox_version', JSON.stringify(state.version))
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

用来初始化并创建一个 store 和 react hooks `useStore`、`useWohooxState`

> 注意：如果注册了同名的 store, 则后注册的 store 会把先注册的同名 store 给覆盖掉。并且控制台会发出警告

#### createStore 参数说明

- `name`，store 名称，默认为`'default'`. 作为 store 的唯一标识符，在多模块的时候，该字段用于区分模块.
- `initState`，初始化数据，并使用该数据的数据结构作为 typescript 类型推断
- `actions`，修改数据的方式，并促使相关组件进行重新渲染。在严格模式下，是唯一合法修改数据的方式
- `plugins`，插件选项
- `options`，配置项
  - `options.strictMode`，严格模式开关。默认 `true`. 严格模式下，actions 是唯一可以修改 state 的方式。非严格模式下，可以直接修改 state。 `ex: state.age = 23; dispatch()`
  - `options.proxySetDeep`，Set 数据深度代理开关。默认 `false`。默认 Set 类型的数据不会对其子数据进行 proxy 处理。因其没有获取数据的情形，对其子数据进行 proxy 处理没有太大必要。如果你确定需要深度代理，你可以将其设置为 true

#### createStore 返回

- `store` 任何地方都可以使用
  - `store.name`
  - `store.state`，
  - `store.actions`，包含 `reset` 在内的 actions
- `useStore` 用于函数式组件内获取 `state` 和 `actions` 的 hook。**使用 `useStore`，函数式组件能在状态改变时，重新渲染组件**
  - **参数：** 可选，`(s) => any`
  - **返回：** 包含 state 和 actions 的对象
    - `state`，值根据参数确定。如果不传参，则为 store 的整个 state, 如果传函数，则为函数返回的值
    - `actions`，同 store 的 actions
- `useWohooxState` 用于函数式组件内获取 `state` 的 hook。**使用 `useWohooxState`，函数式组件能在状态改变时，重新渲染组件**
  - **参数：** 可选，`(s) => any`
  - **返回：** 如果未传参，就是 `store` 的整个 state, 如果传函数，则为函数返回的值

#### 如何使用 createStore

创建一个名叫【default】的 store

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

`store` 就是一个简单的对象，可以用在任何地方。**store 里面的 state 只是一个对象，无法让组件重新渲染**

```jsx
import { store } from 'src/store'

function request() {
  return axios.get(`...?version=${store.state.version}`)
}

function Layout() {
  return (
    <div>
      {/* 此处的 version 变更，无法主动让组件重新渲染*/}
      <header>version: {store.state.version}</header>
    </div>
  )
}
```

`useStore` 是用来获取 `state`、`actions` 的 hooks。其返回的对象包含 `state`、`actions` 两个属性。

```jsx
/**
 * src/pages/example.tsx
 */
import { useStore } from 'src/store.ts'

function Example () {
  // 返回整个 state
  const { state, actions } = useStore()
  // 返回回调函数获取的字段
  const { state: version, actions } = useStore(state => state.version)
  ...
}
```

`useWohooxState` 是 `useStore` 的简化版，直接返回对应的 state 值

> 对于仅需要读取 state 的组件，用 `useWohooxState` 更为方便。不需要重命名 state

```jsx
/**
 * src/pages/example.tsx
 */
import { useWohooxState } from 'src/store.ts'

function Example () {
  // 返回整个 state
  const state = useWohooxState()
  // 返回回调函数获取的字段
  const version = useWohooxState(state => state.version)
  ...
}
```

### combineStores

将多个 store 组合成一个新的 store

#### combineStores 参数说明

参数个数不定，接受 `createStore` 返回的 `store` 作为参数。如

```typescript
const { store: AStore } = createStore({...})
const { store: BStore } = createStore({...})
const { store: CStore } = createStore({...})

combineStores(AStore, BStore)
combineStores(AStore, BStore, CStore)
```

#### combineStores 返回

- `store`，多个 `store` 的对象集合，如 { AStoreName: AStore, BStoreName: BStore, CStoreName: CStore }
- `actions`，多个 `store` 的 `action` 对象集合，如 { AStoreName: AStore.actions, BStoreName: BStore.actions, CStoreName: CStore.actions }
- `useStore` 用于函数式组件内获取 `state` 和 `action` 的 hook。**使用 `useStore`，函数式组件能根据状态改变使组件重新渲染**
  - **参数**
    - storeName, 必填
    - getStateFn, 可选，`(s) => any`
  - **返回：** storeName 所在 store 的 state 和 actions
    - `state`, 值根据参数确定。如果不传 `getStateFn`，则为所选 store 的整个 state, 如果传函数，则为函数返回的值
    - `actions`, 所选 store 的 actions
- `useWohooxState` 用于函数式组件内获取 `state` 的 hook。**使用 `useWohooxState`，函数式组件能根据状态改变使组件重新渲染**
  - **参数**
    - storeName, 必填
    - getStateFn, 可选，`(s) => any`
  - **返回：** 值根据参数确定。如果不传 `getStateFn`，则为所选 store 的整个 state, 如果传函数，则为函数返回的值

#### 如何使用 combineStores

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

同 `createStore` 返回的 store 一样。只是这里的 store 将多个独立 store 通过对象组合起来

`store` 是多个 store 的集合，可以用在任何地方。**store 里面的 state 只是一个对象，无法让组件重新渲染**

```jsx
import { store } from 'src/store'

function request() {
  // 获取默认 store 的状态
  return axios.get(`...?version=${store.default.state.type}`)
}

function Layout() {
  return (
    <div>
      {/* 获取 user store 的状态 */}
      {/* 此处的 version 变更，无法主动让组件重新渲染*/}
      <header>version: {store.user.state.version}</header>
    </div>
  )
}
```

`useStore` 是用来获取 `state`、`actions` 的 hooks。其返回的对象包含 `state`、`actions` 两个属性。

`combineStores` 同 `createStore` 返回的 `useStore` 类似，唯一不同的是 `combineStores` 的 `useStore` 需要指明 store 名称

```jsx
/**
 * src/pages/example.tsx
 */
import { useStore } from 'src/store.ts'

function Example () {
  // 返回整个 default 的 state
  const { state, actions } = useStore('default')
  // 返回回调函数获取的字段
  const { state: type, actions } = useStore('default', state => state.type)

  // 返回整个 user 的 state
  const { state, actions } = useStore('user')
  // 返回回调函数获取的字段
  const { state: type, actions } = useStore('user', state => state.type)
  ...
}
```

`useWohooxState` 是 `useStore` 的简化版，直接返回对应的 state 值

`useWohooxState` 同 `createStore` 返回的 `useWohooxState` 类似，唯一不同的是 `combineStores` 的 `useWohooxState` 需要指明 store 名称

> 对于仅需要读取 state 的组件，用 `useWohooxState` 更为方便。不需要重命名 state

```jsx
/**
 * src/pages/example.tsx
 */
import { useWohooxState } from 'src/store.ts'

function Example () {
  // 返回整个 default 的 state
  const state = useWohooxState('default')
  // 返回回调函数获取的字段
  const type = useWohooxState('default', state => state.type)

    // 返回整个 user 的 state
  const state = useWohooxState('user')
  // 返回回调函数获取的字段
  const type = useWohooxState('user', state => state.type)
  ...
}
```

### dispatch

非严格模式下的更新组件方式。可以间接将其理解为在 `action` 里定义了一个 `dispatch` 如：

```typescript
actions: {
  dispatch(){}
}
```

> 虽然 wohoox-react 支持通过 `dispatch` 让状态的修改生效，并让组件重新渲染，但最好使用 actions 进行数据更

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

#### dispatch 多模块 Typescript 支持

要让 dispatch 支持 typescript，需要进行重新声明使用
**如果你不使用 typescript, 你可以直接使用 wohoox-react 导出的 `dispatch`**

```typescript
import { dispatch as wohooxDispatch } from 'wohoox-react'

const { store } = combineStores(AStore, BStore, CStore)

export function dispatch(storName?: keyof typeof store) {
  wohooxDispatch(storName)
}
```

### dispatchAll

一次性更新所有 store 模块的组件状态，如果只有一个 store, 使用 dispatch 即可

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

## 注意事项

- 在组件中，如果你不使用 `useStore`、`useWohooxState` 获取数据，**数据改变后，组件将不会重新渲染**
- 尽可能使用严格模式（使用 actions 去修改数据）
- Set 类型的数据，默认不会对子数据做代理。如果改变 set 子数据时也想重新渲染：
  - 更改后可以先删除一个子数据，再把删除的添加进去
  - 或者设置 `proxySetDeep: true`
