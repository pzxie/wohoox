import { useStore } from '../store';
import { dispatch } from 'wohoox';

export default function ExampleDataType() {
  console.log('render ExampleDataType');
  const type = useStore(state => state.type);
  const innerArray = useStore(state => state.type.array[4]);

  return (
    <div>
      <h2 style={{ color: 'red' }}>Date Type</h2>
      <div className="text margin-10">
        <span className="title">number: </span>
        {type.number}
      </div>
      <button
        onClick={() => {
          type.number += 1;
          dispatch();
        }}
      >
        update number
      </button>
      <div className="text margin-10">
        <span className="title">string: </span>
        {type.string}
      </div>
      <button
        onClick={() => {
          type.string += '_1';
          dispatch();
        }}
      >
        update string
      </button>
      <div className="text margin-10">
        <span className="title">boolean: </span>
        {type.boolean.toString()}
      </div>
      <button
        onClick={() => {
          type.boolean = !type.boolean;
          dispatch();
        }}
      >
        update boolean
      </button>
      <div className="text margin-10">
        <span className="title">null: </span>
        {type.null + ''}
      </div>
      <button
        onClick={() => {
          type.null = !type.null ? true : null;
          dispatch();
        }}
      >
        update boolean
      </button>
      <div className="text margin-10">
        <span className="title">undefined: </span>
        {type.undefined + ''}
      </div>
      <button
        onClick={() => {
          type.undefined = !type.undefined ? true : undefined;
          dispatch();
        }}
      >
        update undefined
      </button>
      <div className="text margin-10">
        <span className="title">symbol: </span>
        {type.symbol.toString()}
      </div>
      <button
        onClick={() => {
          type.symbol = Symbol(type.symbol.description + '_1');
          dispatch();
        }}
      >
        update symbol
      </button>
      <div className="text margin-10">
        <span className="title">object: </span>
        {JSON.stringify(type.object)}
      </div>

      <button
        onClick={() => {
          type.object.name += '_1';
          type.object.author += '_2';
          dispatch();
        }}
      >
        update object
      </button>
      <div className="text margin-10">
        <span className="title">Array: </span>
        {/* {type.array[4].map(item => <span>{item}</span>)} */}
        {JSON.stringify(innerArray[0])}
        {JSON.stringify(innerArray[1])}
        {JSON.stringify(innerArray[2])}
        {JSON.stringify(innerArray[3])}
        {/* {JSON.stringify(type.array)} */}
      </div>

      <button
        onClick={() => {
          type.array[0] += '_1';
          dispatch();
        }}
      >
        update array string
      </button>
      <button
        onClick={() => {
          type.array[1] = !type.array[1];
          dispatch();
        }}
      >
        update array boolean
      </button>
      <button
        onClick={() => {
          type.array[2] += 1;
          dispatch();
        }}
      >
        update array number
      </button>
       <button
        onClick={() => {
          type.array[3] = {...type.array[3], name: type.array[3].name + '_reference'};
          dispatch();
        }}
      >
        update array object reference address
      </button>
      <button
        onClick={() => {
          type.array[3].name = type.array[3].name + '_field';
          dispatch();
        }}
      >
        update array object field
      </button>
      <button
        onClick={() => {
          type.array[4] = [type.array[4][0] + 1, type.array[4][1] + 2, type.array[4][2] + 3];
          dispatch();
        }}
      >
        update array reference
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
          type.array[4][2] += 1;
          dispatch();
        }}
      >
        update array field
      </button>
      <button
        onClick={() => {
          type.array[4].push(3)
          dispatch();
        }}
      >
        push item to array
      </button>
      <button
        onClick={() => {
          type.array[4].shift()
          dispatch();
        }}
      >
        shift item from array[4]
      </button>
      <button
        onClick={() => {
          type.array.shift();
          dispatch();
        }}
      >
        shift item from array
      </button>

    </div>
  );
}
