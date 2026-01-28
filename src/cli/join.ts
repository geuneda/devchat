import { Command } from 'commander';
import { getConfig } from '../core/config';
import { connectToServer } from '../client';

export const joinCommand = new Command('join')
  .description('Join an existing chat room')
  .argument('<address>', 'Server address (host:port)')
  .option('--nick <nickname>', 'Your nickname', getConfig().nick)
  .action(async (address, options) => {
    const nick = options.nick;

    // Parse address
    let host: string;
    let port: number;

    if (address.includes(':')) {
      const parts = address.split(':');
      host = parts[0];
      port = parseInt(parts[1], 10);
    } else {
      host = address;
      port = getConfig().port;
    }

    console.log(`🔗 Connecting to ${host}:${port}...`);
    console.log(`   Nick: ${nick}`);
    console.log('');

    try {
      await connectToServer({
        host,
        port,
        nick,
      });
    } catch (error) {
      console.error('Failed to connect:', error);
      process.exit(1);
    }
  });
