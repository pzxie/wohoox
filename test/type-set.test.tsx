import * as React from 'react';
import { fireEvent, cleanup, render, screen } from '@testing-library/react';

import createStore, { useStore, dispatch } from '../src';

const reactLegency = !!process.env.reactLegency;

const sourceMap = {
  string: () => Math.floor(Math.random() * 10000) + '',
  number: () => Math.floor(Math.random() * 10000),
  boolean: () => Math.random() > 0.5,
  null: () => null,
  undefined: () => undefined,
  symbol: () => Symbol('symbol' + Math.floor(Math.random() * 10000)),
  bigint: () =>
    BigInt(
      Math.floor(Math.random() * 100000000000) + '' + Math.floor(Math.random() * 100000000000),
    ),
  array: () => new Array(),
  object: () => Object.assign(new Object(), { type: 'object' }),
  map: () => new Map([['type', 'map']]),
  set: () => new Set(['type']),
  weakMap: () => new WeakMap([[{ type: 'weakMap' }, 'weakMap']]),
  date: () => new Date(),
};

function getAllInitialMaps(sourceMap) {
  const set = new Set();

  for (let key in sourceMap) {
    set.add(sourceMap[key]());
  }

  return [...set];
}

function initStore(
  set?: Set<any> | WeakSet<any>,
  options?: { strictMode?: boolean; proxySetDeep?: boolean },
) {
  const initState = {
    set: set || new Set(),
  };

  const store = createStore({
    initState,
    options: options || { strictMode: false },
  });

  return {
    initState,
    store,
  };
}

afterEach(cleanup);

describe('set single component', () => {
  describe('size', () => {
    function checkSize(initSet?: Set<any>) {
      initStore(initSet);

      function Child() {
        let set: Set<any> = useStore(state => state.set);

        return (
          <div>
            <div role="size">{set.size}</div>

            <button
              role="addBtn"
              onClick={() => {
                set.add(Math.floor(Math.random() * 1000000000));
                dispatch();
              }}
            >
              add
            </button>
            <button
              role="addMapBtn"
              onClick={() => {
                set.add('map');
                dispatch();
              }}
            >
              add string map
            </button>
            <button
              role="deleteMapBtn"
              onClick={() => {
                set.delete('map');
                dispatch();
              }}
            >
              delete map
            </button>
            <button
              role="clear"
              onClick={() => {
                set.clear();
                dispatch();
              }}
            >
              clear
            </button>
          </div>
        );
      }

      render(<Child />, { legacyRoot: reactLegency });

      const size = screen.getByRole('size');
      const addBtn = screen.getByRole('addBtn');
      const addMapBtn = screen.getByRole('addMapBtn');
      const deleteMapBtn = screen.getByRole('deleteMapBtn');
      const clear = screen.getByRole('clear');

      let sizeHtml = initSet?.size || 0;
      expect(size.innerHTML).toBe(sizeHtml + '');

      for (let i = 0; i < 20; i++) {
        fireEvent.click(addBtn);
        sizeHtml++;
        expect(size.innerHTML).toBe(sizeHtml + '');
      }

      fireEvent.click(deleteMapBtn);
      expect(size.innerHTML).toBe(sizeHtml + '');

      fireEvent.click(addMapBtn);
      sizeHtml++;
      expect(size.innerHTML).toBe(sizeHtml + '');

      fireEvent.click(deleteMapBtn);
      sizeHtml--;
      expect(size.innerHTML).toBe(sizeHtml + '');

      fireEvent.click(clear);
      sizeHtml = 0;
      expect(size.innerHTML).toBe(sizeHtml + '');
    }

    it('no initial', () => {
      checkSize();
    });
    it('initial 2 items', () => {
      checkSize(new Set(['a', 'b']));
    });
  });

  describe('add new item', () => {
    it('all type', () => {
      const allMaps = getAllInitialMaps(sourceMap);

      initStore();

      let currentValue: any;

      function Child() {
        let set: Set<any> = useStore(state => state.set);

        const items = [...set.values()];

        return (
          <div>
            {items.map(item => (
              <span role="item">
                {typeof item === 'bigint'
                  ? item.toString()
                  : JSON.stringify(
                      typeof item === 'object' &&
                        item !== null &&
                        item.toString().indexOf('Map') > -1 &&
                        item.source
                        ? item.source
                        : item,
                    )}
              </span>
            ))}

            <button
              role="addBtn"
              onClick={() => {
                const current = allMaps.pop()!;
                set.add(current);
                currentValue = current;
                dispatch();
              }}
            >
              add item
            </button>
          </div>
        );
      }

      render(<Child />, { legacyRoot: reactLegency });

      const addBtn = screen.getByRole('addBtn');

      let items;
      const originAllMaps = [...allMaps];
      for (let index in originAllMaps) {
        fireEvent.click(addBtn);
        items = screen.getAllByRole('item');
        expect(items.length).toBe(+index + 1);
        expect(items[items.length - 1].innerHTML).toBe(
          typeof currentValue === 'bigint'
            ? (currentValue as any).toString()
            : currentValue === undefined || typeof currentValue === 'symbol'
            ? ''
            : JSON.stringify(currentValue),
        );
      }
    });
  });

  describe('delete item', () => {
    it('delete item', () => {
      const all = [...getAllInitialMaps(sourceMap)];
      let currentIndex = 0;

      initStore(new Set<any>(all));

      function Child() {
        let set: Set<any> = useStore(state => state.set);

        const items = [...set.values()];

        return (
          <div>
            {items.map(item => (
              <span role="item">
                {typeof item === 'bigint'
                  ? item.toString()
                  : JSON.stringify(
                      typeof item === 'object' &&
                        item !== null &&
                        item.toString().indexOf('Map') > -1 &&
                        item.source
                        ? item.source
                        : item,
                    )}
              </span>
            ))}

            <button
              role="delete"
              onClick={() => {
                set.delete(all[currentIndex]);
                dispatch();
              }}
            >
              delete
            </button>
          </div>
        );
      }

      const { container } = render(<Child />, { legacyRoot: reactLegency });

      const deleteBtn = screen.getByRole('delete');

      const allLength = all.length;

      expect(screen.getAllByRole('item').length).toBe(allLength);

      for (let index = 0; index < allLength; index++) {
        currentIndex = index;
        fireEvent.click(deleteBtn);
        if (allLength - index - 1 === 0) {
          expect(container.querySelectorAll('span')?.length).toBeFalsy();
        } else expect(screen.getAllByRole('item').length).toBe(allLength - index - 1);
      }
    });
  });

  describe('edit item', () => {
    const objectKey = {};

    function renderItem(current) {
      if (current.toString() === '[object Set]') return [...current].toString();
      if (current.toString() === '[object WeakSet]') return current.has(objectKey) + '';
      if (current.toString() === '[object Map]') return [...current.values()].toString();
      if (current.toString() === '[object WeakMap]') return current.get(objectKey);
      if (Array.isArray(current)) return current.toString();
      if (typeof current === 'object') return JSON.stringify(current);
    }

    it('proxySetDeep: true', () => {
      const obj = { name: 'obj' };
      const arr = [1, 2];
      const map = new Map();
      const originSet = new Set();
      const weakMap = new WeakMap([[obj, 123]]);
      const weakSet = new WeakSet();

      initStore(new Set<any>([obj, arr, map, weakMap, originSet, weakSet]), {
        strictMode: false,
        proxySetDeep: true,
      });

      function Child() {
        let state: Set<any> = useStore(state => state.set);

        const obj = [...state.values()][0];
        const array = [...state.values()][1];
        const map = [...state.values()][2];
        const weakMap = [...state.values()][3];
        const set = [...state.values()][4];
        const weakSet = [...state.values()][5];

        return (
          <div>
            <div role="objText">{renderItem(obj)}</div>
            <div role="arrayText">{renderItem(array)}</div>
            <div role="mapText">{renderItem(map)}</div>
            <div role="weakMapText">{renderItem(weakMap)}</div>
            <div role="setText">{renderItem(set)}</div>
            <div role="weakSetText">{renderItem(weakSet)}</div>

            <button
              role="obj"
              onClick={() => {
                obj.changed = 'changed';
                dispatch();
              }}
            >
              edit obj
            </button>
            <button
              role="array"
              onClick={() => {
                array.push('changed');
                dispatch();
              }}
            >
              edit array
            </button>
            <button
              role="map"
              onClick={() => {
                map.set('changed', 'changed');
                dispatch();
              }}
            >
              edit map
            </button>
            <button
              role="weakMap"
              onClick={() => {
                weakMap.set(objectKey, 'changed');
                dispatch();
              }}
            >
              edit weakMap
            </button>
            <button
              role="set"
              onClick={() => {
                set.add('changed');
                dispatch();
              }}
            >
              edit set
            </button>
            <button
              role="weakSet"
              onClick={() => {
                weakSet.add(objectKey);
                dispatch();
              }}
            >
              edit weakSet
            </button>
          </div>
        );
      }

      render(<Child />, { legacyRoot: reactLegency });

      const objText = screen.getByRole('objText');
      const arrayText = screen.getByRole('arrayText');
      const mapText = screen.getByRole('mapText');
      const weakMapText = screen.getByRole('weakMapText');
      const setText = screen.getByRole('setText');
      const weakSetText = screen.getByRole('weakSetText');
      const objBtn = screen.getByRole('obj');
      const arrayBtn = screen.getByRole('array');
      const mapBtn = screen.getByRole('map');
      const weakMapBtn = screen.getByRole('weakMap');
      const setBtn = screen.getByRole('set');
      const weakSetBtn = screen.getByRole('weakSet');

      const tempObj = { ...obj };
      expect(objText.innerHTML).toBe(renderItem(tempObj));
      fireEvent.click(objBtn);
      (tempObj as any).changed = 'changed';
      expect(objText.innerHTML).toBe(renderItem(tempObj));

      const arrTemp = [...arr];
      expect(arrayText.innerHTML).toBe(renderItem(arrTemp));
      fireEvent.click(arrayBtn);
      (arrTemp as any).push('changed');
      expect(arrayText.innerHTML).toBe(renderItem(arrTemp));

      const mapTemp = [...map.values()];
      expect(mapText.innerHTML).toBe(renderItem(mapTemp));
      fireEvent.click(mapBtn);
      mapTemp.push('changed');
      expect(mapText.innerHTML).toBe(renderItem(mapTemp));

      expect(weakMapText.innerHTML).toBe('');
      fireEvent.click(weakMapBtn);
      expect(weakMapText.innerHTML).toBe('changed');

      const setTemp = [...originSet];
      expect(setText.innerHTML).toBe(renderItem(setTemp));
      fireEvent.click(setBtn);
      setTemp.push('changed');
      expect(setText.innerHTML).toBe(renderItem(setTemp));

      expect(weakSetText.innerHTML).toBe('false');
      fireEvent.click(weakSetBtn);
      expect(weakSetText.innerHTML).toBe('true');
    });

    it('proxySetDeep: false', () => {
      const obj = { name: 'obj' };
      const arr = [1, 2];
      const map = new Map();
      const set = new Set();
      const weakMap = new WeakMap([[obj, 123]]);
      const weakSet = new WeakSet();

      initStore(new Set<any>([obj, arr, map, weakMap, set, weakSet]), {
        strictMode: false,
        proxySetDeep: false,
      });

      function Child() {
        let state: Set<any> = useStore(state => state.set);

        const obj = [...state.values()][0];
        const array = [...state.values()][1];
        const map = [...state.values()][2];
        const weakMap = [...state.values()][3];
        const set = [...state.values()][4];
        const weakSet = [...state.values()][5];

        return (
          <div>
            <div role="objText">{renderItem(obj)}</div>
            <div role="arrayText">{renderItem(array)}</div>
            <div role="mapText">{renderItem(map)}</div>
            <div role="weakMapText">{renderItem(weakMap)}</div>
            <div role="setText">{renderItem(set)}</div>
            <div role="weakSetText">{renderItem(weakSet)}</div>

            <button
              role="obj"
              onClick={() => {
                obj.changed = 'changed';
                dispatch();
              }}
            >
              edit obj
            </button>
            <button
              role="array"
              onClick={() => {
                array.push('changed');
                dispatch();
              }}
            >
              edit array
            </button>
            <button
              role="map"
              onClick={() => {
                map.set('changed', 'changed');
                dispatch();
              }}
            >
              edit map
            </button>
            <button
              role="weakMap"
              onClick={() => {
                weakMap.set(objectKey, 'changed');
                dispatch();
              }}
            >
              edit weakMap
            </button>
            <button
              role="set"
              onClick={() => {
                set.add('changed');
                dispatch();
              }}
            >
              edit set
            </button>
            <button
              role="weakSet"
              onClick={() => {
                weakSet.add(objectKey);
                dispatch();
              }}
            >
              edit weakSet
            </button>
          </div>
        );
      }

      render(<Child />, { legacyRoot: reactLegency });

      const objText = screen.getByRole('objText');
      const arrayText = screen.getByRole('arrayText');
      const mapText = screen.getByRole('mapText');
      const weakMapText = screen.getByRole('weakMapText');
      const setText = screen.getByRole('setText');
      const weakSetText = screen.getByRole('weakSetText');
      const objBtn = screen.getByRole('obj');
      const arrayBtn = screen.getByRole('array');
      const mapBtn = screen.getByRole('map');
      const weakMapBtn = screen.getByRole('weakMap');
      const setBtn = screen.getByRole('set');
      const weakSetBtn = screen.getByRole('weakSet');

      const tempObj = { ...obj };
      expect(objText.innerHTML).toBe(renderItem(tempObj));
      fireEvent.click(objBtn);
      expect(objText.innerHTML).toBe(renderItem(tempObj));

      const arrTemp = [...arr];
      expect(arrayText.innerHTML).toBe(renderItem(arrTemp));
      fireEvent.click(arrayBtn);
      expect(arrayText.innerHTML).toBe(renderItem(arrTemp));

      const mapTemp = [...map.values()];
      expect(mapText.innerHTML).toBe(renderItem(mapTemp));
      fireEvent.click(mapBtn);
      expect(mapText.innerHTML).toBe(renderItem(mapTemp));

      expect(weakMapText.innerHTML).toBe('');
      fireEvent.click(weakMapBtn);
      expect(weakMapText.innerHTML).toBe('');

      const setTemp = [...set];
      expect(setText.innerHTML).toBe(renderItem(setTemp));
      fireEvent.click(setBtn);
      expect(setText.innerHTML).toBe(renderItem(setTemp));

      expect(weakSetText.innerHTML).toBe('false');
      fireEvent.click(weakSetBtn);
      expect(weakSetText.innerHTML).toBe('false');
    });
  });
});

describe('set multi component', () => {
  describe('size', () => {
    function checkSize(initSet?: Set<any>) {
      initStore(initSet);

      function Child() {
        let set: Set<any> = useStore(state => state.set);

        return (
          <div>
            <div role="size">{set.size}</div>

            <button
              role="addBtn"
              onClick={() => {
                set.add(Math.floor(Math.random() * 1000000000));
                dispatch();
              }}
            >
              add
            </button>
            <button
              role="addMapBtn"
              onClick={() => {
                set.add('map');
                dispatch();
              }}
            >
              add string map
            </button>
            <button
              role="deleteMapBtn"
              onClick={() => {
                set.delete('map');
                dispatch();
              }}
            >
              delete map
            </button>
            <button
              role="clear"
              onClick={() => {
                set.clear();
                dispatch();
              }}
            >
              clear
            </button>
          </div>
        );
      }

      function Parent() {
        let size: Set<any> = useStore(state => state.set.size);

        return (
          <div>
            <div role="parentSize">{size}</div>
            <Child></Child>
          </div>
        );
      }

      render(<Parent />, { legacyRoot: reactLegency });

      const size = screen.getByRole('size');
      const parentSize = screen.getByRole('parentSize');
      const addBtn = screen.getByRole('addBtn');
      const addMapBtn = screen.getByRole('addMapBtn');
      const deleteMapBtn = screen.getByRole('deleteMapBtn');
      const clear = screen.getByRole('clear');

      let sizeHtml = initSet?.size || 0;
      expect(size.innerHTML).toBe(sizeHtml + '');
      expect(parentSize.innerHTML).toBe(sizeHtml + '');

      for (let i = 0; i < 20; i++) {
        fireEvent.click(addBtn);
        sizeHtml++;
        expect(size.innerHTML).toBe(sizeHtml + '');
        expect(parentSize.innerHTML).toBe(sizeHtml + '');
      }

      fireEvent.click(deleteMapBtn);
      expect(size.innerHTML).toBe(sizeHtml + '');
      expect(parentSize.innerHTML).toBe(sizeHtml + '');

      fireEvent.click(addMapBtn);
      sizeHtml++;
      expect(size.innerHTML).toBe(sizeHtml + '');
      expect(parentSize.innerHTML).toBe(sizeHtml + '');

      fireEvent.click(deleteMapBtn);
      sizeHtml--;
      expect(size.innerHTML).toBe(sizeHtml + '');
      expect(parentSize.innerHTML).toBe(sizeHtml + '');

      fireEvent.click(clear);
      sizeHtml = 0;
      expect(size.innerHTML).toBe(sizeHtml + '');
      expect(parentSize.innerHTML).toBe(sizeHtml + '');
    }

    it('no initial', () => {
      checkSize();
    });
    it('initial 2 items', () => {
      checkSize(new Set(['a', 'b']));
    });
  });

  describe('add new item', () => {
    it('all type', () => {
      const allMaps = getAllInitialMaps(sourceMap);

      initStore();

      let currentValue: any;

      function Child() {
        let set: Set<any> = useStore(state => state.set);

        const items = [...set.values()];

        return (
          <div>
            {items.map(item => (
              <span role="item">
                {typeof item === 'bigint'
                  ? item.toString()
                  : JSON.stringify(
                      typeof item === 'object' &&
                        item !== null &&
                        item.toString().indexOf('Map') > -1 &&
                        item.source
                        ? item.source
                        : item,
                    )}
              </span>
            ))}

            <button
              role="addBtn"
              onClick={() => {
                const current = allMaps.pop()!;
                set.add(current);
                currentValue = current;
                dispatch();
              }}
            >
              add item
            </button>
          </div>
        );
      }

      function Parent() {
        let set: Set<any> = useStore(state => state.set);
        const items = [...set.values()];

        return (
          <div>
            <div role="parentText">{items.length}</div>
            <Child />
          </div>
        );
      }

      render(<Parent />, { legacyRoot: reactLegency });

      const addBtn = screen.getByRole('addBtn');
      const parentText = screen.getByRole('parentText');

      let items;
      const originAllMaps = [...allMaps];
      for (let index in originAllMaps) {
        fireEvent.click(addBtn);
        items = screen.getAllByRole('item');
        expect(items.length).toBe(+index + 1);
        expect(parentText.innerHTML).toBe(+index + 1 + '');
        expect(items[items.length - 1].innerHTML).toBe(
          typeof currentValue === 'bigint'
            ? (currentValue as any).toString()
            : currentValue === undefined || typeof currentValue === 'symbol'
            ? ''
            : JSON.stringify(currentValue),
        );
      }
    });
  });

  describe('delete item', () => {
    it('delete item', () => {
      const all = [...getAllInitialMaps(sourceMap)];
      let currentIndex = 0;

      initStore(new Set<any>(all));

      function Child() {
        let set: Set<any> = useStore(state => state.set);

        const items = [...set.values()];

        return (
          <div>
            {items.map(item => (
              <span role="item">
                {typeof item === 'bigint'
                  ? item.toString()
                  : JSON.stringify(
                      typeof item === 'object' &&
                        item !== null &&
                        item.toString().indexOf('Map') > -1 &&
                        item.source
                        ? item.source
                        : item,
                    )}
              </span>
            ))}

            <button
              role="delete"
              onClick={() => {
                set.delete(all[currentIndex]);
                dispatch();
              }}
            >
              delete
            </button>
          </div>
        );
      }

      function Parent() {
        let set: Set<any> = useStore(state => state.set);
        const items = [...set.values()];

        return (
          <div>
            <div role="parentText">{items.length}</div>
            <Child />
          </div>
        );
      }

      render(<Parent />, { legacyRoot: reactLegency });

      const deleteBtn = screen.getByRole('delete');
      const parentText = screen.getByRole('parentText');

      const allLength = all.length;

      expect(screen.getAllByRole('item').length).toBe(allLength);

      for (let index = 0; index < allLength; index++) {
        currentIndex = index;
        fireEvent.click(deleteBtn);
        const newLength = allLength - index - 1;
        if (newLength > 0) {
          expect(screen.getAllByRole('item').length).toBe(newLength);
        }
        expect(parentText.innerHTML).toBe(newLength + '');
      }
    });
  });

  describe('edit item', () => {
    const newWeakMapKey = {};

    function renderItem(current) {
      if (current.toString() === '[object Set]') return [...current].toString();
      if (current.toString() === '[object WeakSet]') return current.has(newWeakMapKey) + '';
      if (current.toString() === '[object Map]') return [...current.values()].toString();
      if (current.toString() === '[object WeakMap]') return current.get(newWeakMapKey);
      if (Array.isArray(current)) return current.toString();
      if (typeof current === 'object') return JSON.stringify(current);
    }

    it('proxySetDeep: true', () => {
      const obj = { name: 'obj' };
      const arr = [1, 2];
      const map = new Map();
      const set = new Set();
      const weakMap = new WeakMap([[obj, 123]]);
      const weakSet = new WeakSet();

      initStore(new Set<any>([obj, arr, map, weakMap, set, weakSet]), {
        strictMode: false,
        proxySetDeep: true,
      });

      function Child() {
        let state: Set<any> = useStore(state => state.set);

        const obj = [...state.values()][0];
        const array = [...state.values()][1];
        const map = [...state.values()][2];
        const weakMap = [...state.values()][3];
        const set = [...state.values()][4];
        const weakSet = [...state.values()][5];

        return (
          <div>
            <div role="objText">{renderItem(obj)}</div>
            <div role="arrayText">{renderItem(array)}</div>
            <div role="mapText">{renderItem(map)}</div>
            <div role="weakMapText">{renderItem(weakMap)}</div>
            <div role="setText">{renderItem(set)}</div>
            <div role="weakSetText">{renderItem(weakSet)}</div>

            <button
              role="obj"
              onClick={() => {
                obj.changed = 'changed';
                dispatch();
              }}
            >
              edit obj
            </button>
            <button
              role="array"
              onClick={() => {
                array.push('changed');
                dispatch();
              }}
            >
              edit array
            </button>
            <button
              role="map"
              onClick={() => {
                map.set('changed', 'changed');
                dispatch();
              }}
            >
              edit map
            </button>
            <button
              role="weakMap"
              onClick={() => {
                weakMap.set(newWeakMapKey, 'changed');
                dispatch();
              }}
            >
              edit weakMap
            </button>
            <button
              role="set"
              onClick={() => {
                set.add('changed');
                dispatch();
              }}
            >
              edit set
            </button>
            <button
              role="weakSet"
              onClick={() => {
                weakSet.add(newWeakMapKey);
                dispatch();
              }}
            >
              edit weakSet
            </button>
          </div>
        );
      }

      function Parent() {
        let state: Set<any> = useStore(state => state.set);

        const obj = [...state.values()][0];
        const array = [...state.values()][1];
        const map = [...state.values()][2];
        const weakMap = [...state.values()][3];
        const set = [...state.values()][4];
        const weakSet = [...state.values()][5];

        return (
          <div>
            <div role="parentObjText">{renderItem(obj)}</div>
            <div role="parentArrayText">{renderItem(array)}</div>
            <div role="parentMapText">{renderItem(map)}</div>
            <div role="parentWeakMapText">{renderItem(weakMap)}</div>
            <div role="parentSetText">{renderItem(set)}</div>
            <div role="parentWeakSetText">{renderItem(weakSet)}</div>
            <Child />
          </div>
        );
      }

      render(<Parent />, { legacyRoot: reactLegency });

      const objText = screen.getByRole('objText');
      const parentObjText = screen.getByRole('parentObjText');
      const arrayText = screen.getByRole('arrayText');
      const parentArrayText = screen.getByRole('parentArrayText');
      const mapText = screen.getByRole('mapText');
      const parentMapText = screen.getByRole('parentMapText');
      const weakMapText = screen.getByRole('weakMapText');
      const parentWeakMapText = screen.getByRole('parentWeakMapText');
      const setText = screen.getByRole('setText');
      const parentSetText = screen.getByRole('parentSetText');
      const weakSetText = screen.getByRole('weakSetText');
      const parentWeakSetText = screen.getByRole('parentWeakSetText');
      const objBtn = screen.getByRole('obj');
      const arrayBtn = screen.getByRole('array');
      const mapBtn = screen.getByRole('map');
      const weakMapBtn = screen.getByRole('weakMap');
      const setBtn = screen.getByRole('set');
      const weakSetBtn = screen.getByRole('weakSet');

      const tempObj = { ...obj };
      expect(objText.innerHTML).toBe(renderItem(tempObj));
      expect(parentObjText.innerHTML).toBe(renderItem(tempObj));
      fireEvent.click(objBtn);
      (tempObj as any).changed = 'changed';
      expect(objText.innerHTML).toBe(renderItem(tempObj));
      expect(parentObjText.innerHTML).toBe(renderItem(tempObj));

      const arrTemp = [...arr];
      expect(arrayText.innerHTML).toBe(renderItem(arrTemp));
      expect(parentArrayText.innerHTML).toBe(renderItem(arrTemp));
      fireEvent.click(arrayBtn);
      (arrTemp as any).push('changed');
      expect(arrayText.innerHTML).toBe(renderItem(arrTemp));
      expect(parentArrayText.innerHTML).toBe(renderItem(arrTemp));

      const mapTemp = [...map.values()];
      expect(mapText.innerHTML).toBe(renderItem(mapTemp));
      expect(parentMapText.innerHTML).toBe(renderItem(mapTemp));
      fireEvent.click(mapBtn);
      mapTemp.push('changed');
      expect(mapText.innerHTML).toBe(renderItem(mapTemp));
      expect(parentMapText.innerHTML).toBe(renderItem(mapTemp));

      expect(weakMapText.innerHTML).toBe('');
      expect(parentWeakMapText.innerHTML).toBe('');
      fireEvent.click(weakMapBtn);
      expect(weakMapText.innerHTML).toBe('changed');
      expect(parentWeakMapText.innerHTML).toBe('changed');

      const setTemp = [...set];
      expect(setText.innerHTML).toBe(renderItem(setTemp));
      expect(parentSetText.innerHTML).toBe(renderItem(setTemp));
      fireEvent.click(setBtn);
      setTemp.push('changed');
      expect(setText.innerHTML).toBe(renderItem(setTemp));
      expect(parentSetText.innerHTML).toBe(renderItem(setTemp));

      expect(weakSetText.innerHTML).toBe('false');
      expect(parentWeakSetText.innerHTML).toBe('false');
      fireEvent.click(weakSetBtn);
      expect(weakSetText.innerHTML).toBe('true');
      expect(parentWeakSetText.innerHTML).toBe('true');
    });
  });
});

describe('weakSet single component', () => {
  describe('add new item', () => {
    function checkObjToString(value) {
      initStore(new WeakSet());

      function Child() {
        let set: WeakSet<any> = useStore(state => state.set);

        return (
          <div>
            <span role="text">{set.has(value) + ''}</span>

            <button
              role="btn"
              onClick={() => {
                set.add(value);
                dispatch();
              }}
            >
              add
            </button>
          </div>
        );
      }

      render(<Child />, { legacyRoot: reactLegency });

      let item = screen.getByRole('text');
      const addBtn = screen.getByRole('btn');

      expect(item.innerHTML).toBe('false');

      fireEvent.click(addBtn);
      expect(item.innerHTML).toBe('true');
    }

    it('array', () => {
      let key = ['array'];
      checkObjToString(key);
    });

    it('object', () => {
      let key = { type: 'symbol' };
      checkObjToString(key);
    });

    it('set', () => {
      let key = new Set([1]);
      checkObjToString(key);
    });

    it('map', () => {
      let key = new Map();
      checkObjToString(key);
    });
  });

  describe('delete item', () => {
    it('delete item', () => {
      const objectKey = {};
      const setKey = new Set();
      initStore(new WeakSet<any>([objectKey, setKey]));

      function Child() {
        let set: Map<any, any> = useStore(state => state.set);

        return (
          <div>
            <span role="object">{set.has(objectKey) + ''}</span>
            <span role="set">{set.has(setKey) + ''}</span>
            <button
              role="deleteObject"
              onClick={() => {
                set.delete(objectKey);
                dispatch();
              }}
            >
              delete objectKey
            </button>
            <button
              role="deleteSet"
              onClick={() => {
                set.delete(setKey);
                dispatch();
              }}
            >
              delete setKey
            </button>
          </div>
        );
      }

      render(<Child />, { legacyRoot: reactLegency });

      const deleteObject = screen.getByRole('deleteObject');
      const deleteSet = screen.getByRole('deleteSet');
      const object = screen.getByRole('object');
      const set = screen.getByRole('set');

      expect(object.innerHTML).toBe('true');
      expect(set.innerHTML).toBe('true');

      fireEvent.click(deleteObject);
      expect(object.innerHTML).toBe('false');
      expect(set.innerHTML).toBe('true');

      fireEvent.click(deleteSet);
      expect(object.innerHTML).toBe('false');
      expect(set.innerHTML).toBe('false');
    });
  });
});

describe('weakSet multi component', () => {
  describe('add new item', () => {
    function checkObjToString(value) {
      initStore(new WeakSet());

      function Child() {
        let set: WeakSet<any> = useStore(state => state.set);

        return (
          <div>
            <span role="text">{set.has(value) + ''}</span>

            <button
              role="btn"
              onClick={() => {
                set.add(value);
                dispatch();
              }}
            >
              add
            </button>
          </div>
        );
      }

      function Parent() {
        let set: WeakSet<any> = useStore(state => state.set);

        return (
          <div>
            <span role="parentText">{set.has(value) + ''}</span>
            <Child />
          </div>
        );
      }

      render(<Parent />, { legacyRoot: reactLegency });

      let item = screen.getByRole('text');
      let parentText = screen.getByRole('parentText');
      const addBtn = screen.getByRole('btn');

      expect(item.innerHTML).toBe('false');
      expect(parentText.innerHTML).toBe('false');

      fireEvent.click(addBtn);
      expect(item.innerHTML).toBe('true');
      expect(parentText.innerHTML).toBe('true');
    }

    it('array', () => {
      let key = ['array'];
      checkObjToString(key);
    });

    it('object', () => {
      let key = { type: 'symbol' };
      checkObjToString(key);
    });

    it('set', () => {
      let key = new Set([1]);
      checkObjToString(key);
    });

    it('map', () => {
      let key = new Map();
      checkObjToString(key);
    });
  });

  describe('delete item', () => {
    it('delete item', () => {
      const objectKey = {};
      const setKey = new Set();
      initStore(new WeakSet<any>([objectKey, setKey]));

      function Child() {
        let set: Map<any, any> = useStore(state => state.set);

        return (
          <div>
            <span role="object">{set.has(objectKey) + ''}</span>
            <span role="set">{set.has(setKey) + ''}</span>
            <button
              role="deleteObject"
              onClick={() => {
                set.delete(objectKey);
                dispatch();
              }}
            >
              delete objectKey
            </button>
            <button
              role="deleteSet"
              onClick={() => {
                set.delete(setKey);
                dispatch();
              }}
            >
              delete setKey
            </button>
          </div>
        );
      }

      function Parent() {
        let hasObject: Map<any, any> = useStore(state => state.set.has(objectKey));
        let hasSet: Map<any, any> = useStore(state => state.set.has(setKey));
        return (
          <div>
            <span role="parentObject">{hasObject + ''}</span>
            <span role="parentSet">{hasSet + ''}</span>
            <Child />
          </div>
        );
      }

      render(<Parent />, { legacyRoot: reactLegency });

      const deleteObject = screen.getByRole('deleteObject');
      const deleteSet = screen.getByRole('deleteSet');
      const object = screen.getByRole('object');
      const parentObject = screen.getByRole('parentObject');
      const set = screen.getByRole('set');
      const parentSet = screen.getByRole('parentSet');

      expect(object.innerHTML).toBe('true');
      expect(parentObject.innerHTML).toBe('true');
      expect(set.innerHTML).toBe('true');
      expect(parentSet.innerHTML).toBe('true');

      fireEvent.click(deleteObject);
      expect(object.innerHTML).toBe('false');
      expect(parentObject.innerHTML).toBe('false');
      expect(set.innerHTML).toBe('true');
      expect(parentSet.innerHTML).toBe('true');

      fireEvent.click(deleteSet);
      expect(object.innerHTML).toBe('false');
      expect(parentObject.innerHTML).toBe('false');
      expect(set.innerHTML).toBe('false');
      expect(parentSet.innerHTML).toBe('false');
    });
  });
});

it('same object key for multi map', () => {
  const key = { same: true };

  createStore({
    initState: {
      set: new Set([key]),
      weakSet: new WeakSet([key]),
    },
    options: { strictMode: false },
  });

  function Child() {
    let set: Set<any> = useStore(state => state.set);

    const hasKey = set.has(key);

    return (
      <div>
        <span role="childText">{hasKey + ''}</span>

        <button
          role="childDeleteBtn"
          onClick={() => {
            set.delete(key);
            dispatch();
          }}
        >
          delete
        </button>
      </div>
    );
  }

  function Parent() {
    let set: WeakSet<any> = useStore(state => state.weakSet);
    const hasKey = set.has(key);

    return (
      <div>
        <div role="parentText">{hasKey + ''}</div>
        <button
          role="parentDeleteBtn"
          onClick={() => {
            set.delete(key);
            dispatch();
          }}
        >
          delete
        </button>
        <Child></Child>
      </div>
    );
  }

  render(<Parent />, { legacyRoot: reactLegency });

  const childText = screen.getByRole('childText');
  const parentText = screen.getByRole('parentText');
  const childDeleteBtn = screen.getByRole('childDeleteBtn');
  const parentDeleteBtn = screen.getByRole('parentDeleteBtn');

  expect(childText.innerHTML).toBe('true');
  expect(parentText.innerHTML).toBe('true');

  fireEvent.click(childDeleteBtn);
  expect(childText.innerHTML).toBe('false');
  expect(parentText.innerHTML).toBe('true');

  fireEvent.click(parentDeleteBtn);
  expect(childText.innerHTML).toBe('false');
  expect(parentText.innerHTML).toBe('false');
});

it('JSON.stringify: Set', () => {
  const initState = { set: new Set() };
  const { state } = createStore({
    initState,
    options: { strictMode: false },
  });

  expect(JSON.stringify(initState.set)).toBe(JSON.stringify(state.set));

  state.set.add('set');
  expect(JSON.stringify(initState.set)).toBe(JSON.stringify(state.set));
});

it('JSON.stringify: WeakSet', () => {
  const objectKey = { type: 'weakSet' };
  const initState = { set: new WeakSet([objectKey]) };
  const { state } = createStore({
    initState,
    options: { strictMode: false },
  });

  expect(JSON.stringify(initState.set)).toBe(JSON.stringify(state.set));

  state.set.delete(objectKey);
  expect(JSON.stringify(initState.set)).toBe(JSON.stringify(state.set));
});
