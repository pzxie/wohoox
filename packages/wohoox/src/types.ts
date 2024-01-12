export type Options = { strictMode?: boolean; proxySetDeep?: boolean }

export interface ActionsDefine<S extends object> extends Record<string, any> {
  [key: string]: ((state: S, ...args: any) => any) | ActionsDefine<S>
}

export type ActionDispatch<State extends object, Actions> = {
  [K in keyof Actions]: ExtractDispatcherFromActions<State, Actions[K]>
}

export type ExtractDispatcherFromActions<
  TState extends object,
  TAction,
> = TAction extends () => any
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

export type WohooxPluginActionsTypeAutoComplete<
  S extends object,
  A extends ActionsDefine<S>,
> = {
  [K in keyof A]: A[K] extends ActionsDefine<S>
    ? WohooxPluginActionsTypeAutoComplete<S, A[K]>
    : A[K] extends (p, ...pn: infer PN) => infer R
    ? (p: S, ...pn: PN) => R
    : unknown
}

export type WohooxPlugin<
  S extends object,
  A extends ActionsDefine<S>,
  ALast extends WohooxPluginActionsTypeAutoComplete<
    S,
    A
  > = WohooxPluginActionsTypeAutoComplete<S, A>,
> = () => {
  beforeInit?(
    initState: S,
    actions: ALast,
  ): { initState?: Partial<S>; actions?: Partial<ALast> }
  onInit?(store: { name: string; state: S; actions: ALast }): void
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
  onReset?(storeName: string, state: S, originState: S): void
}
