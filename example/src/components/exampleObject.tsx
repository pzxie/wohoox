import { useStore } from '../store';
import { dispatch } from 'wohoox';

export default function ExampleObject() {
  console.log('render ExampleObject');
  const typeObject = useStore(state => state.type.object);

  return (
    <div>
      <h2 style={{ color: 'red' }}>Object</h2>

      <div className="text"><span className='title'>original field:</span> {typeObject.name}</div>
      <div className="text"><span className='title'>reference field:</span> {JSON.stringify(typeObject.reference)}</div>
      
     
      <button
        onClick={() => {
          typeObject.name += '_1'
          dispatch();
        }}
      >
        modify origin field
      </button>

      <button
        onClick={() => {
          typeObject.reference = {...typeObject.reference, value: typeObject.reference.value += '_object'}
          dispatch();
        }}
      >
        modify reference address
      </button>

       <button
        onClick={() => {
          typeObject.reference.value += '_field'
          dispatch();
        }}
      >
        modify reference field
      </button>
      <button
        onClick={() => {
          typeObject.reference.newKey = 'new value'
          dispatch();
        }}
      >
        add key: newKey
      </button>

      <button
        onClick={() => {
          delete typeObject.reference.key
          dispatch();
        }}
      >
        delete exist key: key
      </button>

      <button
        onClick={() => {
          delete typeObject.reference.newKey
          dispatch();
        }}
      >
        delete new key: newKey
      </button>
    </div>
  );
}
