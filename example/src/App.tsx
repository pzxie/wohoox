import { useMemo } from 'react';
import './App.css';
import Example from './components/example';
import MultiExample from './components/multiExample';
import ExampleDataType from './components/exampleDataType';
import ArrayType from './components/exampleArray';
import ExampleObject from './components/exampleObject';
import ExampleMap from './components/exampleMap';
import ExampleWeakMap from './components/exampleWeakMap';

import { useStore, dispatchAll } from './multiStore';

function App() {
  console.log('render app');

  const address = useStore('department', state => state.address);
  const type = useStore(state => state.type);
  const mapObj = useStore(state => state.type.map);

  const multi = useMemo(() => <MultiExample />, []);

  return (
    <div className="App">
      <div className="App-header" style={{ textAlign: 'left' }}>
        <img src="/wohoox.png" className="App-logo" alt="logo" />
        <h2>APP</h2>
        <div className='text'><span className='title'>address.city: </span>{address.city}</div>

        <div>{mapObj.get('123')}</div>

        <button onClick={() => {
          type.object.name = Math.random() + '_1';
          dispatchAll()
        }}>update default name</button>

        <ExampleMap></ExampleMap>
        <ExampleWeakMap></ExampleWeakMap>
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
