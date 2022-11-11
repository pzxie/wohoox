import { actions, useStore } from "../multiStore";
import { dispatch, dispatchAll } from "wohoox";

export default function MultiExample() {
  // Default to get 'default' store and return the hole state
  // const state = useStore()

  console.log('render multi---------')

  const address = useStore("department", (state) => state.address);
  const test = useStore('department', state => state.address.test)  

  return (
    <div>
      <h2>Multi store</h2>
      <div>{address.city}</div>
      <div>test: {test.deep}</div>

      <div>
        <button onClick={() => { actions.department.updateTest(test.deep + '_0') }}>
          update test
        </button>
      </div>

      <div>
        <button
          onClick={() => {
            actions.department.updateAddress({
              ...address,
              city: address.city + "_2",
            });
          }}
        >
          click to update address
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            actions.department.updateCity(address.city + '_4');
          }}
        >
          click to update city
        </button>
      </div>

      <button
        onClick={() => {
          address.city = address.city + "_3";
          dispatch("department");
        }}
      >
        dispatch
      </button>
      <button
        onClick={() => {
          address.city = address.city + "_all";
          dispatchAll();
        }}
      >
        dispatchAll
      </button>
    </div>
  );
}
