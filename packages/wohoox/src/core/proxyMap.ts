import { MapSetSizeKey } from '../global'

type ProxyMapActions<T> = {
  get(source: T, key: any): any
  set(source: T, key: any, value: any): void
  size(source: T, oldValue: number, newValue: number): void
  deleteProperty(source: T, key: any): boolean
  clear(source: T): void
}

export default class ProxyMap<T extends Map<any, any>> extends Map {
  get size() {
    const value = this.source.size

    this.interceptor.get(this.source, MapSetSizeKey)

    return value
  }

  private source: T
  private interceptor: ProxyMapActions<T> = {
    get: () => {},
    set: () => {},
    size: () => {},
    deleteProperty: () => true,
    clear: () => {},
  }

  constructor(source: T, interceptor: Partial<ProxyMapActions<T>>) {
    super()
    this.source = source
    this.interceptor = { ...this.interceptor, ...interceptor }
    Object.defineProperty(this, 'source', { enumerable: false })
    Object.defineProperty(this, 'interceptor', { enumerable: false })
  }

  get(key) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.interceptor.get
      ? this.interceptor.get(this.source, key)
      : this.source.get(key)
  }

  set(key, value) {
    const oldSize = this.size

    this.interceptor.set
      ? this.interceptor.set(this.source, key, value)
      : this.source.set(key, value)

    this.interceptor.size?.(this.source, oldSize, this.source.size)

    return this
  }

  delete(key) {
    const oldSize = this.size

    const flag = this.interceptor.deleteProperty
      ? this.interceptor.deleteProperty(this.source, key)
      : this.source.delete(key)

    this.interceptor.size?.(this.source, oldSize, this.source.size)

    return flag
  }

  clear() {
    const oldSize = this.size

    this.interceptor.clear
      ? this.interceptor.clear(this.source)
      : this.source.clear()

    this.interceptor.size?.(this.source, oldSize, this.source.size)
  }

  forEach(
    callbackfn: (value: any, key: any, map: Map<any, any>) => void,
  ): void {
    this.source.forEach((_value: any, key: any, map: Map<any, any>) => {
      const proxyValue = this.get(key)
      callbackfn(proxyValue, key, map)
    })
  }

  has(key: any): boolean {
    return this.source.has(key)
  }

  keys(): IterableIterator<any> {
    this.interceptor.get(this.source, MapSetSizeKey)

    return this.source.keys()
  }

  values(): IterableIterator<any> {
    const proxyItems: [any, any][] = [...this.source.entries()].map(([key]) => {
      const proxyValue = this.get(key)
      return [key, proxyValue]
    })

    return new Map(proxyItems).values()
  }

  entries(): IterableIterator<[any, any]> {
    const proxyItems: [any, any][] = [...this.source.entries()].map(([key]) => {
      const proxyValue = this.get(key)
      return [key, proxyValue]
    })

    return new Map(proxyItems).entries()
  }

  toString() {
    return this.source.toString()
  }

  [Symbol.iterator]() {
    return this.entries()
  }
}
