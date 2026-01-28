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

