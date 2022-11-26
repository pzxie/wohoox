import { useStore } from '../store';
import { dispatch } from 'wohoox';

const obj = { type: 'set' };

export default function ExampleSet() {
  console.log('render ExampleSet');
  const setObject = useStore(state => state.type.set);

  const proxyObj = [...setObject.keys()].find(item => typeof item === 'object');

  return (
    <div>
      <h2 style={{ color: 'red' }}>Set</h2>

      {JSON.stringify(proxyObj)}

      {[...setObject.values()].map(item => (
        <div key={item} className="text">
          <span className="title">newKey:</span> {JSON.stringify(item)}
          <button
            onClick={() => {
              item.type += '_1';
              dispatch();
            }}
          >
            change obj
          </button>
        </div>
      ))}

      <button
        onClick={() => {
          const num = Math.floor(Math.random() * 100);
          setObject.add(num);
          console.log(num);
          dispatch();
        }}
      >
        add to set
      </button>
      <button
        onClick={() => {
          setObject.add(obj);
          dispatch();
        }}
      >
        add obj to set
      </button>

      <button
        onClick={() => {
          proxyObj.type += '_1';
          dispatch();
        }}
      >
        change obj
      </button>

      <button
        onClick={() => {
          setObject.delete(52);
          dispatch();
        }}
      >
        delete 52
      </button>

      <button
        onClick={() => {
          setObject.delete(obj);
          dispatch();
        }}
      >
        delete obj
      </button>

      <button
        onClick={() => {
          setObject.clear();
          dispatch();
        }}
      >
        clear set
      </button>
    </div>
  );
}
