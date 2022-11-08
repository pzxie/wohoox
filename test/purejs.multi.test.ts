import createStore from '../src';

function initStore(options?: { strictMode?: boolean }) {
  const defaultInitState = {
    name: 'default',
    details: {
      author: 'default',
    },
  };
  const userInitState = {
    name: 'user',
    details: {
      province: 'sc',
      city: 'cd',
    },
  };
  const departmentInitState = {
    name: 'department',
    details: {
      owner: 'department',
    },
  };

  const defaultStore = createStore({
    initState: defaultInitState,
    actions: {
      nested: {
        updateName(state, name: string) {
          state.name = name;
        },
        updateDetailField(state, author) {
          state.details.author = author;
        },
        updateDetail(state, details) {
          state.details = details;
        },
      },
      updateName(state, name: string) {
        state.name = name;
      },
      updateDetailField(state, author) {
        state.details.author = author;
      },
      updateDetail(state, details) {
        state.details = details;
      },
      dispatch() {},
    },
    options,
  });

  const userStore = createStore({
    name: 'user',
    initState: userInitState,
    actions: {
      nested: {
        updateName(state, name: string) {
          state.name = name;
        },
        updateDetailField(state, city) {
          state.details.city = city;
        },
        updateDetail(state, details) {
          state.details = details;
        },
      },
      updateName(state, name: string) {
        state.name = name;
      },
      updateDetailField(state, city) {
        state.details.city = city;
      },
      updateDetail(state, details) {
        state.details = details;
      },
      dispatch() {},
    },
    options,
  });

  const departmentStore = createStore({
    name: 'department',
    initState: departmentInitState,
    actions: {
      nested: {
        updateName(state, name: string) {
          state.name = name;
        },
        updateDetailField(state, owner) {
          state.details.owner = owner;
        },
        updateDetail(state, details) {
          state.details = details;
        },
      },
      updateName(state, name: string) {
        state.name = name;
      },
      updateDetailField(state, owner) {
        state.details.owner = owner;
      },
      updateDetail(state, details) {
        state.details = details;
      },
      dispatch() {},
    },
    options,
  });

  const store = {
    default: defaultStore,
    user: userStore,
    department: departmentStore,
  };

  const actions = Object.keys(store).reduce((pre, current) => {
    pre[current as 'default'] = store[current as 'default']['actions'];
    return pre;
  }, {} as any);

  return {
    store,
    actions: actions as any,
    defaultInitState,
    userInitState,
    departmentInitState,
  };
}

describe('purejs multi: store name', () => {
  it('check multi store names', () => {
    const { store } = initStore();
    expect(store.default.name).toEqual('default');
    expect(store.user.name).toEqual('user');
    expect(store.department.name).toEqual('department');
  });
});

describe('purejs multi: get state', () => {
  it('original field', () => {
    const { store } = initStore();
    expect(store.default.state.name).toBe('default');
    expect(store.user.state.name).toBe('user');
    expect(store.department.state.name).toBe('department');
  });

  it('reference object', () => {
    const { store } = initStore();

    expect(JSON.stringify(store.default.state.details)).toBe(
      JSON.stringify({ author: 'default' })
    );
    expect(JSON.stringify(store.user.state.details)).toBe(
      JSON.stringify({ province: 'sc', city: 'cd' })
    );
    expect(JSON.stringify(store.department.state.details)).toBe(
      JSON.stringify({ owner: 'department' })
    );
  });
});

describe('purejs multi: update by actions', () => {
  it('update original type filed', () => {
    const { store, actions } = initStore();
    const name = 'wohoox';

    expect(store.default.state.name).toBe('default');
    expect(store.user.state.name).toBe('user');
    expect(store.department.state.name).toBe('department');

    actions.default.updateName(name);
    actions.user.updateName(name);
    actions.department.updateName(name);

    expect(store.default.state.name).toBe(name);
    expect(store.user.state.name).toBe(name);
    expect(store.department.state.name).toBe(name);
  });

  it('update field of reference object', () => {
    const { store, actions } = initStore();

    const originDefaultState = JSON.parse(JSON.stringify(store.default.state));
    const originUserState = JSON.parse(JSON.stringify(store.user.state));
    const originDepartmentState = JSON.parse(
      JSON.stringify(store.department.state)
    );

    actions.default.updateDetailField(originDefaultState.details.author + '_1');
    actions.user.updateDetailField(originUserState.details.city + '_1');
    actions.department.updateDetailField(
      originDepartmentState.details.owner + '_1'
    );

    expect(store.default.state.details.author).toBe(
      originDefaultState.details.author + '_1'
    );
    expect(store.user.state.details.city).toBe(
      originUserState.details.city + '_1'
    );
    expect(store.department.state.details.owner).toBe(
      originDepartmentState.details.owner + '_1'
    );
  });

  it('update reference object address', () => {
    const { store, actions } = initStore();

    actions.default.updateDetail({ author: 'updated' });
    actions.user.updateDetail({ province: 'updated', city: 'updated' });
    actions.department.updateDetail({ owner: 'updated' });

    expect(store.default.state.details.author).toBe('updated');
    expect(store.user.state.details.city).toBe('updated');
    expect(store.user.state.details.province).toBe('updated');
    expect(store.department.state.details.owner).toBe('updated');
  });
});

describe('purejs multi: update by expression', () => {
  it('failed in strict mode', () => {
    const { store } = initStore();

    let errMessage: any = '';
    let errorTime = 0;

    expect(store.default.state.name).toBe('default');
    expect(store.user.state.name).toBe('user');
    expect(store.department.state.name).toBe('department');

    try {
      store.user.state.name = 'wohoox';
    } catch (e) {
      errMessage = e;
      errorTime += 1;
    }

    expect(store.default.state.name).toBe('default');
    expect(store.user.state.name).toBe('user');
    expect(store.department.state.name).toBe('department');
    expect(errMessage).toBeInstanceOf(Error);
    errMessage = '';

    try {
      store.default.state.name = 'wohoox';
    } catch (e) {
      errMessage = e;
      errorTime += 1;
    }

    expect(store.default.state.name).toBe('default');
    expect(store.user.state.name).toBe('user');
    expect(store.department.state.name).toBe('department');
    expect(errMessage).toBeInstanceOf(Error);
    errMessage = '';

    try {
      store.department.state.name = 'wohoox';
    } catch (e) {
      errMessage = e;
      errorTime += 1;
    }

    expect(store.default.state.name).toBe('default');
    expect(store.user.state.name).toBe('user');
    expect(store.department.state.name).toBe('department');
    expect(errMessage).toBeInstanceOf(Error);

    expect(errorTime).toBe(3);
  });

  it('failed in strict mode', () => {
    const { store } = initStore({ strictMode: false });

    expect(store.default.state.name).toBe('default');
    expect(store.user.state.name).toBe('user');
    expect(store.department.state.name).toBe('department');

    store.user.state.name = 'wohoox';
    store.default.state.name = 'wohoox';
    store.department.state.name = 'wohoox';

    expect(store.default.state.name).toBe('wohoox');
    expect(store.user.state.name).toBe('wohoox');
    expect(store.department.state.name).toBe('wohoox');
  });
});
