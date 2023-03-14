import { actions, useStore } from './store'
import './App.css'

function App() {
  const items = useStore(s => s.items)
  const version = useStore(s => s.version)

  const addItem = () => {
    const value = Math.floor(Math.random() * 10)
    actions.addItem(value)

    new Notification('add item: ' + value)
  }

  const deleteItem = () => {
    actions.deleteItem()
  }

  const modifySecondItem = () => {
    actions.modifySecondItem(new Date().toLocaleTimeString())
  }

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

        <div className="section">
          <h3>Type of string</h3>
          <div className="desc">
            Update wohoox store by actions and update ui by useState
          </div>
          <div className="version">Version: {version}</div>
          <button
            className="button"
            onClick={() => {
              actions.updateVersion(`1.${Math.floor(Math.random() * 10)}`)
            }}
          >
            click to update
          </button>
        </div>
        <div className="section">
          <h3>Type of array</h3>
          <div className="desc">
            Split with update wohoox store and update ui by useState
          </div>
          <div className="desc">
            The page will not be updated until the update ui button is clicked
          </div>
          <ul>
            {items.map((item, index) => (
              <li key={item}>
                {index}: {item}
              </li>
            ))}
          </ul>
          <div className="actions">
            <button className="button" onClick={addItem}>
              add item
            </button>
          </div>

          <div className="actions">
            <button className="button" onClick={deleteItem}>
              delete item
            </button>
          </div>

          <div className="actions">
            <button className="button" onClick={modifySecondItem}>
              modify second item
            </button>
          </div>

          <button
            className="button actions"
            onClick={() => {
              actions.empty()
            }}
          >
            empty
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
