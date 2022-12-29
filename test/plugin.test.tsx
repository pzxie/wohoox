import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import createStore, { useStore } from '../src/index';

import { pluginsMap } from '../src/core/plugin';

const reactLegency = !!process.env.reactLegency;

beforeEach(() => {
  cleanup();
  pluginsMap.clear();
});

it('plugin: init', () => {
  createStore({
    initState: {
      name: 'wohoox',
    },
    plugins: [{}, {}],
    options: { strictMode: false },
  });

  expect(pluginsMap.get('default')?.length).toBe(2);
});

it('plugin: beforeInit', () => {
  const store = createStore({
    initState: {
      name: 'wohoox',
    },
    plugins: [
      {
        beforeInit(initState, actions) {
          return {
            initState: {
              ...initState,
              type: 'beforeInit',
            },
            actions: {
              ...actions,
              updateType(state, type) {
                state.type = type;
              },
            },
          };
        },
      },
      {},
    ],
    options: { strictMode: false },
  });

  expect(store.state).toHaveProperty('type');
  expect((store.state as any).type).toBe('beforeInit');
  expect(store.actions).toHaveProperty('updateType');

  (store.actions as any).updateType('updated');

  expect((store.state as any).type).toBe('updated');
});

it('plugin: onInit', () => {
  let s;

  createStore({
    initState: {
      name: 'wohoox',
    },
    plugins: [
      {
        onInit(store) {
          s = store;
        },
      },
      {},
    ],
    options: { strictMode: false },
  });

  expect(s).toHaveProperty('name');
  expect(s).toHaveProperty('state');
  expect(s).toHaveProperty('actions');
  expect(s.state.name).toBe('wohoox');
});

it('plugin:js: onAdd', () => {
  let logs: any[] = [];

  const store = createStore({
    initState: {
      name: 'wohoox',
    },
    plugins: [
      {
        onAdd(name, value, keys) {
          logs.push([name, value, keys]);
        },
      },
      {},
    ],
    options: { strictMode: false },
  });

  expect(logs.length).toBe(0);
  (store.state as any).type = 'onAdd';
  expect(logs.length).toBe(1);
  expect(logs[0][0]).toBe('default');
  expect(logs[0][1]).toBe('onAdd');
  expect(logs[0][2].toString()).toBe('type');
  (store.state as any).other = 'other';
  expect(logs.length).toBe(2);
});

it('plugin:js: onDelete', () => {
  let logs: any[] = [];

  const store = createStore({
    initState: {
      name: 'wohoox',
    },
    plugins: [
      {
        onDelete(name, keys) {
          logs.push([name, keys]);
        },
      },
      {},
    ],
    options: { strictMode: false },
  });

  expect(logs.length).toBe(0);
  expect(store.state.name).toBe('wohoox');

  delete (store.state as any).name;
  expect(logs.length).toBe(1);
  expect(logs[0][0]).toBe('default');
  expect(logs[0][1].toString()).toBe('name');

  expect(store.state.name).toBeFalsy();
});

it('plugin:js: onChange', () => {
  let logs: any[] = [];

  const store = createStore({
    initState: {
      name: 'wohoox',
    },
    plugins: [
      {
        onChange(name, value, keys, oldValue) {
          logs.push([name, value, keys, oldValue]);
        },
      },
      {},
    ],
    options: { strictMode: false },
  });

  expect(logs.length).toBe(0);
  store.state.name = 'update';
  expect(logs.length).toBe(1);
  expect(logs[0][0]).toBe('default');
  expect(logs[0][1]).toBe('update');
  expect(logs[0][2].toString()).toBe('name');
  expect(logs[0][3]).toBe('wohoox');
  expect(store.state.name).toBe('update');

  (store.state as any).type = 'onAdd';
  expect(logs.length).toBe(1);
});

it('plugin:js: onGet', () => {
  let logs: any[] = [];

  const store = createStore({
    initState: {
      name: 'wohoox',
    },
    plugins: [
      {
        onGet(name, value, keys) {
          logs.push([name, value, keys]);
        },
      },
      {},
    ],
    options: { strictMode: false },
  });

  expect(logs.length).toBe(0);
  expect(store.state.name).toBe('wohoox');
  expect(logs.length).toBe(1);

  expect(logs[0][0]).toBe('default');
  expect(logs[0][1]).toBe('wohoox');
  expect(logs[0][2].toString()).toBe('name');

  console.log(store.state.name);
  expect(logs.length).toBe(2);

  expect(logs[1][0]).toBe('default');
  expect(logs[1][1]).toBe('wohoox');
  expect(logs[1][2].toString()).toBe('name');
});

it('plugin:hooks: onAdd', () => {
  let logs: any[] = [];

  const store = createStore({
    initState: {
      obj: {
        name: 'wohoox',
      },
    },
    actions: {
      addType(state, type) {
        (state.obj as any).type = type;
      },
    },
    plugins: [
      {
        onAdd(name, value, keys) {
          logs.push([name, value, keys]);
        },
      },
      {},
    ],
    options: { strictMode: false },
  });

  function Parent() {
    let obj = useStore(state => state.obj);

    return (
      <div>
        <div role="text">{obj.type}</div>
        <button
          role="addBtn"
          onClick={() => {
            store.actions.addType('onAdd');
          }}
        >
          add
        </button>
        <button
          role="addExpression"
          onClick={() => {
            obj.addExpression = 'addExpressionValue';
          }}
        >
          addExpression
        </button>
      </div>
    );
  }

  render(<Parent />, { legacyRoot: reactLegency });

  expect(logs.length).toBe(0);

  fireEvent.click(screen.getByRole('addBtn'));

  expect(logs.length).toBe(1);
  expect(logs[0][0]).toBe('default');
  expect(logs[0][1]).toBe('onAdd');
  expect(logs[0][2].join('.')).toBe('obj.type');

  fireEvent.click(screen.getByRole('addExpression'));
  expect(logs.length).toBe(2);
  expect(logs[1][0]).toBe('default');
  expect(logs[1][1]).toBe('addExpressionValue');
  expect(logs[1][2].join('.')).toBe('obj.addExpression');
});

it('plugin:hooks: onDelete', () => {
  let logs: any[] = [];

  const store = createStore({
    initState: {
      obj: {
        name: 'wohoox',
        version: '1.x',
      },
    },
    actions: {
      deleteName(state) {
        delete (state.obj as any).name;
      },
    },
    plugins: [
      {
        onDelete(name, keys) {
          logs.push([name, keys]);
        },
      },
      {},
    ],
    options: { strictMode: false },
  });

  function Parent() {
    let obj = useStore(state => state.obj);

    return (
      <div>
        <div role="text">{obj.type}</div>
        <button
          role="deleteBtn"
          onClick={() => {
            store.actions.deleteName();
          }}
        >
          add
        </button>
        <button
          role="deleteExpression"
          onClick={() => {
            delete obj.version;
          }}
        >
          deleteExpression
        </button>
      </div>
    );
  }

  render(<Parent />, { legacyRoot: reactLegency });

  expect(logs.length).toBe(0);

  fireEvent.click(screen.getByRole('deleteBtn'));

  expect(logs.length).toBe(1);
  expect(logs[0][0]).toBe('default');
  expect(logs[0][1].join('.')).toBe('obj.name');

  fireEvent.click(screen.getByRole('deleteExpression'));
  expect(logs.length).toBe(2);
  expect(logs[1][0]).toBe('default');
  expect(logs[1][1].join('.')).toBe('obj.version');
});

it('plugin:hooks: onChange', () => {
  let logs: any[] = [];

  const store = createStore({
    initState: {
      obj: {
        name: 'wohoox',
        version: '1.x',
      },
    },
    actions: {
      updateName(state, name) {
        state.obj.name = name;
      },
    },
    plugins: [
      {
        onChange(name, value, keys, oldValue) {
          logs.push([name, value, keys, oldValue]);
        },
      },
      {},
    ],
    options: { strictMode: false },
  });

  function Parent() {
    let obj = useStore(state => state.obj);

    return (
      <div>
        <div role="text">{obj.type}</div>
        <button
          role="update"
          onClick={() => {
            store.actions.updateName('update');
          }}
        >
          add
        </button>
        <button
          role="updateExpression"
          onClick={() => {
            obj.name = 'updateExpression';
          }}
        >
          updateExpression
        </button>
      </div>
    );
  }

  render(<Parent />, { legacyRoot: reactLegency });

  expect(logs.length).toBe(0);

  fireEvent.click(screen.getByRole('update'));

  expect(logs.length).toBe(1);
  expect(logs[0][0]).toBe('default');
  expect(logs[0][1]).toBe('update');
  expect(logs[0][2].join('.')).toBe('obj.name');
  expect(logs[0][3]).toBe('wohoox');

  fireEvent.click(screen.getByRole('updateExpression'));
  expect(logs.length).toBe(2);
  expect(logs[1][0]).toBe('default');
  expect(logs[1][1]).toBe('updateExpression');
  expect(logs[1][2].join('.')).toBe('obj.name');
  expect(logs[1][3]).toBe('update');
});

it('plugin:hooks: onGet', () => {
  let logs: any[] = [];

  const store = createStore({
    initState: {
      obj: {
        name: 'wohoox',
      },
    },
    actions: {
      updateName(state, name) {
        state.obj = { name };
      },
    },
    plugins: [
      {
        onGet(name, value, keys) {
          logs.push([name, value, keys]);
        },
      },
      {},
    ],
    options: { strictMode: false },
  });

  function Parent() {
    let obj = useStore(state => state.obj);

    return (
      <div>
        <div role="text">{obj.name}</div>
        <button
          role="update"
          onClick={() => {
            store.actions.updateName('update');
          }}
        >
          add
        </button>
      </div>
    );
  }

  expect(logs.length).toBe(0);

  render(<Parent />, { legacyRoot: reactLegency });

  expect(logs.length).toBe(2);
  expect(logs[0][0]).toBe('default');
  expect(JSON.stringify(logs[0][1])).toBe(JSON.stringify({ name: 'wohoox' }));
  expect(logs[0][2].join('.')).toBe('obj');

  expect(logs[1][0]).toBe('default');
  expect(logs[1][1]).toBe('wohoox');
  expect(logs[1][2].join('.')).toBe('obj.name');

  logs.splice(0, 10);
  fireEvent.click(screen.getByRole('update'));

  expect(logs.length).toBe(2);

  expect(logs[0][0]).toBe('default');
  expect(JSON.stringify(logs[0][1])).toBe(JSON.stringify({ name: 'update' }));
  expect(logs[0][2].join('.')).toBe('obj');

  expect(logs[1][0]).toBe('default');
  expect(logs[1][1]).toBe('update');
  expect(logs[1][2].join('.')).toBe('obj.name');
});
