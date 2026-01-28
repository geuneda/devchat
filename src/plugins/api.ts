import { Plugin, PluginContext, PluginCommand } from '../types';

/**
 * Plugin API for DevChat
 * 
 * Plugins can register commands that users can invoke with /<command>
 * 
 * Example plugin:
 * ```typescript
 * const myPlugin: Plugin = {
 *   name: 'my-plugin',
 *   description: 'A sample plugin',
 *   version: '1.0.0',
 *   commands: {
 *     '/hello': (args, ctx) => {
 *       ctx.broadcast(`Hello from ${ctx.user.nick}!`);
 *     },
 *     '/greet': (args, ctx) => {
 *       const name = args[0] || 'World';
 *       ctx.broadcast(`${ctx.user.nick} greets ${name}!`);
 *     }
 *   },
 *   onLoad: (ctx) => {
 *     console.log('Plugin loaded!');
 *   },
 *   onUnload: () => {
 *     console.log('Plugin unloaded!');
 *   }
 * };
 * ```
 */

export function createPlugin(config: {
  name: string;
  description?: string;
  version?: string;
  commands: Record<string, PluginCommand>;
  onLoad?: (ctx: PluginContext) => void;
  onUnload?: () => void;
}): Plugin {
  return {
    name: config.name,
    description: config.description,
    version: config.version || '1.0.0',
    commands: config.commands,
    onLoad: config.onLoad,
    onUnload: config.onUnload,
  };
}

export function validatePlugin(plugin: unknown): plugin is Plugin {
  if (!plugin || typeof plugin !== 'object') return false;
  
  const p = plugin as Record<string, unknown>;
  
  if (typeof p.name !== 'string' || !p.name) return false;
  if (!p.commands || typeof p.commands !== 'object') return false;
  
  // Validate all commands are functions
  for (const [key, value] of Object.entries(p.commands as Record<string, unknown>)) {
    if (!key.startsWith('/')) return false;
    if (typeof value !== 'function') return false;
  }
  
  return true;
}
