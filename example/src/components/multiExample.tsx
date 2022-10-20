import { actions, useStore } from "../multiStore";

export default function MultiExample() {
  // Default to get 'default' store and return the hole state
  // const state = useStore()

  const address = useStore('department', state => state.address);

  return (
    <div>
      <h2>address</h2>
      <div>{address.city}</div>

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
  );
}
