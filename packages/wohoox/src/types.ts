export type Options = { strictMode?: boolean; proxySetDeep?: boolean }

export type ActionsDefine<S> = {
  [key: string]: ((state: S, ...args: any) => any) | ActionsDefine<S>
}

export type ActionDispatch<State, Actions> = {
  [K in keyof Actions]: ExtractDispatcherFromActions<State, Actions[K]>
}

export type ExtractDispatcherFromActions<TState, TAction> =
  TAction extends () => any
    ? TAction
    : TAction extends (state: TState, ...args: infer TRest) => any
    ? (...args: TRest) => ReturnType<TAction>
    : TAction extends ActionsDefine<TState>
    ? ActionDispatch<TState, TAction>
    : never

export type ExtractStoresName<Stores> = Stores extends { name: infer N }[]
  ? N
  : never

export type ExtractStores<Stores, Name> = Stores extends (infer S)[]
  ? S extends { name: infer N }
    ? N extends Name
      ? S
      : never
    : never
  : never

export type WohooxPlugin = {
  beforeInit?(initState, actions): { initState; actions }
  onInit?(store: { name: string; state; actions }): void
  onAdd?(storeName: string, value: any, keys: any[], target: any): void
  onDelete?(storeName: string, keys: any[], target: any): void
  onChange?(
    storeName: string,
    value: any,
    keys: any[],
    target: any,
    oldValue: any,
  ): void
  onGet?(storeName: string, value: any, keys: any[], target: any): void
  onReset?(storeName: string, state: any, originState: any): void
}
