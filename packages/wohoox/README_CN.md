<p align="center">
  <img style="width: 160px;" src="../../wohoox.png" alt="wohoox" />
</p>

<p align="center">
  <a href="https://github.com/pzxie/wohoox/blob/main/packages/wohoox/README.md">English</a> | 中文
</p>

- 轻量的响应式状态管理
- Map, Set, WeakMap, WeakSet 等类型支持
- Typescript 支持
- 插件 api 支持

## 目录

- [目录](#目录)
- [兼容性](#兼容性)
- [安装](#安装)
- [快速上手](#快速上手)
- [进阶使用](#进阶使用)
  - [定义 Key-Value 通用型 Action](#定义-key-value-通用型-action)
  - [重置状态](#重置状态)
    - [initState 是个对象](#initstate-是个对象)
    - [initState 是个函数](#initstate-是个函数)
  - [多模块整合](#多模块整合)
    - [创建多模块](#创建多模块)
    - [多模块的使用](#多模块的使用)
  - [严格模式](#严格模式)
    - [开启严格模式](#开启严格模式)
    - [关闭严格模式](#关闭严格模式)
  - [插件体系](#插件体系)
    - [示例：persist plugin](#示例persist-plugin)
- [API](#api)
  - [createStore](#createstore)
    - [参数说明](#参数说明)
    - [用法](#用法)
  - [combineStores](#combinestores)
- [注意事项](#注意事项)

## 兼容性

支持[native ES2015 support](https://caniuse.com/es6)的浏览器

## 安装

```bash
npm install -S wohoox
```

## 快速上手

**创建 store**

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

**使用 state**

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

**更新状态**

wohoox 通过 `action` 来更新状态，从而使整个状态的变更更加可控，可追踪

```typescript
/**
 * src/store.ts
 */
import { createStore } from 'wohoox'

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

  // 使用 action 更新 version
  actions.updateVersion(version)
  console.log(state.version)

  // 可以更新整个对象
  actions.updateDetails(details)
  console.log(state.details)

  // 也可以更新更深层次某一个字段
  actions.updateDetailsName(details.name)
  console.log(state.details)
}
```

## 进阶使用

### 定义 Key-Value 通用型 Action

> 常见用一个 `action` 更新固定的字段，比如用 `updateVersion` 来更新 `version`

`wohoox` 允许你定义一个通用型的 `action`，可以简化很多格式化的 `action` 定义

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
store.actions.updateByKeyValue('details', { name: 'wohoox', other: 'anything' })

export default store
```

### 重置状态

wohoox 内置了 `reset` action。你可以使用 `reset` 去重置 `state`

#### initState 是个对象

当初始化 store 时，`initState`如果是个对象，则 `reset` **参数必填**。传入新的初始化数据

```typescript
import { createStore } from 'wohoox'

const store = createStore({
  initState: {
    name: 'wohoox',
    version: '1.x',
  },
})

/**
 * 使用传入的数据重置状态
 * reset 的参数时必填的
 */
store.actions.reset({
  name: 'wohoox',
  version: '2.x',
})
```

#### initState 是个函数

初始化 store 时，如果 `initState` 是个工厂函数，则 `reset` 参数是可选的

- **不传参数时，**则默认调用工厂函数返回新的初始化状态

- **传参数时，**则使用传入的数据作为初始化状态

```typescript
import { createStore } from 'wohoox'

const store = createStore({
  initState: () => ({
    name: 'wohoox',
    version: '1.x',
  }),
})

/**
 * 调用工厂函数重置状态
 */
store.actions.reset()

/**
 * 使用传入的数据重置状态
 */
store.actions.reset({
  name: 'wohoox',
  version: '2.x',
})
```

**注意:** `reset` 是 `wohoox` 的内置 `action`. 如果你自己定义名为 `reset` 的 `action` 将会被忽略

### 多模块整合

`wohoox` 支持按模块进行状态划分

#### 创建多模块

**创建一个 `user` 模块**

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

**创建一个 `department` 模块**

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

**将多个模块整合起来**

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

#### 多模块的使用

多模块的使用方式和单模块的一样，只是需要指明获取 state 的 store 名称

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

### 严格模式

为了使代码风格更加统一、更加规范，**默认开启了严格模式**。这意味着只能通过 actions 才能对 state 进行修改

#### 开启严格模式

严格模式下，修改 state 只能通过 actions

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

#### 关闭严格模式

**下面的方式都是被允许的**

- Actions
- State expression

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

**修改数据**

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

### 插件体系

提供了插件选项用于增强 wohoox 的功能

```jsx
import type { WohooxPlugin } from 'wohoox'

export const plugin: WohooxPlugin<any, any> = () => ({
  beforeInit(initState, actions) {
    // 初始化 store 之前，对 initState, actions 进行处理，并返回新的 initState 和 actions 用于初始化
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
  onReset?(storeName, state, originState) {
    // 重置操作时调用
  }
})
```

#### 示例：persist plugin

**创建 persist 插件**

```jsx
// src/plugin/persist.ts
import type { WohooxPlugin } from 'wohoox'

const persistPlugin: WohooxPlugin<{ version: string }, any> = () => ({
  beforeInit(initState) {
    return {
      initState: {
        ...initState,
        version: JSON.parse(localStorage.getItem('wohoox_version') || '""'),
      },
    }
  },
  onChange(_name, value, keys) {
    if (keys.toString() === 'version')
      localStorage.setItem('wohoox_version', JSON.stringify(value))
  },
  onReset(_name, state) {
    localStorage.setItem('wohoox_version', JSON.stringify(state.version))
  },
})

export default persistPlugin
```

**将插件添加到 `createStore` 的 `plugins` 选项中**

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

用来初始化并创建一个 store

#### 参数说明

- `name`: store 名称，**默认为 'default'**。 作为 store 的唯一标识符，在多模块的时候，该字段用于区分模块

- `initState`: 初始化数据

- `actions`: 修改数据的方式。在严格模式下，是唯一合法修改数据的方式

- `plugins`: 插件列表

- `options.strictMode`: 严格模式开关。**默认 true**
  严格模式下，actions 是唯一可以修改 state 的方式。非严格模式下，还可以直接修改 state。 ex: state.age = 23

- `options.proxySetDeep`: 严格模式开关。**默认 false**
  Set 类型的数据不会对将其子节点进行 proxy 处理。因其没有获取数据的情形，对其子节点进行 proxy 处理没有太大必要。不过如果你确定需要，你可以将其设置为 true

#### 用法

```typescript
/**
 * src/store.ts
 */
import { createStore } from 'wohoox'

const store = createStore({
  /**
   * 默认为 'default'
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
   * 默认为 { strictMode: true }
   */
  options: {
    strictMode: true,
  },
})
```

### combineStores

将多个 store 组合成一个独立的 store

```jsx
import { combineStores } from 'wohoox'

export const { store, actions } = combineStores(
  defaultStore,
  devStore,
  userStore,
)
```

## 注意事项

- 尽可能使用严格模式（使用 actions 去修改数据）
- Set 类型的数据，默认不会对子数据做代理。如果改变 set 子数据时也想重新渲染：
  - 更改后可以先删除一个子数据，再把删除的添加进去
  - 或者设置 `proxySetDeep: true`
