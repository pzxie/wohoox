import { useStore } from '../store';
import { dispatch } from 'wohoox';

const setKey = new Set(['set']);
const mapKey = new Map([['key', 'value']]);

export default function ExampleWeakMap() {
  console.log('render ExampleWeakMap');
  const mapObj = useStore(state => state.type.weakMap);

  return (
    <div>
      <h2 style={{ color: 'red' }}>Map</h2>
      <div>{mapObj.get(mapKey)}</div>

      <button onClick={() => {
       mapObj.set(mapKey, 'weakMap');
       dispatch()
      }}>add item</button>      

<button onClick={() => {
       mapObj.delete(mapKey);
       dispatch()
      }}>delet</button>      
    </div>
  );
}
