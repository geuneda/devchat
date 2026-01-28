import blessed from 'blessed';
import { getConfig, setConfig, getConfigPath } from '../core/config';
import { getThemeNames } from '../core/stealth';

interface MenuOption {
  label: string;
  description: string;
  action: () => void | Promise<void>;
}

/**
 * Main interactive menu for DevChat
 * Shows when user runs `devchat` without arguments
 */
export async function showMainMenu(): Promise<void> {
  const config = getConfig();

  const screen = blessed.screen({
    smartCSR: true,
    title: 'DevChat',
    fullUnicode: true,
  });

  // Header box
  const header = blessed.box({
    top: 0,
    left: 'center',
    width: '80%',
    height: 5,
    content: `{center}{bold}DevChat v1.0.0{/bold}\n{cyan-fg}Stealth CLI Chat Tool{/cyan-fg}\n{gray-fg}개발자를 위한 스텔스 채팅 도구{/gray-fg}{/center}`,
    tags: true,
    border: {
      type: 'line',
    },
    style: {
      border: { fg: 'cyan' },
      bg: 'black',
    },
  });

  // Menu list
  const menuItems: MenuOption[] = [
    {
      label: 'Host Room',
      description: '채팅방 생성 (서버 호스트)',
      action: () => showHostMenu(screen),
    },
    {
      label: 'Join Room',
      description: '채팅방 참여 (클라이언트)',
      action: () => showJoinMenu(screen),
    },
    {
      label: 'Settings',
      description: '설정 관리',
      action: () => showSettingsMenu(screen),
    },
    {
      label: 'Help',
      description: '도움말 보기',
      action: () => showHelpScreen(screen),
    },
    {
      label: 'Exit',
      description: '종료',
      action: () => {
        screen.destroy();
        process.exit(0);
      },
    },
  ];

  const menuList = blessed.list({
    top: 6,
    left: 'center',
    width: '80%',
    height: menuItems.length + 2,
    items: menuItems.map((item, i) => `  ${item.label.padEnd(15)} - ${item.description}`),
    keys: true,
    vi: true,
    mouse: true,
    border: {
      type: 'line',
    },
    style: {
      border: { fg: 'cyan' },
      selected: {
        bg: 'cyan',
        fg: 'black',
        bold: true,
      },
      item: {
        fg: 'white',
      },
    },
    label: ' Menu ',
  });

  // Current config info
  const infoBox = blessed.box({
    top: 6 + menuItems.length + 3,
    left: 'center',
    width: '80%',
    height: 6,
    content: `{gray-fg}현재 설정:{/gray-fg}
  닉네임: {yellow-fg}${config.nick}{/yellow-fg}
  테마: {green-fg}${config.theme}{/green-fg}
  토글 키: {magenta-fg}${config.toggleKey}{/magenta-fg}
  기본 포트: {blue-fg}${config.port}{/blue-fg}`,
    tags: true,
    border: {
      type: 'line',
    },
    style: {
      border: { fg: 'gray' },
    },
    label: ' Info ',
  });

  // Footer
  const footer = blessed.box({
    bottom: 0,
    left: 'center',
    width: '80%',
    height: 3,
    content: '{center}{gray-fg}[↑↓] 이동  [Enter] 선택  [q] 종료{/gray-fg}{/center}',
    tags: true,
    border: {
      type: 'line',
    },
    style: {
      border: { fg: 'gray' },
    },
  });

  screen.append(header);
  screen.append(menuList);
  screen.append(infoBox);
  screen.append(footer);

  // Handle menu selection
  menuList.on('select', async (_item, index) => {
    await menuItems[index].action();
  });

  // Key bindings
  screen.key(['q', 'C-c'], () => {
    screen.destroy();
    process.exit(0);
  });

  menuList.focus();
  screen.render();

  return new Promise(() => {
    // Keep running
  });
}

/**
 * Host room menu
 */
function showHostMenu(screen: blessed.Widgets.Screen): void {
  const config = getConfig();

  // Clear screen content
  screen.children.forEach((child) => child.destroy());

  const formBox = blessed.box({
    top: 'center',
    left: 'center',
    width: '70%',
    height: 16,
    border: {
      type: 'line',
    },
    style: {
      border: { fg: 'green' },
    },
    label: ' Host Room ',
  });

  const portLabel = blessed.text({
    parent: formBox,
    top: 1,
    left: 2,
    content: '포트 번호:',
    style: { fg: 'white' },
  });

  const portInput = blessed.textbox({
    parent: formBox,
    top: 1,
    left: 14,
    width: 20,
    height: 1,
    value: String(config.port),
    inputOnFocus: true,
    style: {
      fg: 'yellow',
      bg: 'black',
    },
  });

  const nameLabel = blessed.text({
    parent: formBox,
    top: 3,
    left: 2,
    content: '방 이름:',
    style: { fg: 'white' },
  });

  const nameInput = blessed.textbox({
    parent: formBox,
    top: 3,
    left: 14,
    width: 30,
    height: 1,
    value: 'DevChat Room',
    inputOnFocus: true,
    style: {
      fg: 'yellow',
      bg: 'black',
    },
  });

  const nickLabel = blessed.text({
    parent: formBox,
    top: 5,
    left: 2,
    content: '닉네임:',
    style: { fg: 'white' },
  });

  const nickInput = blessed.textbox({
    parent: formBox,
    top: 5,
    left: 14,
    width: 20,
    height: 1,
    value: config.nick,
    inputOnFocus: true,
    style: {
      fg: 'yellow',
      bg: 'black',
    },
  });

  const buttonsBox = blessed.box({
    parent: formBox,
    top: 8,
    left: 2,
    width: '100%-4',
    height: 3,
  });

  const startBtn = blessed.button({
    parent: buttonsBox,
    left: 0,
    width: 15,
    height: 3,
    content: '{center}Start{/center}',
    tags: true,
    border: {
      type: 'line',
    },
    style: {
      fg: 'white',
      bg: 'green',
      border: { fg: 'green' },
      focus: {
        bg: 'cyan',
      },
    },
  });

  const cancelBtn = blessed.button({
    parent: buttonsBox,
    left: 18,
    width: 15,
    height: 3,
    content: '{center}Cancel{/center}',
    tags: true,
    border: {
      type: 'line',
    },
    style: {
      fg: 'white',
      bg: 'red',
      border: { fg: 'red' },
      focus: {
        bg: 'cyan',
      },
    },
  });

  const helpText = blessed.text({
    parent: formBox,
    bottom: 0,
    left: 2,
    content: '{gray-fg}[Tab] 다음 필드  [Enter] 확인  [Esc] 취소{/gray-fg}',
    tags: true,
  });

  screen.append(formBox);

  // Focus handling
  const focusableElements = [portInput, nameInput, nickInput, startBtn, cancelBtn];
  let focusIndex = 0;

  const focusNext = () => {
    focusIndex = (focusIndex + 1) % focusableElements.length;
    focusableElements[focusIndex].focus();
    screen.render();
  };

  const focusPrev = () => {
    focusIndex = (focusIndex - 1 + focusableElements.length) % focusableElements.length;
    focusableElements[focusIndex].focus();
    screen.render();
  };

  // Update focusIndex when element is focused directly
  focusableElements.forEach((el, idx) => {
    el.on('focus', () => {
      focusIndex = idx;
    });
  });

  screen.key(['tab'], focusNext);
  screen.key(['S-tab'], focusPrev);

  startBtn.on('press', async () => {
    const port = parseInt(portInput.getValue()) || config.port;
    const roomName = nameInput.getValue() || 'DevChat Room';
    const nick = nickInput.getValue() || config.nick;

    screen.destroy();

    // Import and start host
    const { startServer } = await import('../server');
    await startServer({ port, roomName, nick });
  });

  cancelBtn.on('press', () => {
    screen.destroy();
    showMainMenu();
  });

  screen.key(['escape'], () => {
    screen.destroy();
    showMainMenu();
  });

  portInput.focus();
  screen.render();
}

/**
 * Join room menu
 */
function showJoinMenu(screen: blessed.Widgets.Screen): void {
  const config = getConfig();

  // Clear screen content
  screen.children.forEach((child) => child.destroy());

  const formBox = blessed.box({
    top: 'center',
    left: 'center',
    width: '70%',
    height: 14,
    border: {
      type: 'line',
    },
    style: {
      border: { fg: 'blue' },
    },
    label: ' Join Room ',
  });

  const addressLabel = blessed.text({
    parent: formBox,
    top: 1,
    left: 2,
    content: '서버 주소:',
    style: { fg: 'white' },
  });

  const addressInput = blessed.textbox({
    parent: formBox,
    top: 1,
    left: 14,
    width: 30,
    height: 1,
    value: `localhost:${config.port}`,
    inputOnFocus: true,
    style: {
      fg: 'yellow',
      bg: 'black',
    },
  });

  const nickLabel = blessed.text({
    parent: formBox,
    top: 3,
    left: 2,
    content: '닉네임:',
    style: { fg: 'white' },
  });

  const nickInput = blessed.textbox({
    parent: formBox,
    top: 3,
    left: 14,
    width: 20,
    height: 1,
    value: config.nick,
    inputOnFocus: true,
    style: {
      fg: 'yellow',
      bg: 'black',
    },
  });

  const buttonsBox = blessed.box({
    parent: formBox,
    top: 6,
    left: 2,
    width: '100%-4',
    height: 3,
  });

  const joinBtn = blessed.button({
    parent: buttonsBox,
    left: 0,
    width: 15,
    height: 3,
    content: '{center}Join{/center}',
    tags: true,
    border: {
      type: 'line',
    },
    style: {
      fg: 'white',
      bg: 'blue',
      border: { fg: 'blue' },
      focus: {
        bg: 'cyan',
      },
    },
  });

  const cancelBtn = blessed.button({
    parent: buttonsBox,
    left: 18,
    width: 15,
    height: 3,
    content: '{center}Cancel{/center}',
    tags: true,
    border: {
      type: 'line',
    },
    style: {
      fg: 'white',
      bg: 'red',
      border: { fg: 'red' },
      focus: {
        bg: 'cyan',
      },
    },
  });

  const helpText = blessed.text({
    parent: formBox,
    bottom: 0,
    left: 2,
    content: '{gray-fg}[Tab] 다음 필드  [Enter] 확인  [Esc] 취소{/gray-fg}',
    tags: true,
  });

  screen.append(formBox);

  // Focus handling
  const focusableElements = [addressInput, nickInput, joinBtn, cancelBtn];
  let focusIndex = 0;

  const focusNext = () => {
    focusIndex = (focusIndex + 1) % focusableElements.length;
    focusableElements[focusIndex].focus();
    screen.render();
  };

  const focusPrev = () => {
    focusIndex = (focusIndex - 1 + focusableElements.length) % focusableElements.length;
    focusableElements[focusIndex].focus();
    screen.render();
  };

  // Update focusIndex when element is focused directly
  focusableElements.forEach((el, idx) => {
    el.on('focus', () => {
      focusIndex = idx;
    });
  });

  screen.key(['tab'], focusNext);
  screen.key(['S-tab'], focusPrev);

  joinBtn.on('press', async () => {
    const address = addressInput.getValue() || `localhost:${config.port}`;
    const nick = nickInput.getValue() || config.nick;

    screen.destroy();

    // Import and start client
    const { connectToServer } = await import('../client');
    await connectToServer({ address, nick });
  });

  cancelBtn.on('press', () => {
    screen.destroy();
    showMainMenu();
  });

  screen.key(['escape'], () => {
    screen.destroy();
    showMainMenu();
  });

  addressInput.focus();
  screen.render();
}

/**
 * Settings menu
 */
function showSettingsMenu(screen: blessed.Widgets.Screen): void {
  const config = getConfig();
  const themes = getThemeNames();

  // Clear screen content
  screen.children.forEach((child) => child.destroy());

  const formBox = blessed.box({
    top: 'center',
    left: 'center',
    width: '70%',
    height: 18,
    border: {
      type: 'line',
    },
    style: {
      border: { fg: 'yellow' },
    },
    label: ' Settings ',
  });

  // Nickname setting
  const nickLabel = blessed.text({
    parent: formBox,
    top: 1,
    left: 2,
    content: '기본 닉네임:',
    style: { fg: 'white' },
  });

  const nickInput = blessed.textbox({
    parent: formBox,
    top: 1,
    left: 16,
    width: 20,
    height: 1,
    value: config.nick,
    inputOnFocus: true,
    style: {
      fg: 'yellow',
      bg: 'black',
    },
  });

  // Toggle key setting
  const toggleLabel = blessed.text({
    parent: formBox,
    top: 3,
    left: 2,
    content: '토글 키:',
    style: { fg: 'white' },
  });

  const toggleInput = blessed.textbox({
    parent: formBox,
    top: 3,
    left: 16,
    width: 10,
    height: 1,
    value: config.toggleKey,
    inputOnFocus: true,
    style: {
      fg: 'magenta',
      bg: 'black',
    },
  });

  // Theme setting
  const themeLabel = blessed.text({
    parent: formBox,
    top: 5,
    left: 2,
    content: '위장 테마:',
    style: { fg: 'white' },
  });

  const themeList = blessed.list({
    parent: formBox,
    top: 5,
    left: 16,
    width: 20,
    height: themes.length + 2,
    items: themes,
    keys: true,
    vi: true,
    border: {
      type: 'line',
    },
    style: {
      border: { fg: 'gray' },
      selected: {
        bg: 'green',
        fg: 'black',
      },
    },
  });

  // Select current theme
  const currentThemeIndex = themes.indexOf(config.theme);
  if (currentThemeIndex >= 0) {
    themeList.select(currentThemeIndex);
  }

  // Port setting
  const portLabel = blessed.text({
    parent: formBox,
    top: 5 + themes.length + 3,
    left: 2,
    content: '기본 포트:',
    style: { fg: 'white' },
  });

  const portInput = blessed.textbox({
    parent: formBox,
    top: 5 + themes.length + 3,
    left: 16,
    width: 10,
    height: 1,
    value: String(config.port),
    inputOnFocus: true,
    style: {
      fg: 'blue',
      bg: 'black',
    },
  });

  // Buttons
  const buttonsBox = blessed.box({
    parent: formBox,
    bottom: 2,
    left: 2,
    width: '100%-4',
    height: 3,
  });

  const saveBtn = blessed.button({
    parent: buttonsBox,
    left: 0,
    width: 15,
    height: 3,
    content: '{center}Save{/center}',
    tags: true,
    border: {
      type: 'line',
    },
    style: {
      fg: 'white',
      bg: 'green',
      border: { fg: 'green' },
      focus: {
        bg: 'cyan',
      },
    },
  });

  const cancelBtn = blessed.button({
    parent: buttonsBox,
    left: 18,
    width: 15,
    height: 3,
    content: '{center}Cancel{/center}',
    tags: true,
    border: {
      type: 'line',
    },
    style: {
      fg: 'white',
      bg: 'red',
      border: { fg: 'red' },
      focus: {
        bg: 'cyan',
      },
    },
  });

  const pathText = blessed.text({
    parent: formBox,
    bottom: 0,
    left: 2,
    content: `{gray-fg}설정 파일: ${getConfigPath()}{/gray-fg}`,
    tags: true,
  });

  screen.append(formBox);

  // Focus handling
  const focusableElements = [nickInput, toggleInput, themeList, portInput, saveBtn, cancelBtn];
  let focusIndex = 0;

  const focusNext = () => {
    focusIndex = (focusIndex + 1) % focusableElements.length;
    focusableElements[focusIndex].focus();
    screen.render();
  };

  const focusPrev = () => {
    focusIndex = (focusIndex - 1 + focusableElements.length) % focusableElements.length;
    focusableElements[focusIndex].focus();
    screen.render();
  };

  // Update focusIndex when element is focused directly
  focusableElements.forEach((el, idx) => {
    el.on('focus', () => {
      focusIndex = idx;
    });
  });

  screen.key(['tab'], focusNext);
  screen.key(['S-tab'], focusPrev);

  saveBtn.on('press', () => {
    const nick = nickInput.getValue();
    const toggleKey = toggleInput.getValue();
    const selectedTheme = themes[themeList.selected as number];
    const port = parseInt(portInput.getValue());

    if (nick) setConfig('nick', nick);
    if (toggleKey) setConfig('toggleKey', toggleKey);
    if (selectedTheme) setConfig('theme', selectedTheme);
    if (port && !isNaN(port)) setConfig('port', port);

    screen.destroy();
    showMainMenu();
  });

  cancelBtn.on('press', () => {
    screen.destroy();
    showMainMenu();
  });

  screen.key(['escape'], () => {
    screen.destroy();
    showMainMenu();
  });

  nickInput.focus();
  screen.render();
}

/**
 * Help screen
 */
function showHelpScreen(screen: blessed.Widgets.Screen): void {
  // Clear screen content
  screen.children.forEach((child) => child.destroy());

  const helpBox = blessed.box({
    top: 'center',
    left: 'center',
    width: '80%',
    height: '80%',
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
    mouse: true,
    scrollbar: {
      ch: '│',
      track: { bg: 'black' },
      style: { bg: 'cyan' },
    },
    border: {
      type: 'line',
    },
    style: {
      border: { fg: 'cyan' },
    },
    label: ' Help ',
    tags: true,
    content: `
{bold}{cyan-fg}DevChat - 개발자를 위한 스텔스 채팅 도구{/cyan-fg}{/bold}

{yellow-fg}스텔스 모드{/yellow-fg}
  기본 화면은 가짜 빌드/로그 출력이 스크롤됩니다.
  토글 키를 홀드하면 실제 채팅 화면이 나타납니다.
  키를 놓으면 다시 가짜 출력 화면으로 돌아갑니다.

{yellow-fg}CLI 명령어{/yellow-fg}
  devchat              인터랙티브 메뉴 실행
  devchat host         채팅방 생성 (호스트)
  devchat join <addr>  채팅방 참여
  devchat config       설정 관리

{yellow-fg}Host 옵션{/yellow-fg}
  -p, --port <port>    리스닝 포트 (기본: 8080)
  -n, --name <name>    방 이름
  --nick <nickname>    닉네임

{yellow-fg}채팅 중 단축키{/yellow-fg}
  토글 키 (기본 \`)    홀드하면 채팅 표시
  Ctrl+C              종료
  Ctrl+T              테마 변경
  Ctrl+H              도움말

{yellow-fg}내장 채팅 명령어{/yellow-fg}
  /help               도움말
  /roll [면수]        주사위 굴리기
  /flip               동전 던지기
  /users              접속자 목록
  /me <행동>          액션 메시지

{yellow-fg}텍스트 RPG 명령어{/yellow-fg}
  /rpg                RPG 도움말
  /rpg start          게임 시작
  /rpg status         내 상태
  /rpg hunt           몬스터 사냥
  /rpg attack         공격
  /rpg shop           상점

{gray-fg}[Esc] 또는 [q]를 눌러 돌아가기{/gray-fg}
`,
  });

  screen.append(helpBox);

  screen.key(['escape', 'q'], () => {
    screen.destroy();
    showMainMenu();
  });

  helpBox.focus();
  screen.render();
}
