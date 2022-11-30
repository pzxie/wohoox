import { guid } from '../utils';

const originKeyMap = new Map();
const objectMap = new WeakMap();

const stringifiedKeySourceMap = new Map();
const keyJoinSymbol = '__$$__';

export function getStringifyKey(obj: any, key: any): string {
  if (typeof key === 'string') return key;

  let keyId = originKeyMap.get(key);
  if (!keyId) {
    keyId = guid();
    originKeyMap.set(key, keyId);
  }

  let objId = objectMap.get(obj);
  if (!objId) {
    objId = guid();
    objectMap.set(obj, objId);
  }

  const id = objId + keyJoinSymbol + keyId;
  if (!stringifiedKeySourceMap.has(id)) stringifiedKeySourceMap.set(id, key);

  return id;
}

export function getSourceByStringifyKey(stringifyKey: string) {
  return stringifiedKeySourceMap.get(stringifyKey);
}

export function removeStringifyKey(key: string, target?: any): void {
  const stringifyKey = target ? getStringifyKey(target, key) : key;

  stringifiedKeySourceMap.delete(stringifyKey);
}
