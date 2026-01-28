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

/**
 * Plugin with state persistence support
 * 플러그인 상태를 저장/복원할 수 있도록 확장된 인터페이스
 */
export interface PluginWithState extends Plugin {
  /**
   * 현재 플러그인 상태를 반환
   * 방 저장 시 호출됩니다.
   */
  getState?: () => unknown;
  
  /**
   * 저장된 상태를 복원
   * 방 복원 시 호출됩니다.
   */
  setState?: (state: unknown) => void;
}

/**
 * 저장된 방 데이터
 * 호스트가 만든 채팅방을 로컬에 저장할 때 사용
 */
export interface SavedRoom {
  /** 고유 식별자 */
  id: string;
  /** 방 이름 */
  name: string;
  /** 호스트 닉네임 */
  hostNick: string;
  /** 사용한 포트 */
  port: number;
  /** 최초 생성 시각 */
  createdAt: number;
  /** 마지막으로 열었던 시각 */
  lastOpenedAt: number;
  /** 저장된 채팅 메시지 */
  messages: ChatMessage[];
  /** 플러그인 상태 (플러그인 이름 -> 상태 데이터) */
  pluginStates: Record<string, unknown>;
}

/**
 * 저장된 방 목록 요약 정보 (UI 표시용)
 */
export interface SavedRoomSummary {
  id: string;
  name: string;
  hostNick: string;
  port: number;
  createdAt: number;
  lastOpenedAt: number;
  messageCount: number;
}
