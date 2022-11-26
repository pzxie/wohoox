import { MapSetSizeKey } from '../constant'

type ProxyMapActions<T> = {
  get(source: T, key: any): any;
  set(source: T, key: any, value: any): void;
  size(source: T, oldValue: number, newValue: number): void;
  deleteProperty(source: T, key: any): boolean;
  clear(source: T): void;
};

// todo JSON.stringify is not same as source
export default class ProxyMap<T extends Map<any, any>> extends Map {
  get size () {
    const  value = this.source.size;

    this.interceptor.get(this.source, MapSetSizeKey)

    return value;
  }

  private source: T;
  private interceptor: ProxyMapActions<T> = {
    get: () => {},
    set: () => {},
    size: () => {},
    deleteProperty: () => true,
    clear: () => {},
  };

  constructor(source: T, interceptor: Partial<ProxyMapActions<T>>) {
    super();
    this.source = source;
    this.interceptor = { ...this.interceptor, ...interceptor };
  }

  get(key) {
    return this.interceptor.get ? this.interceptor.get(this.source, key) : this.source.get(key);
  }

  set(key, value) {
    const oldSize = this.size;

    this.interceptor.set
      ? this.interceptor.set(this.source, key, value)
      : this.source.set(key, value);

    this.interceptor.size?.(this.source, oldSize, this.source.size);

    return this;
  }

  delete(key) {
    const oldSize = this.size;

    const flag = this.interceptor.deleteProperty
      ? this.interceptor.deleteProperty(this.source, key)
      : this.source.delete(key);

    this.interceptor.size?.(this.source, oldSize, this.source.size);

    return flag;
  }

  clear() {
    const oldSize = this.size;

    this.interceptor.clear ? this.interceptor.clear(this.source) : this.source.clear();

    this.interceptor.size?.(this.source, oldSize, this.source.size);
  }

  forEach(callbackfn: (value: any, key: any, map: Map<any, any>) => void, thisArg?: any): void {
    this.source.forEach((value: any, key: any, map: Map<any, any>) => {
      this.interceptor.get(this.source, key);
      callbackfn(value, key, map);
    });
  }

  has(key: any): boolean {
    return this.source.has(key);
  }

  keys(): IterableIterator<any> {
    return this.source.keys();
  }

  values(): IterableIterator<any> {
    this.forEach(() => {});
    return this.source.values();
  }

  entries(): IterableIterator<[any, any]> {
    this.forEach(() => {});
    return this.source.entries();
  }

  toString() {
    return this.source.toString();
  }

  [Symbol.iterator]() {
    return this.source[Symbol.iterator]();
  }
}
