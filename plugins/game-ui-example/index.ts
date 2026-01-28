/**
 * Game UI Example Plugin
 * 
 * 플러그인에서 blessed 기반 UI를 만드는 예시입니다.
 * 간단한 턴제 전투 게임 UI를 구현합니다.
 * 
 * 명령어: /game-ui
 */

import { Plugin, PluginContext, PluginWithUI } from '../../src/types';
import { createGameScreen, createStatBar, createColoredStatBar, PluginUIContext } from '../../src/plugins/ui';

interface GameState {
  playerHp: number;
  playerMaxHp: number;
  playerMp: number;
  playerMaxMp: number;
  playerAttack: number;
  playerDefense: number;
  enemyHp: number;
  enemyMaxHp: number;
  enemyName: string;
  enemyAttack: number;
  score: number;
  turn: number;
  battleLog: string[];
  isDefending: boolean;
}

// 초기 게임 상태
function createInitialState(): GameState {
  return {
    playerHp: 100,
    playerMaxHp: 100,
    playerMp: 50,
    playerMaxMp: 50,
    playerAttack: 15,
    playerDefense: 5,
    enemyHp: 80,
    enemyMaxHp: 80,
    enemyName: '슬라임',
    enemyAttack: 10,
    score: 0,
    turn: 1,
    battleLog: ['전투 시작!'],
    isDefending: false,
  };
}

// 적 생성
function spawnEnemy(score: number): Partial<GameState> {
  const enemies = [
    { name: '슬라임', hp: 60, attack: 8 },
    { name: '고블린', hp: 80, attack: 12 },
    { name: '오크', hp: 120, attack: 15 },
    { name: '스켈레톤', hp: 100, attack: 18 },
    { name: '트롤', hp: 180, attack: 22 },
    { name: '드래곤', hp: 300, attack: 30 },
  ];

  const level = Math.min(Math.floor(score / 100), enemies.length - 1);
  const enemy = enemies[level];
  const scale = 1 + score / 500;

  return {
    enemyName: enemy.name,
    enemyHp: Math.floor(enemy.hp * scale),
    enemyMaxHp: Math.floor(enemy.hp * scale),
    enemyAttack: Math.floor(enemy.attack * scale),
  };
}

// 데미지 계산
function calculateDamage(attack: number, defense: number): number {
  const baseDamage = Math.max(1, attack - defense / 2);
  const variance = 0.8 + Math.random() * 0.4; // 0.8 ~ 1.2
  return Math.floor(baseDamage * variance);
}

// 게임 UI 생성 및 실행
function runGameUI(): void {
  let state = createInitialState();

  const ui = createGameScreen({
    title: 'Battle Arena',
    width: '90%',
    height: '90%',
  });

  // === UI 컴포넌트 생성 ===

  // 헤더 (점수, 턴)
  const headerBox = ui.createBox({
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    content: '',
    border: 'line',
    style: { border: { fg: 'yellow' } },
  });

  // 플레이어 상태
  const playerBox = ui.createBox({
    top: 3,
    left: 0,
    width: '50%',
    height: 8,
    label: ' Player ',
    border: 'line',
    style: { border: { fg: 'cyan' } },
  });

  // 적 상태
  const enemyBox = ui.createBox({
    top: 3,
    right: 0,
    width: '50%',
    height: 8,
    label: ' Enemy ',
    border: 'line',
    style: { border: { fg: 'red' } },
  });

  // 액션 메뉴
  const actionList = ui.createList({
    top: 11,
    left: 0,
    width: '40%',
    height: 10,
    items: ['  Attack       (공격)', '  Defend       (방어)', '  Magic        (마법 -20 MP)', '  Heal         (회복 -30 MP)', '  Run          (도망)'],
    label: ' Actions ',
    border: 'line',
    style: { border: { fg: 'green' } },
    selectedStyle: { bg: 'green', fg: 'black', bold: true },
  });

  // 배틀 로그
  const logBox = ui.createLog({
    top: 11,
    right: 0,
    width: '60%',
    height: 10,
    label: ' Battle Log ',
    border: 'line',
    style: { border: { fg: 'gray' } },
  });

  // 도움말
  const helpBox = ui.createBox({
    bottom: 0,
    left: 0,
    width: '100%',
    height: 3,
    content: '{center}{gray-fg}[↑↓] 선택  [Enter] 실행  [q] 종료{/gray-fg}{/center}',
    border: 'line',
    style: { border: { fg: 'gray' } },
  });

  // === 화면 업데이트 함수 ===

  function updateDisplay(): void {
    // 헤더 업데이트
    headerBox.setContent(
      `{center}{bold}Battle Arena{/bold}   |   Score: {yellow-fg}${state.score}{/yellow-fg}   |   Turn: {cyan-fg}${state.turn}{/cyan-fg}{/center}`
    );

    // 플레이어 상태 업데이트
    const hpColor = state.playerHp > 50 ? 'green' : state.playerHp > 25 ? 'yellow' : 'red';
    const mpColor = state.playerMp > 25 ? 'blue' : 'magenta';
    
    playerBox.setContent(
      `\n  HP: ${createColoredStatBar(state.playerHp, state.playerMaxHp, 15, hpColor, 'gray')} ${state.playerHp}/${state.playerMaxHp}\n` +
      `  MP: ${createColoredStatBar(state.playerMp, state.playerMaxMp, 15, mpColor, 'gray')} ${state.playerMp}/${state.playerMaxMp}\n\n` +
      `  ATK: {yellow-fg}${state.playerAttack}{/yellow-fg}   DEF: {cyan-fg}${state.playerDefense}{/cyan-fg}` +
      (state.isDefending ? '  {magenta-fg}[DEFENDING]{/magenta-fg}' : '')
    );

    // 적 상태 업데이트
    const enemyHpColor = state.enemyHp > state.enemyMaxHp * 0.5 ? 'red' : state.enemyHp > state.enemyMaxHp * 0.25 ? 'yellow' : 'green';
    
    enemyBox.setContent(
      `\n  {bold}${state.enemyName}{/bold}\n\n` +
      `  HP: ${createColoredStatBar(state.enemyHp, state.enemyMaxHp, 15, enemyHpColor, 'gray')} ${state.enemyHp}/${state.enemyMaxHp}\n\n` +
      `  ATK: {red-fg}${state.enemyAttack}{/red-fg}`
    );

    ui.render();
  }

  function addLog(message: string): void {
    state.battleLog.push(message);
    logBox.log(message);
  }

  // === 게임 액션 ===

  function playerAttack(): void {
    const damage = calculateDamage(state.playerAttack, 0);
    state.enemyHp = Math.max(0, state.enemyHp - damage);
    addLog(`{cyan-fg}► 공격! ${state.enemyName}에게 ${damage} 데미지!{/cyan-fg}`);
  }

  function playerDefend(): void {
    state.isDefending = true;
    addLog(`{magenta-fg}► 방어 자세!{/magenta-fg}`);
  }

  function playerMagic(): void {
    if (state.playerMp < 20) {
      addLog(`{red-fg}► MP가 부족합니다!{/red-fg}`);
      return;
    }
    state.playerMp -= 20;
    const damage = calculateDamage(state.playerAttack * 2, 0);
    state.enemyHp = Math.max(0, state.enemyHp - damage);
    addLog(`{blue-fg}► 마법 공격! ${state.enemyName}에게 ${damage} 데미지!{/blue-fg}`);
  }

  function playerHeal(): void {
    if (state.playerMp < 30) {
      addLog(`{red-fg}► MP가 부족합니다!{/red-fg}`);
      return;
    }
    state.playerMp -= 30;
    const healAmount = Math.floor(state.playerMaxHp * 0.4);
    state.playerHp = Math.min(state.playerMaxHp, state.playerHp + healAmount);
    addLog(`{green-fg}► 회복! HP +${healAmount}{/green-fg}`);
  }

  function enemyTurn(): void {
    if (state.enemyHp <= 0) return;

    let damage = calculateDamage(state.enemyAttack, state.playerDefense);
    if (state.isDefending) {
      damage = Math.floor(damage * 0.5);
      addLog(`{gray-fg}  (방어로 데미지 감소!){/gray-fg}`);
    }
    state.playerHp = Math.max(0, state.playerHp - damage);
    addLog(`{red-fg}◄ ${state.enemyName}의 공격! ${damage} 데미지 받음!{/red-fg}`);
    state.isDefending = false;
  }

  function checkBattleEnd(): boolean {
    if (state.enemyHp <= 0) {
      const scoreGain = 50 + state.turn * 5;
      state.score += scoreGain;
      addLog(`{yellow-fg}★ ${state.enemyName} 처치! +${scoreGain} 점{/yellow-fg}`);
      
      // 새 적 생성
      const newEnemy = spawnEnemy(state.score);
      Object.assign(state, newEnemy);
      state.turn = 1;
      state.playerMp = Math.min(state.playerMaxMp, state.playerMp + 20);
      addLog(`{white-fg}새로운 적: ${state.enemyName}!{/white-fg}`);
      return true;
    }
    
    if (state.playerHp <= 0) {
      addLog(`{red-fg}✗ 패배! 최종 점수: ${state.score}{/red-fg}`);
      return true;
    }
    
    return false;
  }

  function executeAction(actionIndex: number): void {
    switch (actionIndex) {
      case 0: // Attack
        playerAttack();
        break;
      case 1: // Defend
        playerDefend();
        break;
      case 2: // Magic
        playerMagic();
        break;
      case 3: // Heal
        playerHeal();
        break;
      case 4: // Run
        addLog(`{gray-fg}도망칠 수 없습니다!{/gray-fg}`);
        return;
    }

    if (!checkBattleEnd()) {
      enemyTurn();
      checkBattleEnd();
    }

    state.turn++;
    updateDisplay();
  }

  // === 이벤트 핸들러 ===

  actionList.on('select', (_item, index) => {
    if (state.playerHp <= 0) {
      // 게임 오버 상태에서는 재시작
      state = createInitialState();
      logBox.setContent('');
      addLog('새 게임 시작!');
    } else {
      executeAction(index);
    }
    updateDisplay();
  });

  ui.onKey(['q', 'escape'], () => {
    ui.close();
  });

  // 초기 화면 표시
  addLog(`${state.enemyName}이(가) 나타났다!`);
  updateDisplay();
  actionList.focus();
}

// 플러그인 정의
const gameUIPlugin: PluginWithUI = {
  name: 'game-ui-example',
  description: 'blessed 기반 게임 UI 예시 플러그인',
  version: '1.0.0',
  hasUI: true,
  commands: {
    '/game-ui': (_args: string[], ctx: PluginContext) => {
      ctx.broadcast(`{cyan-fg}${ctx.user.nick}님이 Battle Arena를 시작합니다!{/cyan-fg}`);
      // 약간의 지연 후 UI 시작 (채팅 메시지가 표시된 후)
      setTimeout(() => {
        runGameUI();
      }, 100);
    },
    '/game-ui-help': (_args: string[], ctx: PluginContext) => {
      ctx.broadcast(`
{bold}Game UI Example Plugin{/bold}
━━━━━━━━━━━━━━━━━━━━━━━━

명령어:
  /game-ui       게임 UI 시작
  /game-ui-help  이 도움말

게임 조작:
  ↑↓            액션 선택
  Enter         액션 실행
  q 또는 Esc    종료

이 플러그인은 blessed 기반 UI를 만드는 예시입니다.
src/plugins/ui.ts의 API를 활용합니다.
`);
    },
  },
  createUI: () => {
    runGameUI();
  },
  onLoad: () => {
    console.log('[game-ui-example] 플러그인 로드됨');
  },
  onUnload: () => {
    console.log('[game-ui-example] 플러그인 언로드됨');
  },
};

export default gameUIPlugin;
