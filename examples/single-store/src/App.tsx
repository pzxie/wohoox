import { useStore, actions } from './store'
import './App.css'

function App() {
  const version = useStore(state => state.version)

  return (
    <div className="App">
      <div className="App-header">
        <div className="App-logo">
          <img src="/wohoox.png" className="App-logo" alt="logo" />
          <span className="version-tag">{version}</span>
        </div>

        <div>
          <strong className="primary">Easy</strong>,{' '}
          <strong className="primary">lightweight</strong> and{' '}
          <strong className="primary">reactive</strong> store
        </div>

        <div>
          <span className="version">Version: {version}</span>
          <button
            onClick={() => {
              actions.updateVersion(`1.${Math.floor(Math.random() * 10)}`)
            }}
          >
            click to update
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
