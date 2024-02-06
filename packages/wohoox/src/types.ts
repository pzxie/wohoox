export type Options = { strictMode?: boolean; proxySetDeep?: boolean }

export interface ActionsDefine<S extends object, A> {
  [key: string]:
    | ((
        store: { state: S; actions: ActionDispatch<S, A> },
        ...args: any
      ) => any)
    | ActionsDefine<S, A>
}

export type ActionDispatch<State extends object, Actions> = {
  [K in keyof Actions]: ExtractDispatcherFromActions<State, Actions[K]>
}

export type ExtractDispatcherFromActions<
  TState extends object,
  TAction,
> = TAction extends () => any
  ? TAction
  : TAction extends (
      store: { state: TState; actions: any },
      ...args: infer TRest
    ) => any
  ? (...args: TRest) => ReturnType<TAction>
  : TAction extends ActionsDefine<TState, TAction>
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
  A extends ActionsDefine<S, A>,
> = {
  [K in keyof A]: A[K] extends ActionsDefine<S, A[K]>
    ? WohooxPluginActionsTypeAutoComplete<S, A>
    : A[K] extends (store, ...pn: infer PN) => infer R
    ? (store: { state: S; actions: ActionDispatch<S, A> }, ...pn: PN) => R
    : unknown
}

export type WohooxPlugin<
  S extends object,
  A extends ActionsDefine<S, A>,
  ALast extends WohooxPluginActionsTypeAutoComplete<
    S,
    A
  > = WohooxPluginActionsTypeAutoComplete<S, A>,
> = () => {
  beforeInit?(
    initState: S,
    actions: A,
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
