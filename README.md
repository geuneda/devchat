# DevChat

**개발자를 위한 스텔스 CLI 채팅 도구**

일하는 척 하면서 채팅하세요! 특정 키를 누르고 있을 때만 채팅이 보이고, 평소에는 빌드 로그처럼 보입니다.

![Demo](https://via.placeholder.com/800x400/1a1a2e/16c79a?text=DevChat+Demo)

## 특징

- **스텔스 모드**: 기본 화면은 가짜 빌드/로그 출력, 토글 키 홀드 시 채팅 표시
- **P2P 채팅**: 방장이 호스트, 서버 불필요
- **위장 테마**: npm build, git log, docker logs, compile, pytest 등
- **플러그인 시스템**: 커스텀 명령어 추가 가능
- **내장 텍스트 RPG**: 채팅하면서 미니 RPG 즐기기!
- **Supabase 인증**: 로그인/회원가입으로 게임 상태 영구 저장
- **초대 코드**: 한 줄 명령어로 친구 초대

## 설치

```bash
npm install -g devchat
```

또는 소스에서 빌드:

```bash
git clone https://github.com/YOUR_USERNAME/devchat.git
cd devchat
npm install
npm run build
npm link
```

## AI 에이전트용 빠른 시작

> 이 섹션은 AI 코딩 에이전트(Claude, Cursor, Copilot 등)가 프로젝트를 자동으로 설치하고 실행할 수 있도록 작성되었습니다.

### 원스텝 설치

```bash
git clone https://github.com/YOUR_USERNAME/devchat.git && cd devchat && npm install && npm run build && npm link
```

### 테스트 실행

```bash
# 터미널 1: 호스트 시작
devchat host --port 8080 --name "테스트방"

# 터미널 2: 참여
devchat join localhost:8080 --nick "테스터"
```

### 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run build` | 프로덕션 빌드 |
| `npm run dev` | 개발 모드 (watch) |
| `npm run typecheck` | 타입 체크 |
| `npm test` | 테스트 실행 |

자세한 개발 가이드는 [CLAUDE.md](./CLAUDE.md) 참조.

## 사용법

### 방 만들기 (호스트)

```bash
devchat host --port 8080 --name "우리팀방" --nick "김개발"
```

### 친구 초대 (가장 쉬운 방법)

호스트가 초대 코드를 생성하면 친구는 한 줄 명령어로 접속할 수 있습니다:

```bash
# 호스트: 초대 코드 생성
devchat invite --port 8080 --name "우리팀방"

# 출력된 초대 코드를 친구에게 공유
# 친구: 초대 코드로 접속
devchat join --invite <초대코드> --nick "친구닉네임"
```

초대 코드에는 서버 주소, 포트, 인증 설정이 모두 포함됩니다.

### 방 참여 (수동)

```bash
devchat join 192.168.1.100:8080 --nick "박코딩"
```

### 설정

```bash
# 닉네임 설정
devchat config --nick "나의닉네임"

# 토글 키 변경 (기본: `)
devchat config --toggle-key "~"

# 위장 테마 변경
devchat config --theme "docker-logs"

# 사용 가능한 테마 보기
devchat config --themes

# 현재 설정 보기
devchat config --list
```

## 인증 설정 (선택사항)

Supabase 인증을 설정하면 게임 상태가 영구 저장됩니다. 재접속해도 RPG 캐릭터 레벨, 골드 등이 유지됩니다.

### 호스트가 Supabase 설정하기

1. https://supabase.com 에서 무료 프로젝트 생성
2. Project Settings > API에서 URL과 anon key 복사
3. DevChat에 설정:

```bash
devchat config --supabase-url "https://your-project.supabase.co"
devchat config --supabase-key "your-anon-key"
```

### 친구 초대 시 자동 공유

호스트가 `devchat invite`로 초대 코드를 생성하면 인증 설정이 자동으로 포함됩니다.
친구는 초대 코드로 접속하면 별도 설정 없이 바로 사용 가능합니다.

### 수동 설정 (초대 코드 없이)

호스트에게 Supabase URL과 Key를 받아서 직접 설정:

```bash
devchat config --supabase-url "호스트의-supabase-url"
devchat config --supabase-key "호스트의-anon-key"
```

## 스텔스 모드

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

## 내장 명령어

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

## 텍스트 RPG

채팅하면서 즐기는 미니 RPG!

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
```

## 플러그인 개발

`plugins/` 디렉토리에 플러그인을 추가할 수 있습니다.

```typescript
// plugins/my-plugin/index.ts
import { Plugin } from '../../src/types';

const myPlugin: Plugin = {
  name: 'my-plugin',
  description: '나만의 플러그인',
  version: '1.0.0',
  commands: {
    '/hello': (args, ctx) => {
      ctx.broadcast(`👋 ${ctx.user.nick}님이 인사합니다!`);
    },
    '/random': (args, ctx) => {
      const max = parseInt(args[0]) || 100;
      const num = Math.floor(Math.random() * max) + 1;
      ctx.broadcast(`🎯 ${ctx.user.nick}: ${num} (1-${max})`);
    },
  },
};

export default myPlugin;
```

### 플러그인 API

```typescript
interface PluginContext {
  user: User;           // 현재 사용자
  room: Room;           // 현재 방 정보
  broadcast: (msg: string) => void;  // 전체에게 메시지 전송
  getUsers: () => User[];            // 접속자 목록
}
```

## 단축키

- **토글 키 (기본 \`)**: 홀드하면 채팅 보임
- **Ctrl+C**: 종료
- **Ctrl+T**: 위장 테마 변경
- **Ctrl+H**: 도움말

## 기술 스택

- **언어**: TypeScript
- **런타임**: Node.js
- **TUI**: blessed
- **통신**: WebSocket (ws)
- **CLI**: Commander.js

## 라이선스

MIT License

## 기여

이슈와 PR 환영합니다!

---

**면책 조항**: 이 도구는 재미를 위해 만들어졌습니다. 업무 시간에 채팅하는 것은 권장하지 않습니다. 😉
