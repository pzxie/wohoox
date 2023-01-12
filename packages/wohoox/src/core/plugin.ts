export type WohooxPlugin = {
  beforeInit?(initState, actions): { initState; actions }
  onInit?(store: { name: string; state; actions }): void
  onAdd?(storeName: string, value: any, keys: string[], target: any): void
  onDelete?(storeName: string, keys: string[], target: any): void
  onChange?(
    storeName: string,
    value: any,
    keys: string[],
    oldValue: any,
    target: any,
  ): void
  onGet?(storeName: string, value: any, keys: string[], target: any): void
}

const eventDisabled: {
  [event in keyof Omit<WohooxPlugin, 'beforeInit' | 'onInit'>]: boolean
} = {
  onGet: false,
}

export function ignoreToRecordEvent(
  event: keyof WohooxPlugin,
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
