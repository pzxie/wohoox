export type WohooxPlugin = {
  beforeInit?(initState, actions): { initState; actions };
  onInit?(store: { name: string; state; actions }): void;
  onAdd?(storeName: string, value: any, keys: string[]): void;
  onDelete?(storeName: string, keys: string[]): void;
  onChange?(storeName: string, value: any, keys: string[], oldValue: any): void;
  onGet?(storeName: string, value: any, keys: string[]): void;
};

export const pluginsMap: Map<string, WohooxPlugin[]> = new Map();

export function addPlugins(storeName, ...plugins: WohooxPlugin[]) {
  const pluginsList = pluginsMap.get(storeName);
  if (!pluginsList) pluginsMap.set(storeName, [...plugins]);
  else pluginsList.push(...plugins);
}
