import { MapSetSizeKey } from '../constant'

type ProxySetActions<T> = {
  get(source: T, key: any, value: any): any;
  add(source: T, key: any, value: any): void;
  size(source: T, oldValue: number, newValue: number): void;
  deleteProperty(source: T, key: any): boolean;
  clear(source: T): void;
};

type Options = { deep?: boolean };

// todo JSON.stringify is not same as source
export default class ProxySet<T extends Set<any>> extends Set {
  get size() {
    const  value = this.source.size;

    this.interceptor.get(this.source, MapSetSizeKey, value)

    return value;
  };


  private options: Options = { deep: false };
  private source: T;
  private interceptor: ProxySetActions<T> = {
    get: () => {},
    add: () => {},
    size: () => {},
    deleteProperty: () => true,
    clear: () => {},
  };

  constructor(source: T, interceptor: Partial<ProxySetActions<T>>, options?: Options) {
    super();
    this.source = source;
    this.interceptor = { ...this.interceptor, ...interceptor };
    this.options = Object.assign(this.options, options);
  }

  add(value) {
    const oldSize = this.size;

    this.interceptor.add ? this.interceptor.add(this.source, value, value) : this.source.add(value)

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

  forEach(callbackfn: (value: any, key: any, set: Set<any>) => void, thisArg?: any): void {
    this.source.forEach((value: any, key: any, set: Set<any>) => {
      this.interceptor.get(this.source, key, value);
      callbackfn(value, key, set);
    });
  }

  has(key: any): boolean {
    this.interceptor.get(this.source, key, key);
    return this.source.has(key);
  }

  keys(): IterableIterator<any> {
    if (!this.options.deep) return this.source.keys();

    const proxyItems = [...this.source.keys()].map(item => {
      return this.interceptor.get(this.source, item, item) || item;
    });

    return new Set(proxyItems).keys();
  }

  values(): IterableIterator<any> {
    return this.keys();
  }

  entries(): IterableIterator<[any, any]> {
    if (!this.options.deep) return this.source.entries();

    const proxyItems = [...this.source.entries()].map(([item, _]) => {
      const proxyValue = this.interceptor.get(this.source, item, item) || item;
      return proxyValue;
    });

    return new Set(proxyItems).entries();
  }

  toString() {
    return this.source.toString();
  }

  [Symbol.iterator]() {
    return this.source[Symbol.iterator]();
  }
}