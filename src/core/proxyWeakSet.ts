type ProxyWeakSetActions<T> = {
  get(source: T, key: any): any;
  add(source: T, key: any, value: any): void;
  deleteProperty(source: T, key: any): boolean;
};


export default class ProxyWeakSet<T extends WeakSet<any>> extends WeakSet {
  private source: T;
  private interceptor: ProxyWeakSetActions<T> = {
    get: () => {},
    add: () => {},
    deleteProperty: () => true,
  };

  constructor(source: T, interceptor: Partial<ProxyWeakSetActions<T>>) {
    super();
    this.source = source;
    this.interceptor = { ...this.interceptor, ...interceptor };
    Object.defineProperty(this, 'source' ,{ enumerable: false });
    Object.defineProperty(this, 'interceptor' ,{ enumerable: false });
  }

  add(value) {
    this.interceptor.add ? this.interceptor.add(this.source, value, value) : this.source.add(value)

    return this;
  }

  delete(key) {
    return this.interceptor.deleteProperty
      ? this.interceptor.deleteProperty(this.source, key)
      : this.source.delete(key);
  }

  has(key: any): boolean {
    this.interceptor?.get(this.source, key);
    return this.source.has(key);
  }

  toString() {
    return this.source.toString();
  }
}
