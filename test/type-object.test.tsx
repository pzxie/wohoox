import * as React from 'react';
import { fireEvent, cleanup, render, screen } from '@testing-library/react';

import createStore, { useStore, dispatch } from '../src';

const reactLegency = !!process.env.reactLegency;

function initStore(storeName?: string, options?: { strictMode?: boolean }) {
  const initState = {
    type: {
      object: {
        name: 'object',
        author: 'pzxie',
      },
    },
  };

  const store = createStore({
    name: storeName,
    initState,
    actions: {
      dispatch() {},
    },
    options: options || { strictMode: false },
  });

  return {
    initState,
    store,
  };
}

afterEach(cleanup);

describe('single component: plain object', () => {
  it('modify value', () => {
    const { initState } = initStore();

    const initData = JSON.parse(JSON.stringify(initState.type.object));
    function Child() {
      let state = useStore();

      return (
        <div>
          <span role="object">{JSON.stringify(state.type.object)}</span>
          <span role="field">{state.type.object.name}</span>
          <button
            role="updateObjectBtn"
            onClick={() => {
              state.type.object = {
                ...state.type.object,
                name: state.type.object.name + '_object',
              };
              dispatch();
            }}
          >
            update object
          </button>
          <button
            role="updateFieldBtn"
            onClick={() => {
              state.type.object.name += '_field';
              dispatch();
            }}
          >
            update field
          </button>
        </div>
      );
    }

    render(<Child />, { legacyRoot: reactLegency });

    const objectText = screen.getByRole('object');
    const fieldText = screen.getByRole('field');
    const updateObjectBtn = screen.getByRole('updateObjectBtn');
    const updateFieldBtn = screen.getByRole('updateFieldBtn');

    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);

    fireEvent.click(updateObjectBtn);
    initData.name += '_object';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);

    fireEvent.click(updateFieldBtn);
    initData.name += '_field';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);

    fireEvent.click(updateFieldBtn);
    initData.name += '_field';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);

    fireEvent.click(updateObjectBtn);
    initData.name += '_object';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);

    fireEvent.click(updateObjectBtn);
    initData.name += '_object';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);

    fireEvent.click(updateFieldBtn);
    initData.name += '_field';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);
  });

  it('delete key', () => {
    const { initState } = initStore();

    const initData = JSON.parse(JSON.stringify(initState.type.object));
    function Child() {
      let state = useStore();

      return (
        <div>
          <span role="object">{JSON.stringify(state.type.object)}</span>
          <span role="field">{state.type.object?.name}</span>
          <button
            role="deleteFieldBtn"
            onClick={() => {
              delete state.type.object.name;
              dispatch();
            }}
          >
            delete field
          </button>
          <button
            role="deleteObjectBtn"
            onClick={() => {
              delete state.type.object;
              dispatch();
            }}
          >
            delete object
          </button>
        </div>
      );
    }

    render(<Child />, { legacyRoot: reactLegency });

    const objectText = screen.getByRole('object');
    const fieldText = screen.getByRole('field');
    const deleteFieldBtn = screen.getByRole('deleteFieldBtn');
    const deleteObjectBtn = screen.getByRole('deleteObjectBtn');

    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);

    fireEvent.click(deleteFieldBtn);
    delete initData.name;
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBeFalsy();

    fireEvent.click(deleteFieldBtn);
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBeFalsy();

    fireEvent.click(deleteObjectBtn);
    expect(objectText.innerHTML).toBeFalsy();
    expect(fieldText.innerHTML).toBeFalsy();

    fireEvent.click(deleteObjectBtn);
    expect(objectText.innerHTML).toBeFalsy();
    expect(fieldText.innerHTML).toBeFalsy();
  });

  it('add new key', () => {
    const { initState } = initStore();

    const initData = JSON.parse(JSON.stringify(initState.type.object));
    function Child() {
      let state = useStore();

      return (
        <div>
          <span role="object">{JSON.stringify(state.type.object)}</span>
          <span role="field">{state.type.object.name}</span>
          <button
            role="addNewKey"
            onClick={() => {
              state.type.object.newKey = 'newKey';
              dispatch();
            }}
          >
            add new key
          </button>
        </div>
      );
    }

    render(<Child />, { legacyRoot: reactLegency });

    const objectText = screen.getByRole('object');
    const fieldText = screen.getByRole('field');
    const addNewKey = screen.getByRole('addNewKey');

    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);

    fireEvent.click(addNewKey);
    initData.newKey = 'newKey';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);

    fireEvent.click(addNewKey);
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);
  });
});

describe('multi components: plain object', () => {
  it('modify value', () => {
    const { initState } = initStore();

    const initData = JSON.parse(JSON.stringify(initState.type.object));
    function Child() {
      let state = useStore();

      return (
        <div>
          <span role="object">{JSON.stringify(state.type.object)}</span>
          <span role="field">{state.type.object.name}</span>
          <button
            role="updateObjectBtn"
            onClick={() => {
              state.type.object = {
                ...state.type.object,
                name: state.type.object.name + '_object',
              };
              dispatch();
            }}
          >
            update object
          </button>
          <button
            role="updateFieldBtn"
            onClick={() => {
              state.type.object.name += '_field';
              dispatch();
            }}
          >
            update field
          </button>
        </div>
      );
    }

    function Siblings() {
      let name = useStore(state => state.type.object.name);

      return (
        <div>
          <span role="siblingsText">{name}</span>
        </div>
      );
    }

    function Parent() {
      let obj = useStore(state => state.type.object);

      return (
        <div>
          <span role="parentText">{JSON.stringify(obj)}</span>
          <Child></Child>
          <Siblings></Siblings>
        </div>
      );
    }

    render(<Parent />, { legacyRoot: reactLegency });

    const objectText = screen.getByRole('object');
    const fieldText = screen.getByRole('field');
    const siblingsText = screen.getByRole('siblingsText');
    const parentText = screen.getByRole('parentText');
    const updateObjectBtn = screen.getByRole('updateObjectBtn');
    const updateFieldBtn = screen.getByRole('updateFieldBtn');

    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);
    expect(siblingsText.innerHTML).toBe(initData.name);
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(updateObjectBtn);
    initData.name += '_object';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);
    expect(siblingsText.innerHTML).toBe(initData.name);
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(updateFieldBtn);
    initData.name += '_field';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);
    expect(siblingsText.innerHTML).toBe(initData.name);
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(updateFieldBtn);
    initData.name += '_field';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);
    expect(siblingsText.innerHTML).toBe(initData.name);
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(updateObjectBtn);
    initData.name += '_object';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);
    expect(siblingsText.innerHTML).toBe(initData.name);
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(updateObjectBtn);
    initData.name += '_object';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);
    expect(siblingsText.innerHTML).toBe(initData.name);
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(updateFieldBtn);
    initData.name += '_field';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);
    expect(siblingsText.innerHTML).toBe(initData.name);
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));
  });
  it('delete key', () => {
    const { initState } = initStore();

    const initData = JSON.parse(JSON.stringify(initState.type.object));
    function Child() {
      let state = useStore();

      return (
        <div>
          <span role="object">{JSON.stringify(state.type.object)}</span>
          <span role="field">{state.type.object?.name}</span>
          <button
            role="deleteOriginField"
            onClick={() => {
              delete state.type.object.name;
              dispatch();
            }}
          >
            deleteOriginField
          </button>
          <button
            role="deleteObjectField"
            onClick={() => {
              delete state.type.object;
              dispatch();
            }}
          >
            deleteObjectField
          </button>
        </div>
      );
    }

    function Siblings() {
      let name = useStore(state => state.type.object?.name);

      return (
        <div>
          <span role="siblingsText">{name}</span>
        </div>
      );
    }

    function Parent() {
      let obj = useStore(state => state.type.object);

      return (
        <div>
          <span role="parentText">{JSON.stringify(obj)}</span>
          <Child></Child>
          <Siblings></Siblings>
        </div>
      );
    }

    render(<Parent />, { legacyRoot: reactLegency });

    const objectText = screen.getByRole('object');
    const fieldText = screen.getByRole('field');
    const siblingsText = screen.getByRole('siblingsText');
    const parentText = screen.getByRole('parentText');
    const deleteOriginField = screen.getByRole('deleteOriginField');
    const deleteObjectField = screen.getByRole('deleteObjectField');

    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBe(initData.name);
    expect(siblingsText.innerHTML).toBe(initData.name);
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(deleteOriginField);
    delete initData.name;
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBeFalsy();
    expect(siblingsText.innerHTML).toBeFalsy();
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(deleteOriginField);
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(fieldText.innerHTML).toBeFalsy();
    expect(siblingsText.innerHTML).toBeFalsy();
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(deleteObjectField);
    expect(objectText.innerHTML).toBeFalsy();
    expect(fieldText.innerHTML).toBeFalsy();
    expect(siblingsText.innerHTML).toBeFalsy();
    expect(parentText.innerHTML).toBeFalsy();

    fireEvent.click(deleteObjectField);
    expect(objectText.innerHTML).toBeFalsy();
    expect(fieldText.innerHTML).toBeFalsy();
    expect(siblingsText.innerHTML).toBeFalsy();
    expect(parentText.innerHTML).toBeFalsy();
  });
  it('add new key', () => {
    const { initState } = initStore();

    const initData = JSON.parse(JSON.stringify(initState.type.object));
    const initTypeData = JSON.parse(JSON.stringify(initState.type));
    function Child() {
      let state = useStore();

      return (
        <div>
          <span role="object">{JSON.stringify(state.type.object)}</span>
          <span role="grandpa">{JSON.stringify(state.type)}</span>
          <button
            role="addNewKeyBtn"
            onClick={() => {
              state.type.object.newKey = 'newKey';
              dispatch();
            }}
          >
            add new key
          </button>
        </div>
      );
    }

    function Siblings() {
      let name = useStore(state => state.type.object.name);

      return (
        <div>
          <span role="siblingsText">{name}</span>
        </div>
      );
    }

    function Parent() {
      let obj = useStore(state => state.type.object);

      return (
        <div>
          <span role="parentText">{JSON.stringify(obj)}</span>
          <Child></Child>
          <Siblings></Siblings>
        </div>
      );
    }

    render(<Parent />, { legacyRoot: reactLegency });

    const objectText = screen.getByRole('object');
    const grandpaText = screen.getByRole('grandpa');
    const siblingsText = screen.getByRole('siblingsText');
    const parentText = screen.getByRole('parentText');
    const addNewKeyBtn = screen.getByRole('addNewKeyBtn');

    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(grandpaText.innerHTML).toBe(JSON.stringify(initTypeData));
    expect(siblingsText.innerHTML).toBe(initData.name);
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(addNewKeyBtn);
    initData.newKey = 'newKey';
    initTypeData.object.newKey = 'newKey';
    initTypeData;
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(grandpaText.innerHTML).toBe(JSON.stringify(initTypeData));
    expect(siblingsText.innerHTML).toBe(initData.name);
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(addNewKeyBtn);
    expect(objectText.innerHTML).toBe(JSON.stringify(initData));
    expect(grandpaText.innerHTML).toBe(JSON.stringify(initTypeData));
    expect(siblingsText.innerHTML).toBe(initData.name);
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));
  });
});
