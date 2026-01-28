import { Command } from 'commander';
import { getConfig } from '../core/config';
import { startServer } from '../server';

export const hostCommand = new Command('host')
  .description('Create and host a chat room')
  .option('-p, --port <port>', 'Port to listen on', String(getConfig().port))
  .option('-n, --name <name>', 'Room name', 'DevChat Room')
  .option('--nick <nickname>', 'Your nickname', getConfig().nick)
  .action(async (options) => {
    const port = parseInt(options.port, 10);
    const roomName = options.name;
    const nick = options.nick;

    console.log(`🚀 Starting DevChat server...`);
    console.log(`   Room: ${roomName}`);
    console.log(`   Port: ${port}`);
    console.log(`   Nick: ${nick}`);
    console.log('');

    try {
      await startServer({
        port,
        roomName,
        hostNick: nick,
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  });
