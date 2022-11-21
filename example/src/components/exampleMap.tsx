import { useStore } from '../store';
import { dispatch } from 'wohoox';

const symbolKey = Symbol('key');
const objectKey = { type: 'objectKey' };
const setKey = new Set(['set']);
const mapKey = new Map([['key', 'value']]);

export default function ExampleMap() {
  console.log('render ExampleMap');
  const mapObj = useStore(state => state.type.map);

  return (
    <div>
      <h2 style={{ color: 'red' }}>Map</h2>

      <h3>Map entries</h3>
      {[...mapObj.entries()].map(([key, value]) => (
        <div className="text margin-10">
          <span className="title">{JSON.stringify(key)}: </span>
          {JSON.stringify(value)}
        </div>
      ))}

      <h3>Child Map entries</h3>
      {[...(mapObj.get('map') ? mapObj.get('map').entries() : [])].map(([key, value]) => (
        <div className="text margin-10">
          <span className="title">{JSON.stringify(key)}: </span>
          {JSON.stringify(value)}
        </div>
      ))}

      <h3>add</h3>
      <button
        onClick={() => {
          mapObj.set('undefined', undefined);
          dispatch();
        }}
      >
        add string:undefined
      </button>
      <button
        onClick={() => {
          mapObj.set('name', 'map');
          dispatch();
        }}
      >
        add string:string
      </button>

      <button
        onClick={() => {
          mapObj.set(Math.floor(Math.random() * 100000), 'map_number');
          dispatch();
        }}
      >
        add number:string
      </button>

      <button
        onClick={() => {
          mapObj.set(symbolKey, 'symbol');
          dispatch();
        }}
      >
        add symbol:string
      </button>
      <button
        onClick={() => {
          mapObj.set('symbol', symbolKey);
          dispatch();
        }}
      >
        add string:symbol
      </button>

      <button
        onClick={() => {
          mapObj.set(objectKey, 'object');
          dispatch();
        }}
      >
        add object:string
      </button>
      <button
        onClick={() => {
          mapObj.set('object', objectKey);
          dispatch();
        }}
      >
        add string:object
      </button>

      <button
        onClick={() => {
          mapObj.set(setKey, 'set');
          dispatch();
        }}
      >
        add set:string
      </button>
      <button
        onClick={() => {
          mapObj.set('set', setKey);
          dispatch();
        }}
      >
        add string:set
      </button>

      <button
        onClick={() => {
          mapObj.set(mapKey, 'map');
          dispatch();
        }}
      >
        add map:string
      </button>

      <button
        onClick={() => {
          mapObj.set('map', mapKey);
          dispatch();
        }}
      >
        add string:map
      </button>

      <h3>delete</h3>

      <button
        onClick={() => {
          mapObj.delete('name');
          dispatch();
        }}
      >
        remote item item
      </button>

      <button
        onClick={() => {
          mapObj.clear();
          dispatch();
        }}
      >
        clear
      </button>

      <h3>edit</h3>
      <button
        onClick={() => {
          mapObj.set('name', mapObj.get('name') + '_1');
          dispatch();
        }}
      >
        edit string:string
      </button>
      <button
        onClick={() => {
          mapObj.set(84021, mapObj.get(84021) + '_1');
          dispatch();
        }}
      >
        edit number:string
      </button>
      <button
        onClick={() => {
          mapObj.set(symbolKey, mapObj.get(symbolKey) + '_1');
          dispatch();
        }}
      >
        edit symbol:string
      </button>
      <button
        onClick={() => {
          mapObj.set(objectKey, mapObj.get(objectKey) + '_1');
          dispatch();
        }}
      >
        edit object:string
      </button>
      <button
        onClick={() => {
          mapObj.set(mapKey, mapObj.get(mapKey) + '_1');
          dispatch();
        }}
      >
        edit Map:string
      </button>
      <button
        onClick={() => {
          mapObj.set(setKey, mapObj.get(setKey) + '_1');
          dispatch();
        }}
      >
        edit set:string
      </button>
      <button
        onClick={() => {
          const o = mapObj.get('object');
          o.type += '_1';
          dispatch();
        }}
      >
        edit string:object property
      </button>
      <button
        onClick={() => {
          const o = mapObj.get('map');
          o.set('key', o.get('key') + '_1');
          dispatch();
        }}
      >
        edit string:Map property
      </button>
    </div>
  );
}
