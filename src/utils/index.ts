import guid from './uuid';
import { EffectType, MapSetSizeKey } from '../constant';
import { getSourceByStringifyKey } from '../core/keyMap';

export function isOriginalType(data) {
  return (
    typeof data === 'string' ||
    typeof data === 'bigint' ||
    typeof data === 'boolean' ||
    typeof data === 'symbol'
  );
}

export function isPlainObject(data) {
  const dataType = Object.prototype.toString.call(data);

  return dataType === '[object Object]';
}

export function isMap(data) {
  const dataType = Object.prototype.toString.call(data);

  return dataType === '[object WeakMap]' || dataType === '[object Map]';
}

export function isSet(data) {
  const dataType = Object.prototype.toString.call(data);

  return dataType === '[object WeakSet]' || dataType === '[object Set]';
}

export function isObserverObject(data) {
  const isArray = Array.isArray(data);

  return isArray || isPlainObject(data) || isSet(data) || isMap(data);
}

export function isArrayNewKey (array, keyArr: string[]) {
  return !(keyArr[0] in array);
}

export function isPlainObjectNewKey(obj, keyArr: string[]) {
  let tempObj = obj;
  let isNewKey = false;

  for (let key of keyArr) {
    if (!tempObj.hasOwnProperty(key)) {
      isNewKey = true;
      break;
    }

    tempObj = tempObj[key];
  }

  return isNewKey;
}

export function isMapNewKey(mapState: Map<any, any> | WeakMap<any, any>, keyArr: string[]) {
  let tempMapState = mapState;
  let isNewKey = false;

  for (let key of keyArr) {
    const stringifyKeySource = getSourceByStringifyKey(key);

    if (
      !tempMapState.has(key) &&
      (stringifyKeySource ? !tempMapState.has(stringifyKeySource) : true)
    ) {
      isNewKey = true;
      break;
    }

    tempMapState = tempMapState.get(key);
  }

  return isNewKey;
}

export function isSetNewValue(setState: Set<any>, value) {
  if (setState.has(value)) return false;

  return true;
}

export function getSettleType(target, keyArr: string[], value?: any) {
  let isNewKey = false;

  if (isPlainObject(target)) isNewKey = isPlainObjectNewKey(target, keyArr);
  else if (Array.isArray(target)) isNewKey = isArrayNewKey(target, keyArr);
  else if (isMap(target)) isNewKey = isMapNewKey(target, keyArr);
  else if (isSet(target))
    isNewKey = keyArr.length === 1 && keyArr[0] === MapSetSizeKey ? true : isSetNewValue(target, value);

  return isNewKey ? EffectType.add : EffectType.modify;
}

export { guid };
