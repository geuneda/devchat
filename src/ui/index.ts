import blessed from 'blessed';
import { ChatManager } from '../core/chat';
import { RoomManager } from '../core/room';
import { StealthModeManager, getThemeNames } from '../core/stealth';
import { getConfig } from '../core/config';
import { PluginManager } from '../plugins';
import { User } from '../types';

interface ChatUIOptions {
  isHost: boolean;
  roomName: string;
  user: User;
  chatManager: ChatManager;
  roomManager: RoomManager;
  broadcast: (message: string) => void;
  onPluginMessage: (pluginName: string, message: string) => void;
  /** 외부에서 전달받은 PluginManager (상태 공유용) */
  pluginManager?: PluginManager;
}

export async function createChatUI(options: ChatUIOptions): Promise<void> {
  const { isHost, roomName, user, chatManager, roomManager, broadcast, onPluginMessage } = options;
  const config = getConfig();

  // Create stealth mode manager
  const stealthManager = new StealthModeManager(config.theme);

  // Use provided plugin manager or create new one
  const pluginManager = options.pluginManager || new PluginManager();
  if (!options.pluginManager) {
    await pluginManager.loadBuiltinPlugins();
    await pluginManager.loadExternalPlugins();
  }

  // Create screen
  const screen = blessed.screen({
    smartCSR: true,
    title: 'DevChat - ' + roomName,
    fullUnicode: true,
  });

  // ===== STEALTH MODE VIEW (fake output) =====
  const stealthBox = blessed.box({
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
      ch: ' ',
      track: { bg: 'black' },
      style: { bg: 'grey' },
    },
    style: {
      fg: 'green',
      bg: 'black',
    },
    tags: true,
  });

  // ===== CHAT MODE VIEW =====
  const chatContainer = blessed.box({
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    hidden: true,
  });

  // Header
  const header = blessed.box({
    parent: chatContainer,
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    content: ` DevChat | ${roomName} | ${user.nick} ${isHost ? '(Host)' : ''} | Toggle: Hold [${config.toggleKey}] `,
    style: {
      fg: 'white',
      bg: 'blue',
    },
    tags: true,
  });

  // Chat messages area
  const chatBox = blessed.log({
    parent: chatContainer,
    top: 3,
    left: 0,
    width: '100%-20',
    height: '100%-6',
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
      ch: '│',
      track: { bg: 'black' },
      style: { bg: 'cyan' },
    },
    style: {
      fg: 'white',
      bg: 'black',
      border: { fg: 'cyan' },
    },
    border: {
      type: 'line',
    },
    label: ' Messages ',
    tags: true,
  });

  // User list (right side)
  const userList = blessed.list({
    parent: chatContainer,
    top: 3,
    right: 0,
    width: 20,
    height: '100%-6',
    style: {
      fg: 'white',
      bg: 'black',
      border: { fg: 'cyan' },
      selected: { bg: 'blue' },
    },
    border: {
      type: 'line',
    },
    label: ' Users ',
    items: [],
    tags: true,
  });

  // Input box
  const inputBox = blessed.textbox({
    parent: chatContainer,
    bottom: 0,
    left: 0,
    width: '100%',
    height: 3,
    inputOnFocus: true,
    style: {
      fg: 'white',
      bg: 'black',
      border: { fg: 'green' },
    },
    border: {
      type: 'line',
    },
    label: ' Type message (Enter to send, Esc to cancel) ',
  });

  // New message indicator (for stealth mode)
  const newMsgIndicator = blessed.box({
    parent: stealthBox,
    bottom: 0,
    right: 0,
    width: 3,
    height: 1,
    content: '',
    style: {
      fg: 'red',
      bg: 'black',
    },
  });

  screen.append(stealthBox);
  screen.append(chatContainer);

  // State
  let isToggleKeyHeld = false;
  let hasUnreadMessages = false;
  let blinkInterval: NodeJS.Timeout | null = null;
  let stealthLines: string[] = [];

  // Update user list
  const updateUserList = () => {
    const users = roomManager.getUsers();
    userList.setItems(users.map((u) => (u.isHost ? `★ ${u.nick}` : `  ${u.nick}`)));
    screen.render();
  };

  // Add chat message to view
  const addChatMessage = (formatted: string) => {
    chatBox.log(formatted);
    if (!isToggleKeyHeld) {
      hasUnreadMessages = true;
      startBlinking();
    }
    screen.render();
  };

  // Start blinking indicator
  const startBlinking = () => {
    if (blinkInterval) return;
    let visible = true;
    blinkInterval = setInterval(() => {
      newMsgIndicator.setContent(visible && hasUnreadMessages ? '●' : '');
      screen.render();
      visible = !visible;
    }, 500);
  };

  // Stop blinking
  const stopBlinking = () => {
    if (blinkInterval) {
      clearInterval(blinkInterval);
      blinkInterval = null;
    }
    newMsgIndicator.setContent('');
    hasUnreadMessages = false;
  };

  // Switch to chat view
  const showChatView = () => {
    stealthBox.hide();
    chatContainer.show();
    stopBlinking();
    inputBox.focus();
    screen.render();
  };

  // Switch to stealth view
  const showStealthView = () => {
    chatContainer.hide();
    stealthBox.show();
    screen.render();
  };

  // Add stealth line
  const addStealthLine = (line: string) => {
    stealthLines.push(line);
    if (stealthLines.length > 500) {
      stealthLines = stealthLines.slice(-500);
    }
    stealthBox.setContent(stealthLines.join('\n'));
    stealthBox.setScrollPerc(100);
    screen.render();
  };

  // Start stealth mode output
  stealthManager.startFakeOutput(addStealthLine);

  // Handle toggle key
  screen.key([config.toggleKey], () => {
    if (!isToggleKeyHeld) {
      isToggleKeyHeld = true;
      showChatView();
    }
  });

  // We need to detect key release - blessed doesn't have native support
  // So we'll use a different approach: timeout-based
  let toggleTimeout: NodeJS.Timeout | null = null;

  const resetToggleTimeout = () => {
    if (toggleTimeout) clearTimeout(toggleTimeout);
    toggleTimeout = setTimeout(() => {
      if (isToggleKeyHeld) {
        isToggleKeyHeld = false;
        showStealthView();
      }
    }, 200);
  };

  // Alternative: Use 'keypress' event for continuous detection
  screen.on('keypress', (ch, key) => {
    if (key && key.name === config.toggleKey.replace('`', 'backquote')) {
      if (!isToggleKeyHeld) {
        isToggleKeyHeld = true;
        showChatView();
      }
      resetToggleTimeout();
    }
  });

  // Handle input submission
  inputBox.on('submit', (value) => {
    if (value.trim()) {
      // Check for plugin commands
      if (value.startsWith('/')) {
        const parts = value.slice(1).split(' ');
        const cmd = '/' + parts[0];
        const args = parts.slice(1);

        const handled = pluginManager.executeCommand(cmd, args, {
          user,
          room: roomManager.getRoom()!,
          broadcast: (msg) => {
            onPluginMessage(pluginManager.getCommandPlugin(cmd)?.name || 'Plugin', msg);
            addChatMessage(`[Plugin] ${msg}`);
          },
          sendToUser: () => {}, // Not implemented for simplicity
          getUsers: () => roomManager.getUsers(),
        });

        if (!handled) {
          // Regular message starting with /
          broadcast(value);
        }
      } else {
        broadcast(value);
      }
    }
    inputBox.clearValue();
    inputBox.focus();
    screen.render();
  });

  inputBox.on('cancel', () => {
    inputBox.clearValue();
    screen.render();
  });

  // Poll for new messages
  let lastMessageCount = 0;
  setInterval(() => {
    const messages = chatManager.getMessages();
    if (messages.length > lastMessageCount) {
      for (let i = lastMessageCount; i < messages.length; i++) {
        addChatMessage(chatManager.formatMessage(messages[i]));
      }
      lastMessageCount = messages.length;
    }
    updateUserList();
  }, 100);

  // Quit
  screen.key(['C-c'], () => {
    stealthManager.stopFakeOutput();
    screen.destroy();
    process.exit(0);
  });

  // Help
  screen.key(['C-h'], () => {
    const helpMsg = `
Commands:
  /help - Show this help
  /roll [sides] - Roll a dice
  /users - Show user list
  /theme <name> - Change stealth theme
  /rpg - Start text RPG (if loaded)

Controls:
  Hold [${config.toggleKey}] - Show chat
  Ctrl+C - Quit
  Ctrl+H - This help
`;
    chatManager.addSystemMessage(helpMsg);
  });

  // Theme change command
  screen.key(['C-t'], () => {
    const themes = getThemeNames();
    const currentIndex = themes.indexOf(stealthManager.getTheme().name);
    const nextIndex = (currentIndex + 1) % themes.length;
    stealthManager.setTheme(themes[nextIndex]);
    chatManager.addSystemMessage(`Theme changed to: ${themes[nextIndex]}`);
    stealthLines = [];
  });

  // Initial render
  showStealthView();
  screen.render();

  // Welcome message
  chatManager.addSystemMessage(`Welcome to ${roomName}!`);
  chatManager.addSystemMessage(`Hold [${config.toggleKey}] to view chat. Release to hide.`);
  chatManager.addSystemMessage(`Type /help for commands.`);

  return new Promise(() => {
    // Keep running
  });
}
