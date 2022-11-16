# wohoox

![wohoox](./example/public/wohoox_211x176.png)

基于 react hooks 的简洁、轻量 react store.

## 翻译

[English](./README.md) [中文文档](./README_CN.md)

## 兼容要求

* react: ">=16.8.0"
* browser: 所有支持[native ES2015 support](https://caniuse.com/es6)的浏览器

## 安装

```` bash
npm install -S wohoox
````

## 快速上手

1. 创建store

````typescript
/**
 * src/store.ts
 */
import createStore from 'wohoox';

const store = createStore({
  initState: {
    version: '1.x',
    details: {
      author: 'pzxie',
      other: 'xxx'
    }
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version;
    },
  },
})

export { useStore } from 'wohoox';
export const actions = store.actions
````

2. 在组件中获取并使用 state

````jsx
/**
 * src/pages/example.tsx
 */
import { actions, useStore } from 'src/store.ts'

function Example () {
  // 默认获取名为【default】的 store 中的整个 state
  const userState = useStore()

  const version = useStore(state => state.version)

  return <div>
    <h2>Version: {version}</h2>
    <h2>Version: {userState.version}</h2>

    <button onClick={() => {actions.updateVersion(version + '_1')}}>click to update version</button>
  </div>
}
````

3. typescript 支持

为了能够完整使用 typescript 的类型推断, useStore 需要进行重新声明
**如果你不使用 typescript, 你可以直接使用 wohoox 导出的 `useStore`**

````jsx
/**
 * diff src/store.ts
 */
- import createStore from 'wohoox';
+ import createStore, { useStore as useWoHoox } from 'wohoox';

+ type DefaultState = typeof store.state;

- export { useStore } from 'wohoox';

+ export function useStore(name?: string): DefaultState;
+ export function useStore<T extends (state: DefaultState) => any>(fn?: T): ReturnType<T>;
+ export function useStore<T extends (state: DefaultState) => any>(name?: string,fn?: T): ReturnType<T>;
+ export function useStore(name?: any, fn?: any) {
+   const state = useWohoox(name, fn);
+ 
+   return state;
+ }
````

````jsx
/**
 * src/store.ts
 */
import createStore, { useStore as useWoHoox } from 'wohoox';

const store = createStore({
  initState: {
    version: '1.x',
    details: {
      author: 'pzxie',
      other: 'xxx'
    }
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version;
    },
  },
})

type DefaultState = typeof store.state;

export function useStore(name?: string): DefaultState;
export function useStore<T extends (state: DefaultState) => any>(fn?: T): ReturnType<T>;
export function useStore<T extends (state: DefaultState) => any>(name?: string,fn?: T): ReturnType<T>;
export function useStore(name?: any, fn?: any) {
  const state = useWohoox(name, fn);

  return state;
}

export const actions = store.actions
````

## 更多用法

### 多模块整合

> 如果你想对store按模块进行划分，你可以看这里

#### 创建多个 store

* 创建一个名为【user】的 store

````typescript
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
      state.name = name;
    },
  },
})

export const userActions = userStore.actions
````

* 创建一个名为【department】的 store

````typescript
/**
 * src/multiStore.ts
 */

const devInitState = {
  name: 'developer',
  address: {
    province: 'sc',
    city: 'cd'
  },
}

const devStore = createStore({
  name: 'department',
  initState: devInitState,
  actions: {
    updateAddress(state, address: typeof devInitState['address']) {
      state.address = address;
    },
  },
})

export const devActions = devStore.actions
````

* 将多个 store 组合起来

同样的，为了能够完整使用 typescript 的类型推断, useStore，actions 需要进行重新声明
**如果你不使用 typescript, 你可以直接使用 wohoox 导出的 `useStore` 以及 store 的 actions 属性**

````typescript
/**
 * src/multiStore.ts
 */
import defaultStore from './store'

const store = {
  default: defaultStore,
  department: devStore,
  user: userStore,
};

type AppStore = typeof store;
type StoreActions = { [K in keyof AppStore]: AppStore[K]["actions"] };

export function useStore(): AppStore["default"]["state"];
export function useStore<T extends (state: AppStore["default"]["state"]) => any>(fn: T): ReturnType<T>;
export function useStore<T extends keyof AppStore>(name: T): AppStore[T]["state"];
export function useStore<
  N extends keyof AppStore,
  T extends (state: AppStore[N]["state"]) => any
>(name?: N, fn?: T): ReturnType<T>;
export function useStore(fn?: any, name?: any) {
  const state = useWohoox(fn, name);

  return state;
}

/**
 * 获取所有模块的 actions 属性
 */
export const actions = Object.keys(store).reduce((pre, current) => {
  pre[current as "default"] = store[current as "default"]["actions"];
  return pre;
}, {} as StoreActions);
````

#### usage

多模块的使用方式和单模块的一样，只是需要指明获取 state 的 store 名称

````jsx
/**
 * src/pages/multiExample.tsx
 */
import { actions } from 'src/multiStore.ts'

function example () {
  const defaultState = useStore()
  const userState = useStore('user', state => state.name)
  const devState = useStore('department', state => state.address)


  return <div>
    <h2>Default Version</h2>
    {defaultState.version}

    <h2>User Name</h2>
    {userState}

    <h2>Dev address</h2>
    {devState.province}
    {devState.city} 

    <button onClick={() => {actions.default.updateVersion(version + '_1')}}>click to update version</button>
    <button onClick={() => {actions.user.updateName(userState + '_1')}}>click to update name</button>
    <button onClick={() => {actions.department.updateAddress({...devState, city: devState.city + '_1'})}}>click to update address</button>
  </div>
}
````

### 严格模式

为了使代码风格更加统一，以及使代码更加规范
**默认是开启了严格模式的，这意味着只能通过 actions 才能对 state 进行修改**.

#### 开启严格模式

只能通过 actions 才能对 state 进行修改

````typescript
const store = createStore({
  initState: {
    version: '1.X',
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version;
    },
    dispatch (){}
  },
  options: {
    // default true
    strictMode: true
  }
})
````

通过 actions 修改数据

````jsx
import { actions } from 'src/store.ts'


function exampleStrictMode () {
  const state = useStore()

  const updateVersion = () => {
    // 直接修改 state 会报错
    // state.version = state.version + '_1'
    // actions.dispatch()

    // OK
    actions.updateVersion(state.version + '_1')
  }

  return <div>
    <h2>Default Version</h2>
    {state.version}

    <button onClick={updateVersion}>click to update version</button>
  </div>
}
`````

#### 关闭严格模式

下面的方式都是被允许的

* 通过 actions 修改数据
* 通过表达式直接修改数据 + dispatch

````typescript
- import createStore, { useStore as useWohoox } from 'wohoox';
+ import createStore, { useStore as useWohoox, dispatch as wohooxDispatch } from 'wohoox';

const store = createStore({
  initState: {
    version: '1.X',
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version;
    },
  },
  options: {
-   strictMode: true
+   strictMode: false
  }
})

+ export function dispatch(storName?: keyof AppStore) {
+   wohooxDispatch(storName);
+ }
````

修改数据

````jsx
- import { actions } from 'src/store.ts'
+ import { actions, dispatch } from 'src/store.ts'


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
`````

### 在纯 js/ts 文件中使用 wohoox

`useStore` 只能用在函数式组件中. 你也可以直接导出 state 进行使用

````typescript
/**
 * src/store.ts
 */

// 导出 state
// 重要提醒... 不要通过这种方式在组件中使用，该方式不会使组件重新渲染
+ export const state = store.state

````

````typescript
/**
 * request.ts
 */

import { state, actions } from 'src/store'

function request () {
  // 在其他文件中使用 state
  return fetch(`/api/details?version=${state.version}`)
}

async function getVersion () {
  const res = await fetch('/api/version')
  const {version} = await res.json()

  actions.updateVersion(version);
}
````

## API

* [createStore](#createstore)
* [useStore](#usestore)
* [dispatch](#dispatch)
* [dispatchAll](#dispatchall)


### createStore

他用来初始化并创建一个 store

#### 参数说明

* `name:` store名称，默认为`'default'`. 作为 store 的唯一标识符，在多模块的时候，该字段用于区分模块.
* `initState:` 初始化数据，并使用该数据的数据结构作为 typescript 类型推断
* `actions:` 修改数据的方式，并促使相关组件进行重新渲染。如果在严格模式下，是作为唯一合法修改数据的方式
* `options.strictMode:` 严格模式开关。默认 `true`. 严格模式下，actions 是唯一可以修改 state 的方式。非严格模式下，还可以直接修改 state。 `ex: state.age = 23`  

#### 用法

创建一个名叫【default】的 store

````typescript
/**
 * src/store.ts
 */
import createStore from 'wohoox';

const store = createStore({
  /**
   * default as 'default'
   */
  name: 'default',
  initState: {
    version: '1.x',
    details: {
      author: 'pzxie',
      other: 'xxx'
    }
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version;
    },
  },
  /**
   * default as { strictMode: true }
   */
  options: {
    strictMode: true
  }
})

````

### useStore

用来获取 state 的 hooks。如果所有参数都不传，将返回名为【default】的 store 的整个 state

#### 参数说明

* `name:` 获取 state 的 store 名称。可选, 默认为 'default'. 如果传入了一个不存在的 store 名称，将会抛出错误.
* `callback:` 通过该参数返回具体的状态。

#### 用法

````jsx
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
  const author = useStore(state => state.details.author)
  const details = useStore('default', state => state.details)

  ...
}
````

#### Typescript

为了能够完整使用 typescript 的类型推断, useStore 需要进行重新声明
**如果你不使用 typescript, 你可以直接使用 wohoox 导出的 `useStore`**

````jsx
/**
 * src/store.ts
 */
import createStore, { useStore as useWoHoox } from 'wohoox';

const store = createStore({...})

type DefaultState = typeof store.state;

export function useStore(name?: string): DefaultState;
export function useStore<T extends (state: DefaultState) => any>(fn?: T): ReturnType<T>;
export function useStore<T extends (state: DefaultState) => any>(name?: string,fn?: T): ReturnType<T>;
export function useStore(name?: any, fn?: any) {
  const state = useWohoox(name, fn);

  return state;
}
````

### dispatch

非严格模式下的更新组件方式。可以间接将其理解为与在 action 里定义的dispatch 差不多。如：

````typescript
actions: {
  dispatch(){}
}
````

#### Params

* `storeName:` 默认为'default'. 告诉 wohoox 需要更新哪个 store 的组件状态

#### Usage

````typescript
import { useStore, dispatch } from "../store";

function exampleStrictMode () {
  const state = useStore()

  const updateVersion = () => {
    state.version = state.version + '_1'
    dispatch()
  }

  return <div>
    <h2>Default Version</h2>
    {state.version}

    <button onClick={updateVersion}>click to update version</button>
  </div>
}
````

#### Typescript

为了能够完整使用 typescript 的类型推断, dispatch 需要进行重新声明使用
**如果你不使用 typescript, 你可以直接使用 wohoox 导出的 `dispatch`**

````typescript
export function dispatch(storName?: keyof AppStore) {
  wohooxDispatch(storName);
}
````

### dispatchAll

用于多模块 store 类型。更新所有 store 模块的组件状态，如果只有一个 store, 使用 dispatch 即可

````jsx
/**
 * src/pages/multiExample.tsx
 */
import { actions } from 'src/multiStore.ts'
import { dispatchAll } from 'wohoox'

function example () {
  const defaultState = useStore()
  const userState = useStore('user', state => state)
  const devState = useStore('department', state => state.address)


  return <div>
    <h2>Default Version</h2>
    {defaultState.version}

    <h2>User Name</h2>
    {userState.name}

    <h2>Dev address</h2>
    {devState.province}
    {devState.city} 

    <button onClick={() => {
      defaultState.version += '_1'
      devState.city += "_2"
      userState.name += '_3'

      dispatchAll()
    }}>click to update all</button>
  </div>
}
````

## Notes

* 在组件中，如果你不使用 `useStore` 获取数据，**数据改变后，组件将不会重新渲染**
* 尽可能使用严格模式（使用 actions 去修改数据）
* symbol类型不能作为 store 的 key

## TODO

1. 增加服务器同步数据的功能
2. 持久化
3. map, set 支持
