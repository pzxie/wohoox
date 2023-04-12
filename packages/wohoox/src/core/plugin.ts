import type { WohooxPlugin } from '../types'

const eventDisabled: {
  [event in keyof Omit<WohooxPlugin, 'beforeInit' | 'onInit'>]: boolean
} = {
  onGet: false,
}

export function ignoreToRecordEvent(
  event: keyof Omit<WohooxPlugin, 'beforeInit' | 'onInit'>,
  fn: () => any,
): ReturnType<typeof fn> {
  eventDisabled[event] = true
  const result = fn?.()
  eventDisabled[event] = false

  return result
}

export function isEventDisabled(event: keyof WohooxPlugin) {
  return !!eventDisabled[event]
}

export const pluginsMap: Map<string, WohooxPlugin[]> = new Map()

export function addPlugins(storeName: string, ...plugins: WohooxPlugin[]) {
  const pluginsList = pluginsMap.get(storeName)
  if (!pluginsList) pluginsMap.set(storeName, [...plugins])
  else pluginsList.push(...plugins)
}
