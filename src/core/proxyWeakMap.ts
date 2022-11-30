type ProxyWeakMapActions<T> = {
  get(source: T, key: any): any;
  set(source: T, key: any, value: any): void;
  deleteProperty(source: T, key: any): boolean;
};


export default class ProxyWeakMap<T extends WeakMap<any, any>> extends WeakMap {
  private source: T;
  private interceptor: ProxyWeakMapActions<T> = {
    get: () => {},
    set: () => {},
    deleteProperty: () => true,
  };

  constructor(source: T, interceptor: Partial<ProxyWeakMapActions<T>>) {
    super();
    this.source = source;
    this.interceptor = { ...this.interceptor, ...interceptor };
    Object.defineProperty(this, 'source' ,{ enumerable: false });
    Object.defineProperty(this, 'interceptor' ,{ enumerable: false });
  }

  get(key) {
    return this.interceptor.get ? this.interceptor.get(this.source, key) : this.source.get(key);
  }

  set(key, value) {
    this.interceptor.set
      ? this.interceptor.set(this.source, key, value)
      : this.source.set(key, value);
    return this;
  }

  delete(key) {
    const flag = this.interceptor.deleteProperty
      ? this.interceptor.deleteProperty(this.source, key)
      : this.source.delete(key);

    return flag
  }

  has(key: any): boolean {
    return this.source.has(key);
  }

  toString() {
    return this.source.toString();
  }
}
