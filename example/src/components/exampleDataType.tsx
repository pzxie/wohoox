import { useStore } from '../store';
import { dispatch } from 'wohoox';

export default function ExampleDataType() {
  console.log('render ExampleDataType');
  const type = useStore(state => state.type);

  return (
    <div>
      <h2 style={{ color: 'red' }}>Original Type</h2>
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
    </div>
  );
}
