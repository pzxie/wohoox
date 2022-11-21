import { guid } from '../utils';

const keyMap = new Map();
// todo max size?

export function getStringifyKey(key: any): string {
  if (typeof key === 'string') return key;

  const revertedKey = keyMap.get(key);
  if (revertedKey) return revertedKey;

  const id = guid();
  keyMap.set(key, id);
  keyMap.set(id, key);

  return id;
}

export function getSourceByStringifyKey(stringifyKey: string) {
  return keyMap.get(stringifyKey);
}

export function removeStringifyKey(key: string): void {
  keyMap.delete(keyMap.get(key));
  keyMap.delete(key);
}

export function isStringifyMapKey(key: string) {
  return keyMap.has(key);
}
