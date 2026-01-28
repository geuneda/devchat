import WebSocket from 'ws';
import { nanoid } from 'nanoid';
import { RoomManager } from '../core/room';
import { ChatManager } from '../core/chat';
import { getConnectionErrorMessage, getDisconnectMessage } from '../core/errors';
import { getAuthManager, isSupabaseConfigured } from '../core/auth';
import { WSMessage, ChatPayload, JoinPayload, User, UserListPayload, AuthSuccessPayload } from '../types';
import { createChatUI } from '../ui';
import { PluginManager } from '../plugins';

interface ClientOptions {
  host: string;
  port: number;
  nick: string;
}

export async function connectToServer(options: ClientOptions): Promise<void> {
  const { host, port, nick } = options;

  const roomManager = new RoomManager();
  const chatManager = new ChatManager();
  const pluginManager = new PluginManager();

  await pluginManager.loadBuiltinPlugins();
  await pluginManager.loadExternalPlugins();

  // 인증 토큰 가져오기
  let authToken: string | null = null;
  let userUid: string | null = null;
  if (isSupabaseConfigured()) {
    const authManager = getAuthManager();
    await authManager.initialize();
    authToken = authManager.getToken();
    userUid = authManager.getUid();
  }

  // Create a temporary user (will be updated when server confirms)
  let currentUser: User = {
    id: nanoid(),
    nick,
    isHost: false,
    uid: userUid || undefined,
  };

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${host}:${port}`);
    let uiStarted = false;

    ws.on('open', () => {
      console.log('Connected to server!');

      // Send join message with token
      const joinPayload: JoinPayload = { nick };
      if (authToken) {
        joinPayload.token = authToken;
      }

      const joinMsg: WSMessage = {
        type: 'join',
        payload: joinPayload,
        timestamp: Date.now(),
      };
      ws.send(JSON.stringify(joinMsg));
    });

    ws.on('message', async (data) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());

        switch (message.type) {
          case 'auth_success': {
            const payload = message.payload as AuthSuccessPayload;
            currentUser = payload.user;
            if (payload.gameState) {
              pluginManager.restoreAllPluginStates(payload.gameState);
            }
            break;
          }

          case 'auth_error': {
            const payload = message.payload as { message: string };
            console.error('Authentication error:', payload.message);
            break;
          }

          case 'system': {
            const payload = message.payload as ChatPayload;
            chatManager.addSystemMessage(payload.message);

            // Check if this is welcome message to extract our nick
            if (payload.message.includes('You are:')) {
              const match = payload.message.match(/You are: (.+)$/);
              if (match) {
                currentUser.nick = match[1];
              }
            }
            break;
          }

          case 'chat': {
            const payload = message.payload as ChatPayload;
            chatManager.addMessage(payload.sender, payload.message);
            break;
          }

          case 'plugin': {
            const payload = message.payload as ChatPayload;
            chatManager.addPluginMessage(payload.sender, payload.message);
            break;
          }

          case 'user-list': {
            const payload = message.payload as UserListPayload;
            // Update room manager with user list
            // For simplicity, we recreate the room state
            if (!roomManager.getRoom()) {
              roomManager.createRoom('Remote Room', payload.users[0]?.nick || 'Host');
            }
            break;
          }

          case 'error': {
            const payload = message.payload as { message: string };
            console.error('Server error:', payload.message);
            break;
          }
        }

        // Start UI after receiving first message
        if (!uiStarted) {
          uiStarted = true;
          console.log('Starting chat interface...');
          console.log('');

          await createChatUI({
            isHost: false,
            roomName: 'Remote Room',
            user: currentUser,
            chatManager,
            roomManager,
            pluginManager,
            broadcast: (msg: string) => {
              const chatMsg: WSMessage = {
                type: 'chat',
                payload: { message: msg, sender: currentUser.nick } as ChatPayload,
                timestamp: Date.now(),
              };
              ws.send(JSON.stringify(chatMsg));
              chatManager.addMessage(currentUser.nick, msg);
            },
            onPluginMessage: (pluginName: string, msg: string) => {
              const pluginMsg: WSMessage = {
                type: 'plugin',
                payload: { message: msg, sender: pluginName } as ChatPayload,
                timestamp: Date.now(),
              };
              ws.send(JSON.stringify(pluginMsg));
              chatManager.addPluginMessage(pluginName, msg);
            },
          });

          resolve();
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('');
      console.error('❌ ' + getDisconnectMessage(host, port, false));
      process.exit(0);
    });

    ws.on('error', (error: Error) => {
      const errorMessage = getConnectionErrorMessage(error, host, port);
      console.error('');
      console.error('❌ ' + errorMessage);
      reject(error);
    });
  });
}
