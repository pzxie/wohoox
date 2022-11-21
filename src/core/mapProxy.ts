type MapProxyActions<T> = {
  get(source: T, key: any): any;
  set(source: T, key: any, value: any): void;
  deleteProperty(source: T, key: any): boolean;
  clear(source: T): void;
};

// todo JSON.stringify is not same as source
export default class MapProxy<T extends Map<any, any>> extends Map {
  size: number = 0;
  private source: T;
  private interceptor: MapProxyActions<T> = {
    get: () => {},
    set: () => {},
    deleteProperty: () => true,
    clear: () => {},
  };

  constructor(source: T, interceptor: Partial<MapProxyActions<T>>) {
    super();
    this.source = source;
    this.interceptor = { ...this.interceptor, ...interceptor };
  }

  get(key) {
    return this.interceptor.get ? this.interceptor.get(this.source, key) : this.source.get(key);
  }

  set(key, value) {
    this.interceptor.set
      ? this.interceptor.set(this.source, key, value)
      : this.source.set(key, value);
    this.size = this.source.size;
    return this;
  }

  delete(key) {
    const flag = this.interceptor.deleteProperty
      ? this.interceptor.deleteProperty(this.source, key)
      : this.source.delete(key);

    this.size = this.source.size;

    return flag
  }

  clear() {
    this.interceptor.clear ? this.interceptor.clear(this.source) : this.source.clear();
    this.size = this.source.size;
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

  [Symbol.iterator](){
    return this.source[Symbol.iterator]()
  }
}
