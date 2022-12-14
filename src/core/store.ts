import { storeMap, getIsModifyByAction, setIsModifyByAction, defaultStoreName } from '../global';
import { observer } from './observer';
import { isPlainObject } from '../utils';
import { EffectType } from '../constant';
import {getSourceByStringifyKey} from '../core/keyStore';

import type { ActionsDefine, ActionDispatch } from '../types';

export type Options = { strictMode?: boolean; proxySetDeep?: boolean };

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
    } else if (isPlainObject(actions[actionName])) {
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
    proxySetDeep: false,
  };

  public state: S;

  // Save source state to generate new proxy for every useStore.
  sourceState: S;

  public actions = {} as ActionDispatch<S, A>;

  // Properties stack to record current visited properties，effectList source
  currentProxyGetKeys: string[] = [];

  // settled state property list
  effectList: Set<string> = new Set();

  effectUpdateList: Set<string> = new Set();
  
  dispatch = () => {};

  constructor(name: string, state: S, actions?: A, options?: Options) {
    storeMap.set(name, this);
    this.sourceState = state;
    Object.assign(this.options, options);

    this.state = observer(state, {
      getCallback: (_, keys) => {
        this.currentProxyGetKeys = keys;
      },
      setCallback: (value, keys, target, oldValue) => {
        if (!getIsModifyByAction() && this.options.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed',
          );
        }

        this.addKeyToEffectList(keys, value, EffectType.modify);
      },
      addCallback: (value, keys) => {
        if (!getIsModifyByAction() && this.options.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed',
          );
        }

        this.addKeyToEffectList(keys, value, EffectType.add);
      },
      deleteCallback: (target, keys) => {
        if (!getIsModifyByAction() && this.options.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be delete by expression. Only actions are allowed',
          );
        }

        this.addKeyToEffectList(keys, target, EffectType.delete);
      },
      proxySetDeep: this.options.proxySetDeep,
    });

    this.actions = revertActionsToAutoMode(
      this.state,
      { ...actions!, __not_safe__dispatch: () => {} },
      () => {
        this.applyRender();
        this.effectList.clear();
        this.effectUpdateList.clear();
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

  addKeyToEffectList(keys: string[], newValue: any, effectType: EffectType) {
    if (!keys.length) return;

    if (effectType === EffectType.add || !keys.find(key => getSourceByStringifyKey(key))) {
      this.effectList.add(keys.join('.'));

      const parentKeys = keys.slice(0, -1);

      if (parentKeys.length) this.effectList.add(parentKeys.join('.'));
    }
    else this.effectUpdateList.add(keys.join('.'));    
  }

  getOptions() {
    return { ...this.options };
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
