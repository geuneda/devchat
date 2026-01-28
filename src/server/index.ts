import { WebSocketServer, WebSocket } from 'ws';
import { nanoid } from 'nanoid';
import { RoomManager } from '../core/room';
import { ChatManager } from '../core/chat';
import { saveRoom, loadRoom, updateLastOpened } from '../core/roomHistory';
import { WSMessage, ChatPayload, JoinPayload, User, UserListPayload, SavedRoom } from '../types';
import { createChatUI } from '../ui';
import { PluginManager } from '../plugins';

interface ServerOptions {
  port: number;
  roomName: string;
  hostNick: string;
  /** 저장된 방을 복원할 때 사용할 방 ID */
  resumeRoomId?: string;
}

interface ClientConnection {
  ws: WebSocket;
  user: User;
}

export async function startServer(options: ServerOptions): Promise<void> {
  const { port, roomName, hostNick, resumeRoomId } = options;

  const roomManager = new RoomManager();
  const chatManager = new ChatManager();
  const pluginManager = new PluginManager();
  const clients = new Map<string, ClientConnection>();

  // 플러그인 로드
  await pluginManager.loadBuiltinPlugins();

  // 현재 방 ID (새 방이면 null, 복원된 방이면 기존 ID)
  let currentRoomId: string | null = resumeRoomId || null;
  let savedRoom: SavedRoom | null = null;

  // 저장된 방 복원
  if (resumeRoomId) {
    savedRoom = loadRoom(resumeRoomId);
    if (savedRoom) {
      // 채팅 메시지 복원
      chatManager.setMessages(savedRoom.messages);
      // 플러그인 상태 복원
      pluginManager.restoreAllPluginStates(savedRoom.pluginStates);
      // 마지막 열림 시각 업데이트
      updateLastOpened(resumeRoomId);
      console.log(`📂 저장된 방을 복원합니다: ${savedRoom.name}`);
      console.log(`   메시지 ${savedRoom.messages.length}개 복원됨`);
    }
  }

  // Create the room
  const room = roomManager.createRoom(roomName, hostNick);
  const hostUser = room.host;

  // 방 저장 함수
  const saveCurrentRoom = () => {
    const messages = chatManager.getMessages();
    const pluginStates = pluginManager.getAllPluginStates();
    const saved = saveRoom(currentRoomId, roomName, hostNick, port, messages, pluginStates);
    currentRoomId = saved.id;
    return saved;
  };

  // Create WebSocket server
  const wss = new WebSocketServer({ port });

  // Broadcast to all clients
  const broadcast = (message: WSMessage, excludeId?: string) => {
    const data = JSON.stringify(message);
    clients.forEach((client, id) => {
      if (id !== excludeId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    });
  };

  // Send to specific client
  const sendTo = (userId: string, message: WSMessage) => {
    const client = clients.get(userId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  };

  // Broadcast user list
  const broadcastUserList = () => {
    const userListMsg: WSMessage = {
      type: 'user-list',
      payload: { users: roomManager.getUsers() } as UserListPayload,
      timestamp: Date.now(),
    };
    broadcast(userListMsg);
  };

  // Handle new connections
  wss.on('connection', (ws) => {
    let userId: string | null = null;

    ws.on('message', (data) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());

        switch (message.type) {
          case 'join': {
            const payload = message.payload as JoinPayload;
            let nick = payload.nick;

            // Check if nick is taken
            if (roomManager.isNickTaken(nick)) {
              nick = `${nick}_${nanoid(4)}`;
            }

            const user = roomManager.addUser(nick);
            userId = user.id;
            clients.set(userId, { ws, user });

            // Send welcome message
            const welcomeMsg: WSMessage = {
              type: 'system',
              payload: { message: `Welcome to ${roomName}! You are: ${nick}`, sender: 'System' },
              timestamp: Date.now(),
            };
            ws.send(JSON.stringify(welcomeMsg));

            // Notify others
            const joinNotice = chatManager.addSystemMessage(`${nick} joined the room`);
            broadcast({
              type: 'system',
              payload: { message: joinNotice.content, sender: 'System' },
              timestamp: Date.now(),
            }, userId);

            // Send user list
            broadcastUserList();
            break;
          }

          case 'chat': {
            const payload = message.payload as ChatPayload;
            if (!userId) return;

            const user = roomManager.getUserById(userId);
            if (!user) return;

            const chatMsg = chatManager.addMessage(user.nick, payload.message);
            
            // Broadcast to all including sender
            const chatMsgWs: WSMessage = {
              type: 'chat',
              payload: { message: chatMsg.content, sender: user.nick },
              timestamp: chatMsg.timestamp,
            };
            broadcast(chatMsgWs);
            break;
          }

          case 'plugin': {
            // Plugin messages are broadcasted as-is
            broadcast(message);
            break;
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        const user = roomManager.removeUser(userId);
        clients.delete(userId);
        
        if (user) {
          const leaveNotice = chatManager.addSystemMessage(`${user.nick} left the room`);
          broadcast({
            type: 'system',
            payload: { message: leaveNotice.content, sender: 'System' },
            timestamp: Date.now(),
          });
          broadcastUserList();
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  wss.on('error', (error) => {
    console.error('Server error:', error);
    throw error;
  });

  // 종료 시 방 저장
  let isShuttingDown = false;
  const handleShutdown = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log('\n💾 방을 저장하는 중...');
    try {
      const saved = saveCurrentRoom();
      console.log(`✅ 방이 저장되었습니다. (ID: ${saved.id})`);
      console.log(`   메시지 ${saved.messages.length}개 저장됨`);
    } catch (error) {
      console.error('❌ 방 저장 실패:', error);
    }

    // WebSocket 서버 종료
    wss.close(() => {
      process.exit(0);
    });

    // 강제 종료 (3초 후)
    setTimeout(() => {
      process.exit(0);
    }, 3000);
  };

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);

  // Get local IP for display
  const getLocalIP = (): string => {
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
  };

  const localIP = getLocalIP();
  console.log(`✅ Server started!`);
  console.log(`   Local:   ws://localhost:${port}`);
  console.log(`   Network: ws://${localIP}:${port}`);
  console.log('');
  console.log(`Share this address to invite others: ${localIP}:${port}`);
  console.log('');
  console.log('Starting chat interface...');
  console.log('');

  // 복원된 방이면 안내 메시지 표시
  if (savedRoom) {
    console.log(`📂 복원된 방: ${savedRoom.name}`);
  }

  // Start the chat UI for the host
  await createChatUI({
    isHost: true,
    roomName,
    user: hostUser,
    chatManager,
    roomManager,
    pluginManager, // 상태 공유를 위해 동일한 인스턴스 전달
    broadcast: (msg: string) => {
      const chatMsg = chatManager.addMessage(hostUser.nick, msg);
      const chatMsgWs: WSMessage = {
        type: 'chat',
        payload: { message: chatMsg.content, sender: hostUser.nick },
        timestamp: chatMsg.timestamp,
      };
      broadcast(chatMsgWs);
    },
    onPluginMessage: (pluginName: string, msg: string) => {
      const pluginMsg = chatManager.addPluginMessage(pluginName, msg);
      const pluginMsgWs: WSMessage = {
        type: 'plugin',
        payload: { message: pluginMsg.content, sender: pluginName },
        timestamp: pluginMsg.timestamp,
      };
      broadcast(pluginMsgWs);
    },
  });
}
