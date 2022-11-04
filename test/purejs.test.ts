import createStore from '../src';

function initStore(storeName?: string, options?: { strictMode?: boolean }) {
  const initState = {
    name: 'wohoox-default-test',
    version: {
      major: 1,
      minor: 1,
      patch: 1,
    },
    author: {
      name: 'pzxie',
      address: {
        city: 'cd',
        province: 'cs',
      },
    },
  };

  const store = createStore({
    name: storeName,
    initState,
    actions: {
      user: {
        aa() {}
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
    },
    options,
  });

  return { store, initState };
}

describe('purejs: store name', () => {
  it('equals "default"', () => {
    const { store } = initStore();
    store.actions.user.aa();
    expect(store.name).toEqual('default');
  });

  it('equals "userinfo" by manual set"', () => {
    const name = 'userinfo';
    const { store } = initStore(name);
    expect(store.name).toEqual(name);
  });
});

describe('purejs: get state', () => {
  it('original field', () => {
    const { store } = initStore();
    expect(store.state.name).toBe('wohoox-default-test');
  });

  it('reference object', () => {
    const {
      store: { state },
    } = initStore();
    expect(
      [state.version.major, state.version.minor, state.version.patch].join('.')
    ).toBe('1.1.1');
  });
});

describe('purejs: update by actions', () => {
  it('update original type filed', () => {
    const {
      store: { actions, state },
    } = initStore();
    const name = 'wohoox';
    actions.updateName(name);

    expect(state.name).toBe(name);
  });

  it('update field of reference object', () => {
    const {
      store: { actions, state },
    } = initStore();

    expect(
      [state.version.major, state.version.minor, state.version.patch].join('.')
    ).toBe('1.1.1');
    actions.updatePatch();
    expect(
      [state.version.major, state.version.minor, state.version.patch].join('.')
    ).toBe('1.1.2');
  });

  it('update reference object address failed', () => {
    const {
      store: { actions },
    } = initStore();

    const version = '2.1';
    expect(() => actions.updateVersion(version)).toThrow(
      /version update error/
    );
  });

  it('update reference object address success', () => {
    const {
      store: { actions, state },
    } = initStore();

    const version = '2.1.2';
    actions.updateVersion(version);
    expect(
      [state.version.major, state.version.minor, state.version.patch].join('.')
    ).toBe(version);
  });
});

describe('purejs: update by expression', () => {
  it('failed in strict mode', () => {
    const {
      store: { state },
    } = initStore();

    let errMessage = '';

    expect(state.name).toBe('wohoox-default-test');

    try {
      state.name = 'wohoox';
    } catch (e: any) {
      errMessage = e;
    }

    expect(state.name).toBe('wohoox-default-test');
    expect(errMessage).toBeInstanceOf(Error);
  });

  it('failed in strict mode', () => {
    const {
      store: { state },
    } = initStore(undefined, { strictMode: false });

    let errMessage = '';

    expect(state.name).toBe('wohoox-default-test');

    try {
      state.name = 'wohoox';
    } catch (e: any) {
      errMessage = e;
    }

    expect(state.name).toBe('wohoox');
    expect(errMessage).toBe('');
  });
});
