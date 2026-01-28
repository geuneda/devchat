import blessed from 'blessed';
import { getAuthManager, isSupabaseConfigured } from '../core/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
}

export interface AuthMenuResult {
  success: boolean;
  skipped?: boolean;
}

export async function showAuthMenu(): Promise<AuthMenuResult> {
  if (!isSupabaseConfigured()) {
    return { success: true, skipped: true };
  }

  const authManager = getAuthManager();

  const initialized = await authManager.initialize();
  if (initialized && authManager.isLoggedIn()) {
    return { success: true };
  }

  return new Promise((resolve) => {
    const screen = blessed.screen({
      smartCSR: true,
      title: 'DevChat - Login',
      fullUnicode: true,
    });

    const container = blessed.box({
      parent: screen,
      top: 'center',
      left: 'center',
      width: 50,
      height: 18,
      border: { type: 'line' },
      style: {
        border: { fg: 'cyan' },
        bg: 'black',
      },
    });

    const titleBox = blessed.box({
      parent: container,
      top: 0,
      left: 'center',
      width: '100%-2',
      height: 3,
      content: '{center}DevChat - Login{/center}',
      style: {
        fg: 'white',
        bg: 'blue',
      },
      tags: true,
    });

    const emailLabel = blessed.text({
      parent: container,
      top: 4,
      left: 2,
      content: 'Email:',
      style: { fg: 'white' },
    });

    const emailInput = blessed.textbox({
      parent: container,
      top: 4,
      left: 10,
      width: 35,
      height: 1,
      style: {
        fg: 'white',
        bg: 'black',
        focus: { bg: 'blue' },
      },
      inputOnFocus: true,
      keys: true,
    });

    const passwordLabel = blessed.text({
      parent: container,
      top: 6,
      left: 2,
      content: 'Password:',
      style: { fg: 'white' },
    });

    const passwordInput = blessed.textbox({
      parent: container,
      top: 6,
      left: 12,
      width: 33,
      height: 1,
      style: {
        fg: 'white',
        bg: 'black',
        focus: { bg: 'blue' },
      },
      inputOnFocus: true,
      keys: true,
      censor: true,
    });

    const loginBtn = blessed.button({
      parent: container,
      top: 9,
      left: 5,
      width: 15,
      height: 3,
      content: '{center}Login{/center}',
      style: {
        fg: 'white',
        bg: 'green',
        focus: { bg: 'cyan' },
      },
      tags: true,
      border: { type: 'line' },
      mouse: true,
    });

    const registerBtn = blessed.button({
      parent: container,
      top: 9,
      left: 25,
      width: 15,
      height: 3,
      content: '{center}Register{/center}',
      style: {
        fg: 'white',
        bg: 'blue',
        focus: { bg: 'cyan' },
      },
      tags: true,
      border: { type: 'line' },
      mouse: true,
    });

    const skipBtn = blessed.button({
      parent: container,
      top: 13,
      left: 'center',
      width: 20,
      height: 1,
      content: '{center}Skip (No Auth){/center}',
      style: {
        fg: 'gray',
        focus: { fg: 'white' },
      },
      tags: true,
      mouse: true,
    });

    const statusBox = blessed.box({
      parent: container,
      bottom: 0,
      left: 0,
      width: '100%-2',
      height: 1,
      content: '',
      style: { fg: 'yellow' },
      tags: true,
    });

    const showStatus = (msg: string, isError = false) => {
      statusBox.setContent(`{center}${msg}{/center}`);
      statusBox.style.fg = isError ? 'red' : 'green';
      screen.render();
    };

    const handleLogin = async () => {
      try {
        const email = emailInput.getValue().trim();
        const password = passwordInput.getValue();

        if (!email || !password) {
          showStatus('Email and password required', true);
          return;
        }

        if (!isValidEmail(email)) {
          showStatus('Invalid email format', true);
          return;
        }

        showStatus('Logging in...');
        const result = await authManager.login(email, password);

        if (result.success) {
          showStatus('Login successful!');
          setTimeout(() => {
            screen.destroy();
            resolve({ success: true });
          }, 500);
        } else {
          showStatus(result.error || 'Login failed', true);
        }
      } catch (err) {
        showStatus('Login error occurred', true);
      }
    };

    const handleRegister = async () => {
      try {
        const email = emailInput.getValue().trim();
        const password = passwordInput.getValue();

        if (!email || !password) {
          showStatus('Email and password required', true);
          return;
        }

        if (!isValidEmail(email)) {
          showStatus('Invalid email format', true);
          return;
        }

        const passwordValidation = isValidPassword(password);
        if (!passwordValidation.valid) {
          showStatus(passwordValidation.message || 'Invalid password', true);
          return;
        }

        showStatus('Registering...');
        const nick = email.split('@')[0];
        const result = await authManager.register(email, password, nick);

        if (result.success) {
          showStatus('Registration successful! You can now login.');
        } else {
          showStatus(result.error || 'Registration failed', true);
        }
      } catch (err) {
        showStatus('Registration error occurred', true);
      }
    };

    const handleSkip = () => {
      screen.destroy();
      resolve({ success: true, skipped: true });
    };

    loginBtn.on('press', handleLogin);
    registerBtn.on('press', handleRegister);
    skipBtn.on('press', handleSkip);

    const focusOrder = [emailInput, passwordInput, loginBtn, registerBtn, skipBtn];
    let focusIdx = 0;

    const moveFocus = (direction: number) => {
      focusIdx = (focusIdx + direction + focusOrder.length) % focusOrder.length;
      focusOrder[focusIdx].focus();
      screen.render();
    };

    const setFocus = (idx: number) => {
      focusIdx = idx;
      focusOrder[focusIdx].focus();
      screen.render();
    };

    // 이메일 입력 필드 키 핸들러
    emailInput.key(['tab', 'down'], () => {
      emailInput.cancel();
      setFocus(1); // password로 이동
    });

    emailInput.key(['enter'], () => {
      emailInput.submit();
    });

    emailInput.on('submit', () => {
      setFocus(1); // password로 이동
    });

    // 비밀번호 입력 필드 키 핸들러
    passwordInput.key(['tab', 'down'], () => {
      passwordInput.cancel();
      setFocus(2); // loginBtn으로 이동
    });

    passwordInput.key(['S-tab', 'up'], () => {
      passwordInput.cancel();
      setFocus(0); // email로 이동
    });

    passwordInput.key(['enter'], () => {
      passwordInput.submit();
    });

    passwordInput.on('submit', handleLogin);

    // 버튼들 키 핸들러
    screen.key(['escape', 'q'], () => {
      screen.destroy();
      resolve({ success: false });
    });

    screen.key(['tab', 'down'], () => {
      // 입력 필드가 아닐 때만 동작
      if (focusIdx >= 2) {
        moveFocus(1);
      }
    });

    screen.key(['S-tab', 'up'], () => {
      if (focusIdx >= 2) {
        moveFocus(-1);
      } else if (focusIdx === 0) {
        // email에서 위로 가면 skip으로
        setFocus(4);
      }
    });

    screen.key(['left', 'right'], () => {
      // Login <-> Register 전환
      if (focusIdx === 2) {
        setFocus(3);
      } else if (focusIdx === 3) {
        setFocus(2);
      }
    });

    emailInput.focus();
    screen.render();
  });
}
