import { useStore } from '../store';
import { dispatch } from 'wohoox';

const mapKey = new Map([['key', 'value']]);

const same = {};

export default function ExampleWeakMap() {
  console.log('render ExampleWeakMap');
  const mapObj = useStore(state => state.type.weakMap);

  return (
    <div>
      <h2 style={{ color: 'red' }}>WeakMap</h2>
      <div>{mapObj.get(same)}</div>

      <button
        onClick={() => {
          mapObj.set(mapKey, 'weakMap');
          dispatch();
        }}
      >
        add item
      </button>

      <button
        onClick={() => {
          mapObj.delete(mapKey);
          dispatch();
        }}
      >
        delet
      </button>
      <button
        onClick={() => {
          mapObj.set(same, 456);
          dispatch();
        }}
      >
        add same:456
      </button>
      <button
        onClick={() => {
          mapObj.delete(same);
          dispatch();
        }}
      >
        delete same:456
      </button>
    </div>
  );
}
