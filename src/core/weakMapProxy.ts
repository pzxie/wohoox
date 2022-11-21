type WeakMapProxyActions<T> = {
  get(source: T, key: any): any;
  set(source: T, key: any, value: any): void;
  deleteProperty(source: T, key: any): boolean;
};


// todo JSON.stringify is not same as source
export default class WeakMapProxy<T extends WeakMap<any, any>> extends WeakMap {
  private source: T;
  private interceptor: WeakMapProxyActions<T> = {
    get: () => {},
    set: () => {},
    deleteProperty: () => true,
  };

  constructor(source: T, interceptor: Partial<WeakMapProxyActions<T>>) {
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
