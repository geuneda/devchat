import blessed from 'blessed';

/**
 * Plugin UI API
 * 
 * 플러그인에서 blessed 기반의 UI 컴포넌트를 쉽게 만들 수 있도록
 * 도와주는 헬퍼 함수들을 제공합니다.
 */

export interface BoxOptions {
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

export interface ListOptions extends BoxOptions {
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

export interface ProgressOptions extends BoxOptions {
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

export interface InputOptions extends BoxOptions {
  value?: string;
  secret?: boolean;
  censor?: string;
}

export interface TextDisplayOptions extends BoxOptions {
  tags?: boolean;
}

export interface GameScreenOptions {
  title?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * Plugin UI Context
 * 플러그인에서 UI를 만들 때 사용하는 컨텍스트
 */
export interface PluginUIContext {
  screen: blessed.Widgets.Screen;
  container: blessed.Widgets.BoxElement;
  createBox: (options: BoxOptions) => blessed.Widgets.BoxElement;
  createList: (options: ListOptions) => blessed.Widgets.ListElement;
  createProgressBar: (options: ProgressOptions) => blessed.Widgets.ProgressBarElement;
  createInput: (options: InputOptions) => blessed.Widgets.TextboxElement;
  createTextDisplay: (options: TextDisplayOptions) => blessed.Widgets.BoxElement;
  createLog: (options: BoxOptions) => blessed.Widgets.Log;
  render: () => void;
  onKey: (key: string | string[], callback: (ch: string, key: blessed.Widgets.Events.IKeyEventArg) => void) => void;
  close: () => void;
  setTitle: (title: string) => void;
}

/**
 * 게임 UI 화면을 생성합니다.
 * 
 * @example
 * ```typescript
 * const gameUI = createGameScreen({
 *   title: 'My Game',
 *   width: '80%',
 *   height: '80%',
 * });
 * 
 * const hpBar = gameUI.createProgressBar({
 *   top: 2,
 *   left: 2,
 *   width: 30,
 *   height: 3,
 *   label: ' HP ',
 *   filled: 80,
 * });
 * 
 * gameUI.render();
 * ```
 */
export function createGameScreen(options: GameScreenOptions = {}): PluginUIContext {
  const screen = blessed.screen({
    smartCSR: true,
    title: options.title || 'DevChat Game',
    fullUnicode: true,
  });

  const container = blessed.box({
    top: 'center',
    left: 'center',
    width: options.width || '90%',
    height: options.height || '90%',
    border: {
      type: 'line',
    },
    style: {
      border: { fg: 'cyan' },
      bg: 'black',
    },
    label: options.title ? ` ${options.title} ` : undefined,
  });

  screen.append(container);

  const createBox = (opts: BoxOptions): blessed.Widgets.BoxElement => {
    const box = blessed.box({
      parent: container,
      top: opts.top,
      left: opts.left,
      right: opts.right,
      bottom: opts.bottom,
      width: opts.width,
      height: opts.height,
      content: opts.content,
      label: opts.label,
      border: opts.border ? { type: typeof opts.border === 'string' ? opts.border : 'line' } : undefined,
      scrollable: opts.scrollable,
      tags: true,
      style: {
        fg: opts.style?.fg || 'white',
        bg: opts.style?.bg || 'black',
        border: opts.style?.border,
      },
    });
    return box;
  };

  const createList = (opts: ListOptions): blessed.Widgets.ListElement => {
    const list = blessed.list({
      parent: container,
      top: opts.top,
      left: opts.left,
      right: opts.right,
      bottom: opts.bottom,
      width: opts.width,
      height: opts.height,
      items: opts.items || [],
      keys: opts.keys !== false,
      vi: opts.vi !== false,
      mouse: opts.mouse !== false,
      label: opts.label,
      border: opts.border ? { type: typeof opts.border === 'string' ? opts.border : 'line' } : undefined,
      tags: true,
      style: {
        fg: opts.style?.fg || 'white',
        bg: opts.style?.bg || 'black',
        border: opts.style?.border,
        selected: {
          fg: opts.selectedStyle?.fg || 'black',
          bg: opts.selectedStyle?.bg || 'cyan',
          bold: opts.selectedStyle?.bold !== false,
        },
      },
    });
    return list;
  };

  const createProgressBar = (opts: ProgressOptions): blessed.Widgets.ProgressBarElement => {
    const bar = blessed.progressbar({
      parent: container,
      top: opts.top,
      left: opts.left,
      right: opts.right,
      bottom: opts.bottom,
      width: opts.width,
      height: opts.height,
      orientation: opts.orientation || 'horizontal',
      filled: opts.filled || 0,
      pch: opts.pch || '█',
      ch: opts.ch || '░',
      label: opts.label,
      border: opts.border ? { type: typeof opts.border === 'string' ? opts.border : 'line' } : undefined,
      style: {
        fg: opts.style?.fg || 'white',
        bg: opts.style?.bg || 'black',
        bar: opts.style?.bar || { fg: 'green' },
        border: opts.style?.border,
      },
    });
    return bar;
  };

  const createInput = (opts: InputOptions): blessed.Widgets.TextboxElement => {
    const input = blessed.textbox({
      parent: container,
      top: opts.top,
      left: opts.left,
      right: opts.right,
      bottom: opts.bottom,
      width: opts.width,
      height: opts.height,
      value: opts.value,
      secret: opts.secret,
      censor: opts.censor,
      inputOnFocus: true,
      label: opts.label,
      border: opts.border ? { type: typeof opts.border === 'string' ? opts.border : 'line' } : undefined,
      style: {
        fg: opts.style?.fg || 'white',
        bg: opts.style?.bg || 'black',
        border: opts.style?.border,
      },
    });
    return input;
  };

  const createTextDisplay = (opts: TextDisplayOptions): blessed.Widgets.BoxElement => {
    const display = blessed.box({
      parent: container,
      top: opts.top,
      left: opts.left,
      right: opts.right,
      bottom: opts.bottom,
      width: opts.width,
      height: opts.height,
      content: opts.content,
      label: opts.label,
      border: opts.border ? { type: typeof opts.border === 'string' ? opts.border : 'line' } : undefined,
      scrollable: opts.scrollable !== false,
      alwaysScroll: true,
      tags: opts.tags !== false,
      style: {
        fg: opts.style?.fg || 'white',
        bg: opts.style?.bg || 'black',
        border: opts.style?.border,
      },
    });
    return display;
  };

  const createLog = (opts: BoxOptions): blessed.Widgets.Log => {
    const log = blessed.log({
      parent: container,
      top: opts.top,
      left: opts.left,
      right: opts.right,
      bottom: opts.bottom,
      width: opts.width,
      height: opts.height,
      label: opts.label,
      border: opts.border ? { type: typeof opts.border === 'string' ? opts.border : 'line' } : undefined,
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: '│',
        track: { bg: 'black' },
        style: { bg: 'cyan' },
      },
      tags: true,
      style: {
        fg: opts.style?.fg || 'white',
        bg: opts.style?.bg || 'black',
        border: opts.style?.border,
      },
    });
    return log;
  };

  const render = () => {
    screen.render();
  };

  const onKey = (
    key: string | string[],
    callback: (ch: string, key: blessed.Widgets.Events.IKeyEventArg) => void
  ) => {
    screen.key(key, callback);
  };

  const close = () => {
    screen.destroy();
  };

  const setTitle = (title: string) => {
    screen.title = title;
    container.setLabel(` ${title} `);
    render();
  };

  // Default key bindings
  screen.key(['C-c'], () => {
    close();
    process.exit(0);
  });

  return {
    screen,
    container,
    createBox,
    createList,
    createProgressBar,
    createInput,
    createTextDisplay,
    createLog,
    render,
    onKey,
    close,
    setTitle,
  };
}

/**
 * HP/MP 등의 스탯 바를 텍스트로 생성합니다.
 * 
 * @example
 * ```typescript
 * const hpBar = createStatBar(80, 100, 20, '█', '░');
 * // 결과: "████████████████░░░░" (80/100)
 * ```
 */
export function createStatBar(
  current: number,
  max: number,
  length: number = 20,
  filledChar: string = '█',
  emptyChar: string = '░'
): string {
  const filled = Math.round((current / max) * length);
  const empty = length - filled;
  return filledChar.repeat(Math.max(0, filled)) + emptyChar.repeat(Math.max(0, empty));
}

/**
 * 컬러 스탯 바를 생성합니다. (blessed 태그 포함)
 * 
 * @example
 * ```typescript
 * const hpBar = createColoredStatBar(30, 100, 20, 'red', 'gray');
 * // 결과: "{red-fg}██████{/red-fg}{gray-fg}██████████████{/gray-fg}"
 * ```
 */
export function createColoredStatBar(
  current: number,
  max: number,
  length: number = 20,
  filledColor: string = 'green',
  emptyColor: string = 'gray',
  filledChar: string = '█',
  emptyChar: string = '░'
): string {
  const filled = Math.round((current / max) * length);
  const empty = length - filled;
  const filledStr = filledChar.repeat(Math.max(0, filled));
  const emptyStr = emptyChar.repeat(Math.max(0, empty));
  return `{${filledColor}-fg}${filledStr}{/${filledColor}-fg}{${emptyColor}-fg}${emptyStr}{/${emptyColor}-fg}`;
}

/**
 * 프레임 박스를 문자열로 생성합니다.
 * 
 * @example
 * ```typescript
 * const frame = createFrameBox('Hello World', 20);
 * // 결과:
 * // ┌──────────────────┐
 * // │   Hello World    │
 * // └──────────────────┘
 * ```
 */
export function createFrameBox(content: string, width: number): string {
  const innerWidth = width - 2;
  const padding = Math.max(0, innerWidth - content.length);
  const leftPad = Math.floor(padding / 2);
  const rightPad = padding - leftPad;
  
  const top = '┌' + '─'.repeat(innerWidth) + '┐';
  const middle = '│' + ' '.repeat(leftPad) + content + ' '.repeat(rightPad) + '│';
  const bottom = '└' + '─'.repeat(innerWidth) + '┘';
  
  return `${top}\n${middle}\n${bottom}`;
}

/**
 * 선택 메뉴를 문자열로 생성합니다.
 */
export function createMenuString(
  items: string[],
  selectedIndex: number,
  pointer: string = '>'
): string {
  return items
    .map((item, i) => (i === selectedIndex ? `${pointer} ${item}` : `  ${item}`))
    .join('\n');
}

// Re-export blessed types for convenience
export { blessed };
