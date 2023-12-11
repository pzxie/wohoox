import { useStore } from './store'
import './App.css'

function App() {
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
      <div className="content">
        <div className="logo">
          <a
            href="https://github.com/pzxie/wohoox/tree/main/packages/wohoox-react"
            target="_blank"
            rel="noreferrer"
          >
            wohoox-react
          </a>
        </div>

        <div>
          <strong className="primary">Easy</strong>,{' '}
          <strong className="primary">lightweight</strong> and{' '}
          <strong className="primary">reactive</strong> store by react hooks
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
    </div>
  )
}

export default App
