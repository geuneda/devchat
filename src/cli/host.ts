import { Command } from 'commander';
import { getConfig } from '../core/config';
import { startServer } from '../server';
import { loadRoom, getSavedRooms, formatDate } from '../core/roomHistory';

export const hostCommand = new Command('host')
  .description('Create and host a chat room')
  .option('-p, --port <port>', 'Port to listen on', String(getConfig().port))
  .option('-n, --name <name>', 'Room name', 'DevChat Room')
  .option('--nick <nickname>', 'Your nickname', getConfig().nick)
  .option('-r, --resume <roomId>', 'Resume a saved room by ID')
  .action(async (options) => {
    let port = parseInt(options.port, 10);
    let roomName = options.name;
    let nick = options.nick;
    let resumeRoomId: string | undefined;

    // 저장된 방 복원 모드
    if (options.resume) {
      const savedRoom = loadRoom(options.resume);
      if (!savedRoom) {
        console.error(`❌ 저장된 방을 찾을 수 없습니다: ${options.resume}`);
        console.log('');
        console.log('저장된 방 목록을 확인하려면: devchat rooms');
        process.exit(1);
      }

      // 저장된 방 정보로 설정 (CLI 옵션으로 덮어쓰기 가능)
      port = options.port !== String(getConfig().port) ? port : savedRoom.port;
      roomName = options.name !== 'DevChat Room' ? roomName : savedRoom.name;
      nick = options.nick !== getConfig().nick ? nick : savedRoom.hostNick;
      resumeRoomId = savedRoom.id;

      console.log(`📂 저장된 방을 복원합니다...`);
      console.log(`   방 이름: ${savedRoom.name}`);
      console.log(`   메시지: ${savedRoom.messages.length}개`);
      console.log(`   마지막 사용: ${formatDate(savedRoom.lastOpenedAt)}`);
      console.log('');
    }

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
        resumeRoomId,
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  });
