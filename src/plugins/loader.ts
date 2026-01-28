import * as fs from 'fs';
import * as path from 'path';
import { Plugin, PluginContext } from '../types';
import { validatePlugin } from './api';

export class PluginLoader {
  private pluginsDir: string;
  private loadedPlugins: Map<string, Plugin> = new Map();

  constructor(pluginsDir: string = './plugins') {
    this.pluginsDir = pluginsDir;
  }

  /**
   * Load a plugin from a file or directory
   */
  async loadPlugin(pluginPath: string): Promise<Plugin | null> {
    try {
      const absolutePath = path.isAbsolute(pluginPath)
        ? pluginPath
        : path.resolve(this.pluginsDir, pluginPath);

      // Check if it's a directory with index.js/ts
      let modulePath = absolutePath;
      if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) {
        if (fs.existsSync(path.join(absolutePath, 'index.js'))) {
          modulePath = path.join(absolutePath, 'index.js');
        } else if (fs.existsSync(path.join(absolutePath, 'index.ts'))) {
          modulePath = path.join(absolutePath, 'index.ts');
        }
      }

      // Dynamic import
      const module = await import(modulePath);
      const plugin = module.default || module;

      if (!validatePlugin(plugin)) {
        console.error(`Invalid plugin structure: ${pluginPath}`);
        return null;
      }

      this.loadedPlugins.set(plugin.name, plugin);
      return plugin;
    } catch (error) {
      console.error(`Failed to load plugin ${pluginPath}:`, error);
      return null;
    }
  }

  /**
   * Load all plugins from the plugins directory
   */
  async loadAllPlugins(): Promise<Plugin[]> {
    const plugins: Plugin[] = [];

    if (!fs.existsSync(this.pluginsDir)) {
      return plugins;
    }

    const entries = fs.readdirSync(this.pluginsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const plugin = await this.loadPlugin(entry.name);
        if (plugin) {
          plugins.push(plugin);
        }
      }
    }

    return plugins;
  }

  /**
   * Get a loaded plugin by name
   */
  getPlugin(name: string): Plugin | undefined {
    return this.loadedPlugins.get(name);
  }

  /**
   * Get all loaded plugins
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * Unload a plugin
   */
  unloadPlugin(name: string): boolean {
    const plugin = this.loadedPlugins.get(name);
    if (plugin) {
      if (plugin.onUnload) {
        plugin.onUnload();
      }
      this.loadedPlugins.delete(name);
      return true;
    }
    return false;
  }

  /**
   * Unload all plugins
   */
  unloadAllPlugins(): void {
    for (const name of this.loadedPlugins.keys()) {
      this.unloadPlugin(name);
    }
  }
}
