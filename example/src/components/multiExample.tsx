import { actions, useStore, dispatch, dispatchAll } from '../multiStore';

export default function MultiExample() {
  console.log('render multi---------');

  const address = useStore('department', state => state.address);
  const test = useStore('department', state => state.address.test);
  const details = useStore('default', state => state.details);

  return (
    <div>
      <h2 style={{ color: 'red' }}>Multi store</h2>

      <h3 style={{ color: '#8282ef' }}>department store</h3>
      <div>
        <div className="text"><span className='title'>address.city:</span> {address.city}</div>
        <div>
          <button
            onClick={() => {
              actions.department.updateAddress({
                ...address,
                city: address.city + '_address',
              });
            }}
          >
            click to update address
          </button>
        </div>
        <div>
          <button
            onClick={() => {
              actions.department.updateCity(address.city + '_city');
            }}
          >
            click to update city
          </button>
        </div>
        <button
          onClick={() => {
            address.city = address.city + '_dispatchCity';
            dispatch('department');
          }}
        >
          dispatch
        </button>
      </div>

      <div style={{ marginTop: '10px' }}>
        <div className="text"><span className='title'>address.test.deep: </span>{test.deep}</div>
        <div>
          <button
            onClick={() => {
              actions.department.updateTest(test.deep + '_test');
            }}
          >
            update test
          </button>
        </div>
      </div>

      <h3 style={{ color: '#8282ef' }}>default store</h3>
      <div className="text"><span className='title'>details.name:</span> {details.name}</div>

      <button
        style={{ marginTop: '10px' }}
        onClick={() => {
          details.name += '_dispatchAll';
          address.city = address.city + '_dispatchAll';
          dispatchAll();
        }}
      >
        dispatchAllStore
      </button>
    </div>
  );
}
