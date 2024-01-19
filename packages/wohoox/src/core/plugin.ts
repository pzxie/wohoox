import type { WohooxPlugin, ActionsDefine } from '../types'

type ReturnWohooxPlugin<
  S extends object = object,
  A extends ActionsDefine<S> = ActionsDefine<S>,
> = ReturnType<WohooxPlugin<S, A>>

const eventDisabled: {
  [event in keyof Omit<ReturnWohooxPlugin, 'beforeInit' | 'onInit'>]: boolean
} = {
  onGet: false,
}

/**
 * Do not trigger the event in plugins, if state modified in [fn]
 * @param event the event ignored in plugin
 * @param fn modified state callback
 */
export function ignoreToRecordEvent(
  event: keyof Omit<ReturnWohooxPlugin, 'beforeInit' | 'onInit' | 'onReset'>,
  fn: () => any,
): ReturnType<typeof fn> {
  eventDisabled[event] = true
  const result = fn?.()
  eventDisabled[event] = false

  return result
}

export function isEventDisabled(event: keyof ReturnWohooxPlugin) {
  return !!eventDisabled[event]
}

export const pluginsMap: Map<string, ReturnWohooxPlugin[]> = new Map()

export function addPlugins(
  storeName: string,
  ...plugins: WohooxPlugin<object, ActionsDefine<object>>[]
) {
  if (!plugins || !plugins.length) return

  const pluginsObjArr = plugins.map(fn => fn())
  const pluginsList = pluginsMap.get(storeName)
  if (!pluginsList) pluginsMap.set(storeName, [...pluginsObjArr])
  else pluginsList.push(...pluginsObjArr)
}

export function getPlugins(storeName: string) {
  return pluginsMap.get(storeName)
}

export function clearPlugins() {
  pluginsMap.clear()
}

export function clearPluginsByStore(name: string) {
  pluginsMap.delete(name)
}
