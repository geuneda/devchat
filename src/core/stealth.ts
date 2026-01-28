import { StealthTheme } from '../types';

// Fake npm build output
const npmBuildTheme: StealthTheme = {
  name: 'npm-build',
  description: 'Fake npm build/webpack output',
  interval: { min: 100, max: 800 },
  generateLine: () => {
    const lines = [
      '> webpack --mode production',
      'asset main.js 1.24 MiB [emitted] [minimized] (name: main)',
      'asset vendor.js 892 KiB [emitted] [minimized] (name: vendor)',
      'asset styles.css 156 KiB [emitted] (name: styles)',
      'orphan modules 1.82 MiB [orphan] 632 modules',
      'runtime modules 3.21 KiB 8 modules',
      'cacheable modules 2.94 MiB',
      '  modules by path ./src/ 1.12 MiB 423 modules',
      '  modules by path ./node_modules/ 1.82 MiB',
      '    modules by path ./node_modules/react/ 142 KiB 4 modules',
      '    modules by path ./node_modules/lodash/ 528 KiB 108 modules',
      'webpack compiled successfully in 4523 ms',
      '[eslint] src/components/App.tsx: no issues found',
      '[eslint] src/utils/helpers.ts: no issues found',
      'Compiling...',
      'Compiled successfully!',
      'Building fresh packages...',
      'Linking dependencies...',
      '✓ Compiled successfully.',
      'Hash: a3f2b9c8d4e5f6a7',
      'Version: webpack 5.89.0',
      'Time: 3847ms',
      'Built at: ' + new Date().toLocaleString(),
      'Entrypoint main = main.js main.js.map',
      '  [0] ./src/index.tsx 2.3 KiB {main} [built]',
      '  [1] ./src/App.tsx 8.7 KiB {main} [built]',
      '  [2] ./src/components/Header.tsx 3.2 KiB {main} [built]',
      '  [3] ./src/hooks/useAuth.ts 1.8 KiB {main} [built]',
      '  [4] ./src/utils/api.ts 4.1 KiB {main} [built]',
      'Child mini-css-extract-plugin:',
      '    Entrypoint mini-css-extract-plugin = *',
      '       1 module',
      'Checking TypeScript types...',
      'Type checking complete.',
      '[HMR] Waiting for update signal from WDS...',
      '[HMR] Updated modules: 5',
      '✨  Done in 12.34s.',
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },
};

// Fake git log output
const gitLogTheme: StealthTheme = {
  name: 'git-log',
  description: 'Fake git log output',
  interval: { min: 500, max: 1500 },
  generateLine: () => {
    const hashes = ['a3f2b9c', 'b8d4e5f', 'c9e6f7a', 'd1a2b3c', 'e4f5a6b'];
    const authors = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Kim', 'Charlie Lee'];
    const messages = [
      'feat: add user authentication',
      'fix: resolve memory leak in component',
      'refactor: improve code structure',
      'docs: update README',
      'chore: update dependencies',
      'test: add unit tests for utils',
      'style: format code with prettier',
      'perf: optimize database queries',
      'fix: handle edge case in parser',
      'feat: implement dark mode',
    ];
    const hash = hashes[Math.floor(Math.random() * hashes.length)];
    const author = authors[Math.floor(Math.random() * authors.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const date = new Date(Date.now() - Math.random() * 86400000 * 30).toISOString().split('T')[0];
    
    return `${hash} - ${message} (${date}) <${author}>`;
  },
};

// Fake docker logs output
const dockerLogsTheme: StealthTheme = {
  name: 'docker-logs',
  description: 'Fake docker container logs',
  interval: { min: 200, max: 1000 },
  generateLine: () => {
    const containers = ['api-server', 'db-postgres', 'redis-cache', 'nginx-proxy', 'worker-1'];
    const levels = ['INFO', 'DEBUG', 'WARN'];
    const messages = [
      'Request processed in 23ms',
      'Connection established from 192.168.1.45',
      'Cache hit for key: user_session_abc123',
      'Query executed: SELECT * FROM users LIMIT 10',
      'Health check passed',
      'Worker processing job #4521',
      'Memory usage: 256MB / 512MB',
      'CPU: 12% | Memory: 48%',
      'Incoming request: GET /api/v1/users',
      'Response sent: 200 OK',
      'New connection on port 3000',
      'SSL handshake completed',
      'Rate limit check passed',
      'Token validated successfully',
      'Database connection pool: 8/20 active',
    ];
    const container = containers[Math.floor(Math.random() * containers.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const time = new Date().toISOString();
    
    return `${container} | ${time} | ${level} | ${message}`;
  },
};

// Fake compile output (C++/Rust style)
const compileTheme: StealthTheme = {
  name: 'compile',
  description: 'Fake C++/Rust compile output',
  interval: { min: 50, max: 400 },
  generateLine: () => {
    const lines = [
      'Compiling devchat v1.0.0 (/home/user/projects/devchat)',
      '   Compiling libc v0.2.150',
      '   Compiling cfg-if v1.0.0',
      '   Compiling proc-macro2 v1.0.70',
      '   Compiling unicode-ident v1.0.12',
      '   Compiling quote v1.0.33',
      '   Compiling syn v2.0.41',
      '   Compiling serde_derive v1.0.193',
      '   Compiling serde v1.0.193',
      '   Compiling tokio v1.35.0',
      '    Building [====================>          ] 156/234',
      '    Building [========================>      ] 189/234',
      '    Building [=============================> ] 230/234',
      '    Finished dev [unoptimized + debuginfo] target(s) in 45.23s',
      '     Running `target/debug/devchat`',
      'g++ -c -o main.o main.cpp -std=c++17 -O2',
      'g++ -c -o utils.o utils.cpp -std=c++17 -O2',
      'g++ -c -o network.o network.cpp -std=c++17 -O2',
      'Linking main.o utils.o network.o...',
      'Build successful: ./bin/program',
      'clang++ -Wall -Wextra -O3 -o app src/*.cpp',
      'In file included from src/main.cpp:1:',
      'note: in expansion of macro \'ASSERT\'',
      'make[2]: Entering directory \'/home/user/project/src\'',
      'make[2]: Leaving directory \'/home/user/project/src\'',
      '[ 45%] Building CXX object CMakeFiles/app.dir/main.cpp.o',
      '[ 67%] Building CXX object CMakeFiles/app.dir/utils.cpp.o',
      '[100%] Linking CXX executable app',
      '[100%] Built target app',
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },
};

// Fake pytest output
const pytestTheme: StealthTheme = {
  name: 'pytest',
  description: 'Fake pytest output',
  interval: { min: 100, max: 600 },
  generateLine: () => {
    const lines = [
      '============================= test session starts ==============================',
      'platform linux -- Python 3.11.5, pytest-7.4.3, pluggy-1.3.0',
      'rootdir: /home/user/project',
      'plugins: cov-4.1.0, asyncio-0.21.1, mock-3.12.0',
      'collected 156 items',
      '',
      'tests/test_auth.py::test_login_success PASSED                           [  1%]',
      'tests/test_auth.py::test_login_failure PASSED                           [  2%]',
      'tests/test_api.py::test_get_users PASSED                                [  3%]',
      'tests/test_api.py::test_create_user PASSED                              [  4%]',
      'tests/test_utils.py::test_validate_email PASSED                         [  5%]',
      'tests/test_utils.py::test_hash_password PASSED                          [  6%]',
      'tests/test_database.py::test_connection PASSED                          [  7%]',
      'tests/test_database.py::test_query PASSED                               [  8%]',
      '.........................',
      '.........s.............',
      '======================== 156 passed, 2 skipped in 12.34s ========================',
      'Name                      Stmts   Miss  Cover',
      '---------------------------------------------',
      'src/auth.py                 89     12    87%',
      'src/api.py                 156     23    85%',
      'src/utils.py                67      5    93%',
      'src/database.py            112     18    84%',
      '---------------------------------------------',
      'TOTAL                      424     58    86%',
      'Coverage HTML written to dir htmlcov',
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },
};

// Export all themes
export const themes: Record<string, StealthTheme> = {
  'npm-build': npmBuildTheme,
  'git-log': gitLogTheme,
  'docker-logs': dockerLogsTheme,
  'compile': compileTheme,
  'pytest': pytestTheme,
};

export function getTheme(name: string): StealthTheme {
  return themes[name] || themes['npm-build'];
}

export function getThemeNames(): string[] {
  return Object.keys(themes);
}

export class StealthModeManager {
  private theme: StealthTheme;
  private isActive = true; // Stealth mode is ON by default (hiding chat)
  private interval: NodeJS.Timeout | null = null;
  private onLineCallback: ((line: string) => void) | null = null;

  constructor(themeName: string = 'npm-build') {
    this.theme = getTheme(themeName);
  }

  setTheme(themeName: string): void {
    this.theme = getTheme(themeName);
  }

  getTheme(): StealthTheme {
    return this.theme;
  }

  isStealthActive(): boolean {
    return this.isActive;
  }

  // Toggle stealth mode (true = showing fake output, false = showing chat)
  toggle(): boolean {
    this.isActive = !this.isActive;
    return this.isActive;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  // Start generating fake output
  startFakeOutput(onLine: (line: string) => void): void {
    this.onLineCallback = onLine;
    this.generateNextLine();
  }

  stopFakeOutput(): void {
    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = null;
    }
  }

  private generateNextLine(): void {
    if (!this.onLineCallback) return;

    const { min, max } = this.theme.interval;
    const delay = min + Math.random() * (max - min);

    this.interval = setTimeout(() => {
      if (this.isActive && this.onLineCallback) {
        this.onLineCallback(this.theme.generateLine());
      }
      this.generateNextLine();
    }, delay);
  }
}
