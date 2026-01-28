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

// Plugin UI types
export interface PluginUIBoxOptions {
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  width?: number | string;
  height?: number | string;
  content?: string;
  label?: string;
  border?: 'line' | 'bg' | boolean;
  scrollable?: boolean;
  style?: {
    fg?: string;
    bg?: string;
    border?: { fg?: string; bg?: string };
  };
}

export interface PluginUIListOptions extends PluginUIBoxOptions {
  items?: string[];
  keys?: boolean;
  vi?: boolean;
  mouse?: boolean;
  selectedStyle?: {
    fg?: string;
    bg?: string;
    bold?: boolean;
  };
}

export interface PluginUIProgressOptions extends PluginUIBoxOptions {
  orientation?: 'horizontal' | 'vertical';
  filled?: number;
  pch?: string;
  ch?: string;
  style?: {
    fg?: string;
    bg?: string;
    bar?: { fg?: string; bg?: string };
  };
}

export interface PluginUIInputOptions extends PluginUIBoxOptions {
  value?: string;
  secret?: boolean;
  censor?: string;
}

/**
 * Plugin with UI support
 * 플러그인이 전체 화면 UI를 가질 수 있도록 확장된 인터페이스
 */
export interface PluginWithUI extends Plugin {
  /**
   * UI 생성 함수
   * 플러그인 명령어로 UI를 표시할 때 호출됩니다.
   */
  createUI?: () => void | Promise<void>;
  
  /**
   * UI가 활성화되어 있는지 여부
   */
  hasUI?: boolean;
}
