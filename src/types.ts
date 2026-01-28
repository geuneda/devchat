// Message types
export interface ChatMessage {
  id: string;
  type: 'chat' | 'system' | 'plugin';
  sender: string;
  content: string;
  timestamp: number;
}

export interface User {
  id: string;
  nick: string;
  isHost: boolean;
}

export interface Room {
  name: string;
  host: User;
  users: User[];
  createdAt: number;
}

// WebSocket message protocol
export type WSMessageType =
  | 'join'
  | 'leave'
  | 'chat'
  | 'system'
  | 'plugin'
  | 'user-list'
  | 'error';

export interface WSMessage {
  type: WSMessageType;
  payload: unknown;
  timestamp: number;
}

export interface JoinPayload {
  nick: string;
  roomName?: string;
}

export interface ChatPayload {
  message: string;
  sender: string;
}

export interface UserListPayload {
  users: User[];
}

// Plugin types
export interface PluginContext {
  user: User;
  room: Room;
  broadcast: (message: string) => void;
  sendToUser: (userId: string, message: string) => void;
  getUsers: () => User[];
}

export interface PluginCommand {
  (args: string[], ctx: PluginContext): void | Promise<void>;
}

export interface Plugin {
  name: string;
  description?: string;
  version?: string;
  commands: Record<string, PluginCommand>;
  onLoad?: (ctx: PluginContext) => void;
  onUnload?: () => void;
}

// Config types
export interface DevChatConfig {
  nick: string;
  toggleKey: string;
  theme: string;
  port: number;
  pluginsDir: string;
}

export const DEFAULT_CONFIG: DevChatConfig = {
  nick: 'anonymous',
  toggleKey: '`',
  theme: 'npm-build',
  port: 8080,
  pluginsDir: './plugins',
};

// Stealth theme types
export interface StealthTheme {
  name: string;
  description: string;
  generateLine: () => string;
  interval: { min: number; max: number }; // ms between lines
}
