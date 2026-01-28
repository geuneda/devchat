import { Command } from 'commander';
import { getConfig, setConfig, getConfigPath, resetConfig } from '../core/config';
import { getThemeNames } from '../core/stealth';

export const configCommand = new Command('config')
  .description('View or modify configuration')
  .option('--nick <nickname>', 'Set default nickname')
  .option('--toggle-key <key>', 'Set toggle key for stealth mode')
  .option('--theme <theme>', 'Set stealth mode theme')
  .option('--port <port>', 'Set default port')
  .option('--list', 'List all configuration')
  .option('--themes', 'List available themes')
  .option('--reset', 'Reset to default configuration')
  .option('--path', 'Show config file path')
  .action((options) => {
    // Show config path
    if (options.path) {
      console.log(`Config file: ${getConfigPath()}`);
      return;
    }

    // Reset config
    if (options.reset) {
      resetConfig();
      console.log('✓ Configuration reset to defaults');
      return;
    }

    // List themes
    if (options.themes) {
      console.log('Available themes:');
      getThemeNames().forEach((name) => {
        console.log(`  - ${name}`);
      });
      return;
    }

    // Set values
    let changed = false;

    if (options.nick) {
      setConfig('nick', options.nick);
      console.log(`✓ Nick set to: ${options.nick}`);
      changed = true;
    }

    if (options.toggleKey) {
      setConfig('toggleKey', options.toggleKey);
      console.log(`✓ Toggle key set to: ${options.toggleKey}`);
      changed = true;
    }

    if (options.theme) {
      const validThemes = getThemeNames();
      if (!validThemes.includes(options.theme)) {
        console.error(`Invalid theme. Available: ${validThemes.join(', ')}`);
        process.exit(1);
      }
      setConfig('theme', options.theme);
      console.log(`✓ Theme set to: ${options.theme}`);
      changed = true;
    }

    if (options.port) {
      const port = parseInt(options.port, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        console.error('Invalid port number');
        process.exit(1);
      }
      setConfig('port', port);
      console.log(`✓ Port set to: ${port}`);
      changed = true;
    }

    // If no changes made or --list, show current config
    if (!changed || options.list) {
      const config = getConfig();
      console.log('\nCurrent configuration:');
      console.log(`  nick:       ${config.nick}`);
      console.log(`  toggleKey:  ${config.toggleKey}`);
      console.log(`  theme:      ${config.theme}`);
      console.log(`  port:       ${config.port}`);
      console.log(`  pluginsDir: ${config.pluginsDir}`);
    }
  });
