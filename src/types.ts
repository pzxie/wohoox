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
