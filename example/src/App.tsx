import './App.css';
import Example from './components/example';
import MultiExample from './components/multiExample';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src='/wohoox.png' className="App-logo" alt="logo" />
        <Example />
        <MultiExample />
      </header>
    </div>
  );
}

export default App;
