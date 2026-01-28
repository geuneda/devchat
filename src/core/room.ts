import { nanoid } from 'nanoid';
import { Room, User } from '../types';

export class RoomManager {
  private room: Room | null = null;

  createRoom(name: string, hostNick: string): Room {
    const host: User = {
      id: nanoid(),
      nick: hostNick,
      isHost: true,
    };

    this.room = {
      name,
      host,
      users: [host],
      createdAt: Date.now(),
    };

    return this.room;
  }

  getRoom(): Room | null {
    return this.room;
  }

  addUser(nick: string): User {
    if (!this.room) {
      throw new Error('No room exists');
    }

    const user: User = {
      id: nanoid(),
      nick,
      isHost: false,
    };

    this.room.users.push(user);
    return user;
  }

  removeUser(userId: string): User | null {
    if (!this.room) return null;

    const index = this.room.users.findIndex((u) => u.id === userId);
    if (index === -1) return null;

    const [removed] = this.room.users.splice(index, 1);
    return removed;
  }

  getUsers(): User[] {
    return this.room?.users ?? [];
  }

  getUserById(userId: string): User | undefined {
    return this.room?.users.find((u) => u.id === userId);
  }

  getUserByNick(nick: string): User | undefined {
    return this.room?.users.find((u) => u.nick === nick);
  }

  isNickTaken(nick: string): boolean {
    return this.room?.users.some((u) => u.nick === nick) ?? false;
  }

  getUserCount(): number {
    return this.room?.users.length ?? 0;
  }
}
