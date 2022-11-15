import { storeMap, getIsModifyByAction, setIsModifyByAction, defaultStoreName } from '../global';
import { observer } from './observer';
import { isObserverObject } from '../utils';

import type { ActionsDefine, ActionDispatch } from '../types';

export type Options = { strictMode?: boolean };

function revertActionsToAutoMode<TState, TActions extends ActionsDefine<TState>>(
  state: TState,
  actions: TActions,
  autoModeTask = () => {},
) {
  const autoModeActions: ActionDispatch<TState, TActions> = Object.assign({});

  for (let actionName in actions) {
    if (typeof actions[actionName] === 'function') {
      autoModeActions[actionName] = ((...args: any) => {
        setIsModifyByAction(true);
        (actions[actionName] as any)(state, ...args);
        setIsModifyByAction(false);
        autoModeTask();
      }) as any;
    } else if (isObserverObject(actions[actionName])) {
      autoModeActions[actionName] = revertActionsToAutoMode(
        state,
        actions[actionName] as any,
        autoModeTask,
      ) as any;
    }
  }

  return autoModeActions;
}

export class Store<S extends object, A extends ActionsDefine<S>> {
  private listeners: Array<() => void> = [];

  private options = {
    strictMode: true,
  };

  public state: S;

  // save source state, generate new proxy for every useStore.
  sourceState: S;

  public actions = {} as ActionDispatch<S, A>;

  // recording every components who used store state field
  usedMap: Record<string, Set<string>> = {};

  // Field order when getting deep fields，effectList source
  currentProxyGetKeys: (string | number | symbol | Symbol)[] = [];

  // settled state field list
  effectList: Set<string> = new Set();

  dispatch = () => {};

  constructor(name: string, state: S, actions?: A, options?: Options) {
    storeMap.set(name, this);
    this.sourceState = state;
    Object.assign(this.options, options);
    this.state = observer(state, {
      getCallback: (_, keys) => {
        this.currentProxyGetKeys = keys;
      },
      setCallback: (_, keys) => {
        if (!getIsModifyByAction() && this.options.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed',
          );
        }

        this.effectList.add(keys.join('.'));
      },
      deleteCallback: (target, keys) => {
        if (!getIsModifyByAction() && this.options.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed',
          );
        }

        this.effectList.add(keys.join('.'));
      },
    });

    this.actions = revertActionsToAutoMode(
      this.state,
      { ...actions!, __not_safe__dispatch: () => {} },
      () => {
        this.applyRender();
        this.effectList.clear();
      },
    );

    this.dispatch = this.actions.__not_safe__dispatch as () => any;

    delete this.actions.__not_safe__dispatch;
  }

  private applyRender() {
    this.listeners.forEach(listener => listener());
  }

  addListener(listener: () => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: () => void) {
    const index = this.listeners.indexOf(listener);

    if (index > -1) this.listeners.splice(index, 1);
  }

  addKeyToUsedMap(key: string, componentId: string) {
    if (!this.usedMap[key]) {
      this.usedMap[key] = new Set([componentId]);
    } else {
      this.usedMap[key].add(componentId);
    }
  }

  getOptions() {
    return this.options;
  }
}

export function createStore<S extends object, A extends ActionsDefine<S>>({
  name = defaultStoreName,
  initState,
  actions,
  options,
}: {
  name?: string;
  initState: S;
  actions?: A;
  options?: Options;
}) {
  const store = new Store(name, initState, actions, options);

  return {
    name,
    state: store.state,
    actions: store.actions,
  };
}
