import store, { actions } from './store'
import './App.css'
import { useState } from 'react'

function App() {
  const [_, update] = useState(1)

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

  const updateUi = () => {
    update(Math.random())
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
          <div className="version">Version: {store.state.version}</div>
          <button
            className="button"
            onClick={() => {
              actions.updateVersion(`1.${Math.floor(Math.random() * 10)}`)
              updateUi()
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
            {store.state.items.map(item => (
              <li>{item}</li>
            ))}
          </ul>
          <div className="actions">
            <button className="button" onClick={addItem}>
              add item
            </button>
            <button className="button" onClick={updateUi}>
              update ui
            </button>
          </div>

          <div className="actions">
            <button className="button" onClick={deleteItem}>
              delete item
            </button>
            <button className="button" onClick={updateUi}>
              update ui
            </button>
          </div>

          <div className="actions">
            <button className="button" onClick={modifySecondItem}>
              modify second item
            </button>
            <button className="button" onClick={updateUi}>
              update ui
            </button>
          </div>

          <button
            className="button actions"
            onClick={() => {
              actions.empty()
              update(Math.random())
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
