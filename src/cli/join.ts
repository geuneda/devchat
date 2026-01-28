import { Command } from 'commander';
import { getConfig } from '../core/config';
import { connectToServer } from '../client';
import { decodeInvite, applyInviteConfig } from './invite';

export const joinCommand = new Command('join')
  .description('Join an existing chat room')
  .argument('[address]', 'Server address (host:port)')
  .option('--nick <nickname>', 'Your nickname')
  .option('-i, --invite <code>', 'Join using an invite code')
  .action(async (address, options) => {
    let host: string;
    let port: number;
    let nick = options.nick || getConfig().nick;

    // Handle invite code
    if (options.invite) {
      const inviteData = decodeInvite(options.invite);

      if (!inviteData) {
        console.error('Invalid invite code');
        process.exit(1);
      }

      // Apply Supabase config from invite
      applyInviteConfig(inviteData);

      host = inviteData.host;
      port = inviteData.port;

      console.log('');
      console.log('Invite code accepted!');
      if (inviteData.roomName) {
        console.log(`  Room: ${inviteData.roomName}`);
      }
      if (inviteData.supabaseUrl) {
        console.log('  Auth: Configured from invite');
      }
      console.log('');
    } else if (address) {
      // Parse address
      if (address.includes(':')) {
        const parts = address.split(':');
        host = parts[0];
        port = parseInt(parts[1], 10);
      } else {
        host = address;
        port = getConfig().port;
      }
    } else {
      console.error('Please provide an address or invite code');
      console.error('Usage: devchat join <host:port>');
      console.error('   or: devchat join --invite <code>');
      process.exit(1);
    }

    console.log(`Connecting to ${host}:${port}...`);
    console.log(`   Nick: ${nick}`);
    console.log('');

    try {
      await connectToServer({
        host,
        port,
        nick,
      });
    } catch (error) {
      process.exit(1);
    }
  });
