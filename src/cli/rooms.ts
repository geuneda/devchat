import { Command } from 'commander';
import { getSavedRooms, deleteRoom, loadRoom, formatDate, getRoomHistoryPath } from '../core/roomHistory';

export const roomsCommand = new Command('rooms')
  .description('Manage saved chat rooms')
  .action(() => {
    const rooms = getSavedRooms();

    if (rooms.length === 0) {
      console.log('저장된 방이 없습니다.');
      console.log('');
      console.log('방을 호스트하고 종료하면 자동으로 저장됩니다.');
      console.log('  devchat host --name "방이름"');
      return;
    }

    console.log('📂 저장된 방 목록');
    console.log('═'.repeat(60));
    console.log('');

    rooms.forEach((room, index) => {
      const date = formatDate(room.lastOpenedAt);
      console.log(`  ${index + 1}. ${room.name}`);
      console.log(`     ID: ${room.id}`);
      console.log(`     호스트: ${room.hostNick} | 포트: ${room.port}`);
      console.log(`     메시지: ${room.messageCount}개 | 마지막 사용: ${date}`);
      console.log('');
    });

    console.log('─'.repeat(60));
    console.log('');
    console.log('사용법:');
    console.log('  저장된 방 열기:  devchat host --resume <roomId>');
    console.log('  방 삭제:        devchat rooms delete <roomId>');
    console.log('');
  });

// 하위 명령어: delete
roomsCommand
  .command('delete <roomId>')
  .description('Delete a saved room')
  .action((roomId: string) => {
    const room = loadRoom(roomId);

    if (!room) {
      console.error(`❌ 저장된 방을 찾을 수 없습니다: ${roomId}`);
      console.log('');
      console.log('저장된 방 목록을 확인하려면: devchat rooms');
      process.exit(1);
    }

    console.log(`삭제할 방: ${room.name}`);
    console.log(`  메시지: ${room.messages.length}개`);
    console.log(`  마지막 사용: ${formatDate(room.lastOpenedAt)}`);
    console.log('');

    const success = deleteRoom(roomId);
    if (success) {
      console.log('✅ 방이 삭제되었습니다.');
    } else {
      console.error('❌ 방 삭제에 실패했습니다.');
      process.exit(1);
    }
  });

// 하위 명령어: info
roomsCommand
  .command('info <roomId>')
  .description('Show detailed information about a saved room')
  .action((roomId: string) => {
    const room = loadRoom(roomId);

    if (!room) {
      console.error(`❌ 저장된 방을 찾을 수 없습니다: ${roomId}`);
      process.exit(1);
    }

    console.log('📂 방 상세 정보');
    console.log('═'.repeat(60));
    console.log('');
    console.log(`  이름: ${room.name}`);
    console.log(`  ID: ${room.id}`);
    console.log(`  호스트: ${room.hostNick}`);
    console.log(`  포트: ${room.port}`);
    console.log(`  생성일: ${new Date(room.createdAt).toLocaleString('ko-KR')}`);
    console.log(`  마지막 사용: ${new Date(room.lastOpenedAt).toLocaleString('ko-KR')}`);
    console.log(`  메시지 수: ${room.messages.length}개`);
    console.log('');

    // 플러그인 상태 정보
    const pluginNames = Object.keys(room.pluginStates);
    if (pluginNames.length > 0) {
      console.log('  플러그인 상태:');
      pluginNames.forEach((name) => {
        console.log(`    - ${name}: 저장됨`);
      });
      console.log('');
    }

    // 최근 메시지 미리보기
    if (room.messages.length > 0) {
      console.log('  최근 메시지:');
      const recentMessages = room.messages.slice(-5);
      recentMessages.forEach((msg) => {
        const time = new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const content = msg.content.length > 40 
          ? msg.content.substring(0, 40) + '...' 
          : msg.content;
        console.log(`    [${time}] ${msg.sender}: ${content}`);
      });
      console.log('');
    }

    console.log('─'.repeat(60));
    console.log('');
    console.log(`이 방을 열려면: devchat host --resume ${room.id}`);
  });

// 하위 명령어: path
roomsCommand
  .command('path')
  .description('Show the path to saved rooms file')
  .action(() => {
    console.log('저장 파일 경로:', getRoomHistoryPath());
  });
