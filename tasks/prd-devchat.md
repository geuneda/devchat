# PRD: DevChat 전체 기능 테스트 및 수정

## Overview
DevChat의 모든 기능(메뉴 UI, 호스트/조인, 채팅, 스텔스 모드, 플러그인 시스템, 방 저장/복원)이 제대로 작동하지 않는 상태입니다. 각 기능을 체계적으로 점검하고, 버그를 수정하며, 누락된 기능을 보완하여 CLAUDE.md에 명시된 대로 완전히 작동하도록 합니다.

## Goals
- 모든 UI 컴포넌트가 키보드 입력에 정상 반응하도록 수정
- 호스트/조인 네트워킹이 2개 터미널에서 완벽히 작동
- 스텔스 모드(토글 키 홀드 시 채팅 표시)가 정상 작동
- 플러그인 시스템과 내장 플러그인(text-rpg, game-ui-example)이 모두 작동
- 방 저장/복원 기능이 채팅 내역과 플러그인 상태 포함하여 작동

## Quality Gates

각 User Story 완료 시 다음을 수행해야 합니다:
- `npm run build` - 빌드 성공 확인
- 터미널에서 실제 실행하여 수동 테스트
- 해당 기능이 CLAUDE.md에 명시된 대로 작동하는지 확인

## User Stories

### US-001: 메인 메뉴 UI 키보드 네비게이션 수정
As a user, I want to navigate the main menu with arrow keys so that I can select options.

**Acceptance Criteria:**
- [ ] `devchat` 실행 시 메인 메뉴가 표시됨
- [ ] 위/아래 방향키로 메뉴 항목 간 이동이 됨
- [ ] 현재 선택된 항목이 시각적으로 구분됨
- [ ] Enter 키로 선택한 항목이 실행됨
- [ ] q 또는 Ctrl+C로 종료됨

### US-002: Host Room 화면 구현 및 수정
As a user, I want to create a chat room from the Host Room menu so that others can join.

**Acceptance Criteria:**
- [ ] 메인 메뉴에서 Host Room 선택 시 호스트 설정 화면으로 이동
- [ ] 방 이름, 포트, 닉네임 입력 가능
- [ ] 저장된 방이 있으면 목록으로 먼저 표시
- [ ] "새로운 방 만들기" 옵션 선택 가능
- [ ] Esc로 메인 메뉴로 돌아감

### US-003: Join Room 화면 구현 및 수정
As a user, I want to join an existing room from the Join Room menu so that I can chat with others.

**Acceptance Criteria:**
- [ ] 메인 메뉴에서 Join Room 선택 시 조인 설정 화면으로 이동
- [ ] 서버 주소(host:port) 입력 가능
- [ ] 닉네임 입력 가능
- [ ] Enter로 연결 시도
- [ ] Esc로 메인 메뉴로 돌아감

### US-004: Settings 화면 구현 및 수정
As a user, I want to change settings from the Settings menu so that my preferences are saved.

**Acceptance Criteria:**
- [ ] 메인 메뉴에서 Settings 선택 시 설정 화면으로 이동
- [ ] 닉네임, 토글 키, 테마, 포트 설정 변경 가능
- [ ] Tab으로 입력 필드 간 이동
- [ ] 변경사항이 저장됨
- [ ] Esc로 메인 메뉴로 돌아감

### US-005: WebSocket 서버 호스팅 기능 수정
As a host, I want to start a WebSocket server so that clients can connect to my room.

**Acceptance Criteria:**
- [ ] `devchat host --port 8080 --name "테스트방"` 실행 시 서버 시작
- [ ] 서버 시작 메시지에 포트, 방 이름 표시
- [ ] 서버가 지정 포트에서 연결 대기
- [ ] Ctrl+C로 서버 종료 가능

### US-006: WebSocket 클라이언트 연결 기능 수정
As a client, I want to connect to a host's server so that I can join the chat room.

**Acceptance Criteria:**
- [ ] `devchat join localhost:8080 --nick "테스터"` 실행 시 연결
- [ ] 연결 성공 시 채팅 UI 표시
- [ ] 연결 실패 시 에러 메시지 표시
- [ ] 호스트 측에서 새 유저 접속 알림 표시

### US-007: 채팅 메시지 송수신 기능 수정
As a user, I want to send and receive messages so that I can communicate with others.

**Acceptance Criteria:**
- [ ] 호스트와 클라이언트 모두 메시지 입력 및 전송 가능
- [ ] 전송한 메시지가 모든 참여자에게 표시
- [ ] 메시지에 발신자 닉네임 표시
- [ ] 메시지 입력 중에도 수신 메시지 표시

### US-008: 스텔스 모드 구현 및 수정
As a user, I want to hide the chat with a stealth mode so that my screen looks like a build log.

**Acceptance Criteria:**
- [ ] 기본 상태에서 위장 테마(가짜 빌드 로그)가 스크롤됨
- [ ] 토글 키(기본 `) 홀드 시 실제 채팅 화면 표시
- [ ] 토글 키 릴리즈 시 다시 위장 화면으로 전환
- [ ] 새 메시지 도착 시 화면 구석에 알림 표시
- [ ] Ctrl+T로 위장 테마 변경 가능

### US-009: 위장 테마 시스템 구현
As a user, I want to choose different disguise themes so that my stealth screen looks authentic.

**Acceptance Criteria:**
- [ ] npm-build 테마 작동 (Webpack 빌드 출력)
- [ ] git-log 테마 작동 (Git 커밋 로그)
- [ ] docker-logs 테마 작동 (Docker 컨테이너 로그)
- [ ] compile 테마 작동 (C++/Rust 컴파일)
- [ ] pytest 테마 작동 (Python 테스트)

### US-010: 내장 채팅 명령어 구현
As a user, I want to use built-in chat commands so that I can interact beyond plain text.

**Acceptance Criteria:**
- [ ] `/help` - 도움말 표시
- [ ] `/roll [면수]` - 주사위 굴리기 (기본 6면)
- [ ] `/flip` - 동전 던지기
- [ ] `/users` - 접속자 목록 표시
- [ ] `/me <행동>` - 액션 메시지
- [ ] `/shrug`, `/tableflip`, `/unflip` - 이모티콘

### US-011: 플러그인 로더 시스템 수정
As a developer, I want plugins to be loaded automatically so that custom commands are available.

**Acceptance Criteria:**
- [ ] `plugins/` 디렉토리의 플러그인이 자동 로드됨
- [ ] 플러그인 로드 시 `onLoad` 콜백 호출
- [ ] 플러그인 언로드 시 `onUnload` 콜백 호출
- [ ] 플러그인 명령어가 채팅에서 사용 가능

### US-012: text-rpg 플러그인 수정
As a user, I want to play the text RPG game in chat so that I can have fun while chatting.

**Acceptance Criteria:**
- [ ] `/rpg` - RPG 도움말 표시
- [ ] `/rpg start` - 게임 시작, 캐릭터 생성
- [ ] `/rpg status` - 현재 상태(HP, 레벨, 골드 등) 표시
- [ ] `/rpg hunt` - 몬스터 사냥 시작
- [ ] `/rpg attack` - 전투 중 공격
- [ ] `/rpg run` - 전투에서 도망
- [ ] `/rpg heal` - HP 회복
- [ ] `/rpg shop` - 상점 표시
- [ ] `/rpg buy <아이템>` - 아이템 구매

### US-013: game-ui-example 플러그인 수정
As a user, I want to launch the game UI example so that I can see the plugin UI system working.

**Acceptance Criteria:**
- [ ] 플러그인 명령어로 게임 UI 실행 가능
- [ ] 전체 화면 게임 UI 표시
- [ ] HP/MP 바 표시 및 업데이트
- [ ] 액션 메뉴 키보드 네비게이션 작동
- [ ] q 또는 Esc로 게임 UI 종료 후 채팅으로 복귀

### US-014: 방 저장 기능 구현
As a host, I want my room to be saved when I exit so that I can resume it later.

**Acceptance Criteria:**
- [ ] Ctrl+C로 방 종료 시 자동 저장
- [ ] 채팅 내역(최대 1000개) 저장
- [ ] 방 설정(이름, 포트, 닉네임) 저장
- [ ] 저장 위치: `~/.config/devchat/room-history.json`
- [ ] `devchat rooms` 명령어로 저장된 방 목록 확인

### US-015: 방 복원 기능 구현
As a host, I want to restore a saved room so that I can continue where I left off.

**Acceptance Criteria:**
- [ ] `devchat host --resume <roomId>` 로 저장된 방 복원
- [ ] 저장된 채팅 내역 표시
- [ ] 메뉴에서 저장된 방 선택하여 복원 가능
- [ ] 복원 시 이전 설정(방 이름, 포트) 유지

### US-016: 플러그인 상태 저장/복원 구현
As a user, I want plugin states to be saved with the room so that game progress is preserved.

**Acceptance Criteria:**
- [ ] `PluginWithState` 인터페이스 구현한 플러그인 상태 저장
- [ ] text-rpg 플러그인 상태(캐릭터 레벨, HP, 골드 등) 저장
- [ ] 방 복원 시 플러그인 상태도 함께 복원
- [ ] 복원 후 `/rpg status`로 이전 상태 확인 가능

### US-017: CLI 명령어 전체 점검
As a user, I want all CLI commands to work as documented so that I can use DevChat effectively.

**Acceptance Criteria:**
- [ ] `devchat` - 인터랙티브 메뉴 표시
- [ ] `devchat host [옵션]` - 방 생성
- [ ] `devchat join <address> [옵션]` - 방 참여
- [ ] `devchat config [옵션]` - 설정 관리
- [ ] `devchat rooms [명령어]` - 저장된 방 관리
- [ ] 모든 옵션 플래그가 정상 작동

### US-018: 에러 처리 및 사용자 피드백 개선
As a user, I want clear error messages so that I know what went wrong.

**Acceptance Criteria:**
- [ ] 연결 실패 시 명확한 에러 메시지
- [ ] 잘못된 명령어 입력 시 도움말 안내
- [ ] 포트 사용 중일 때 적절한 에러 메시지
- [ ] 네트워크 끊김 시 재연결 안내 또는 자동 처리

## Functional Requirements
- FR-1: 모든 UI 컴포넌트는 blessed 라이브러리 기반으로 구현
- FR-2: WebSocket 통신은 ws 라이브러리 사용
- FR-3: 설정 파일은 conf 라이브러리로 관리
- FR-4: CLI는 Commander.js로 구현
- FR-5: 플러그인은 `plugins/` 디렉토리에서 동적 로드
- FR-6: 스텔스 모드는 키 이벤트 기반으로 즉시 전환

## Non-Goals
- 외부 서버를 통한 P2P 연결 (NAT traversal)
- 암호화된 통신 (E2E encryption)
- 파일 전송 기능
- 음성/영상 채팅
- 모바일 지원

## Technical Considerations
- blessed 라이브러리의 키 이벤트 처리 방식 확인 필요
- WebSocket 연결 상태 관리 및 재연결 로직
- 플러그인 로드 시 에러 격리 (한 플러그인 오류가 전체 영향 안줌)
- 스텔스 모드 전환 시 화면 깜빡임 최소화

## Success Metrics
- 2개 터미널에서 호스트/조인 후 메시지 송수신 성공
- 모든 내장 채팅 명령어 정상 작동
- text-rpg 플러그인으로 게임 플레이 가능
- 방 종료 후 복원하여 이전 채팅 내역 확인
- 스텔스 모드 토글이 즉시 반응

## Open Questions
- 현재 테스트 코드가 있는지, 있다면 어떤 상태인지 확인 필요
- 기존 코드에서 어느 부분이 구현되어 있고 어느 부분이 스텁인지 파악 필요