<p align="center">
  <img style="width: 160px;" src="../../wohoox.png" alt="wohoox" />
</p>

<p align="center">
  <a href="./README.md">English</a> | 中文
</p>

- 轻量的响应式状态管理
- Map, Set, WeakMap, WeakSet 等类型支持
- Typescript 支持
- 插件 api 支持

## 兼容性

\*所有支持[native ES2015 support](https://caniuse.com/es6)的浏览器

## 安装

```bash
npm install -S wohoox
```

## 快速上手

1. 创建 store

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
  actions: {
    updateVersion(state, version: string) {
      state.version = version
    },
  },
})

export default store
```

2. 在代码中使用 state

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

3. Typescript 支持

wohoox 完整支持 Typescript

## 进阶使用

### 多模块整合

> 如果你想对 store 按模块进行划分，wohoox 同样提供了支持.

#### 创建多模块

- 创建一个 'user' 模块

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

- 创建一个 'department' 模块

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

- 多模块整合

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

#### 多模块的使用

多模块的使用方式和单模块的一样，只是需要指明获取 state 的 store 名称

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

### 严格模式

为了使代码风格更加统一、更加规范  
**默认是开启了严格模式的，这意味着只能通过 actions 才能对 state 进行修改.**

#### 开始严格模式

严格模式下，修改 state 只能通过 actions

```typescript
import { createStore } from 'wohoox'

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

```jsx
import store from 'src/store.ts'

function exampleStrictMode() {
  const { state, actions } = store

  const updateVersion = () => {
    // 通过表达式直接赋值，将会报错
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

#### 关闭严格模式

下面的方式都是被允许的

- Actions
- state expression

```typescript
import { createStore } from 'wohoox'

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

修改数据

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

### 在普通 js/ts 文件中使用 wohoox

```typescript
/**
 * request.ts
 */

import store from 'src/store'

const { state, actions } = store

function request() {
  // 在其他地方使用 state
  return fetch(`/api/details?version=${state.version}`)
}

async function getVersion() {
  const res = await fetch('/api/version')
  const { version } = await res.json()

  actions.updateVersion(version)
}
```

### 插件体系

提供了插件选项用于增强 wohoox 的功能

wohoox 的插件由以下一些方法构成

```jsx
import type { WohooxPlugin } from 'wohoox'

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

#### 示例：persist plugin

- 创建 persist 插件

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

- 将插件添加到 `createStore` 的 `plugins` 选项中

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

- `name`: store 名称，**默认为 'default'**。 作为 store 的唯一标识符，在多模块的时候，该字段用于区分模块.
- `initState`: 初始化数据，并使用该数据的数据结构作为 typescript 类型推断
- `actions`: 修改数据的方式，并促使相关组件进行重新渲染。如果在严格模式下，是作为唯一合法修改数据的方式
- `plugins`: 插件选项
- `options.strictMode`: 严格模式开关。**默认 true**。严格模式下，actions 是唯一可以修改 state 的方式。非严格模式下，还可以直接修改 state。 ex: state.age = 23
- `options.proxySetDeep`: 严格模式开关。**默认 true**。 Set 类型的数据不会对将其子节点进行 proxy 处理。因其没有获取数据的情形，对其子节点进行 proxy 处理没有太大必要。不过如果你确定需要，你可以将其设置为 true

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

## Notes

- 尽可能使用严格模式（使用 actions 去修改数据）
- Set 类型的数据，默认不会对子数据做代理。如果改变 set 子数据时也想重新渲染：
  - 更改后可以先删除一个子数据，再把删除的添加进去
  - 或者设置 `proxySetDeep: true`
