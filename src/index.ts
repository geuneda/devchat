#!/usr/bin/env node

import { Command } from 'commander';
import { hostCommand, joinCommand, configCommand, roomsCommand, inviteCommand } from './cli';

const program = new Command();

program
  .name('devchat')
  .description('A stealth CLI chat tool for developers')
  .version('1.0.0')
  .action(async () => {
    // 서브커맨드 없이 devchat만 실행 시 인터랙티브 메뉴 UI 표시
    const { showMainMenu } = await import('./ui/menu');
    await showMainMenu();
  });

program.addCommand(hostCommand);
program.addCommand(joinCommand);
program.addCommand(configCommand);
program.addCommand(roomsCommand);
program.addCommand(inviteCommand);

program.parse();
