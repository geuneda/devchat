# CLAUDE.md - DevChat 개발 가이드

> 이 문서는 AI 코딩 에이전트(Claude, Cursor, Copilot 등)와 개발자를 위한 완전 가이드입니다.

## 프로젝트 개요

**DevChat**은 개발자를 위한 스텔스 CLI 채팅 도구입니다.

- **스텔스 모드**: 기본 화면은 가짜 빌드/로그 출력, 토글 키 홀드 시 채팅 표시
- **P2P 방식**: 호스트가 서버 역할, 별도 서버 불필요
- **위장 테마**: npm-build, git-log, docker-logs, compile, pytest
- **플러그인 시스템**: 커스텀 명령어 추가 가능

## 빠른 시작 (에이전트용)

### 원스텝 설치

```bash
git clone https://github.com/YOUR_USERNAME/devchat.git && cd devchat && npm install && npm run build && npm link
```

### 단계별 설치

```bash
# 1. 저장소 클론
git clone https://github.com/YOUR_USERNAME/devchat.git
cd devchat

# 2. 의존성 설치
npm install

# 3. 빌드
npm run build

# 4. 글로벌 명령어로 등록
npm link
```

### 요구사항

- Node.js >= 18.0.0
- npm

## 인터랙티브 메뉴

`devchat` 명령어만 입력하면 인터랙티브 메뉴 UI가 표시됩니다.

```bash
devchat
```

```
+------------------------------------------+
|           DevChat v1.0.0                 |
|        Stealth CLI Chat Tool             |
+------------------------------------------+
|                                          |
|    > Host Room     - 채팅방 생성         |
|      Join Room     - 채팅방 참여         |
|      Settings      - 설정 관리           |
|      Help          - 도움말              |
|      Exit          - 종료                |
|                                          |
+------------------------------------------+
|  [↑↓] 이동  [Enter] 선택  [q] 종료       |
+------------------------------------------+
```

### 메뉴 조작법

| 키 | 동작 |
|----|------|
| `↑` / `↓` | 메뉴 항목 이동 |
| `Enter` | 선택한 항목 실행 |
| `q` / `Ctrl+C` | 종료 |
| `Tab` | 다음 입력 필드 (설정 화면) |
| `Esc` | 이전 화면으로 돌아가기 |

### 메뉴 항목

- **Host Room**: 채팅방 생성 화면으로 이동 (저장된 방 목록 표시 또는 새 방 생성)
- **Join Room**: 채팅방 참여 화면으로 이동 (서버 주소, 닉네임 설정)
- **Settings**: 기본 설정 변경 (닉네임, 토글 키, 테마, 포트)
- **Help**: 도움말 표시
- **Exit**: 프로그램 종료

### Host Room - 저장된 방 관리

Host Room 선택 시 저장된 방이 있으면 목록이 먼저 표시됩니다:

```
+------------------------------------------+
|              Host Room                   |
+------------------------------------------+
| 저장된 방:                               |
|   > 우리팀방 (오늘 14:30) [15개 메시지]   |
|     테스트방 (어제) [8개 메시지]          |
|   ─────────────────────────────          |
|   + 새로운 방 만들기                     |
+------------------------------------------+
| [↑↓] 이동 [Enter] 선택 [d] 삭제 [Esc] 취소 |
+------------------------------------------+
```

| 키 | 동작 |
|----|------|
| `Enter` | 선택한 방 열기 (저장된 채팅/게임 상태 복원) |
| `d` | 선택한 방 삭제 (확인 다이얼로그 표시) |
| `Esc` | 메인 메뉴로 돌아가기 |

---

## CLI 명령어 레퍼런스

### devchat host - 채팅방 생성

호스트로서 채팅방을 생성하고 서버를 시작합니다.

```bash
devchat host [옵션]
```

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `-p, --port <port>` | 리스닝 포트 | 8080 |
| `-n, --name <name>` | 방 이름 | "DevChat Room" |
| `--nick <nickname>` | 닉네임 | 설정된 닉네임 |
| `-r, --resume <roomId>` | 저장된 방 복원 | - |

**예시:**
```bash
# 기본 설정으로 방 생성
devchat host

# 커스텀 설정
devchat host --port 9000 --name "우리팀방" --nick "김개발"

# 저장된 방 복원
devchat host --resume abc123def456
```

> **참고**: 방 종료 시 (Ctrl+C) 채팅 내역과 게임 진행 상태가 자동 저장됩니다.

### devchat rooms - 저장된 방 관리

저장된 채팅방 목록을 조회하고 관리합니다.

```bash
devchat rooms [명령어]
```

| 명령어 | 설명 |
|--------|------|
| (없음) | 저장된 방 목록 보기 |
| `delete <roomId>` | 저장된 방 삭제 |
| `info <roomId>` | 방 상세 정보 보기 |
| `path` | 저장 파일 경로 보기 |

**예시:**
```bash
# 저장된 방 목록 보기
devchat rooms

# 방 상세 정보 보기
devchat rooms info abc123def456

# 방 삭제
devchat rooms delete abc123def456
```

### devchat join - 채팅방 참여

기존 채팅방에 참여합니다.

```bash
devchat join <address> [옵션]
```

| 인자/옵션 | 설명 | 예시 |
|-----------|------|------|
| `<address>` | 서버 주소 (host:port) | 192.168.1.100:8080 |
| `--nick <nickname>` | 닉네임 | "박코딩" |

**예시:**
```bash
# IP 주소로 접속
devchat join 192.168.1.100:8080 --nick "박코딩"

# localhost 접속 (테스트용)
devchat join localhost:8080
```

### devchat config - 설정 관리

설정을 조회하거나 변경합니다.

```bash
devchat config [옵션]
```

| 옵션 | 설명 |
|------|------|
| `--nick <nickname>` | 기본 닉네임 설정 |
| `--toggle-key <key>` | 스텔스 모드 토글 키 설정 |
| `--theme <theme>` | 위장 테마 설정 |
| `--port <port>` | 기본 포트 설정 |
| `--list` | 현재 설정 보기 |
| `--themes` | 사용 가능한 테마 목록 |
| `--reset` | 기본값으로 초기화 |
| `--path` | 설정 파일 경로 보기 |

**예시:**
```bash
# 현재 설정 보기
devchat config --list

# 닉네임 설정
devchat config --nick "나의닉네임"

# 테마 변경
devchat config --theme "docker-logs"

# 토글 키 변경 (기본: `)
devchat config --toggle-key "~"
```

## 방 만들기 및 초대 가이드

### 1단계: 호스트가 방 생성

```bash
devchat host --port 8080 --name "우리팀방" --nick "방장"
```

서버가 시작되면 다음과 같이 출력됩니다:
```
🚀 Starting DevChat server...
   Room: 우리팀방
   Port: 8080
   Nick: 방장
```

### 2단계: IP 주소 확인

호스트의 IP 주소를 확인합니다:
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

### 3단계: 팀원에게 접속 정보 공유

팀원에게 다음 정보를 공유합니다:
- IP 주소 (예: 192.168.1.100)
- 포트 번호 (예: 8080)

### 4단계: 팀원이 접속

```bash
devchat join 192.168.1.100:8080 --nick "팀원1"
```

### 로컬 테스트

같은 컴퓨터에서 테스트하려면:

```bash
# 터미널 1: 호스트
devchat host --port 8080 --name "테스트방"

# 터미널 2: 참여자
devchat join localhost:8080 --nick "테스터"
```

## 방 저장 및 복원 기능

호스트가 만든 채팅방은 로컬에 자동 저장되어 나중에 다시 열 수 있습니다.

### 자동 저장되는 데이터

- **채팅 내역**: 모든 메시지 (최대 1000개)
- **플러그인 상태**: 게임 진행 기록 (예: RPG 캐릭터 레벨, 골드 등)
- **방 설정**: 방 이름, 포트, 호스트 닉네임

### 저장 시점

- 방 종료 시 (Ctrl+C) 자동 저장
- 저장 위치: `~/.config/devchat/room-history.json`

### 사용 방법

**방법 1: 인터랙티브 메뉴**
```bash
devchat
# Host Room 선택 → 저장된 방 목록에서 선택
```

**방법 2: CLI 명령어**
```bash
# 저장된 방 목록 확인
devchat rooms

# 저장된 방 복원
devchat host --resume <roomId>
```

### 저장된 방 삭제

**메뉴에서 삭제:**
- Host Room → 방 선택 → `d` 키 → 확인

**CLI에서 삭제:**
```bash
devchat rooms delete <roomId>
```

## 스텔스 모드 사용법

| 상태 | 화면 |
|------|------|
| 기본 (키 안 누름) | 가짜 빌드/로그 출력이 스크롤 |
| 토글 키 홀드 | 실제 채팅 화면 + 입력창 |
| 새 메시지 도착 | 화면 구석에 빨간 점 깜빡임 |

### 위장 테마

- `npm-build` - Webpack/npm 빌드 출력
- `git-log` - Git 커밋 로그
- `docker-logs` - Docker 컨테이너 로그
- `compile` - C++/Rust 컴파일 출력
- `pytest` - Python 테스트 출력

### 단축키

- **토글 키 (기본 \`)**: 홀드하면 채팅 보임
- **Ctrl+C**: 종료
- **Ctrl+T**: 위장 테마 변경
- **Ctrl+H**: 도움말

## 내장 채팅 명령어

```
/help         - 도움말
/roll [면수]  - 주사위 굴리기
/flip         - 동전 던지기
/users        - 접속자 목록
/me <행동>    - 액션 메시지
/shrug        - ¯\_(ツ)_/¯
/tableflip    - (╯°□°)╯︵ ┻━┻
/unflip       - ┬─┬ノ( º _ ºノ)
```

## 텍스트 RPG 명령어

채팅하면서 즐기는 미니 RPG:

```
/rpg          - RPG 도움말
/rpg start    - 게임 시작
/rpg status   - 내 상태
/rpg hunt     - 몬스터 사냥
/rpg attack   - 공격
/rpg run      - 도망
/rpg heal     - 회복
/rpg shop     - 상점
/rpg buy <아이템> - 구매
/rpg dungeon  - 던전 탐험
```

---

## 플러그인 개발 가이드라인

### 파일 구조

플러그인은 `plugins/` 디렉토리에 폴더로 생성합니다:

```
plugins/
└── my-plugin/
    └── index.ts
```

### 기본 플러그인 템플릿

```typescript
import { Plugin, PluginContext } from '../../src/types';

const myPlugin: Plugin = {
  name: 'my-plugin',
  description: '플러그인 설명',
  version: '1.0.0',
  commands: {
    '/mycmd': (args, ctx) => {
      ctx.broadcast(`${ctx.user.nick}님이 명령어를 실행했습니다!`);
    },
    '/greet': (args, ctx) => {
      const name = args[0] || 'World';
      ctx.broadcast(`${ctx.user.nick}님이 ${name}에게 인사합니다!`);
    },
  },
  onLoad: (ctx) => {
    console.log('플러그인이 로드되었습니다');
  },
  onUnload: () => {
    console.log('플러그인이 언로드되었습니다');
  },
};

export default myPlugin;
```

### Plugin 인터페이스

```typescript
interface Plugin {
  name: string;           // 플러그인 이름 (필수)
  description?: string;   // 설명
  version?: string;       // 버전
  commands: Record<string, PluginCommand>;  // 명령어 맵 (필수)
  onLoad?: (ctx: PluginContext) => void;    // 로드 시 콜백
  onUnload?: () => void;                     // 언로드 시 콜백
}

// 상태 저장을 지원하는 플러그인
interface PluginWithState extends Plugin {
  getState?: () => unknown;                  // 상태 저장 시 호출
  setState?: (state: unknown) => void;       // 상태 복원 시 호출
}
```

> **참고**: `PluginWithState`를 구현하면 방 저장 시 플러그인의 게임 진행 상태가 함께 저장됩니다.

### PluginContext API

```typescript
interface PluginContext {
  user: User;           // 현재 사용자
  room: Room;           // 현재 방 정보
  broadcast: (message: string) => void;        // 전체에게 메시지 전송
  sendToUser: (userId: string, message: string) => void;  // 특정 사용자에게 전송
  getUsers: () => User[];                      // 접속자 목록 반환
}

interface User {
  id: string;
  nick: string;
  isHost: boolean;
}

interface Room {
  name: string;
  host: User;
  users: User[];
  createdAt: number;
}
```

### 명령어 규칙

1. **명령어는 `/`로 시작**: `/hello`, `/roll` 등
2. **서브커맨드 패턴**: `/cmd-sub` 형태로 정의 후 메인 핸들러에서 분기

```typescript
const plugin: Plugin = {
  name: 'game',
  commands: {
    '/game': (args, ctx) => {
      if (args.length === 0) {
        ctx.broadcast('게임 도움말...');
        return;
      }
      const subCommand = `/game-${args[0]}`;
      if (subCommand in plugin.commands) {
        plugin.commands[subCommand](args.slice(1), ctx);
      }
    },
    '/game-start': (args, ctx) => {
      ctx.broadcast('게임 시작!');
    },
    '/game-stop': (args, ctx) => {
      ctx.broadcast('게임 종료!');
    },
  },
};
```

### 플러그인 예시: 주사위 게임

```typescript
import { Plugin } from '../../src/types';

const dicePlugin: Plugin = {
  name: 'dice-game',
  description: '주사위 게임 플러그인',
  version: '1.0.0',
  commands: {
    '/dice': (args, ctx) => {
      const sides = parseInt(args[0]) || 6;
      const result = Math.floor(Math.random() * sides) + 1;
      ctx.broadcast(`🎲 ${ctx.user.nick}님이 ${sides}면체 주사위를 굴려 ${result}이(가) 나왔습니다!`);
    },
    '/coin': (args, ctx) => {
      const result = Math.random() < 0.5 ? '앞면' : '뒷면';
      ctx.broadcast(`🪙 ${ctx.user.nick}님이 동전을 던져 ${result}이 나왔습니다!`);
    },
  },
};

export default dicePlugin;
```

---

## 플러그인 UI 개발 가이드

플러그인에서 blessed 기반의 전체 화면 UI를 만들 수 있습니다. 게임, 대시보드, 설정 화면 등을 구현할 때 유용합니다.

### 플러그인 UI API

`src/plugins/ui.ts`에서 제공하는 API를 사용합니다:

```typescript
import { createGameScreen, createStatBar, createColoredStatBar } from '../../src/plugins/ui';
```

### PluginUIContext API

```typescript
interface PluginUIContext {
  screen: blessed.Widgets.Screen;        // blessed 스크린 객체
  container: blessed.Widgets.BoxElement; // 메인 컨테이너
  
  // UI 컴포넌트 생성
  createBox: (options: BoxOptions) => blessed.Widgets.BoxElement;
  createList: (options: ListOptions) => blessed.Widgets.ListElement;
  createProgressBar: (options: ProgressOptions) => blessed.Widgets.ProgressBarElement;
  createInput: (options: InputOptions) => blessed.Widgets.TextboxElement;
  createTextDisplay: (options: TextDisplayOptions) => blessed.Widgets.BoxElement;
  createLog: (options: BoxOptions) => blessed.Widgets.Log;
  
  // 유틸리티
  render: () => void;                     // 화면 렌더링
  onKey: (key: string | string[], callback: Function) => void;  // 키 이벤트
  close: () => void;                      // UI 종료
  setTitle: (title: string) => void;      // 타이틀 변경
}
```

### 게임 UI 생성 예시

```typescript
import { createGameScreen, createColoredStatBar } from '../../src/plugins/ui';

function runGameUI(): void {
  // 게임 화면 생성
  const ui = createGameScreen({
    title: 'My Game',
    width: '90%',
    height: '90%',
  });

  // HP 바 생성
  const hpBox = ui.createBox({
    top: 2,
    left: 2,
    width: 40,
    height: 3,
    label: ' HP ',
    border: 'line',
  });

  // 액션 메뉴 생성
  const actionList = ui.createList({
    top: 6,
    left: 2,
    width: 30,
    height: 8,
    items: ['Attack', 'Defend', 'Magic', 'Run'],
    label: ' Actions ',
    border: 'line',
    selectedStyle: { bg: 'green', fg: 'black' },
  });

  // 로그 영역 생성
  const logBox = ui.createLog({
    top: 6,
    right: 2,
    width: '50%',
    height: 8,
    label: ' Log ',
    border: 'line',
  });

  // HP 바 업데이트
  function updateHP(current: number, max: number): void {
    const bar = createColoredStatBar(current, max, 20, 'green', 'gray');
    hpBox.setContent(`  ${bar} ${current}/${max}`);
    ui.render();
  }

  // 메뉴 선택 핸들러
  actionList.on('select', (item, index) => {
    logBox.log(`선택: ${['Attack', 'Defend', 'Magic', 'Run'][index]}`);
    ui.render();
  });

  // 종료 키 바인딩
  ui.onKey(['q', 'escape'], () => {
    ui.close();
  });

  // 초기 화면
  updateHP(80, 100);
  actionList.focus();
}
```

### 스탯 바 헬퍼 함수

```typescript
// 기본 스탯 바 (문자열)
const bar = createStatBar(80, 100, 20);
// 결과: "████████████████░░░░"

// 컬러 스탯 바 (blessed 태그 포함)
const colorBar = createColoredStatBar(80, 100, 20, 'green', 'gray');
// 결과: "{green-fg}████████████████{/green-fg}{gray-fg}░░░░{/gray-fg}"

// HP 상태에 따른 색상 변경
function getHPColor(current: number, max: number): string {
  const ratio = current / max;
  if (ratio > 0.5) return 'green';
  if (ratio > 0.25) return 'yellow';
  return 'red';
}
```

### 게임 UI 플러그인 전체 템플릿

```typescript
import { Plugin, PluginContext, PluginWithUI } from '../../src/types';
import { createGameScreen, createColoredStatBar, PluginUIContext } from '../../src/plugins/ui';

interface GameState {
  playerHp: number;
  playerMaxHp: number;
  score: number;
}

function runGameUI(): void {
  let state: GameState = {
    playerHp: 100,
    playerMaxHp: 100,
    score: 0,
  };

  const ui = createGameScreen({ title: 'My Game' });

  // === UI 컴포넌트 ===
  const headerBox = ui.createBox({
    top: 0, left: 0, width: '100%', height: 3,
    border: 'line',
  });

  const playerBox = ui.createBox({
    top: 3, left: 0, width: '50%', height: 6,
    label: ' Player ', border: 'line',
  });

  const actionList = ui.createList({
    top: 9, left: 0, width: '40%', height: 8,
    items: ['Attack', 'Defend', 'Heal'],
    label: ' Actions ', border: 'line',
  });

  const logBox = ui.createLog({
    top: 9, right: 0, width: '60%', height: 8,
    label: ' Log ', border: 'line',
  });

  // === 화면 업데이트 ===
  function updateDisplay(): void {
    headerBox.setContent(`{center}Score: ${state.score}{/center}`);
    
    const hpColor = state.playerHp > 50 ? 'green' : state.playerHp > 25 ? 'yellow' : 'red';
    playerBox.setContent(
      `\n  HP: ${createColoredStatBar(state.playerHp, state.playerMaxHp, 15, hpColor, 'gray')} ${state.playerHp}/${state.playerMaxHp}`
    );
    
    ui.render();
  }

  function addLog(msg: string): void {
    logBox.log(msg);
  }

  // === 액션 핸들러 ===
  actionList.on('select', (item, index) => {
    switch (index) {
      case 0: // Attack
        state.score += 10;
        addLog('공격!');
        break;
      case 1: // Defend
        addLog('방어 자세!');
        break;
      case 2: // Heal
        state.playerHp = Math.min(state.playerMaxHp, state.playerHp + 20);
        addLog('HP +20 회복!');
        break;
    }
    updateDisplay();
  });

  // === 키 바인딩 ===
  ui.onKey(['q', 'escape'], () => ui.close());

  // === 초기화 ===
  updateDisplay();
  addLog('게임 시작!');
  actionList.focus();
}

const gamePlugin: PluginWithUI = {
  name: 'my-game',
  description: '게임 UI 예시',
  version: '1.0.0',
  hasUI: true,
  commands: {
    '/my-game': (args, ctx) => {
      ctx.broadcast(`${ctx.user.nick}님이 게임을 시작합니다!`);
      setTimeout(() => runGameUI(), 100);
    },
  },
  createUI: () => runGameUI(),
};

export default gamePlugin;
```

### UI 개발 팁

1. **화면 갱신**: 상태 변경 후 반드시 `ui.render()` 호출
2. **포커스 관리**: 입력을 받을 컴포넌트에 `.focus()` 호출
3. **종료 처리**: `ui.close()` 호출로 리소스 정리
4. **색상 사용**: blessed 태그 형식 사용 (예: `{red-fg}텍스트{/red-fg}`)
5. **로그 출력**: `createLog()`로 생성한 컴포넌트에 `.log()` 메서드 사용

### 예시 플러그인

`plugins/game-ui-example/` 폴더에 전체 구현 예시가 있습니다:
- 턴제 전투 시스템
- HP/MP 바
- 액션 메뉴
- 배틀 로그
- 점수 시스템

---

## 프로젝트 구조

```
devchat/
├── src/
│   ├── cli/              # CLI 명령어 정의
│   │   ├── host.ts       # host 명령어
│   │   ├── join.ts       # join 명령어
│   │   ├── config.ts     # config 명령어
│   │   ├── rooms.ts      # rooms 명령어 (저장된 방 관리)
│   │   └── index.ts      # CLI 엔트리
│   ├── client/           # WebSocket 클라이언트
│   │   └── index.ts
│   ├── server/           # WebSocket 서버
│   │   └── index.ts
│   ├── core/             # 핵심 로직
│   │   ├── chat.ts       # 채팅 처리
│   │   ├── config.ts     # 설정 관리
│   │   ├── room.ts       # 방 관리
│   │   ├── roomHistory.ts # 방 저장/복원 관리
│   │   └── stealth.ts    # 스텔스 모드/테마
│   ├── plugins/          # 플러그인 시스템
│   │   ├── api.ts        # 플러그인 API
│   │   ├── ui.ts         # 플러그인 UI API (게임 UI용)
│   │   ├── loader.ts     # 플러그인 로더
│   │   └── index.ts
│   ├── ui/               # blessed TUI
│   │   ├── index.ts      # 채팅 UI
│   │   └── menu.ts       # 인터랙티브 메뉴 UI
│   ├── types.ts          # 타입 정의
│   └── index.ts          # 메인 엔트리
├── plugins/              # 플러그인 디렉토리
│   ├── text-rpg/         # 내장 RPG 플러그인
│   │   └── index.ts
│   └── game-ui-example/  # 게임 UI 예시 플러그인
│       └── index.ts
├── dist/                 # 빌드 출력
├── package.json
├── tsconfig.json
└── README.md
```

## 개발 명령어

```bash
# 프로덕션 빌드
npm run build

# 개발 모드 (watch)
npm run dev

# 타입 체크
npm run typecheck

# 테스트 실행
npm test

# 빌드 후 실행
npm start
```

## 기술 스택

- **언어**: TypeScript
- **런타임**: Node.js (>= 18)
- **TUI**: blessed
- **통신**: WebSocket (ws)
- **CLI**: Commander.js
- **설정**: conf

## 트러블슈팅

### 포트가 이미 사용 중인 경우

```bash
# 다른 포트 사용
devchat host --port 9000

# 또는 사용 중인 프로세스 확인
lsof -i :8080
```

### npm link가 작동하지 않는 경우

```bash
# 직접 실행
node dist/index.js host --port 8080

# 또는 npm start 사용
npm start -- host --port 8080
```

### 연결이 안 되는 경우

1. 방화벽 설정 확인
2. 같은 네트워크에 있는지 확인
3. IP 주소가 올바른지 확인
4. 포트가 열려있는지 확인
