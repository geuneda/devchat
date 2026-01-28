# Ralph Progress Log

This file tracks progress across iterations. It's automatically updated
after each iteration and included in agent prompts for context.

## Codebase Patterns (Study These First)

### blessed 라이브러리 타입 문제 해결 패턴

1. **`screen.unkey()` 호출 시**: 두 번째 인자(listener)가 필수. 핸들러를 별도로 추적하여 제거해야 함.
   ```typescript
   // 잘못된 방법
   screen.unkey(key);

   // 올바른 방법 - 핸들러도 함께 저장하고 제거
   interface RegisteredKeyHandler {
     keys: string[];
     handler: KeyHandler;
   }
   let currentKeyHandlers: RegisteredKeyHandler[] = [];
   // 등록 시
   currentKeyHandlers.push({ keys: keyArray, handler: wrappedHandler });
   // 제거 시
   keys.forEach((key) => screen.unkey(key, handler));
   ```

2. **`list.selected` 속성 접근 시**: @types/blessed에 타입 정의가 누락됨. 타입 캐스팅 필요.
   ```typescript
   // 타입 에러 발생
   const index = list.selected;

   // 해결 방법
   const index = (list as unknown as { selected: number }).selected;
   ```

### ClientOptions 인터페이스

- `connectToServer()`는 `{ host, port, nick }` 형태의 파라미터 필요
- 주소 문자열(`address`)을 전달하면 안 됨. 반드시 파싱해서 전달:
  ```typescript
  const [host, portStr] = address.split(':');
  const port = parseInt(portStr) || defaultPort;
  await connectToServer({ host, port, nick });
  ```

### blessed 플러그인 UI 타입 문제

- `ProgressBarElement`의 style에는 `border` 속성이 없음 - 제거 필요
- `TextboxElement`의 `censor` 속성은 `boolean` 타입 (`string` 아님)

---

## 2026-01-28 - US-001

- 구현한 내용: 메인 메뉴 UI 키보드 네비게이션 타입 에러 수정
- 변경된 파일:
  - `src/ui/menu.ts`
- **배운 점:**
  - blessed 라이브러리의 타입 정의(@types/blessed)가 불완전함
  - `unkey` 메서드는 반드시 두 번째 인자(listener)를 전달해야 함
  - `ListElement.selected` 속성이 타입에 없어서 타입 캐스팅 필요
  - 키 핸들러를 추적할 때 핸들러 함수 자체를 저장해야 나중에 제거 가능

---

## 2026-01-28 - US-002

- 구현한 내용: Host Room 화면 검증 및 타입 에러 수정
- 변경된 파일:
  - `src/plugins/ui.ts` - 타입 에러 수정 (censor: boolean, ProgressBar style.border 제거)
- **배운 점:**
  - US-002 기능은 이미 US-001과 함께 구현되어 있었음
  - `showHostMenu()`: 저장된 방 있으면 목록, 없으면 새 방 생성 폼
  - `showSavedRoomsMenu()`: 저장된 방 목록 + "새로운 방 만들기" 옵션
  - `showNewRoomForm()`: 포트, 방 이름, 닉네임 입력 폼
  - 모든 화면에서 Esc로 이전 화면/메인 메뉴 복귀 가능

---

## 2026-01-28 - US-003

- 구현한 내용: Join Room 화면 검증 (이미 구현됨)
- 변경된 파일: 없음 (기존 코드 검증만)
- **배운 점:**
  - US-003 기능은 이미 US-001과 함께 구현되어 있었음
  - `showJoinMenu()`: 서버 주소와 닉네임 입력 폼 (642-818줄)
  - 서버 주소 파싱: `address.split(':')` 후 host/port 분리 (797-799줄)
  - `connectToServer({ host, port, nick })` 형태로 호출 (804-805줄)
  - Tab/화살표로 필드 이동, Enter로 연결, Esc로 취소

---

## 2026-01-28 - US-005

- 구현한 내용: WebSocket 서버 호스팅 기능 검증 (이미 구현됨)
- 변경된 파일: 없음 (기존 코드 검증만)
- **배운 점:**
  - US-005 기능은 기존에 완전히 구현되어 있었음
  - CLI 명령어: `src/cli/host.ts` - Commander.js 기반
    - `-p, --port <port>`: 포트 설정 (기본값: config.port)
    - `-n, --name <name>`: 방 이름 설정 (기본값: "DevChat Room")
    - `--nick <nickname>`: 닉네임 설정
    - `-r, --resume <roomId>`: 저장된 방 복원
  - WebSocket 서버: `src/server/index.ts`
    - `WebSocketServer({ port })` 로 서버 생성 (67줄)
    - 서버 시작 메시지 출력 (41-45줄, 242-248줄)
    - SIGINT/SIGTERM 핸들러로 Ctrl+C 종료 처리 (223-224줄)
    - 종료 시 방 자동 저장 기능 포함 (199-221줄)

---

## ✓ Iteration 1 - US-001: 메인 메뉴 UI 키보드 네비게이션 수정
*2026-01-28T05:03:01.287Z (176s)*

**Status:** Completed

**Notes:**
:"## 요약\n\nUS-001 (메인 메뉴 UI 키보드 네비게이션 수정) 작업을 완료했습니다.\n\n**수정 내용:**\n1. `screen.unkey()` 호출 시 두 번째 인자(listener) 누락 문제 해결 - 키 핸들러 추적 방식 변경\n2. `ListElement.selected` 속성 타입 에러 해결 - 타입 캐스팅 적용\n3. `connectToServer()` 파라미터 형식 수정 - address 문자열을 host/port로 파싱\n\n**완료 조건 충족:**\n- devchat 실행 시 메인 메뉴 표시됨\n- 위/아래 방향키로 메뉴 항목 이동 가능 (`keys: true`, `vi: true`)\n- 현재 선택 항목 시각적 구분 (`style.selected`)\n- Enter 키로 선택 실행 (`menuList.on('select', ...)`)\n- q 또는 Ctrl+C로 종료 (`registerKey(screen, ['q', 'C-c'], ...)`)\n\n

---
## ✓ Iteration 2 - US-002: Host Room 화면 구현 및 수정
*2026-01-28T05:04:29.112Z (87s)*

**Status:** Completed

**Notes:**
--|------|\n| 메인 메뉴에서 Host Room 선택 시 호스트 설정 화면으로 이동 | ✅ | `showHostMenu()` 208-219줄 |\n| 방 이름, 포트, 닉네임 입력 가능 | ✅ | `showNewRoomForm()` 437-637줄 |\n| 저장된 방이 있으면 목록으로 먼저 표시 | ✅ | `showSavedRoomsMenu()` 224-332줄 |\n| 새로운 방 만들기 옵션 선택 가능 | ✅ | 257줄 - \"+ 새로운 방 만들기\" 항목 |\n| Esc로 메인 메뉴로 돌아감 | ✅ | 각 화면의 escape 키 핸들러 |\n\n**추가 수정사항:**\n- `src/plugins/ui.ts`의 타입 에러 수정:\n  - `InputOptions.censor` 타입을 `string`에서 `boolean`으로 변경\n  - `ProgressBarElement` style에서 불필요한 `border` 속성 제거\n\n타입체크와 빌드 모두 성공했습니다.\n\n

---
## ✓ Iteration 3 - US-003: Join Room 화면 구현 및 수정
*2026-01-28T05:05:18.708Z (49s)*

**Status:** Completed

**Notes:**
:"text","text":"## 요약\n\nUS-003 (Join Room 화면 구현 및 수정) 작업을 검증 완료했습니다.\n\n**완료 조건 충족 현황:**\n\n| 조건 | 상태 | 위치 |\n|------|------|------|\n| 메인 메뉴에서 Join Room 선택 시 조인 설정 화면으로 이동 | ✅ | `src/ui/menu.ts:98-101` |\n| 서버 주소(host:port) 입력 가능 | ✅ | `src/ui/menu.ts:671-683` |\n| 닉네임 입력 가능 | ✅ | `src/ui/menu.ts:693-705` |\n| Enter로 연결 시도 | ✅ | `src/ui/menu.ts:793-806` |\n| Esc로 메인 메뉴로 돌아감 | ✅ | `src/ui/menu.ts:812-814` |\n\nJoin Room 화면(`showJoinMenu()`)은 이미 US-001 작업 시 함께 구현되어 있었습니다. 타입체크와 빌드 모두 성공했습니다.\n\n

---
