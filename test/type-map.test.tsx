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
  const typeMap = {};

  for (let key in sourceMap) {
    const map = new Map();
    for (let valueKey in sourceMap) {
      if (valueKey === key) continue;
      map.set(sourceMap[key](), sourceMap[valueKey]());
    }
    typeMap[key] = map;
  }

  return Object.values(typeMap).reduce((pre, current: any) => {
    (pre as any[]).push(...current.entries());
    return pre;
  }, []) as [any, any][];
}

function initStore(map?: Map<any, any> | WeakMap<any, any>, options?: { strictMode?: boolean }) {
  const initState = {
    map: map || new Map(),
  };

  const store = createStore({
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

describe('map single component', () => {
  describe('size', () => {
    function checkSize(initMap?: Map<any, any>) {
      initStore(initMap);

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        return (
          <div>
            <div role="size">{map.size}</div>

            <button
              role="addBtn"
              onClick={() => {
                map.set(Math.floor(Math.random() * 1000000000) + '', Math.floor(Math.random() * 1000));
                dispatch();
              }}
            >
              add
            </button>
            <button
              role="addMapBtn"
              onClick={() => {
                map.set('map', Math.floor(Math.random() * 1000));
                dispatch();
              }}
            >
              add string map
            </button>
            <button
              role="deleteMapBtn"
              onClick={() => {
                map.delete('map');
                dispatch();
              }}
            >
              delete map
            </button>
            <button
              role="clear"
              onClick={() => {
                map.clear()
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

      let sizeHtml = initMap?.size || 0;
      expect(size.innerHTML).toBe(sizeHtml + '');

      for(let i = 0 ; i < 20; i++) {
        fireEvent.click(addBtn);
        sizeHtml++
        expect(size.innerHTML).toBe(sizeHtml + '');
      }

      fireEvent.click(deleteMapBtn);
      expect(size.innerHTML).toBe(sizeHtml + '');

      fireEvent.click(addMapBtn);
      sizeHtml++
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
      checkSize(new Map([['a', 3], ['b', 2]]));
    });
  });

  describe('add new item', () => {
    function checkToString(key, value) {
      initStore();
      let length = 0;
      let outerMap;

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        outerMap = map;
        length = map.size;

        return (
          <div>
            <span role="text">{map.get(key)}</span>

            <button
              role="btn"
              onClick={() => {
                map.set(key, value);
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

      expect(length).toBe(0);
      expect(item.innerHTML).toBeFalsy();

      fireEvent.click(addBtn);
      expect(length).toBe(1);
      expect(item.innerHTML).toBe(value);
      expect([...outerMap.keys()][0]).toBe(key);
    }

    it('string -> string', () => {
      initStore();
      let length = 0;

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        length = map.size;

        return (
          <div>
            {[...map.values()].map(value => (
              <span role="string">{value}</span>
            ))}

            <button
              role="btn"
              onClick={() => {
                map.set(Math.floor(Math.random() * 100000) + '', Math.floor(Math.random() * 1000));
                dispatch();
              }}
            >
              add string
            </button>
          </div>
        );
      }

      render(<Child />, { legacyRoot: reactLegency });

      let items: any = [];
      try {
        items = screen.getAllByRole('string');
      } catch (e) {}
      const addBtn = screen.getByRole('btn');

      expect(length).toBe(0);
      expect(items.length).toBe(0);

      fireEvent.click(addBtn);
      items = screen.getAllByRole('string');
      expect(length).toBe(1);
      expect(items.length).toBe(1);

      fireEvent.click(addBtn);
      items = screen.getAllByRole('string');
      expect(length).toBe(2);
      expect(items.length).toBe(2);

      fireEvent.click(addBtn);
      fireEvent.click(addBtn);

      items = screen.getAllByRole('string');

      items.forEach(item => {
        expect(+item.innerHTML).toBeLessThanOrEqual(1000);
        expect(+item.innerHTML).toBeGreaterThan(0);
      });
    });

    it('number -> string', () => {
      initStore();
      let length = 0;
      let outerMap;

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        outerMap = map;
        length = map.size;

        return (
          <div>
            {[...map.values()].map(value => (
              <span role="number">{value}</span>
            ))}

            <button
              role="btn"
              onClick={() => {
                map.set(Math.floor(Math.random() * 100000), Math.floor(Math.random() * 100));
                dispatch();
              }}
            >
              add number
            </button>
          </div>
        );
      }

      render(<Child />, { legacyRoot: reactLegency });

      let items: any = [];
      try {
        items = screen.getAllByRole('number');
      } catch (e) {}
      const addBtn = screen.getByRole('btn');

      expect(length).toBe(0);
      expect(items.length).toBe(0);

      fireEvent.click(addBtn);
      items = screen.getAllByRole('number');
      expect(length).toBe(1);
      expect(items.length).toBe(1);
      expect(typeof [...outerMap.keys()][0]).toBe('number');

      fireEvent.click(addBtn);
      items = screen.getAllByRole('number');
      expect(length).toBe(2);
      expect(items.length).toBe(2);
      expect(typeof [...outerMap.keys()][0]).toBe('number');
      expect(typeof [...outerMap.keys()][1]).toBe('number');

      items.forEach(item => {
        expect(+item.innerHTML).toBeLessThanOrEqual(100);
        expect(+item.innerHTML).toBeGreaterThan(0);
      });
    });

    it('Symbol -> string', () => {
      let key = Symbol(123);
      checkToString(key, 'string');
    });

    it('array -> string', () => {
      let key = ['array'];
      let value = 'array';
      checkToString(key, value);
    });

    it('object -> string', () => {
      let key = { type: 'symbol' };
      let value = 'object';
      checkToString(key, value);
    });

    it('set -> string', () => {
      let key = new Set([1]);
      let value = 'set';
      checkToString(key, value);
    });

    it('map -> string', () => {
      let key = new Map();
      let value = 'map';
      checkToString(key, value);
    });

    it('map -> object', () => {
      initStore();
      let length = 0;
      let key = new Map();
      let value = { type: 'map' };

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        length = map.size;

        const obj = map.get(key);

        return (
          <div>
            <span role="obj">{JSON.stringify(obj)}</span>
            <span role="propertyType">{obj?.type}</span>

            <button
              role="addBtn"
              onClick={() => {
                map.set(key, value);
                dispatch();
              }}
            >
              add item
            </button>
            <button
              role="editBtn"
              onClick={() => {
                obj.type += '_1';
                dispatch();
              }}
            >
              edit item
            </button>
          </div>
        );
      }

      render(<Child />, { legacyRoot: reactLegency });

      let objText = screen.getByRole('obj');
      let propertyTypeText = screen.getByRole('propertyType');
      const addBtn = screen.getByRole('addBtn');
      const editBtn = screen.getByRole('editBtn');

      expect(length).toBe(0);
      expect(objText.innerHTML).toBeFalsy();
      expect(propertyTypeText.innerHTML).toBeFalsy();

      fireEvent.click(addBtn);
      expect(length).toBe(1);
      expect(objText.innerHTML).toBe(JSON.stringify(value));
      expect(propertyTypeText.innerHTML).toBe(value.type);

      fireEvent.click(editBtn);
      expect(length).toBe(1);
      expect(objText.innerHTML).toBe(JSON.stringify(value));
      expect(propertyTypeText.innerHTML).toBe(value.type);
      expect(value.type).toBe('map_1');
    });

    it('map -> map', () => {
      initStore();
      let length = 0;
      let key = new Map();
      let value = new Map();

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        length = map.size;
        const obj = map.get(key);

        return (
          <div>
            <span role="obj">{obj?.size}</span>
            <span role="propertyType">{obj?.get('type')}</span>

            <button
              role="addBtn"
              onClick={() => {
                map.set(key, value);
                dispatch();
              }}
            >
              add item
            </button>
            <button
              role="editBtn"
              onClick={() => {
                obj.set('type', 'map - map');
                dispatch();
              }}
            >
              edit item
            </button>
          </div>
        );
      }

      render(<Child />, { legacyRoot: reactLegency });

      let objText = screen.getByRole('obj');
      let propertyTypeText = screen.getByRole('propertyType');
      const addBtn = screen.getByRole('addBtn');
      const editBtn = screen.getByRole('editBtn');

      expect(length).toBe(0);
      expect(objText.innerHTML).toBeFalsy();
      expect(propertyTypeText.innerHTML).toBeFalsy();

      fireEvent.click(addBtn);
      expect(length).toBe(1);
      expect(objText.innerHTML).toBe('0');
      expect(propertyTypeText.innerHTML).toBeFalsy();

      fireEvent.click(editBtn);
      expect(length).toBe(1);
      expect(objText.innerHTML).toBe('1');
      expect(propertyTypeText.innerHTML).toBe('map - map');
      expect(value.get('type')).toBe('map - map');
    });

    it('all type', () => {
      const allMaps = getAllInitialMaps(sourceMap);

      initStore();

      let currentValue = '';

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        const items = [...map.values()];

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
                map.set(current[0], current[1]);
                currentValue = current[1];
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

  describe('edit item', () => {
    function renderItem(current) {
      return typeof current === 'bigint'
        ? current.toString()
        : typeof current === 'symbol'
        ? current.description
        : typeof current === 'object' &&
          current !== null &&
          (current.toString() === '[object Set]' || current.toString() === '[object Map]')
        ? [...current].toString()
        : JSON.stringify(current);
    }

    it('edit all type', () => {
      const allMaps = getAllInitialMaps(sourceMap);

      const map = new Map();

      allMaps.forEach(([key, value]) => map.set(key, value));

      const { initState } = initStore(map);
      const allItems = [...(initState.map as Map<any, any>).entries()];

      let currentKey: any = allItems[0][0];

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        const current = map.get(currentKey);

        return (
          <div>
            <div role="outer">{<span role="item">{renderItem(current)}</span>}</div>

            <button
              role="edit"
              onClick={() => {
                const value = map.get(currentKey);

                let newValue = value;

                switch (typeof value) {
                  case 'bigint':
                    newValue = BigInt(value.toString() + '1');
                    break;
                  case 'boolean':
                    newValue = !value;
                    break;
                  case 'number':
                    newValue = value + 1;
                    break;
                  case 'string':
                    newValue = value + '_1';
                    break;
                  case 'symbol':
                    newValue = Symbol(value.description + '_1');
                    break;
                  case 'undefined':
                    newValue = 'undefined_changed';
                    break;
                  case 'object':
                    if (value === null) newValue = 'null_changed';
                    else if (value.toString() === '[object Map]') value.set('changed', 'changed');
                    else if (value.toString() === '[object Set]') value.add('changed');
                    else if (value.toString() === '[object Object]') value.changed = 'changed';
                    else if (Array.isArray(value)) value.push('changed');
                    else newValue = 'changed';
                    break;
                }

                map.set(currentKey, newValue);
                dispatch();
              }}
            >
              add item
            </button>
          </div>
        );
      }

      render(<Child />, { legacyRoot: reactLegency });

      const editBtn = screen.getByRole('edit');

      expect(screen.getByRole('item').innerHTML).toBe(renderItem(allItems[0][1]));

      for (let index = 0; index < allItems.length; index++) {
        let item = allItems[index];
        currentKey = item[0];
        const originItem = item[1];

        // todo type set check
        if (
          typeof originItem === 'object' &&
          originItem !== null &&
          originItem.toString().indexOf('Set') > -1
        )
          continue;

        let itemRenderText: any = renderItem(originItem);

        let newItemRenderText = itemRenderText;
        switch (typeof originItem) {
          case 'bigint':
            newItemRenderText = originItem.toString() + '1';
            break;
          case 'boolean':
            newItemRenderText = JSON.stringify(!originItem);
            break;
          case 'number':
            newItemRenderText = JSON.stringify(originItem + 1);
            break;
          case 'string':
            newItemRenderText = JSON.stringify(originItem + '_1');
            break;
          case 'symbol':
            newItemRenderText = originItem.description + '_1';
            break;
          case 'undefined':
            newItemRenderText = JSON.stringify('undefined_changed');
            break;
          case 'object':
            if (originItem === null) newItemRenderText = JSON.stringify('null_changed');
            else if (originItem.toString() === '[object Map]')
              newItemRenderText = [...originItem, ['changed', 'changed']].toString();
            else if (originItem.toString() === '[object Set]')
              newItemRenderText = [...originItem, 'changed'].toString();
            else if (originItem.toString() === '[object Object]')
              newItemRenderText = JSON.stringify({ ...originItem, changed: 'changed' });
            else if (Array.isArray(originItem))
              newItemRenderText = JSON.stringify([...originItem, 'changed']);
            else newItemRenderText = JSON.stringify('changed');
            break;
        }

        fireEvent.click(editBtn);
        expect(screen.getByRole('item').innerHTML).toBe(newItemRenderText);
      }
    });
  });

  describe('delete item', () => {
    it('delete item', () => {
      initStore(
        new Map<any, any>([
          ['key', 'value'],
          [123, 123],
        ]),
      );

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        const items = [...map.values()];

        return (
          <div>
            {items.map(item => (
              <span key={item} role="item">
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
              role="deleteKey"
              onClick={() => {
                map.delete('key');
                dispatch();
              }}
            >
              delete key
            </button>
            <button
              role="deleteNum"
              onClick={() => {
                map.delete(123);
                dispatch();
              }}
            >
              delete 123
            </button>
          </div>
        );
      }

      const { container } = render(<Child />, { legacyRoot: reactLegency });

      const deleteKey = screen.getByRole('deleteKey');
      const deleteNum = screen.getByRole('deleteNum');

      expect(screen.getAllByRole('item').length).toBe(2);

      fireEvent.click(deleteKey);
      expect(screen.getAllByRole('item').length).toBe(1);

      fireEvent.click(deleteNum);
      expect(container.querySelectorAll('span').length).toBe(0);
    });
  });
});

describe('map multi component', () => {
  describe('size', () => {
    function checkSize(initMap?: Map<any, any>) {
      initStore(initMap);

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        return (
          <div>
            <div role="size">{map.size}</div>

            <button
              role="addBtn"
              onClick={() => {
                map.set(Math.floor(Math.random() * 1000000000) + '', Math.floor(Math.random() * 1000));
                dispatch();
              }}
            >
              add
            </button>
            <button
              role="addMapBtn"
              onClick={() => {
                map.set('map', Math.floor(Math.random() * 1000));
                dispatch();
              }}
            >
              add string map
            </button>
            <button
              role="deleteMapBtn"
              onClick={() => {
                map.delete('map');
                dispatch();
              }}
            >
              delete map
            </button>
            <button
              role="clear"
              onClick={() => {
                map.clear()
                dispatch();
              }}
            >
              clear
            </button>
          </div>
        );
      }

      function Parent() {
        let size: Map<any, any> = useStore(state => state.map.size);

        return <div>
          <div role='parentSize'>{size}</div>
          <Child />
        </div>;
      }

      render(<Parent />, { legacyRoot: reactLegency });

      const size = screen.getByRole('size');
      const addBtn = screen.getByRole('addBtn');
      const addMapBtn = screen.getByRole('addMapBtn');
      const deleteMapBtn = screen.getByRole('deleteMapBtn');
      const clear = screen.getByRole('clear');


      const parentSize = screen.getByRole('parentSize');

      let sizeHtml = initMap?.size || 0;
      expect(size.innerHTML).toBe(sizeHtml + '');

      for(let i = 0 ; i < 20; i++) {
        fireEvent.click(addBtn);
        sizeHtml++
        expect(size.innerHTML).toBe(sizeHtml + '');
        expect(parentSize.innerHTML).toBe(sizeHtml + '');
      }

      fireEvent.click(deleteMapBtn);
      expect(size.innerHTML).toBe(sizeHtml + '');
      expect(parentSize.innerHTML).toBe(sizeHtml + '');

      fireEvent.click(addMapBtn);
      sizeHtml++
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
    it('initial 3 items', () => {
      checkSize(new Map([['a', 3], ['b', 2], ['c', 3]]));
    });
  })

  describe('add new item', () => {
    function checkType(key, value) {
      initStore(new Map());

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        length = map.size;

        const type = map.get(key);

        return (
          <div>
            <span role="childText">{type}</span>

            <button
              role="btn"
              onClick={() => {
                map.set(key, value);
                dispatch();
              }}
            >
              add
            </button>
          </div>
        );
      }

      function Parent() {
        let type: Map<any, any> = useStore(state => state.map.get(key));

        return (
          <div>
            <div role="parentText">{type}</div>
            <Child></Child>
          </div>
        );
      }

      render(<Parent />, { legacyRoot: reactLegency });

      const childText = screen.getByRole('childText');
      const parentText = screen.getByRole('parentText');
      const btn = screen.getByRole('btn');

      expect(childText.innerHTML).toBeFalsy();
      expect(parentText.innerHTML).toBeFalsy();

      fireEvent.click(btn);
      expect(childText.innerHTML).toBe(value);
      expect(parentText.innerHTML).toBe(value);
    }

    it('string -> string', () => {
      checkType('type', 'map');
    });

    it('number -> string', () => {
      checkType(123, 'map');
    });

    it('Symbol -> string', () => {
      checkType(Symbol(123), 'map');
    });

    it('object -> string', () => {
      checkType({}, 'map');
    });
  });

  describe('edit item', () => {
    function checkEdit(key, value) {
      initStore(new Map([[key, value]]));

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        const type = map.get(key);

        return (
          <div>
            <span role="childText">{type}</span>

            <button
              role="btn"
              onClick={() => {
                map.set(key, value + '_1');
                dispatch();
              }}
            >
              edit
            </button>
          </div>
        );
      }

      function Parent() {
        let type: Map<any, any> = useStore(state => state.map.get(key));

        return (
          <div>
            <div role="parentText">{type}</div>
            <Child></Child>
          </div>
        );
      }

      render(<Parent />, { legacyRoot: reactLegency });

      const childText = screen.getByRole('childText');
      const parentText = screen.getByRole('parentText');
      const btn = screen.getByRole('btn');

      expect(childText.innerHTML).toBe(value);
      expect(parentText.innerHTML).toBe(value);

      fireEvent.click(btn);
      expect(childText.innerHTML).toBe(value + '_1');
      expect(parentText.innerHTML).toBe(value + '_1');
    }

    it('string -> string', () => {
      checkEdit('type', 'map');
    });

    it('number -> string', () => {
      checkEdit(123, 'map');
    });

    it('Symbol -> string', () => {
      checkEdit(Symbol(123), 'map');
    });

    it('object -> string', () => {
      checkEdit({}, 'map');
    });
  });

  describe('delete item', () => {
    it('delete item', () => {
      const key = 'type';
      const value = 'map';

      initStore(new Map([[key, value]]));

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        const type = map.get(key);

        return (
          <div>
            <span role="childText">{type}</span>

            <button
              role="btn"
              onClick={() => {
                map.delete(key);
                dispatch();
              }}
            >
              delete
            </button>
          </div>
        );
      }

      function Parent() {
        let type: Map<any, any> = useStore(state => state.map.get(key));

        return (
          <div>
            <div role="parentText">{type}</div>
            <Child></Child>
          </div>
        );
      }

      render(<Parent />, { legacyRoot: reactLegency });

      const childText = screen.getByRole('childText');
      const parentText = screen.getByRole('parentText');
      const btn = screen.getByRole('btn');

      expect(childText.innerHTML).toBe(value);
      expect(parentText.innerHTML).toBe(value);

      fireEvent.click(btn);
      expect(childText.innerHTML).toBeFalsy();
      expect(parentText.innerHTML).toBeFalsy();
    });
  });
});

describe('weakMap single component', () => {
  describe('add new item', () => {
    function checkObjToString(key, value) {
      initStore(new WeakMap());

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        return (
          <div>
            <span role="text">{map.get(key)}</span>

            <button
              role="btn"
              onClick={() => {
                map.set(key, value);
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

      expect(item.innerHTML).toBeFalsy();

      fireEvent.click(addBtn);
      expect(item.innerHTML).toBe(value);
    }

    it('array -> string', () => {
      let key = ['array'];
      let value = 'array';
      checkObjToString(key, value);
    });

    it('object -> string', () => {
      let key = { type: 'symbol' };
      let value = 'object';
      checkObjToString(key, value);
    });

    it('set -> string', () => {
      let key = new Set([1]);
      let value = 'set';
      checkObjToString(key, value);
    });

    it('map -> string', () => {
      let key = new Map();
      let value = 'map';
      checkObjToString(key, value);
    });

    it('map -> object', () => {
      initStore(new WeakMap());
      let key = new Map();
      let value = { type: 'map' };

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        const obj = map.get(key);

        return (
          <div>
            <span role="obj">{JSON.stringify(obj)}</span>
            <span role="propertyType">{obj?.type}</span>

            <button
              role="addBtn"
              onClick={() => {
                map.set(key, value);
                dispatch();
              }}
            >
              add item
            </button>
            <button
              role="editBtn"
              onClick={() => {
                obj.type += '_1';
                dispatch();
              }}
            >
              edit item
            </button>
          </div>
        );
      }

      render(<Child />, { legacyRoot: reactLegency });

      let objText = screen.getByRole('obj');
      let propertyTypeText = screen.getByRole('propertyType');
      const addBtn = screen.getByRole('addBtn');
      const editBtn = screen.getByRole('editBtn');

      expect(objText.innerHTML).toBeFalsy();
      expect(propertyTypeText.innerHTML).toBeFalsy();

      fireEvent.click(addBtn);
      expect(objText.innerHTML).toBe(JSON.stringify(value));
      expect(propertyTypeText.innerHTML).toBe(value.type);

      fireEvent.click(editBtn);
      expect(objText.innerHTML).toBe(JSON.stringify(value));
      expect(propertyTypeText.innerHTML).toBe(value.type);
      expect(value.type).toBe('map_1');
    });

    it('map -> map', () => {
      initStore(new WeakMap());
      let key = new Map();
      let value = new Map();

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        const obj = map.get(key);

        return (
          <div>
            <span role="propertyType">{obj?.get('type')}</span>

            <button
              role="addBtn"
              onClick={() => {
                map.set(key, value);
                dispatch();
              }}
            >
              add item
            </button>
            <button
              role="editBtn"
              onClick={() => {
                obj.set('type', 'map - map');
                dispatch();
              }}
            >
              edit item
            </button>
          </div>
        );
      }

      render(<Child />, { legacyRoot: reactLegency });

      let propertyTypeText = screen.getByRole('propertyType');
      const addBtn = screen.getByRole('addBtn');
      const editBtn = screen.getByRole('editBtn');

      expect(propertyTypeText.innerHTML).toBeFalsy();

      fireEvent.click(addBtn);
      expect(propertyTypeText.innerHTML).toBeFalsy();

      fireEvent.click(editBtn);
      expect(propertyTypeText.innerHTML).toBe('map - map');
      expect(value.get('type')).toBe('map - map');
    });
  });

  describe('edit item', () => {
    it('edit object:string', () => {
      const objectKey = {};
      initStore(new WeakMap<any, any>([[objectKey, 'value']]));

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        const value = map.get(objectKey);

        return (
          <div>
            <span role="item">{typeof value === 'string' ? value : JSON.stringify(value)}</span>
            <span role="name">{value && value.name}</span>

            <button
              role="edit"
              onClick={() => {
                map.set(objectKey, { name: 123 });
                dispatch();
              }}
            >
              edit
            </button>
          </div>
        );
      }

      render(<Child />, { legacyRoot: reactLegency });

      const edit = screen.getByRole('edit');

      expect(screen.getByRole('item').innerHTML).toBe('value');
      expect(screen.getByRole('name').innerHTML).toBeFalsy();

      fireEvent.click(edit);
      expect(screen.getByRole('item').innerHTML).toBe(JSON.stringify({ name: 123 }));
      expect(screen.getByRole('name').innerHTML).toBe('123');
    });

    it('edit set:obj', () => {
      const objectKey = new Set();
      initStore(new WeakMap<any, any>([[objectKey, { name: 123 }]]));

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        const value = map.get(objectKey);

        return (
          <div>
            <span role="item">{typeof value === 'string' ? value : JSON.stringify(value)}</span>
            <span role="name">{value && value.name}</span>

            <button
              role="edit"
              onClick={() => {
                map.set(objectKey, 'changed');
                dispatch();
              }}
            >
              edit
            </button>
          </div>
        );
      }

      render(<Child />, { legacyRoot: reactLegency });

      const edit = screen.getByRole('edit');
      expect(screen.getByRole('item').innerHTML).toBe(JSON.stringify({ name: 123 }));
      expect(screen.getByRole('name').innerHTML).toBe('123');

      fireEvent.click(edit);
      expect(screen.getByRole('item').innerHTML).toBe('changed');
      expect(screen.getByRole('name').innerHTML).toBeFalsy();
    });
  });

  describe('delete item', () => {
    it('delete item', () => {
      const objectKey = {};
      const setKey = new Set();
      initStore(
        new WeakMap<any, any>([
          [objectKey, 'value'],
          [setKey, 123],
        ]),
      );

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        return (
          <div>
            <span role="string">{map.get(objectKey)}</span>
            <span role="number">{map.get(setKey)}</span>
            <button
              role="deleteKey"
              onClick={() => {
                map.delete(objectKey);
                dispatch();
              }}
            >
              delete objectKey
            </button>
            <button
              role="deleteNum"
              onClick={() => {
                map.delete(setKey);
                dispatch();
              }}
            >
              delete setKey
            </button>
          </div>
        );
      }

      render(<Child />, { legacyRoot: reactLegency });

      const deleteKey = screen.getByRole('deleteKey');
      const deleteNum = screen.getByRole('deleteNum');

      expect(screen.getByRole('string').innerHTML).toBe('value');
      expect(screen.getByRole('number').innerHTML).toBe('123');

      fireEvent.click(deleteKey);
      expect(screen.getByRole('string').innerHTML).toBeFalsy();
      expect(screen.getByRole('number').innerHTML).toBe('123');

      fireEvent.click(deleteNum);
      expect(screen.getByRole('string').innerHTML).toBeFalsy();
      expect(screen.getByRole('number').innerHTML).toBeFalsy();
    });
  });
});

describe('weakMap multi component', () => {
  describe('add new item', () => {
    function checkType(key, value) {
      initStore(new WeakMap());

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        const type = map.get(key);

        return (
          <div>
            <span role="childText">{type}</span>

            <button
              role="btn"
              onClick={() => {
                map.set(key, value);
                dispatch();
              }}
            >
              add
            </button>
          </div>
        );
      }

      function Parent() {
        let type: Map<any, any> = useStore(state => state.map.get(key));

        return (
          <div>
            <div role="parentText">{type}</div>
            <Child></Child>
          </div>
        );
      }

      render(<Parent />, { legacyRoot: reactLegency });

      const childText = screen.getByRole('childText');
      const parentText = screen.getByRole('parentText');
      const btn = screen.getByRole('btn');

      expect(childText.innerHTML).toBeFalsy();
      expect(parentText.innerHTML).toBeFalsy();

      fireEvent.click(btn);
      expect(childText.innerHTML).toBe(value);
      expect(parentText.innerHTML).toBe(value);
    }

    it('object -> string', () => {
      checkType({}, 'map');
    });

    it('set -> string', () => {
      checkType(new Set(), '123');
    });
  });

  describe('edit item', () => {
    function checkEdit(key, value) {
      initStore(new WeakMap([[key, value]]));

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        const type = map.get(key);

        return (
          <div>
            <span role="childText">{type}</span>

            <button
              role="btn"
              onClick={() => {
                map.set(key, value + '_1');
                dispatch();
              }}
            >
              edit
            </button>
          </div>
        );
      }

      function Parent() {
        let type: Map<any, any> = useStore(state => state.map.get(key));

        return (
          <div>
            <div role="parentText">{type}</div>
            <Child></Child>
          </div>
        );
      }

      render(<Parent />, { legacyRoot: reactLegency });

      const childText = screen.getByRole('childText');
      const parentText = screen.getByRole('parentText');
      const btn = screen.getByRole('btn');

      expect(childText.innerHTML).toBe(value);
      expect(parentText.innerHTML).toBe(value);

      fireEvent.click(btn);
      expect(childText.innerHTML).toBe(value + '_1');
      expect(parentText.innerHTML).toBe(value + '_1');
    }

    it('Map -> string', () => {
      checkEdit(new Map(), 'map');
    });

    it('WeakMap -> string', () => {
      checkEdit(new WeakMap(), 'map');
    });

    it('array -> string', () => {
      checkEdit([], 'map');
    });

    it('object -> string', () => {
      checkEdit({}, 'map');
    });
  });

  describe('delete item', () => {
    it('delete item', () => {
      const key = {};
      const value = 'map';

      initStore(new WeakMap([[key, value]]));

      function Child() {
        let map: Map<any, any> = useStore(state => state.map);

        const type = map.get(key);

        return (
          <div>
            <span role="childText">{type}</span>

            <button
              role="btn"
              onClick={() => {
                map.delete(key);
                dispatch();
              }}
            >
              delete
            </button>
          </div>
        );
      }

      function Parent() {
        let type: Map<any, any> = useStore(state => state.map.get(key));

        return (
          <div>
            <div role="parentText">{type}</div>
            <Child></Child>
          </div>
        );
      }

      render(<Parent />, { legacyRoot: reactLegency });

      const childText = screen.getByRole('childText');
      const parentText = screen.getByRole('parentText');
      const btn = screen.getByRole('btn');

      expect(childText.innerHTML).toBe(value);
      expect(parentText.innerHTML).toBe(value);

      fireEvent.click(btn);
      expect(childText.innerHTML).toBeFalsy();
      expect(parentText.innerHTML).toBeFalsy();
    });
  });
});

it('same object key for multi map', () => {
  const key = { same: true };

  createStore({
    initState: {
      map: new Map([[key, 'map']]),
      weakMap: new WeakMap([[key, 'weakMap']]),
    },
    options: { strictMode: false },
  });

  function Child() {
    let map: Map<any, any> = useStore(state => state.map);

    const type = map.get(key);

    return (
      <div>
        <span role="childText">{type}</span>

        <button
          role="childChangeBtn"
          onClick={() => {
            map.set(key, type ? type + '_1' : 'map_changed');
            dispatch();
          }}
        >
          change
        </button>
        <button
          role="childDeleteBtn"
          onClick={() => {
            map.delete(key);
            dispatch();
          }}
        >
          delete
        </button>
        <button
          role="childAddBtn"
          onClick={() => {
            map.set(key, 'map');
            dispatch();
          }}
        >
          add
        </button>
      </div>
    );
  }

  function Parent() {
    let map: Map<any, any> = useStore(state => state.weakMap);
    const type = map.get(key);

    return (
      <div>
        <div role="parentText">{type}</div>
        <button
          role="parentChangeBtn"
          onClick={() => {
            map.set(key, type ? type + '_1' : 'weakMap_changed');
            dispatch();
          }}
        >
          change
        </button>
        <button
          role="parentDeleteBtn"
          onClick={() => {
            map.delete(key);
            dispatch();
          }}
        >
          delete
        </button>
        <button
          role="parentAddBtn"
          onClick={() => {
            map.set(key, 'weakMap');
            dispatch();
          }}
        >
          add
        </button>
        <Child></Child>
      </div>
    );
  }

  render(<Parent />, { legacyRoot: reactLegency });

  const childText = screen.getByRole('childText');
  const parentText = screen.getByRole('parentText');
  const childChangeBtn = screen.getByRole('childChangeBtn');
  const childDeleteBtn = screen.getByRole('childDeleteBtn');
  const childAddBtn = screen.getByRole('childAddBtn');
  const parentChangeBtn = screen.getByRole('parentChangeBtn');
  const parentDeleteBtn = screen.getByRole('parentDeleteBtn');
  const parentAddBtn = screen.getByRole('parentAddBtn');

  expect(childText.innerHTML).toBe('map');
  expect(parentText.innerHTML).toBe('weakMap');

  fireEvent.click(childChangeBtn);
  expect(childText.innerHTML).toBe('map_1');
  expect(parentText.innerHTML).toBe('weakMap');

  fireEvent.click(parentChangeBtn);
  expect(childText.innerHTML).toBe('map_1');
  expect(parentText.innerHTML).toBe('weakMap_1');

  fireEvent.click(childDeleteBtn);
  expect(childText.innerHTML).toBeFalsy();
  expect(parentText.innerHTML).toBe('weakMap_1');

  fireEvent.click(parentChangeBtn);
  expect(childText.innerHTML).toBeFalsy();
  expect(parentText.innerHTML).toBe('weakMap_1_1');

  fireEvent.click(childAddBtn);
  expect(childText.innerHTML).toBe('map');
  expect(parentText.innerHTML).toBe('weakMap_1_1');

  fireEvent.click(parentChangeBtn);
  expect(childText.innerHTML).toBe('map');
  expect(parentText.innerHTML).toBe('weakMap_1_1_1');

  fireEvent.click(parentDeleteBtn);
  expect(childText.innerHTML).toBe('map');
  expect(parentText.innerHTML).toBeFalsy();

  fireEvent.click(childChangeBtn);
  expect(childText.innerHTML).toBe('map_1');
  expect(parentText.innerHTML).toBeFalsy();

  fireEvent.click(parentAddBtn);
  expect(childText.innerHTML).toBe('map_1');
  expect(parentText.innerHTML).toBe('weakMap');

  fireEvent.click(parentChangeBtn);
  expect(childText.innerHTML).toBe('map_1');
  expect(parentText.innerHTML).toBe('weakMap_1');

  fireEvent.click(childChangeBtn);
  expect(childText.innerHTML).toBe('map_1_1');
  expect(parentText.innerHTML).toBe('weakMap_1');
});
