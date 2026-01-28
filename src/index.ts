#!/usr/bin/env node

import { Command } from 'commander';
import { hostCommand, joinCommand, configCommand } from './cli';

const program = new Command();

program
  .name('devchat')
  .description('A stealth CLI chat tool for developers')
  .version('1.0.0');

program.addCommand(hostCommand);
program.addCommand(joinCommand);
program.addCommand(configCommand);

program.parse();
