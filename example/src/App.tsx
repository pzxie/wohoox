import { useMemo } from 'react';
import './App.css';
import Example from './components/example';
import MultiExample from './components/multiExample';
import ExampleDataType from './components/exampleDataType';
import ArrayType from './components/exampleArray';
import ExampleObject from './components/exampleObject';

import { useStore } from './multiStore';

function App() {
  console.log('render app');

  const address = useStore('department', state => state.address);

  const multi = useMemo(() => <MultiExample />, []);

  return (
    <div className="App">
      <div className="App-header" style={{ textAlign: 'left' }}>
        <img src="/wohoox.png" className="App-logo" alt="logo" />
        <h2>APP</h2>
        <div className='text'><span className='title'>address.city: </span>{address.city}</div>

        <ExampleDataType></ExampleDataType>
        <ExampleObject></ExampleObject>
        <ArrayType></ArrayType>
        <Example />
        {multi}
      </div>
    </div>
  );
}

export default App;
