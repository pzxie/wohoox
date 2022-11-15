import * as React from 'react';
import { fireEvent, cleanup, render, screen } from '@testing-library/react';

import createStore, { useStore, dispatch } from '../src';

const reactLegency = !!process.env.reactLegency;

function initStore(storeName?: string, options?: { strictMode?: boolean }) {
  const initState = {
    type: {
      number: 123,
      string: 'string',
      boolean: true,
      symbol: Symbol(123),
      null: null as null | boolean,
      undefined: undefined as undefined | boolean,
      object: {
        name: 'object',
        author: 'pzxie',
      },
      arrayOriginal: ['1', true, 3],
      arrayReference: [{ name: 'arrayObject' }, [11, 22, 33]] as [{ name: string }, Array<number>],
      set: new Set([1]),
      weakSet: new WeakSet(),
      map: new Map(),
      weakMap: new WeakMap(),
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

describe('single: origin type data', () => {
  it('string', () => {
    const { initState } = initStore();

    const initString = initState.type.string;
    function Child() {
      let state = useStore();

      return (
        <div>
          <span>{state.type.string}</span>
          <button
            onClick={() => {
              state.type.string += '_1';
              dispatch();
            }}
          >
            update string
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    expect(container.querySelector('span')?.innerHTML).toBe(initString);

    fireEvent.click(container.querySelector('button')!);
    expect(container.querySelector('span')?.innerHTML).toBe(initString + '_1');

    fireEvent.click(container.querySelector('button')!);
    expect(container.querySelector('span')?.innerHTML).toBe(initString + '_1_1');
  });

  it('number', () => {
    const { initState } = initStore();

    const initData = initState.type.number;
    function Child() {
      let state = useStore();

      return (
        <div>
          <span>{state.type.number}</span>
          <button
            onClick={() => {
              state.type.number += 1;
              dispatch();
            }}
          >
            update number
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    expect(container.querySelector('span')?.innerHTML).toBe(initData + '');

    fireEvent.click(container.querySelector('button')!);
    expect(container.querySelector('span')?.innerHTML).toBe(initData + 1 + '');

    fireEvent.click(container.querySelector('button')!);
    expect(container.querySelector('span')?.innerHTML).toBe(initData + 2 + '');
  });

  it('boolean', () => {
    const { initState } = initStore();

    const initData = initState.type.boolean;
    function Child() {
      let state = useStore();

      return (
        <div>
          <span>{state.type.boolean + ''}</span>
          <button
            onClick={() => {
              state.type.boolean = !state.type.boolean;
              dispatch();
            }}
          >
            update boolean
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    expect(container.querySelector('span')?.innerHTML).toBe(initData + '');

    fireEvent.click(container.querySelector('button')!);
    expect(container.querySelector('span')?.innerHTML).toBe(!initData + '');

    fireEvent.click(container.querySelector('button')!);
    expect(container.querySelector('span')?.innerHTML).toBe(initData + '');
  });

  it('null', () => {
    const { initState } = initStore();

    const initData = initState.type.null;
    function Child() {
      let state = useStore();

      return (
        <div>
          <span>{state.type.null + ''}</span>
          <button
            onClick={() => {
              state.type.null = state.type.null ? null : true;
              dispatch();
            }}
          >
            update null
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    expect(container.querySelector('span')?.innerHTML).toBe(initData + '');

    fireEvent.click(container.querySelector('button')!);
    expect(container.querySelector('span')?.innerHTML).toBe(true + '');

    fireEvent.click(container.querySelector('button')!);
    expect(container.querySelector('span')?.innerHTML).toBe(initData + '');
  });

  it('undefined', () => {
    const { initState } = initStore();

    const initData = initState.type.undefined;
    function Child() {
      let state = useStore();

      return (
        <div>
          <span>{state.type.undefined + ''}</span>
          <button
            onClick={() => {
              state.type.undefined = state.type.undefined ? undefined : true;
              dispatch();
            }}
          >
            update undefined
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    expect(container.querySelector('span')?.innerHTML).toBe(initData + '');

    fireEvent.click(container.querySelector('button')!);
    expect(container.querySelector('span')?.innerHTML).toBe(true + '');

    fireEvent.click(container.querySelector('button')!);
    expect(container.querySelector('span')?.innerHTML).toBe(initData + '');
  });

  it('symbol', () => {
    const { initState } = initStore();

    const initData = initState.type.symbol.toString();
    function Child() {
      let state = useStore();

      return (
        <div>
          <span>{state.type.symbol.toString()}</span>
          <button
            onClick={() => {
              state.type.symbol = Symbol(state.type.symbol.description + '_1');
              dispatch();
            }}
          >
            update symbol
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    expect(container.querySelector('span')?.innerHTML).toBe(initData);

    fireEvent.click(container.querySelector('button')!);
    expect(container.querySelector('span')?.innerHTML).toBe(initData.slice(0, -1) + '_1' + ')');

    fireEvent.click(container.querySelector('button')!);
    expect(container.querySelector('span')?.innerHTML).toBe(initData.slice(0, -1) + '_1_1' + ')');
  });
});

describe('single: plainObject', () => {
  it('modify', () => {
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
});

describe('single: Array', () => {
  it('value modify: original item', () => {
    const { initState } = initStore();

    const initData = JSON.parse(JSON.stringify(initState.type.arrayOriginal));
    function Child() {
      let state = useStore(state => state.type.arrayOriginal);
      let type = useStore(state => state.type);

      return (
        <div>
          <span role="string">{state[0]}</span>
          <span role="boolean">{state[1] + ''}</span>
          <span role="number">{state[2]}</span>

          <button
            role="updateString"
            onClick={() => {
              state[0] += '_string';
              dispatch();
            }}
          >
            update string
          </button>
          <button
            role="updateBoolean"
            onClick={() => {
              state[1] = !state[1];
              dispatch();
            }}
          >
            update boolean
          </button>
          <button
            role="updateNumber"
            onClick={() => {
              state[2] += 2;
              dispatch();
            }}
          >
            update number
          </button>
          <button
            role="updateArray"
            onClick={() => {
              type.arrayOriginal = ['3', true, 3];
              dispatch();
            }}
          >
            update number
          </button>
        </div>
      );
    }

    render(<Child />, { legacyRoot: reactLegency });

    const stringText = screen.getByRole('string');
    const booleanText = screen.getByRole('boolean');
    const numberText = screen.getByRole('number');
    const updateString = screen.getByRole('updateString');
    const updateBoolean = screen.getByRole('updateBoolean');
    const updateNumber = screen.getByRole('updateNumber');
    const updateArray = screen.getByRole('updateArray');

    expect(stringText.innerHTML).toBe(initData[0]);
    expect(booleanText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(numberText.innerHTML).toBe(JSON.stringify(initData[2]));

    fireEvent.click(updateString);
    initData[0] += '_string';
    expect(stringText.innerHTML).toBe(initData[0]);
    expect(booleanText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(numberText.innerHTML).toBe(JSON.stringify(initData[2]));

    fireEvent.click(updateBoolean);
    initData[1] = !initData[1];
    expect(stringText.innerHTML).toBe(initData[0]);
    expect(booleanText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(numberText.innerHTML).toBe(JSON.stringify(initData[2]));

    fireEvent.click(updateNumber);
    initData[2] += 2;
    expect(stringText.innerHTML).toBe(initData[0]);
    expect(booleanText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(numberText.innerHTML).toBe(JSON.stringify(initData[2]));

    fireEvent.click(updateArray);
    expect(stringText.innerHTML).toBe('3');
    expect(booleanText.innerHTML).toBe(JSON.stringify(true));
    expect(numberText.innerHTML).toBe('3');
  });

  it('value modify: reference item', () => {
    const { initState } = initStore();

    const initData = JSON.parse(JSON.stringify(initState.type.arrayReference));
    function Child() {
      let state = useStore(state => state.type.arrayReference);
      let type = useStore(state => state.type);

      return (
        <div>
          <span role="object">{JSON.stringify(state[0])}</span>
          <span role="objectField">{state[0]?.name}</span>
          <span role="array">{JSON.stringify(state[1])}</span>
          <span role="array1">{state[1] ? state[1][1] : ''}</span>

          <button
            role="updateObjectReference"
            onClick={() => {
              state[0] = { ...state[0], name: state[0].name + '_object' };
              dispatch();
            }}
          >
            update object reference
          </button>
          <button
            role="updateObjectField"
            onClick={() => {
              state[0].name += '_field';
              dispatch();
            }}
          >
            update object field
          </button>
          <button
            role="updateArrayReference"
            onClick={() => {
              state[1] = [state[1][0] + 1, state[1][1] + 2, state[1][2] + 3];
              dispatch();
            }}
          >
            update array reference
          </button>
          <button
            role="updateArrayItem"
            onClick={() => {
              state[1][1] += 3;
              dispatch();
            }}
          >
            update array item
          </button>
          <button
            role="updateArrayLengthToZero"
            onClick={() => {
              state.length = 0;
              dispatch();
            }}
          >
            update array length to 0
          </button>

          <button
            role="updateArrayLengthToTwo"
            onClick={() => {
              state.length = 2;
              dispatch();
            }}
          >
            update array length to 2
          </button>

          <button
            role="updateArraySelf"
            onClick={() => {
              type.arrayReference = [{}, []];
              dispatch();
            }}
          >
            update array self address
          </button>
        </div>
      );
    }

    render(<Child />, { legacyRoot: reactLegency });

    const objectText = screen.getByRole('object');
    const objectFieldText = screen.getByRole('objectField');
    const arrayText = screen.getByRole('array');
    const arrayItemText = screen.getByRole('array1');
    const updateObjectReference = screen.getByRole('updateObjectReference');
    const updateObjectField = screen.getByRole('updateObjectField');
    const updateArrayReference = screen.getByRole('updateArrayReference');
    const updateArrayItem = screen.getByRole('updateArrayItem');
    const updateArrayLengthToZero = screen.getByRole('updateArrayLengthToZero');
    const updateArrayLengthToTwo = screen.getByRole('updateArrayLengthToTwo');
    const updateArraySelf = screen.getByRole('updateArraySelf');

    expect(objectText.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(objectFieldText.innerHTML).toBe(initData[0].name);
    expect(arrayText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arrayItemText.innerHTML).toBe(initData[1][1] + '');

    fireEvent.click(updateObjectReference);
    initData[0].name += '_object';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(objectFieldText.innerHTML).toBe(initData[0].name);
    expect(arrayText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arrayItemText.innerHTML).toBe(initData[1][1] + '');

    fireEvent.click(updateObjectField);
    initData[0].name += '_field';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(objectFieldText.innerHTML).toBe(initData[0].name);
    expect(arrayText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arrayItemText.innerHTML).toBe(initData[1][1] + '');

    fireEvent.click(updateArrayReference);
    initData[1] = [initData[1][0] + 1, initData[1][1] + 2, initData[1][2] + 3];
    expect(objectText.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(objectFieldText.innerHTML).toBe(initData[0].name);
    expect(arrayText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arrayItemText.innerHTML).toBe(initData[1][1] + '');

    fireEvent.click(updateArrayItem);
    initData[1][1] += 3;
    expect(objectText.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(objectFieldText.innerHTML).toBe(initData[0].name);
    expect(arrayText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arrayItemText.innerHTML).toBe(initData[1][1] + '');

    fireEvent.click(updateArrayLengthToZero);
    expect(objectText.innerHTML).toBeFalsy();
    expect(objectFieldText.innerHTML).toBeFalsy();
    expect(arrayText.innerHTML).toBeFalsy();
    expect(arrayItemText.innerHTML).toBeFalsy();

    fireEvent.click(updateArrayLengthToTwo);
    expect(objectText.innerHTML).toBeFalsy();
    expect(objectFieldText.innerHTML).toBeFalsy();
    expect(arrayText.innerHTML).toBeFalsy();
    expect(arrayItemText.innerHTML).toBeFalsy();

    fireEvent.click(updateArraySelf);
    expect(objectText.innerHTML).toBe(JSON.stringify({}));
    expect(objectFieldText.innerHTML).toBeFalsy();
    expect(arrayText.innerHTML).toBe(JSON.stringify([]));
    expect(arrayItemText.innerHTML).toBeFalsy();
  });

  it('methods call', () => {
    const { initState } = initStore();

    const initData = JSON.parse(JSON.stringify(initState.type.arrayOriginal));
    function Child() {
      let state = useStore(state => state.type.arrayOriginal);
      let type = useStore(state => state.type);

      return (
        <div>
          <span role="arr0">{state[0] + ''}</span>
          <span role="arr1">{state[1] + ''}</span>
          <span role="arr2">{state[2] + ''}</span>
          <span role="arr3">{state[3] + ''}</span>
          <span role="arr4">{state[4] + ''}</span>

          <button
            role="push"
            onClick={() => {
              type.arrayOriginal.push(2);
              dispatch();
            }}
          >
            push
          </button>
          <button
            role="unshift"
            onClick={() => {
              type.arrayOriginal.unshift(5);
              dispatch();
            }}
          >
            unshift
          </button>
          <button
            role="pop"
            onClick={() => {
              type.arrayOriginal.pop();
              dispatch();
            }}
          >
            pop
          </button>
          <button
            role="shift"
            onClick={() => {
              type.arrayOriginal.shift();
              dispatch();
            }}
          >
            shift
          </button>
          <button
            role="reverse"
            onClick={() => {
              type.arrayOriginal.reverse();
              dispatch();
            }}
          >
            reverse
          </button>
          <button
            role="sort"
            onClick={() => {
              type.arrayOriginal.sort();
              dispatch();
            }}
          >
            sort
          </button>
          <button
            role="spliceDelete"
            onClick={() => {
              type.arrayOriginal.splice(1, 1);
              dispatch();
            }}
          >
            splice to delete index 1
          </button>

          <button
            role="spliceInsert"
            onClick={() => {
              type.arrayOriginal.splice(1, 0, 'splice');
              dispatch();
            }}
          >
            splice to insert index 1
          </button>
        </div>
      );
    }

    render(<Child />, { legacyRoot: reactLegency });

    const arr0Text = screen.getByRole('arr0');
    const arr1Text = screen.getByRole('arr1');
    const arr2Text = screen.getByRole('arr2');
    const arr3Text = screen.getByRole('arr3');
    const arr4Text = screen.getByRole('arr4');

    const push = screen.getByRole('push');
    const unshift = screen.getByRole('unshift');
    const pop = screen.getByRole('pop');
    const shift = screen.getByRole('shift');
    const reverse = screen.getByRole('reverse');
    const sort = screen.getByRole('sort');
    const spliceDelete = screen.getByRole('spliceDelete');
    const spliceInsert = screen.getByRole('spliceInsert');

    expect(arr0Text.innerHTML).toBe(initData[0]);
    expect(arr1Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arr2Text.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(arr3Text.innerHTML).toBe('undefined');
    expect(arr4Text.innerHTML).toBe('undefined');

    fireEvent.click(push);
    expect(arr0Text.innerHTML).toBe(initData[0]);
    expect(arr1Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arr2Text.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(arr3Text.innerHTML).toBe('2');
    expect(arr4Text.innerHTML).toBe('undefined');

    fireEvent.click(unshift);
    expect(arr0Text.innerHTML).toBe('5');
    expect(arr1Text.innerHTML).toBe(initData[0]);
    expect(arr2Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arr3Text.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(arr4Text.innerHTML).toBe('2');

    fireEvent.click(pop);
    expect(arr0Text.innerHTML).toBe('5');
    expect(arr1Text.innerHTML).toBe(initData[0]);
    expect(arr2Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arr3Text.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(arr4Text.innerHTML).toBe('undefined');

    fireEvent.click(shift);
    expect(arr0Text.innerHTML).toBe(initData[0]);
    expect(arr1Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arr2Text.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(arr3Text.innerHTML).toBe('undefined');
    expect(arr4Text.innerHTML).toBe('undefined');

    fireEvent.click(reverse);
    expect(arr0Text.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(arr1Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arr2Text.innerHTML).toBe(initData[0]);
    expect(arr3Text.innerHTML).toBe('undefined');
    expect(arr4Text.innerHTML).toBe('undefined');

    fireEvent.click(sort);
    expect(arr0Text.innerHTML).toBe(initData[0]);
    expect(arr1Text.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(arr2Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arr3Text.innerHTML).toBe('undefined');
    expect(arr4Text.innerHTML).toBe('undefined');

    fireEvent.click(spliceDelete);
    expect(arr0Text.innerHTML).toBe(initData[0]);
    expect(arr1Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arr2Text.innerHTML).toBe('undefined');
    expect(arr3Text.innerHTML).toBe('undefined');
    expect(arr4Text.innerHTML).toBe('undefined');

    fireEvent.click(spliceInsert);
    expect(arr0Text.innerHTML).toBe(initData[0]);
    expect(arr1Text.innerHTML).toBe('splice');
    expect(arr2Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arr3Text.innerHTML).toBe('undefined');
    expect(arr4Text.innerHTML).toBe('undefined');
  });
});

describe('multi: origin type data', () => {
  it('string', () => {
    const { initState } = initStore();

    let initString = initState.type.string;
    function Child() {
      let state = useStore();

      return (
        <div>
          <span role="childText">{state.type.string}</span>
          <button
            role="updateBtn"
            onClick={() => {
              state.type.string += '_1';
              dispatch();
            }}
          >
            update string
          </button>
        </div>
      );
    }

    function Siblings() {
      let state = useStore();

      return (
        <div>
          <span role="siblingsText">{state.type.string}</span>
        </div>
      );
    }

    function Parent() {
      let state = useStore();
      return (
        <div>
          <span role="parentText">{state.type.string}</span>
          <button
            role="updateFromParentBtn"
            onClick={() => {
              state.type.string += '_2';
              dispatch();
            }}
          >
            update string
          </button>
          <Child></Child>
          <Siblings></Siblings>
        </div>
      );
    }

    render(<Parent />, { legacyRoot: reactLegency });

    const childText = screen.getByRole('childText');
    const siblingsText = screen.getByRole('siblingsText');
    const parentText = screen.getByRole('parentText');
    const updateBtn = screen.getByRole('updateBtn');
    const updateFromParentBtn = screen.getByRole('updateFromParentBtn');

    expect(childText.innerHTML).toBe(initString);
    expect(siblingsText.innerHTML).toBe(initString);
    expect(parentText.innerHTML).toBe(initString);

    fireEvent.click(updateBtn);
    initString += '_1';
    expect(childText.innerHTML).toBe(initString);
    expect(siblingsText.innerHTML).toBe(initString);
    expect(parentText.innerHTML).toBe(initString);

    fireEvent.click(updateFromParentBtn);
    initString += '_2';
    expect(childText.innerHTML).toBe(initString);
    expect(siblingsText.innerHTML).toBe(initString);
    expect(parentText.innerHTML).toBe(initString);

    fireEvent.click(updateBtn);
    initString += '_1';
    expect(childText.innerHTML).toBe(initString);
    expect(siblingsText.innerHTML).toBe(initString);
    expect(parentText.innerHTML).toBe(initString);

    fireEvent.click(updateBtn);
    initString += '_1';
    expect(childText.innerHTML).toBe(initString);
    expect(siblingsText.innerHTML).toBe(initString);
    expect(parentText.innerHTML).toBe(initString);
  });
});

describe('multi: plainObject', () => {
  it('modify', () => {
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
});

describe('multi: Array', () => {
  it('value modify: original item', () => {
    const { initState } = initStore();

    const initData = JSON.parse(JSON.stringify(initState.type.arrayOriginal));
    function Child() {
      let state = useStore(state => state.type.arrayOriginal);
      let type = useStore(state => state.type);

      return (
        <div>
          <span role="string">{state[0]}</span>
          <span role="boolean">{state[1] + ''}</span>
          <span role="number">{state[2]}</span>

          <button
            role="updateString"
            onClick={() => {
              state[0] += '_string';
              dispatch();
            }}
          >
            update string
          </button>
          <button
            role="updateBoolean"
            onClick={() => {
              state[1] = !state[1];
              dispatch();
            }}
          >
            update boolean
          </button>
          <button
            role="updateNumber"
            onClick={() => {
              state[2] += 2;
              dispatch();
            }}
          >
            update number
          </button>
          <button
            role="updateArray"
            onClick={() => {
              type.arrayOriginal = ['3', true, 3];
              dispatch();
            }}
          >
            update number
          </button>
        </div>
      );
    }

    function Siblings() {
      let array1 = useStore(state => state.type.arrayOriginal[1]);

      return (
        <div>
          <span role="array1Text">{array1 + ''}</span>
        </div>
      );
    }

    function Parent() {
      let state = useStore(state => state.type);

      return (
        <div>
          <span role="parentText">{JSON.stringify(state.arrayOriginal)}</span>
          <Child></Child>
          <Siblings></Siblings>
        </div>
      );
    }

    render(<Parent />, { legacyRoot: reactLegency });

    const stringText = screen.getByRole('string');
    const booleanText = screen.getByRole('boolean');
    const numberText = screen.getByRole('number');
    const array1Text = screen.getByRole('array1Text');
    const parentText = screen.getByRole('parentText');
    const updateString = screen.getByRole('updateString');
    const updateBoolean = screen.getByRole('updateBoolean');
    const updateNumber = screen.getByRole('updateNumber');
    const updateArray = screen.getByRole('updateArray');

    expect(stringText.innerHTML).toBe(initData[0]);
    expect(booleanText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(numberText.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(array1Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(updateString);
    initData[0] += '_string';
    expect(stringText.innerHTML).toBe(initData[0]);
    expect(booleanText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(numberText.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(array1Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(updateBoolean);
    initData[1] = !initData[1];
    expect(stringText.innerHTML).toBe(initData[0]);
    expect(booleanText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(numberText.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(array1Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(updateNumber);
    initData[2] += 2;
    expect(stringText.innerHTML).toBe(initData[0]);
    expect(booleanText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(numberText.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(array1Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(updateArray);
    expect(stringText.innerHTML).toBe('3');
    expect(booleanText.innerHTML).toBe(JSON.stringify(true));
    expect(numberText.innerHTML).toBe('3');
    expect(array1Text.innerHTML).toBe(JSON.stringify(true));
    expect(parentText.innerHTML).toBe(JSON.stringify(['3', true, 3]));
  });

  it('value modify: reference item', () => {
    const { initState } = initStore();

    const initData = JSON.parse(JSON.stringify(initState.type.arrayReference));
    function Child() {
      let state = useStore(state => state.type.arrayReference);
      let type = useStore(state => state.type);

      return (
        <div>
          <span role="object">{JSON.stringify(state[0])}</span>
          <span role="objectField">{state[0]?.name}</span>
          <span role="array">{JSON.stringify(state[1])}</span>
          <span role="array1">{state[1] ? state[1][1] : ''}</span>

          <button
            role="updateObjectReference"
            onClick={() => {
              state[0] = { ...state[0], name: state[0].name + '_object' };
              dispatch();
            }}
          >
            update object reference
          </button>
          <button
            role="updateObjectField"
            onClick={() => {
              state[0].name += '_field';
              dispatch();
            }}
          >
            update object field
          </button>
          <button
            role="updateArrayReference"
            onClick={() => {
              state[1] = [state[1][0] + 1, state[1][1] + 2, state[1][2] + 3];
              dispatch();
            }}
          >
            update array reference
          </button>
          <button
            role="updateArrayItem"
            onClick={() => {
              state[1][1] += 3;
              dispatch();
            }}
          >
            update array item
          </button>
          <button
            role="updateArrayLengthToZero"
            onClick={() => {
              state.length = 0;
              dispatch();
            }}
          >
            update array length to 0
          </button>

          <button
            role="updateArrayLengthToTwo"
            onClick={() => {
              state.length = 2;
              dispatch();
            }}
          >
            update array length to 2
          </button>

          <button
            role="updateArraySelf"
            onClick={() => {
              type.arrayReference = [{}, []];
              dispatch();
            }}
          >
            update array self address
          </button>
        </div>
      );
    }

    function Siblings() {
      let obj = useStore(state => state.type.arrayReference[0]);

      return (
        <div>
          <span role="siblingsText">{obj?.name}</span>
        </div>
      );
    }

    function Parent() {
      let state = useStore(state => state.type.arrayReference);

      return (
        <div>
          <span role="parentText">{JSON.stringify(state[1])}</span>
          <Child></Child>
          <Siblings></Siblings>
        </div>
      );
    }

    render(<Parent />, { legacyRoot: reactLegency });

    const objectText = screen.getByRole('object');
    const objectFieldText = screen.getByRole('objectField');
    const arrayText = screen.getByRole('array');
    const arrayItemText = screen.getByRole('array1');
    const siblingsText = screen.getByRole('siblingsText');
    const parentText = screen.getByRole('parentText');
    const updateObjectReference = screen.getByRole('updateObjectReference');
    const updateObjectField = screen.getByRole('updateObjectField');
    const updateArrayReference = screen.getByRole('updateArrayReference');
    const updateArrayItem = screen.getByRole('updateArrayItem');
    const updateArrayLengthToZero = screen.getByRole('updateArrayLengthToZero');
    const updateArrayLengthToTwo = screen.getByRole('updateArrayLengthToTwo');
    const updateArraySelf = screen.getByRole('updateArraySelf');

    expect(objectText.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(objectFieldText.innerHTML).toBe(initData[0].name);
    expect(arrayText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arrayItemText.innerHTML).toBe(initData[1][1] + '');
    expect(siblingsText.innerHTML).toBe(initData[0].name);
    expect(parentText.innerHTML).toBe(JSON.stringify(initData[1]));

    fireEvent.click(updateObjectReference);
    initData[0].name += '_object';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(objectFieldText.innerHTML).toBe(initData[0].name);
    expect(arrayText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arrayItemText.innerHTML).toBe(initData[1][1] + '');
    expect(siblingsText.innerHTML).toBe(initData[0].name);
    expect(parentText.innerHTML).toBe(JSON.stringify(initData[1]));

    fireEvent.click(updateObjectField);
    initData[0].name += '_field';
    expect(objectText.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(objectFieldText.innerHTML).toBe(initData[0].name);
    expect(arrayText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arrayItemText.innerHTML).toBe(initData[1][1] + '');
    expect(siblingsText.innerHTML).toBe(initData[0].name);
    expect(parentText.innerHTML).toBe(JSON.stringify(initData[1]));

    fireEvent.click(updateArrayReference);
    initData[1] = [initData[1][0] + 1, initData[1][1] + 2, initData[1][2] + 3];
    expect(objectText.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(objectFieldText.innerHTML).toBe(initData[0].name);
    expect(arrayText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arrayItemText.innerHTML).toBe(initData[1][1] + '');
    expect(siblingsText.innerHTML).toBe(initData[0].name);
    expect(parentText.innerHTML).toBe(JSON.stringify(initData[1]));

    fireEvent.click(updateArrayItem);
    initData[1][1] += 3;
    expect(objectText.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(objectFieldText.innerHTML).toBe(initData[0].name);
    expect(arrayText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arrayItemText.innerHTML).toBe(initData[1][1] + '');
    expect(siblingsText.innerHTML).toBe(initData[0].name);
    expect(parentText.innerHTML).toBe(JSON.stringify(initData[1]));

    fireEvent.click(updateArrayLengthToZero);
    expect(objectText.innerHTML).toBeFalsy();
    expect(objectFieldText.innerHTML).toBeFalsy();
    expect(arrayText.innerHTML).toBeFalsy();
    expect(arrayItemText.innerHTML).toBeFalsy();
    expect(siblingsText.innerHTML).toBeFalsy();
    expect(parentText.innerHTML).toBeFalsy();

    fireEvent.click(updateArrayLengthToTwo);
    expect(objectText.innerHTML).toBeFalsy();
    expect(objectFieldText.innerHTML).toBeFalsy();
    expect(arrayText.innerHTML).toBeFalsy();
    expect(arrayItemText.innerHTML).toBeFalsy();
    expect(siblingsText.innerHTML).toBeFalsy();
    expect(parentText.innerHTML).toBeFalsy();

    fireEvent.click(updateArraySelf);
    expect(objectText.innerHTML).toBe(JSON.stringify({}));
    expect(objectFieldText.innerHTML).toBeFalsy();
    expect(arrayText.innerHTML).toBe(JSON.stringify([]));
    expect(arrayItemText.innerHTML).toBeFalsy();
    expect(siblingsText.innerHTML).toBeFalsy();
    expect(parentText.innerHTML).toBe(JSON.stringify([]));
  });

  it('methods call', () => {
    const { initState } = initStore();

    const initData = JSON.parse(JSON.stringify(initState.type.arrayReference[1]));
    function Child() {
      let state = useStore(state => state.type.arrayReference[1]);
      let type = useStore(state => state.type);

      return (
        <div>
          <span role="arr0">{state[0] + ''}</span>
          <span role="arr1">{state[1] + ''}</span>
          <span role="arr2">{state[2] + ''}</span>
          <span role="arr3">{state[3] + ''}</span>
          <span role="arr4">{state[4] + ''}</span>

          <button
            role="push"
            onClick={() => {
              type.arrayReference[1].push(2);
              dispatch();
            }}
          >
            push
          </button>
          <button
            role="unshift"
            onClick={() => {
              type.arrayReference[1].unshift(5);
              dispatch();
            }}
          >
            unshift
          </button>
          <button
            role="pop"
            onClick={() => {
              type.arrayReference[1].pop();
              dispatch();
            }}
          >
            pop
          </button>
          <button
            role="shift"
            onClick={() => {
              type.arrayReference[1].shift();
              dispatch();
            }}
          >
            shift
          </button>
          <button
            role="reverse"
            onClick={() => {
              type.arrayReference[1].reverse();
              dispatch();
            }}
          >
            reverse
          </button>
          <button
            role="sort"
            onClick={() => {
              type.arrayReference[1].sort();
              dispatch();
            }}
          >
            sort
          </button>
          <button
            role="spliceDelete"
            onClick={() => {
              type.arrayReference[1].splice(1, 1);
              dispatch();
            }}
          >
            splice to delete index 1
          </button>

          <button
            role="spliceInsert"
            onClick={() => {
              type.arrayReference[1].splice(1, 0, 'splice');
              dispatch();
            }}
          >
            splice to insert index 1
          </button>
        </div>
      );
    }

    function Siblings() {
      let arr = useStore(state => state.type.arrayReference[1]);

      return (
        <div>
          <span role="siblingsText">{arr[1]}</span>
        </div>
      );
    }

    function Parent() {
      let state = useStore(state => state.type.arrayReference);

      return (
        <div>
          <span role="parentText">{JSON.stringify(state[1])}</span>
          <Child></Child>
          <Siblings></Siblings>
        </div>
      );
    }

    render(<Parent />, { legacyRoot: reactLegency });

    const arr0Text = screen.getByRole('arr0');
    const arr1Text = screen.getByRole('arr1');
    const arr2Text = screen.getByRole('arr2');
    const arr3Text = screen.getByRole('arr3');
    const arr4Text = screen.getByRole('arr4');
    const siblingsText = screen.getByRole('siblingsText');
    const parentText = screen.getByRole('parentText');

    const push = screen.getByRole('push');
    const unshift = screen.getByRole('unshift');
    const pop = screen.getByRole('pop');
    const shift = screen.getByRole('shift');
    const reverse = screen.getByRole('reverse');
    const sort = screen.getByRole('sort');
    const spliceDelete = screen.getByRole('spliceDelete');
    const spliceInsert = screen.getByRole('spliceInsert');

    expect(arr0Text.innerHTML).toBe(initData[0] + '');
    expect(arr1Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arr2Text.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(arr3Text.innerHTML).toBe('undefined');
    expect(arr4Text.innerHTML).toBe('undefined');
    expect(siblingsText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(push);
    expect(arr0Text.innerHTML).toBe(initData[0] + '');
    expect(arr1Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arr2Text.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(arr3Text.innerHTML).toBe('2');
    expect(arr4Text.innerHTML).toBe('undefined');
    expect(siblingsText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(parentText.innerHTML).toBe(JSON.stringify([...initData, 2]));

    fireEvent.click(unshift);
    expect(arr0Text.innerHTML).toBe('5');
    expect(arr1Text.innerHTML).toBe(JSON.stringify(initData[0]) + '');
    expect(arr2Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arr3Text.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(arr4Text.innerHTML).toBe('2');
    expect(siblingsText.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(parentText.innerHTML).toBe(JSON.stringify([5, ...initData, 2]));

    fireEvent.click(pop);
    expect(arr0Text.innerHTML).toBe('5');
    expect(arr1Text.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(arr2Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arr3Text.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(arr4Text.innerHTML).toBe('undefined');
    expect(siblingsText.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(parentText.innerHTML).toBe(JSON.stringify([5, ...initData]));

    fireEvent.click(shift);
    expect(arr0Text.innerHTML).toBe(initData[0] + '');
    expect(arr1Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arr2Text.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(arr3Text.innerHTML).toBe('undefined');
    expect(arr4Text.innerHTML).toBe('undefined');
    expect(siblingsText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(reverse);
    expect(arr0Text.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(arr1Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arr2Text.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(arr3Text.innerHTML).toBe('undefined');
    expect(arr4Text.innerHTML).toBe('undefined');
    expect(siblingsText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(parentText.innerHTML).toBe(JSON.stringify(initData.reverse()));

    fireEvent.click(sort);
    initData.sort()
    expect(arr0Text.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(arr1Text.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(arr2Text.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(arr3Text.innerHTML).toBe('undefined');
    expect(arr4Text.innerHTML).toBe('undefined');
    expect(siblingsText.innerHTML).toBe(JSON.stringify(initData[1]));
    expect(parentText.innerHTML).toBe(JSON.stringify(initData));

    fireEvent.click(spliceDelete);
    expect(arr0Text.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(arr1Text.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(arr2Text.innerHTML).toBe('undefined');
    expect(arr3Text.innerHTML).toBe('undefined');
    expect(arr4Text.innerHTML).toBe('undefined');
    expect(siblingsText.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(parentText.innerHTML).toBe(JSON.stringify([initData[0], initData[2]]));

    fireEvent.click(spliceInsert);
    expect(arr0Text.innerHTML).toBe(JSON.stringify(initData[0]));
    expect(arr1Text.innerHTML).toBe('splice');
    expect(arr2Text.innerHTML).toBe(JSON.stringify(initData[2]));
    expect(arr3Text.innerHTML).toBe('undefined');
    expect(arr4Text.innerHTML).toBe('undefined');
    expect(siblingsText.innerHTML).toBe('splice');
    expect(parentText.innerHTML).toBe(JSON.stringify([initData[0], 'splice', initData[2]]));
  });
});
