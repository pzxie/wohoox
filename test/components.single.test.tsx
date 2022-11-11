import * as React from 'react';
import {
  fireEvent,
  cleanup,
  render,
  act,
  screen,
} from '@testing-library/react';

import createStore, { useStore, dispatch, dispatchAll } from '../src';

const reactLegency = !!process.env.reactLegency;

function initStore(storeName?: string, options?: { strictMode?: boolean }) {
  const initState = {
    name: 'wohoox',
    version: {
      major: 1,
      minor: 1,
      patch: 1,
    },
  };

  const store = createStore({
    name: storeName,
    initState,
    actions: {
      nested: {
        updateName(state, name: string) {
          state.name = name;
        },
        updatePatch(state) {
          state.version.patch += 1;
        },

        updateVersion(state, version: string) {
          const versionArr = version.split('.');

          if (versionArr.length !== 3) {
            throw new Error('version update error. version liked 1.2.3');
          }

          state.version = {
            major: +versionArr[0],
            minor: +versionArr[1],
            patch: +versionArr[2],
          };
        },
      },
      updateName(state, name: string) {
        state.name = name;
      },
      updatePatch(state) {
        state.version.patch += 1;
      },

      updateVersion(state, version: string) {
        const versionArr = version.split('.');

        if (versionArr.length !== 3) {
          throw new Error('version update error. version liked 1.2.3');
        }

        state.version = {
          major: +versionArr[0],
          minor: +versionArr[1],
          patch: +versionArr[2],
        };
      },

      dispatch() {},
    },
    options,
  });

  return {
    initState,
    store,
  };
}

afterEach(cleanup);

describe('component: getState', () => {
  it('get state before init store, should be error', () => {
    let error;

    function Child() {
      let state;
      try {
        state = useStore();
      } catch(e) {
        error = e
      }

      return (
        <div>
          <span>{JSON.stringify(state)}</span>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    expect(error).toBeInstanceOf(Error);
    expect(container.querySelector('span')?.innerHTML).toBeFalsy();
  });

  it('get state by not exist store name, should be error', () => {
    let error;

    initStore();

    function Child() {
      let state;
      try {
        state = useStore('notExistStore');
      } catch(e) {
        error = e
      }

      return (
        <div>
          <span>{JSON.stringify(state)}</span>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    expect(error).toBeInstanceOf(Error);
    expect(container.querySelector('span')?.innerHTML).toBeFalsy();
  });

  it('get hold state of store named [default], by no params', () => {
    let { initState } = initStore();

    function Child() {
      const state = useStore();

      return (
        <div>
          <span>{JSON.stringify(state)}</span>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });
    expect(container.querySelector('span')?.innerHTML).toBe(
      JSON.stringify(initState)
    );
  });

  it('get hold state of store named [default], by callback', () => {
    let { initState } = initStore();
    function Child() {
      const state = useStore(s => s);

      return (
        <div>
          <span>{JSON.stringify(state)}</span>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });
    expect(container.querySelector('span')?.innerHTML).toBe(
      JSON.stringify(initState)
    );
  });

  it('get state field(version) of store named [default], by callback', () => {
    let { initState } = initStore();

    function Child() {
      const version = useStore(s => s.version);

      return (
        <div>
          <span>{[version.major, version.minor, version.patch].join('.')}</span>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });
    expect(container.querySelector('span')?.innerHTML).toBe(
      [
        initState.version.major,
        initState.version.minor,
        initState.version.patch,
      ].join('.')
    );
  });
});

describe('component: update state by actions', () => {
  it('update origin field by action, check component self rerender', () => {
    let { store } = initStore();

    const initName = store.state.name;
    function Child() {
      const name = useStore(s => s.name);

      return (
        <div>
          <span>{name}</span>
          <button
            onClick={() => {
              store.actions.updateName(name + '_1');
            }}
          >
            update
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    let span = container.querySelector('span');

    expect(span?.innerHTML).toBe(initName);
    expect(span?.innerHTML).toBe(store.state.name);

    const updateNameBtn = container.querySelector('button')!;

    fireEvent.click(updateNameBtn);
    expect(container.querySelector('span')?.innerHTML).toBe(initName + '_1');
    expect(container.querySelector('span')?.innerHTML).toBe(store.state.name);

    act(() => {
      updateNameBtn.click();
    });
    span = container.querySelector('span');
    expect(container.querySelector('span')?.innerHTML).toBe(initName + '_1_1');
    expect(container.querySelector('span')?.innerHTML).toBe(store.state.name);
  });

  it('update origin field by action, check all relate components rerender', () => {
    let { store } = initStore();

    let expectCurrentName = store.state.name;
    function Child({ roleName = 'childBtn' }: { roleName?: string }) {
      const name = useStore(s => s.name);

      return (
        <div>
          Child
          <span role={roleName + 'Text'}>{name}</span>
          <button
            role={roleName}
            onClick={() => store.actions.updateName(name + '_child')}
          >
            update
          </button>
        </div>
      );
    }

    function Parent({ children }: { children: React.ReactNode }) {
      const name = useStore(s => s.name);

      return (
        <div>
          Parent
          <span role="parentText">{name}</span>
          <button
            role="parentBtn"
            onClick={() => store.actions.updateName(name + '_parent')}
          >
            update
          </button>
          {children}
        </div>
      );
    }

    render(
      <Parent>
        <Child roleName="child1" />
        <Child roleName="child2" />
      </Parent>,
      { legacyRoot: reactLegency }
    );

    let child1Text = screen.getByRole('child1Text');
    let child2Text = screen.getByRole('child2Text');
    let parentText = screen.getByRole('parentText');
    let parentButton = screen.getByRole('parentBtn')!;
    let child1Button = screen.getByRole('child1')!;
    let child2Button = screen.getByRole('child2')!;

    expect(child1Text.innerHTML).toBe(expectCurrentName);
    expect(child2Text.innerHTML).toBe(expectCurrentName);
    expect(parentText.innerHTML).toBe(expectCurrentName);

    fireEvent.click(parentButton);
    expectCurrentName += '_parent';
    expect(child1Text.innerHTML).toBe(expectCurrentName);
    expect(child2Text.innerHTML).toBe(expectCurrentName);
    expect(parentText.innerHTML).toBe(expectCurrentName);

    fireEvent.click(child1Button);
    expectCurrentName += '_child';
    expect(child1Text.innerHTML).toBe(expectCurrentName);
    expect(child2Text.innerHTML).toBe(expectCurrentName);
    expect(parentText.innerHTML).toBe(expectCurrentName);

    fireEvent.click(child2Button);
    expectCurrentName += '_child';
    expect(child1Text.innerHTML).toBe(expectCurrentName);
    expect(child2Text.innerHTML).toBe(expectCurrentName);
    expect(parentText.innerHTML).toBe(expectCurrentName);
  });

  it('update reference field address by action, check component self return new reference field during rerender ', () => {
    let { store } = initStore();

    const initVersion = store.state.version;
    function Child() {
      const version = useStore(s => s.version);

      return (
        <div>
          <span role="major">{version.major}</span>
          <span role="minor">{version.minor}</span>
          <span role="patch">{version.patch}</span>
          <button
            onClick={() => {
              store.actions.updateVersion('1.2.2');
            }}
          >
            update
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    let major = screen.getByRole('major');
    let minor = screen.getByRole('minor');
    let patch = screen.getByRole('patch');

    expect(major?.innerHTML).toBe(initVersion.major + '');
    expect(minor?.innerHTML).toBe(initVersion.minor + '');
    expect(patch?.innerHTML).toBe(initVersion.patch + '');

    const updateVersionBtn = container.querySelector('button')!;

    fireEvent.click(updateVersionBtn);
    expect(major?.innerHTML).toBe('1');
    expect(minor?.innerHTML).toBe('2');
    expect(patch?.innerHTML).toBe('2');
  });

  it('update reference field address by action, check all relate components return new reference field during rerender ', () => {
    let { store } = initStore();

    const initVersion = store.state.version;
    const initName = store.state.name;
    function ChildVersion() {
      const version = useStore(s => s.version);

      return (
        <div>
          <span role="major">{version.major}</span>
          <span role="minor">{version.minor}</span>
          <span role="patch">{version.patch}</span>
          <button
            onClick={() => {
              store.actions.updateVersion('1.2.2');
            }}
          >
            update
          </button>
        </div>
      );
    }

    function ChildName() {
      const name = useStore(s => s.name);

      return <span role="name">{name}</span>;
    }

    function Parent() {
      const version = useStore(s => s.version);
      const name = useStore(s => s.name);

      return (
        <div>
          <span role="parentName">{name}</span>
          <span role="parentVersion">
            {[version.major, version.minor, version.patch].join('.')}
          </span>
          <ChildName />
          <ChildVersion />
        </div>
      );
    }

    const { container } = render(<Parent />, { legacyRoot: reactLegency });

    let major = screen.getByRole('major');
    let minor = screen.getByRole('minor');
    let patch = screen.getByRole('patch');
    let childName = screen.getByRole('name');
    let parentName = screen.getByRole('parentName');
    let parentVersion = screen.getByRole('parentVersion');

    expect(major?.innerHTML).toBe(initVersion.major + '');
    expect(minor?.innerHTML).toBe(initVersion.minor + '');
    expect(patch?.innerHTML).toBe(initVersion.patch + '');
    expect(parentVersion?.innerHTML).toBe(
      [initVersion.major, initVersion.minor, initVersion.patch].join('.')
    );
    expect(childName.innerHTML).toBe(initName);
    expect(parentName.innerHTML).toBe(initName);

    const updateVersionBtn = container.querySelector('button')!;

    fireEvent.click(updateVersionBtn);
    expect(major?.innerHTML).toBe('1');
    expect(minor?.innerHTML).toBe('2');
    expect(patch?.innerHTML).toBe('2');
    expect(parentVersion?.innerHTML).toBe('1.2.2');
    expect(childName.innerHTML).toBe(initName);
    expect(parentName.innerHTML).toBe(initName);
  });

  it('update child param of reference field by action, check component self rerender', () => {
    let { store } = initStore();

    const initVersion = store.state.version;
    function Child() {
      const version = useStore(s => s.version);

      return (
        <div>
          <span role="major">{version.major}</span>
          <span role="minor">{version.minor}</span>
          <span role="patch">{version.patch}</span>
          <button
            onClick={() => {
              store.actions.updatePatch();
            }}
          >
            update
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    let major = screen.getByRole('major');
    let minor = screen.getByRole('minor');
    let patch = screen.getByRole('patch');

    expect(major?.innerHTML).toBe(initVersion.major.toString());
    expect(minor?.innerHTML).toBe(initVersion.minor.toString());
    expect(patch?.innerHTML).toBe(initVersion.patch.toString());

    const updatePatchBtn = container.querySelector('button')!;

    fireEvent.click(updatePatchBtn);
    expect(major?.innerHTML).toBe('1');
    expect(minor?.innerHTML).toBe('1');
    expect(patch?.innerHTML).toBe('2');

    fireEvent.click(updatePatchBtn);
    expect(major?.innerHTML).toBe('1');
    expect(minor?.innerHTML).toBe('1');
    expect(patch?.innerHTML).toBe('3');
  });

  it('update child param of reference field by action, check all relate components rerender ', () => {
    let { store } = initStore();

    const initVersion = store.state.version;
    const initName = store.state.name;
    function ChildVersion() {
      const version = useStore(s => s.version);

      return (
        <div>
          <span role="major">{version.major}</span>
          <span role="minor">{version.minor}</span>
          <span role="patch">{version.patch}</span>
        </div>
      );
    }

    function ChildName() {
      const name = useStore(s => s.name);

      return (
        <div>
          <span role="name">{name}</span>
          <button
            onClick={() => {
              store.actions.updateName(name + '_1');
            }}
          >
            update
          </button>
        </div>
      );
    }

    function Parent() {
      const version = useStore(s => s.version);
      const name = useStore(s => s.name);

      return (
        <div>
          <span role="parentName">{name}</span>
          <span role="parentVersion">
            {[version.major, version.minor, version.patch].join('.')}
          </span>
          <ChildName />
          <ChildVersion />
        </div>
      );
    }

    const { container } = render(<Parent />, { legacyRoot: reactLegency });

    let major = screen.getByRole('major');
    let minor = screen.getByRole('minor');
    let patch = screen.getByRole('patch');
    let childName = screen.getByRole('name');
    let parentName = screen.getByRole('parentName');
    let parentVersion = screen.getByRole('parentVersion');

    expect(major?.innerHTML).toBe(initVersion.major + '');
    expect(minor?.innerHTML).toBe(initVersion.minor + '');
    expect(patch?.innerHTML).toBe(initVersion.patch + '');
    expect(parentVersion?.innerHTML).toBe(
      [initVersion.major, initVersion.minor, initVersion.patch].join('.')
    );
    expect(childName.innerHTML).toBe(initName);
    expect(parentName.innerHTML).toBe(initName);

    const updateNameBtn = container.querySelector('button')!;

    fireEvent.click(updateNameBtn);
    expect(major?.innerHTML).toBe(initVersion.major + '');
    expect(minor?.innerHTML).toBe(initVersion.minor + '');
    expect(patch?.innerHTML).toBe(initVersion.patch + '');
    expect(parentVersion?.innerHTML).toBe(
      [initVersion.major, initVersion.minor, initVersion.patch].join('.')
    );
    expect(childName.innerHTML).toBe(initName + '_1');
    expect(parentName.innerHTML).toBe(initName + '_1');
  });

  it('update child param of reference field + update reference self alternately, check component self rerender', () => {
    let { store } = initStore();

    const initVersion = JSON.parse(JSON.stringify(store.state.version));
    function Child() {
      const version = useStore(s => s.version);

      return (
        <div>
          <span role="major">{version.major}</span>
          <span role="minor">{version.minor}</span>
          <span role="patch">{version.patch}</span>
          <button
            role="updatePatchBtn"
            onClick={() => {
              store.actions.updatePatch();
            }}
          >
            update patch
          </button>
          <button
            role="updateVersionBtn"
            onClick={() => {
              store.actions.updateVersion('2.2.2');
            }}
          >
            update version
          </button>
        </div>
      );
    }

    render(<Child />, { legacyRoot: reactLegency });

    let major = screen.getByRole('major');
    let minor = screen.getByRole('minor');
    let patch = screen.getByRole('patch');

    expect(major?.innerHTML).toBe(initVersion.major.toString());
    expect(minor?.innerHTML).toBe(initVersion.minor.toString());
    expect(patch?.innerHTML).toBe(initVersion.patch.toString());

    const updatePatchBtn = screen.getByRole('updatePatchBtn')!;
    const updateVersionBtn = screen.getByRole('updateVersionBtn')!;

    fireEvent.click(updatePatchBtn);
    expect(major?.innerHTML).toBe('1');
    expect(minor?.innerHTML).toBe('1');
    expect(patch?.innerHTML).toBe('2');

    fireEvent.click(updatePatchBtn);
    expect(major?.innerHTML).toBe('1');
    expect(minor?.innerHTML).toBe('1');
    expect(patch?.innerHTML).toBe('3');


    fireEvent.click(updateVersionBtn);
    expect(major?.innerHTML).toBe('2');
    expect(minor?.innerHTML).toBe('2');
    expect(patch?.innerHTML).toBe('2');

    fireEvent.click(updatePatchBtn);
    expect(major?.innerHTML).toBe('2');
    expect(minor?.innerHTML).toBe('2');
    expect(patch?.innerHTML).toBe('3');

    fireEvent.click(updatePatchBtn);
    expect(major?.innerHTML).toBe('2');
    expect(minor?.innerHTML).toBe('2');
    expect(patch?.innerHTML).toBe('4');

    fireEvent.click(updateVersionBtn);
    expect(major?.innerHTML).toBe('2');
    expect(minor?.innerHTML).toBe('2');
    expect(patch?.innerHTML).toBe('2');
  });  

  it('update child param of reference field + update reference self alternately, check all relate components rerender', () => {
    let { store } = initStore();

    const initVersion = JSON.parse(JSON.stringify(store.state.version));
    function Child() {
      const version = useStore(s => s.version);

      return (
        <div>
          <span role="major">{version.major}</span>
          <span role="minor">{version.minor}</span>
          <span role="patch">{version.patch}</span>
          <button
            role="updatePatchBtn"
            onClick={() => {
              store.actions.updatePatch();
            }}
          >
            update patch
          </button>
          <button
            role="updateVersionBtn"
            onClick={() => {
              store.actions.updateVersion('2.2.2');
            }}
          >
            update version
          </button>
        </div>
      );
    }

    function Parent () {
      const version = useStore(s => s.version);

      return  <div>
        <span role="parentPatch">{version.patch}</span>
        <Child />
        </div>
    }

    render(<Parent />, { legacyRoot: reactLegency });

    let major = screen.getByRole('major');
    let minor = screen.getByRole('minor');
    let patch = screen.getByRole('patch');
    let parentPatch = screen.getByRole('parentPatch');

    expect(major?.innerHTML).toBe(initVersion.major.toString());
    expect(minor?.innerHTML).toBe(initVersion.minor.toString());
    expect(patch?.innerHTML).toBe(initVersion.patch.toString());
    expect(parentPatch?.innerHTML).toBe(initVersion.patch.toString());

    const updatePatchBtn = screen.getByRole('updatePatchBtn')!;
    const updateVersionBtn = screen.getByRole('updateVersionBtn')!;

    fireEvent.click(updatePatchBtn);
    expect(major?.innerHTML).toBe('1');
    expect(minor?.innerHTML).toBe('1');
    expect(patch?.innerHTML).toBe('2');
    expect(parentPatch?.innerHTML).toBe('2');

    fireEvent.click(updatePatchBtn);
    expect(major?.innerHTML).toBe('1');
    expect(minor?.innerHTML).toBe('1');
    expect(patch?.innerHTML).toBe('3');
    expect(parentPatch?.innerHTML).toBe('3');


    fireEvent.click(updateVersionBtn);
    expect(major?.innerHTML).toBe('2');
    expect(minor?.innerHTML).toBe('2');
    expect(patch?.innerHTML).toBe('2');
    expect(parentPatch?.innerHTML).toBe('2');


    fireEvent.click(updatePatchBtn);
    expect(major?.innerHTML).toBe('2');
    expect(minor?.innerHTML).toBe('2');
    expect(patch?.innerHTML).toBe('3');
    expect(parentPatch?.innerHTML).toBe('3');


    fireEvent.click(updatePatchBtn);
    expect(major?.innerHTML).toBe('2');
    expect(minor?.innerHTML).toBe('2');
    expect(patch?.innerHTML).toBe('4');
    expect(parentPatch?.innerHTML).toBe('4');

    fireEvent.click(updateVersionBtn);
    expect(major?.innerHTML).toBe('2');
    expect(minor?.innerHTML).toBe('2');
    expect(patch?.innerHTML).toBe('2');
    expect(parentPatch?.innerHTML).toBe('2');

  });  
});

describe('component: update state by state expression + dispatch by actions', () => {
  it('update origin field in strictMode, should throw error', () => {
    let { store } = initStore();

    let errMessage = '';
    let renderTime = 0;
    function Child() {
      const state = useStore();

      renderTime += 1;

      return (
        <div>
          <span>{state.name}</span>
          <button
            onClick={() => {
              try {
                state.name += '_1';
                store.actions.dispatch();
              } catch (e: any) {
                errMessage = e;
              }
            }}
          >
            update
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    expect(renderTime).toBe(1);

    const updateNameBtn = container.querySelector('button')!;
    fireEvent.click(updateNameBtn);
    expect(renderTime).toBe(1);
    expect(errMessage).toBeInstanceOf(Error);
  });

  it('update origin field', () => {
    let { store } = initStore(undefined, { strictMode: false });

    const initName = store.state.name;
    function Child() {
      const state = useStore();

      return (
        <div>
          <span>{state.name}</span>
          <button
            onClick={() => {
              state.name += '_1';
              store.actions.dispatch();
            }}
          >
            update
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    const updateNameBtn = container.querySelector('button')!;
    const span = container.querySelector('span')!;

    expect(span.innerHTML).toBe(initName);

    fireEvent.click(updateNameBtn);
    expect(span.innerHTML).toBe(initName + '_1');
  });

  it('update field of reference object', () => {
    let { store } = initStore(undefined, { strictMode: false });

    const initPatch = store.state.version.patch;
    function Child() {
      const version = useStore(st => st.version);

      return (
        <div>
          <span>{version.patch}</span>
          <button
            onClick={() => {
              version.patch = +version.patch + 1;
              store.actions.dispatch();
            }}
          >
            update
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    const updateNameBtn = container.querySelector('button')!;
    const span = container.querySelector('span')!;

    expect(span.innerHTML).toBe(initPatch + '');

    fireEvent.click(updateNameBtn);
    expect(span.innerHTML).toBe(+initPatch + 1 + '');
  });
});

describe('component: update state by state expression + dispatch by wohoox dispatch', () => {
  it('update origin field in strictMode, should throw error', () => {
    initStore();

    let errMessage = '';
    let renderTime = 0;
    function Child() {
      const state = useStore();

      renderTime += 1;

      return (
        <div>
          <span>{state.name}</span>
          <button
            onClick={() => {
              try {
                state.name += '_1';
                dispatch();
              } catch (e: any) {
                errMessage = e;
              }
            }}
          >
            update
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    expect(renderTime).toBe(1);

    const updateNameBtn = container.querySelector('button')!;
    fireEvent.click(updateNameBtn);
    expect(renderTime).toBe(1);
    expect(errMessage).toBeInstanceOf(Error);
  });

  it('update origin field', () => {
    let { store } = initStore(undefined, { strictMode: false });

    const initName = store.state.name;
    function Child() {
      const state = useStore();

      return (
        <div>
          <span>{state.name}</span>
          <button
            onClick={() => {
              state.name += '_1';
              dispatch();
            }}
          >
            update
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    const updateNameBtn = container.querySelector('button')!;
    const span = container.querySelector('span')!;

    expect(span.innerHTML).toBe(initName);

    fireEvent.click(updateNameBtn);
    expect(span.innerHTML).toBe(initName + '_1');
  });

  it('update field of reference object', () => {
    let { store } = initStore(undefined, { strictMode: false });

    const initPatch = store.state.version.patch;
    function Child() {
      const version = useStore(st => st.version);

      return (
        <div>
          <span>{version.patch}</span>
          <button
            onClick={() => {
              version.patch = +version.patch + 1;
              dispatch('default');
            }}
          >
            update
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    const updateNameBtn = container.querySelector('button')!;
    const span = container.querySelector('span')!;

    expect(span.innerHTML).toBe(initPatch + '');

    fireEvent.click(updateNameBtn);
    expect(span.innerHTML).toBe(+initPatch + 1 + '');
  });
});

describe('component: update state by state expression + dispatch by wohoox dispatchAll', () => {
  it('update origin field in strictMode, should throw error', () => {
    initStore();

    let errMessage = '';
    let renderTime = 0;
    function Child() {
      const state = useStore();

      renderTime += 1;

      return (
        <div>
          <span>{state.name}</span>
          <button
            onClick={() => {
              try {
                state.name += '_1';
                dispatchAll();
              } catch (e: any) {
                errMessage = e;
              }
            }}
          >
            update
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    expect(renderTime).toBe(1);

    const updateNameBtn = container.querySelector('button')!;
    fireEvent.click(updateNameBtn);
    expect(renderTime).toBe(1);
    expect(errMessage).toBeInstanceOf(Error);
  });

  it('update origin field', () => {
    let { store } = initStore(undefined, { strictMode: false });

    const initName = store.state.name;
    function Child() {
      const state = useStore();

      return (
        <div>
          <span>{state.name}</span>
          <button
            onClick={() => {
              state.name += '_1';
              dispatchAll();
            }}
          >
            update
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    const updateNameBtn = container.querySelector('button')!;
    const span = container.querySelector('span')!;

    expect(span.innerHTML).toBe(initName);

    fireEvent.click(updateNameBtn);
    expect(span.innerHTML).toBe(initName + '_1');
  });

  it('update field of reference object', () => {
    let { store } = initStore(undefined, { strictMode: false });

    const initPatch = store.state.version.patch;
    function Child() {
      const version = useStore(st => st.version);

      return (
        <div>
          <span>{version.patch}</span>
          <button
            onClick={() => {
              version.patch = +version.patch + 1;
              dispatchAll();
            }}
          >
            update
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    const updateNameBtn = container.querySelector('button')!;
    const span = container.querySelector('span')!;

    expect(span.innerHTML).toBe(initPatch + '');

    fireEvent.click(updateNameBtn);
    expect(span.innerHTML).toBe(+initPatch + 1 + '');
  });
});

describe('component: render times', () => {
  it('update origin field by 1 action, render 1 time', () => {
    let { store } = initStore();

    let renderTimes = 0;
    function Child() {
      const name = useStore(s => s.name);
      renderTimes += 1;

      return (
        <div>
          <span>{name}</span>
          <button onClick={() => store.actions.updateName(name + '_1')}>
            update
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    const button = container.querySelector('button')!;
    const beforeRenderTimes = renderTimes;

    fireEvent.click(button);
    expect(renderTimes).toBe(beforeRenderTimes + 1);

    fireEvent.click(button);
    expect(renderTimes).toBe(beforeRenderTimes + 2);
  });

  it('update multi field by multi actions in the same queue, render 1 time', () => {
    let { store } = initStore();

    let renderTimes = 0;
    function Child() {
      const name = useStore(s => s.name);
      const version = useStore(s => s.version);
      renderTimes += 1;

      return (
        <div>
          <span>{name}</span>
          <span>{version.patch}</span>
          <button
            onClick={() => {
              store.actions.updateName(name + '_1');
              store.actions.updatePatch();
            }}
          >
            update
          </button>
        </div>
      );
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency });

    const button = container.querySelector('button')!;
    const beforeRenderTimes = renderTimes;

    fireEvent.click(button);
    expect(renderTimes).toBe(beforeRenderTimes + 1);

    fireEvent.click(button);
    expect(renderTimes).toBe(beforeRenderTimes + 2);
  });

  // it('update multi field by multi actions in different queues, render multi time', () => {
  //   let { store } = initStore();

  //   let renderTimes = 0;
  //   function Child() {
  //     const name = useStore(s => s.name);
  //     const version = useStore(s => s.version);
  //     renderTimes += 1;

  //     return (
  //       <div>
  //         <span>{name}</span>
  //         <span>{version.patch}</span>
  //         <button
  //           onClick={() => {
  //             store.actions.updateName(name + '_1');
  //             Promise.resolve().then(() => store.actions.updatePatch())
  //           }}
  //         >
  //           update
  //         </button>
  //       </div>
  //     );
  //   }

  //   const { container } = render(<Child />, { legacyRoot: reactLegency });

  //   const button = container.querySelector('button')!;
  //   const beforeRenderTimes = renderTimes;

  //   fireEvent.click(button);
  //   expect(renderTimes).toBe(beforeRenderTimes + 2);

  //   fireEvent.click(button);
  //   expect(renderTimes).toBe(beforeRenderTimes + 4);
  // });

  it('update field by actions, relate components rerender, otherwise not rerender', () => {
    let { store } = initStore();

    let childNameRenderTimes = 0;
    let childVersionRenderTimes = 0;
    let childVersionPatchRenderTimes = 0;
    function ChildVersion() {
      const version = useStore(s => s.version);

      childVersionRenderTimes += 1;

      return (
        <div>
          <span role="major">{version.major}</span>
          <span role="minor">{version.minor}</span>
          <span role="patch">{version.patch}</span>
          <button
            role="updateVersionBtn"
            onClick={() => {
              store.actions.updateVersion('1.2.2');
            }}
          >
            update
          </button>
          <button
            role="updateVersionPatchBtn"
            onClick={() => {
              store.actions.updatePatch();
            }}
          >
            update
          </button>
        </div>
      );
    }

    function ChildVersionPatch() {
      const patch = useStore(s => s.version.patch);

      childVersionPatchRenderTimes += 1;

      return (
        <div>
          <span role="patch">{patch}</span>
        </div>
      );
    }

    function ChildName() {
      const name = useStore(s => s.name);

      childNameRenderTimes += 1;

      return (
        <div>
          <span role="name">{name}</span>
          <button
            role="updateNameBtn"
            onClick={() => {
              store.actions.updateName(name + '_1');
            }}
          >
            update name
          </button>
        </div>
      );
    }

    function Parent() {
      return (
        <div>
          <ChildName />
          <ChildVersionPatch />
          <ChildVersion />
        </div>
      );
    }

    render(<Parent />, { legacyRoot: reactLegency });

    expect(childNameRenderTimes).toBe(1);
    expect(childVersionRenderTimes).toBe(1);
    expect(childVersionPatchRenderTimes).toBe(1);

    const updateNameBtn = screen.getByRole('updateNameBtn');
    fireEvent.click(updateNameBtn);
    expect(childNameRenderTimes).toBe(2);
    expect(childVersionRenderTimes).toBe(1);
    expect(childVersionPatchRenderTimes).toBe(1);

    const updateVersionBtn = screen.getByRole('updateVersionBtn');
    fireEvent.click(updateVersionBtn);
    expect(childNameRenderTimes).toBe(2);
    expect(childVersionRenderTimes).toBe(2);
    expect(childVersionPatchRenderTimes).toBe(2);

    const updateVersionPatchBtn = screen.getByRole('updateVersionPatchBtn');
    fireEvent.click(updateVersionPatchBtn);
    expect(childNameRenderTimes).toBe(2);
    expect(childVersionRenderTimes).toBe(3);
    expect(childVersionPatchRenderTimes).toBe(3);
  });
});
