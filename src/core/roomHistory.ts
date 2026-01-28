import Conf from 'conf';
import { nanoid } from 'nanoid';
import { SavedRoom, SavedRoomSummary, ChatMessage } from '../types';

interface RoomHistoryStore {
  rooms: Record<string, SavedRoom>;
}

const store = new Conf<RoomHistoryStore>({
  projectName: 'devchat',
  configName: 'room-history',
  defaults: {
    rooms: {},
  },
});

/**
 * 방을 저장합니다.
 * 새 방이면 ID를 생성하고, 기존 방이면 업데이트합니다.
 */
export function saveRoom(
  roomId: string | null,
  name: string,
  hostNick: string,
  port: number,
  messages: ChatMessage[],
  pluginStates: Record<string, unknown>
): SavedRoom {
  const rooms = store.get('rooms');
  const now = Date.now();

  const id = roomId || nanoid();
  const existingRoom = rooms[id];

  const savedRoom: SavedRoom = {
    id,
    name,
    hostNick,
    port,
    createdAt: existingRoom?.createdAt || now,
    lastOpenedAt: now,
    messages,
    pluginStates,
  };

  rooms[id] = savedRoom;
  store.set('rooms', rooms);

  return savedRoom;
}

/**
 * 저장된 방을 로드합니다.
 */
export function loadRoom(roomId: string): SavedRoom | null {
  const rooms = store.get('rooms');
  return rooms[roomId] || null;
}

/**
 * 저장된 모든 방의 요약 정보를 반환합니다.
 * 최근에 열었던 순서로 정렬됩니다.
 */
export function getSavedRooms(): SavedRoomSummary[] {
  const rooms = store.get('rooms');
  
  return Object.values(rooms)
    .map((room) => ({
      id: room.id,
      name: room.name,
      hostNick: room.hostNick,
      port: room.port,
      createdAt: room.createdAt,
      lastOpenedAt: room.lastOpenedAt,
      messageCount: room.messages.length,
    }))
    .sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
}

/**
 * 저장된 방을 삭제합니다.
 */
export function deleteRoom(roomId: string): boolean {
  const rooms = store.get('rooms');
  
  if (rooms[roomId]) {
    delete rooms[roomId];
    store.set('rooms', rooms);
    return true;
  }
  
  return false;
}

/**
 * 저장된 방이 있는지 확인합니다.
 */
export function hasSavedRooms(): boolean {
  const rooms = store.get('rooms');
  return Object.keys(rooms).length > 0;
}

/**
 * 방의 마지막 열림 시각을 업데이트합니다.
 */
export function updateLastOpened(roomId: string): void {
  const rooms = store.get('rooms');
  
  if (rooms[roomId]) {
    rooms[roomId].lastOpenedAt = Date.now();
    store.set('rooms', rooms);
  }
}

/**
 * 날짜를 읽기 쉬운 형식으로 포맷합니다.
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `오늘 ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return '어제';
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}

/**
 * 저장 파일 경로를 반환합니다.
 */
export function getRoomHistoryPath(): string {
  return store.path;
}
