import { actions, useStore } from './store'
import { dispatch } from 'wohoox-react'
import './App.css'

const objectKey = {}

function renderItem(current: any) {
  if (current.toString() === '[object Set]') return [...current].toString()
  if (current.toString() === '[object WeakSet]')
    return current.has(objectKey) + ''
  if (current.toString() === '[object Map]')
    return [...current.values()].toString()
  if (current.toString() === '[object WeakMap]') return current.get(objectKey)
  if (Array.isArray(current)) return current.toString()
  if (typeof current === 'object') return JSON.stringify(current)
}

function Child() {
  let state: Set<any> = useStore(state => state.set)

  const obj = [...state.values()][0]
  const array = [...state.values()][1]
  const map = [...state.values()][2]
  const weakMap = [...state.values()][3]
  const set = [...state.values()][4]
  const weakSet = [...state.values()][5]

  return (
    <div>
      <div role="objText">{renderItem(obj)}</div>
      <div role="arrayText">{renderItem(array)}</div>
      <div role="mapText">{renderItem(map)}</div>
      <div role="weakMapText">{renderItem(weakMap)}</div>
      <div role="setText">{renderItem(set)}</div>
      <div role="weakSetText">{renderItem(weakSet)}</div>

      <button
        role="obj"
        onClick={() => {
          obj.changed = 'changed'
          dispatch()
        }}
      >
        edit obj
      </button>
      <button
        role="array"
        onClick={() => {
          array.push('changed')
          dispatch()
        }}
      >
        edit array
      </button>
      <button
        role="map"
        onClick={() => {
          map.set('changed', 'changed')
          dispatch()
        }}
      >
        edit map
      </button>
      <button
        role="weakMap"
        onClick={() => {
          weakMap.set(objectKey, 'changed')
          dispatch()
        }}
      >
        edit weakMap
      </button>
      <button
        role="set"
        onClick={() => {
          set.add('changed')
          dispatch()
        }}
      >
        edit set
      </button>
      <button
        role="weakSet"
        onClick={() => {
          weakSet.add(objectKey)
          dispatch()
        }}
      >
        edit weakSet
      </button>
    </div>
  )
}

function App() {
  const defaultStoreVersion = useStore(s => s.version)
  const userStoreTime = useStore('user', state => state.time)
  const map = useStore(s => s.map)

  console.log(map)
  console.log([...map.values()])

  return (
    <div className="App">
      <div className="content">
        <div className="logo">
          <a
            href="https://github.com/pzxie/wohoox"
            target="_blank"
            rel="noreferrer"
          >
            <img src="/wohoox.png" className="logo" alt="logo" />
          </a>
        </div>

        <div>
          <strong className="primary">Easy</strong>,{' '}
          <strong className="primary">lightweight</strong> and{' '}
          <strong className="primary">reactive</strong> store
        </div>
        <div>
          <a
            className="link"
            href="https://github.com/pzxie/wohoox"
            target="_blank"
            rel="noreferrer"
          >
            Get started
          </a>
        </div>
        <h2>Multi Modules</h2>

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
      <Child></Child>
    </div>
  )
}

export default App
