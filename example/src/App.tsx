import { useMemo } from 'react';
import './App.css';
import Example from './components/example';
import MultiExample from './components/multiExample';

import { useStore } from './multiStore';

function App() {

  console.log('render app')

  const address = useStore('department', state => state.address);

  const multi = useMemo(() => <MultiExample />, []);

  return (
    <div className="App">
      {address.city}
      <div className="App-header">
        {/* <img src='/wohoox.png' className="App-logo" alt="logo" /> */}
        <Example />
        {multi}
      </div>
    </div>
  );
}

export default App;
