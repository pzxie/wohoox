export type ActionsDefine<S> = {
  [key: string]: ((state: S, ...args: any) => any) | ActionsDefine<S>;
};

export type ActionDispatch<S, R> = {
  [K in keyof R]: ExtractDispatcherFromActions<S, R[K]>;
};

export type ExtractDispatcherFromActions<TState, TAction> = TAction extends () => any
  ? TAction
  : TAction extends (state: TState, ...args: infer TRest) => any
  ? TRest extends []
    ? () => any
    : (...arg: TRest) => any
  : TAction extends ActionsDefine<TState>
  ? ActionDispatch<TState, TAction>
  : never;

export type ExtractStoresName<Stores> = Stores extends { name: infer N }[] ? N : never;

export type ExtractStores<Stores, Name> = Stores extends (infer S)[]
  ? S extends { name: infer N }
    ? N extends Name
      ? S
      : never
    : never
  : never;
