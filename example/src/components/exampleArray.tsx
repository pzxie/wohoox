import { useStore } from '../store';
import { dispatch } from 'wohoox';

export default function ExampleArray() {
  console.log('render ExampleArray');
  const typeArray = useStore(state => state.type.array);
  const innerArray = useStore(state => state.type.array[4]);

  return (
    <div>
      <h2 style={{ color: 'red' }}>Array</h2>
      
      <div className="text margin-10">
        {innerArray.map((item, index) => <div key={item}> <span className="title">Array[{index}]: {item + ''}</span></div>)}
        {/* {JSON.stringify(type.array)} */}
      </div>

      <button
        onClick={() => {
          innerArray[0] += 1;
          dispatch();
        }}
      >
        update array[0]
      </button>
      <button
        onClick={() => {
          innerArray[1] += 1;
          dispatch();
        }}
      >
        update array[1]
      </button>
      <button
        onClick={() => {
          typeArray[4] = [innerArray[0] + 1, innerArray[1] + 2, innerArray[2] + 3, innerArray[3] + 4]
          dispatch();
        }}
      >
        update array
      </button>
      <button
        onClick={() => {
          innerArray.length = 0;
          dispatch();
        }}
      >
        update array length to zero
      </button>
      <button
        onClick={() => {
          innerArray.length = 2;
          dispatch();
        }}
      >
        update array length to two
      </button>
      <button
        onClick={() => {
          innerArray.push(Math.floor(Math.random() * 100));
          dispatch();
        }}
      >
        push 1
      </button>
      <button
        onClick={() => {
          innerArray.unshift(2);
          dispatch();
        }}
      >
        unshift 2 
      </button>
      <button
        onClick={() => {
          innerArray.pop();
          dispatch();
        }}
      >
        pop
      </button>
      <button
        onClick={() => {
          innerArray.shift();
          dispatch();
        }}
      >
        shift
      </button>
      <button
        onClick={() => {
          innerArray.reverse();
          dispatch();
        }}
      >
        reverse
      </button>
      <button
        onClick={() => {
          innerArray.sort();
          dispatch();
        }}
      >
        sort
      </button>
      <button
        onClick={() => {
          innerArray.splice(1, 1);
          dispatch();
        }}
      >
        spliceDelete1
      </button>
      <button
        onClick={() => {
          innerArray.splice(1, 0, 1000);
          dispatch();
        }}
      >
        spliceInsert1
      </button>
    </div>
  );
}
