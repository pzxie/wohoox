import { useStore } from '../store';
import { dispatch } from 'wohoox';

const setKey = new Set(['set']);
const mapKey = new Map([['key', 'value']]);

export default function ExampleWeakSet() {
  console.log('render ExampleWeakSet');
  const weakSet = useStore(state => state.type.weakSet);
  // @ts-ignore
  window.bbb = weakSet;

  return (
    <div>
      <h2 style={{ color: 'red' }}>WeakSet</h2>
      <div>{weakSet.has(mapKey) + ''}</div>
      <div>{weakSet.has(setKey) + ''}</div>

      <button
        onClick={() => {
          weakSet.add(mapKey);
          dispatch();
        }}
      >
        add map
      </button>
      <button
        onClick={() => {
          weakSet.add(setKey);
          dispatch();
        }}
      >
        add set
      </button>

      <button
        onClick={() => {
          weakSet.delete(mapKey);
          dispatch();
        }}
      >
        delet map
      </button>
      <button
        onClick={() => {
          weakSet.delete(setKey);
          dispatch();
        }}
      >
        delet set
      </button>
      
    </div>
  );
}
