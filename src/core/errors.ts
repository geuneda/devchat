/**
 * 에러 처리 유틸리티
 * 사용자 친화적인 에러 메시지 생성 및 에러 분류
 */

/**
 * 연결 에러 타입
 */
export type ConnectionErrorType =
  | 'ECONNREFUSED' // 서버가 연결 거부
  | 'ENOTFOUND' // 호스트를 찾을 수 없음
  | 'ETIMEDOUT' // 연결 타임아웃
  | 'ECONNRESET' // 연결이 재설정됨
  | 'EADDRINUSE' // 포트가 이미 사용 중
  | 'EACCES' // 권한 없음 (포트 < 1024)
  | 'UNKNOWN'; // 알 수 없는 에러

/**
 * 에러 코드를 분석하여 타입 반환
 */
export function getErrorType(error: Error | NodeJS.ErrnoException): ConnectionErrorType {
  const errnoError = error as NodeJS.ErrnoException;
  const code = errnoError.code || '';

  switch (code) {
    case 'ECONNREFUSED':
      return 'ECONNREFUSED';
    case 'ENOTFOUND':
      return 'ENOTFOUND';
    case 'ETIMEDOUT':
      return 'ETIMEDOUT';
    case 'ECONNRESET':
      return 'ECONNRESET';
    case 'EADDRINUSE':
      return 'EADDRINUSE';
    case 'EACCES':
      return 'EACCES';
    default:
      return 'UNKNOWN';
  }
}

/**
 * 연결 에러에 대한 사용자 친화적 메시지 생성
 */
export function getConnectionErrorMessage(error: Error, host: string, port: number): string {
  const errorType = getErrorType(error);

  switch (errorType) {
    case 'ECONNREFUSED':
      return `연결이 거부되었습니다.

   가능한 원인:
   - 서버가 실행 중이지 않습니다
   - 주소(${host}:${port})가 올바르지 않습니다

   해결 방법:
   - 호스트가 'devchat host --port ${port}'를 실행했는지 확인하세요
   - IP 주소와 포트가 정확한지 확인하세요`;

    case 'ENOTFOUND':
      return `호스트를 찾을 수 없습니다: ${host}

   해결 방법:
   - 호스트 주소가 올바른지 확인하세요
   - 네트워크 연결 상태를 확인하세요`;

    case 'ETIMEDOUT':
      return `연결 시간이 초과되었습니다.

   가능한 원인:
   - 서버가 응답하지 않습니다
   - 방화벽이 연결을 차단하고 있습니다
   - 네트워크 상태가 불안정합니다

   해결 방법:
   - 서버가 실행 중인지 확인하세요
   - 방화벽 설정을 확인하세요
   - 같은 네트워크에 있는지 확인하세요`;

    case 'ECONNRESET':
      return `서버와의 연결이 끊어졌습니다.

   가능한 원인:
   - 서버가 종료되었습니다
   - 네트워크 연결이 불안정합니다

   다시 연결하려면: devchat join ${host}:${port}`;

    default:
      return `연결에 실패했습니다: ${error.message}

   다시 시도하거나, 호스트에게 서버 상태를 확인하세요.`;
  }
}

/**
 * 서버 시작 에러에 대한 사용자 친화적 메시지 생성
 */
export function getServerErrorMessage(error: Error, port: number): string {
  const errorType = getErrorType(error);

  switch (errorType) {
    case 'EADDRINUSE':
      return `포트 ${port}이(가) 이미 사용 중입니다.

   해결 방법:
   - 다른 포트를 사용하세요: devchat host --port ${port + 1}
   - 또는 기존 프로세스를 종료하세요

   포트 사용 확인: lsof -i :${port} (macOS/Linux)
                   netstat -ano | findstr :${port} (Windows)`;

    case 'EACCES':
      return `포트 ${port}에 대한 접근 권한이 없습니다.

   1024 미만의 포트는 관리자 권한이 필요합니다.

   해결 방법:
   - 1024 이상의 포트를 사용하세요: devchat host --port 8080
   - 또는 관리자 권한으로 실행하세요 (권장하지 않음)`;

    default:
      return `서버 시작에 실패했습니다: ${error.message}`;
  }
}

/**
 * 네트워크 연결 끊김 시 안내 메시지
 */
export function getDisconnectMessage(host: string, port: number, wasHost: boolean): string {
  if (wasHost) {
    return `서버가 종료되었습니다.

   방 정보가 저장되었습니다. 다시 시작하려면:
   - devchat rooms (저장된 방 목록 확인)
   - devchat host --resume <roomId> (저장된 방 복원)`;
  }

  return `서버와의 연결이 끊어졌습니다.

   가능한 원인:
   - 서버(호스트)가 종료되었습니다
   - 네트워크 연결이 끊어졌습니다

   다시 연결하려면: devchat join ${host}:${port}`;
}

/**
 * 잘못된 명령어 입력 시 안내 메시지
 */
export function getUnknownCommandMessage(command: string): string {
  return `알 수 없는 명령어: ${command}

사용 가능한 명령어를 보려면 /help를 입력하세요.`;
}

/**
 * 명령어 실행 실패 시 안내 메시지
 */
export function getCommandErrorMessage(command: string): string {
  return `명령어 실행 중 오류가 발생했습니다: ${command}

다시 시도하거나, /help로 사용법을 확인하세요.`;
}
