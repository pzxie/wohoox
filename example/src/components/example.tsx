import { useStore } from '../store';
import { dispatch } from 'wohoox';

export default function Example() {
  console.log('render example');
  const state = useStore();

  return (
    <div>
      <h2 style={{color: 'red'}}>Single store</h2>
      <div className='text'><span className='title'>version: </span>{state.version}</div>

      <button
        onClick={() => {
          state.version += '_1';
          dispatch();
        }}
      >
        dispatch to update version
      </button>
    </div>
  );
}
