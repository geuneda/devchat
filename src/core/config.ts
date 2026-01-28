import Conf from 'conf';
import { DevChatConfig, DEFAULT_CONFIG } from '../types';

const config = new Conf<DevChatConfig>({
  projectName: 'devchat',
  defaults: DEFAULT_CONFIG,
});

export function getConfig(): DevChatConfig {
  return {
    nick: config.get('nick'),
    toggleKey: config.get('toggleKey'),
    theme: config.get('theme'),
    port: config.get('port'),
    pluginsDir: config.get('pluginsDir'),
  };
}

export function setConfig<K extends keyof DevChatConfig>(
  key: K,
  value: DevChatConfig[K]
): void {
  config.set(key, value);
}

export function resetConfig(): void {
  config.clear();
}

export function getConfigPath(): string {
  return config.path;
}
