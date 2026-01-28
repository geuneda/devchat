import { Command } from 'commander';
import { getConfig, setConfig } from '../core/config';
import { isSupabaseConfigured } from '../core/auth';

export interface InviteData {
  host: string;
  port: number;
  supabaseUrl?: string;
  supabaseKey?: string;
  roomName?: string;
}

export function encodeInvite(data: InviteData): string {
  const json = JSON.stringify(data);
  return Buffer.from(json).toString('base64url');
}

export function decodeInvite(code: string): InviteData | null {
  try {
    const json = Buffer.from(code, 'base64url').toString('utf-8');
    const data = JSON.parse(json);

    if (!data.host || !data.port) {
      return null;
    }

    return data as InviteData;
  } catch {
    return null;
  }
}

export function applyInviteConfig(data: InviteData): void {
  if (data.supabaseUrl) {
    setConfig('supabaseUrl', data.supabaseUrl);
  }
  if (data.supabaseKey) {
    setConfig('supabaseAnonKey', data.supabaseKey);
  }
}

function getLocalIP(): string {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

export const inviteCommand = new Command('invite')
  .description('Generate an invite code for others to join')
  .option('-p, --port <port>', 'Server port', '8080')
  .option('-n, --name <name>', 'Room name')
  .option('--no-auth', 'Exclude Supabase auth config from invite')
  .action((options) => {
    const config = getConfig();
    const port = parseInt(options.port) || config.port || 8080;
    const localIP = getLocalIP();

    const inviteData: InviteData = {
      host: localIP,
      port,
      roomName: options.name,
    };

    // Include Supabase config if configured and not excluded
    if (options.auth !== false && isSupabaseConfigured()) {
      inviteData.supabaseUrl = config.supabaseUrl;
      inviteData.supabaseKey = config.supabaseAnonKey;
    }

    const code = encodeInvite(inviteData);

    console.log('');
    console.log('='.repeat(60));
    console.log('  Invite Code Generated!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Share this code with others:');
    console.log('');
    console.log(`  ${code}`);
    console.log('');
    console.log('They can join with:');
    console.log('');
    console.log(`  devchat join --invite ${code}`);
    console.log('');
    console.log('Or copy-paste this one-liner:');
    console.log('');
    console.log(`  devchat join --invite ${code} --nick "YourName"`);
    console.log('');
    console.log('='.repeat(60));
    console.log('');
    console.log('Details:');
    console.log(`  Host: ${localIP}:${port}`);
    if (inviteData.roomName) {
      console.log(`  Room: ${inviteData.roomName}`);
    }
    console.log(`  Auth: ${inviteData.supabaseUrl ? 'Included' : 'Not included'}`);
    console.log('');
  });
