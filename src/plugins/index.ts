import { Plugin, PluginContext, PluginWithState } from '../types';
import { PluginLoader } from './loader';
import { createPlugin } from './api';

// Built-in dice plugin
const dicePlugin = createPlugin({
  name: 'dice',
  description: 'Roll dice with /roll',
  version: '1.0.0',
  commands: {
    '/roll': (args, ctx) => {
      const sides = parseInt(args[0], 10) || 6;
      const count = parseInt(args[1], 10) || 1;
      
      const results: number[] = [];
      for (let i = 0; i < Math.min(count, 10); i++) {
        results.push(Math.floor(Math.random() * sides) + 1);
      }
      
      const total = results.reduce((a, b) => a + b, 0);
      
      if (count === 1) {
        ctx.broadcast(`🎲 ${ctx.user.nick} rolled a ${results[0]}! (d${sides})`);
      } else {
        ctx.broadcast(`🎲 ${ctx.user.nick} rolled [${results.join(', ')}] = ${total} (${count}d${sides})`);
      }
    },
    '/flip': (_args, ctx) => {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      ctx.broadcast(`🪙 ${ctx.user.nick} flipped a coin: ${result}!`);
    },
  },
});

// Built-in utility plugin
const utilPlugin = createPlugin({
  name: 'utils',
  description: 'Utility commands',
  version: '1.0.0',
  commands: {
    '/users': (_args, ctx) => {
      const users = ctx.getUsers();
      const list = users.map((u) => `${u.isHost ? '★' : '•'} ${u.nick}`).join('\n');
      ctx.broadcast(`Users in room:\n${list}`);
    },
    '/me': (args, ctx) => {
      const action = args.join(' ') || 'does something';
      ctx.broadcast(`* ${ctx.user.nick} ${action}`);
    },
    '/shrug': (_args, ctx) => {
      ctx.broadcast(`${ctx.user.nick}: ¯\\_(ツ)_/¯`);
    },
    '/tableflip': (_args, ctx) => {
      ctx.broadcast(`${ctx.user.nick}: (╯°□°)╯︵ ┻━┻`);
    },
    '/unflip': (_args, ctx) => {
      ctx.broadcast(`${ctx.user.nick}: ┬─┬ノ( º _ ºノ)`);
    },
  },
});

// Built-in help plugin
const helpPlugin = createPlugin({
  name: 'help',
  description: 'Help commands',
  version: '1.0.0',
  commands: {
    '/help': (_args, ctx) => {
      ctx.broadcast(`
Available commands:
  /roll [sides] [count] - Roll dice
  /flip - Flip a coin
  /users - List users in room
  /me <action> - Perform an action
  /shrug - ¯\\_(ツ)_/¯
  /tableflip - Flip a table
  /unflip - Unflip a table
  /rpg - Start text RPG
  /help - Show this help
`);
    },
  },
});

// Built-in Text RPG plugin
const textRpgPlugin = createTextRpgPlugin();

function createTextRpgPlugin(): PluginWithState {
  interface Player {
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    gold: number;
    level: number;
    exp: number;
    inventory: string[];
  }

  interface Monster {
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    goldDrop: number;
    expDrop: number;
  }

  const MONSTERS: Monster[] = [
    { name: '슬라임', hp: 20, maxHp: 20, attack: 5, defense: 1, goldDrop: 10, expDrop: 15 },
    { name: '고블린', hp: 35, maxHp: 35, attack: 8, defense: 3, goldDrop: 20, expDrop: 25 },
    { name: '오크', hp: 60, maxHp: 60, attack: 12, defense: 5, goldDrop: 35, expDrop: 40 },
    { name: '스켈레톤', hp: 45, maxHp: 45, attack: 10, defense: 2, goldDrop: 25, expDrop: 30 },
    { name: '트롤', hp: 100, maxHp: 100, attack: 18, defense: 8, goldDrop: 60, expDrop: 70 },
    { name: '드래곤', hp: 200, maxHp: 200, attack: 30, defense: 15, goldDrop: 150, expDrop: 200 },
  ];

  const ITEMS: Record<string, { name: string; effect: string; price: number }> = {
    potion: { name: '체력 포션', effect: 'hp+30', price: 20 },
    sword: { name: '강철검', effect: 'attack+5', price: 50 },
    shield: { name: '강철방패', effect: 'defense+3', price: 40 },
    elixir: { name: '엘릭서', effect: 'hp+100', price: 80 },
  };

  const players = new Map<string, Player>();
  const battles = new Map<string, Monster>();
  const dungeonLevels = new Map<string, number>();

  function createPlayer(name: string): Player {
    return {
      name,
      hp: 100,
      maxHp: 100,
      attack: 10,
      defense: 3,
      gold: 50,
      level: 1,
      exp: 0,
      inventory: ['potion'],
    };
  }

  function getPlayer(userId: string, name: string): Player {
    if (!players.has(userId)) {
      players.set(userId, createPlayer(name));
    }
    return players.get(userId)!;
  }

  function spawnMonster(dungeonLevel: number): Monster {
    const maxIndex = Math.min(dungeonLevel, MONSTERS.length - 1);
    const monster = MONSTERS[Math.floor(Math.random() * (maxIndex + 1))];
    const scale = 1 + (dungeonLevel - 1) * 0.2;
    return {
      ...monster,
      hp: Math.floor(monster.hp * scale),
      maxHp: Math.floor(monster.maxHp * scale),
      attack: Math.floor(monster.attack * scale),
      defense: Math.floor(monster.defense * scale),
      goldDrop: Math.floor(monster.goldDrop * scale),
      expDrop: Math.floor(monster.expDrop * scale),
    };
  }

  function calculateDamage(atk: number, def: number): number {
    const baseDamage = atk - def / 2;
    const variance = Math.random() * 0.4 + 0.8;
    return Math.max(1, Math.floor(baseDamage * variance));
  }

  function checkLevelUp(player: Player): boolean {
    const expNeeded = player.level * 50;
    if (player.exp >= expNeeded) {
      player.level++;
      player.exp -= expNeeded;
      player.maxHp += 20;
      player.hp = player.maxHp;
      player.attack += 3;
      player.defense += 1;
      return true;
    }
    return false;
  }

  function getBar(current: number, max: number): string {
    const filled = Math.round((current / max) * 10);
    return '█'.repeat(filled) + '░'.repeat(10 - filled);
  }

  const plugin: PluginWithState = {
    name: 'text-rpg',
    description: 'A text-based RPG game',
    version: '1.0.0',
    commands: {
      '/rpg': (args, ctx) => {
        const sub = args[0];
        const player = getPlayer(ctx.user.id, ctx.user.nick);

        if (!sub) {
          ctx.broadcast(`
🎮 TEXT RPG 명령어:
  /rpg start - 게임 시작
  /rpg status - 상태 보기
  /rpg hunt - 몬스터 사냥
  /rpg attack - 공격
  /rpg run - 도망
  /rpg heal - 회복
  /rpg shop - 상점
  /rpg buy <item> - 구매
`);
          return;
        }

        switch (sub) {
          case 'start':
            dungeonLevels.set(ctx.user.id, 1);
            ctx.broadcast(`⚔️ ${ctx.user.nick} 모험 시작! HP:${player.hp} ATK:${player.attack} DEF:${player.defense} 💰${player.gold}`);
            break;

          case 'status':
            ctx.broadcast(`📊 ${player.name} Lv.${player.level} HP:${player.hp}/${player.maxHp} ATK:${player.attack} DEF:${player.defense} 💰${player.gold} EXP:${player.exp}/${player.level * 50}`);
            break;

          case 'hunt': {
            if (battles.has(ctx.user.id)) {
              ctx.broadcast(`❌ 이미 전투 중!`);
              return;
            }
            if (player.hp <= 0) {
              ctx.broadcast(`💀 쓰러져 있음. /rpg heal`);
              return;
            }
            const lvl = dungeonLevels.get(ctx.user.id) || 1;
            const mon = spawnMonster(lvl);
            battles.set(ctx.user.id, mon);
            ctx.broadcast(`⚔️ ${mon.name} 등장! HP:${mon.hp} ATK:${mon.attack} - /rpg attack or /rpg run`);
            break;
          }

          case 'attack': {
            const mon = battles.get(ctx.user.id);
            if (!mon) {
              ctx.broadcast(`❌ 전투 중 아님`);
              return;
            }
            const dmg = calculateDamage(player.attack, mon.defense);
            mon.hp -= dmg;
            let msg = `⚔️ ${dmg} 데미지! `;

            if (mon.hp <= 0) {
              player.gold += mon.goldDrop;
              player.exp += mon.expDrop;
              battles.delete(ctx.user.id);
              msg += `🎉 처치! +${mon.goldDrop}💰 +${mon.expDrop}exp`;
              if (checkLevelUp(player)) msg += ` 🎊 레벨업! Lv.${player.level}`;
            } else {
              const monDmg = calculateDamage(mon.attack, player.defense);
              player.hp -= monDmg;
              msg += `반격 ${monDmg}! HP:${player.hp}/${player.maxHp} vs ${mon.name}:${mon.hp}`;
              if (player.hp <= 0) {
                player.hp = 0;
                player.gold = Math.floor(player.gold * 0.5);
                battles.delete(ctx.user.id);
                msg += ` 💀 사망...`;
              }
            }
            ctx.broadcast(msg);
            break;
          }

          case 'run': {
            const mon = battles.get(ctx.user.id);
            if (!mon) {
              ctx.broadcast(`❌ 전투 중 아님`);
              return;
            }
            if (Math.random() < 0.7) {
              battles.delete(ctx.user.id);
              ctx.broadcast(`🏃 도망 성공!`);
            } else {
              const dmg = calculateDamage(mon.attack, player.defense);
              player.hp -= dmg;
              ctx.broadcast(`❌ 도망 실패! ${dmg} 데미지! HP:${player.hp}`);
              if (player.hp <= 0) {
                player.hp = 0;
                player.gold = Math.floor(player.gold * 0.5);
                battles.delete(ctx.user.id);
              }
            }
            break;
          }

          case 'heal': {
            if (battles.has(ctx.user.id)) {
              const idx = player.inventory.indexOf('potion');
              if (idx === -1) {
                ctx.broadcast(`❌ 포션 없음!`);
                return;
              }
              player.inventory.splice(idx, 1);
              player.hp = Math.min(player.hp + 30, player.maxHp);
            } else {
              player.hp = Math.min(player.hp + Math.floor(player.maxHp * 0.3), player.maxHp);
            }
            ctx.broadcast(`🧪 회복! HP:${player.hp}/${player.maxHp}`);
            break;
          }

          case 'shop':
            ctx.broadcast(`🏪 상점 (💰${player.gold}): potion(20), sword(50), shield(40), elixir(80) - /rpg buy <item>`);
            break;

          case 'buy': {
            const item = args[1]?.toLowerCase();
            if (!item || !ITEMS[item]) {
              ctx.broadcast(`❌ 없는 아이템`);
              return;
            }
            const it = ITEMS[item];
            if (player.gold < it.price) {
              ctx.broadcast(`❌ 골드 부족`);
              return;
            }
            player.gold -= it.price;
            if (it.effect.startsWith('hp+')) {
              player.hp = Math.min(player.hp + parseInt(it.effect.slice(3)), player.maxHp);
            } else if (it.effect.startsWith('attack+')) {
              player.attack += parseInt(it.effect.slice(7));
            } else if (it.effect.startsWith('defense+')) {
              player.defense += parseInt(it.effect.slice(8));
            } else {
              player.inventory.push(item);
            }
            ctx.broadcast(`✅ ${it.name} 구매!`);
            break;
          }

          default:
            ctx.broadcast(`❓ 알 수 없는 명령. /rpg 로 도움말`);
        }
      },
    },
    // 상태 저장 - 방 저장 시 호출됨
    getState: () => {
      return {
        players: Object.fromEntries(players),
        dungeonLevels: Object.fromEntries(dungeonLevels),
        // battles는 저장하지 않음 (진행 중인 전투는 복원 안 함)
      };
    },
    // 상태 복원 - 방 복원 시 호출됨
    setState: (state: unknown) => {
      const s = state as { players?: Record<string, Player>; dungeonLevels?: Record<string, number> };
      if (s.players) {
        players.clear();
        for (const [key, value] of Object.entries(s.players)) {
          players.set(key, value);
        }
      }
      if (s.dungeonLevels) {
        dungeonLevels.clear();
        for (const [key, value] of Object.entries(s.dungeonLevels)) {
          dungeonLevels.set(key, value);
        }
      }
      // battles는 초기화 (진행 중이던 전투는 리셋)
      battles.clear();
    },
  };

  return plugin;
}

export class PluginManager {
  private loader: PluginLoader;
  private builtinPlugins: Plugin[] = [dicePlugin, utilPlugin, helpPlugin, textRpgPlugin];
  private plugins: Plugin[] = [];

  constructor(pluginsDir?: string) {
    this.loader = new PluginLoader(pluginsDir);
  }

  async loadBuiltinPlugins(): Promise<void> {
    this.plugins = [...this.builtinPlugins];
  }

  async loadExternalPlugins(): Promise<void> {
    const external = await this.loader.loadAllPlugins();
    for (const plugin of external) {
      this.plugins.push(plugin);
      // onLoad 콜백은 컨텍스트가 필요하므로 나중에 호출됨
    }
  }

  getPlugins(): Plugin[] {
    return this.plugins;
  }

  getCommandPlugin(command: string): Plugin | undefined {
    return this.plugins.find((p) => command in p.commands);
  }

  executeCommand(command: string, args: string[], ctx: PluginContext): boolean {
    for (const plugin of this.plugins) {
      if (command in plugin.commands) {
        try {
          plugin.commands[command](args, ctx);
          return true;
        } catch (error) {
          console.error(`Error executing command ${command}:`, error);
          return false;
        }
      }
    }
    return false;
  }

  registerPlugin(plugin: Plugin, ctx?: PluginContext): void {
    this.plugins.push(plugin);
    if (plugin.onLoad && ctx) {
      try {
        plugin.onLoad(ctx);
      } catch (error) {
        console.error(`Error in plugin ${plugin.name} onLoad:`, error);
      }
    }
  }

  /**
   * 모든 플러그인의 onLoad 콜백을 호출합니다.
   * 플러그인 컨텍스트가 준비된 후 호출해야 합니다.
   */
  initializePlugins(ctx: PluginContext): void {
    for (const plugin of this.plugins) {
      if (plugin.onLoad) {
        try {
          plugin.onLoad(ctx);
        } catch (error) {
          console.error(`Error in plugin ${plugin.name} onLoad:`, error);
        }
      }
    }
  }

  /**
   * 모든 플러그인을 언로드합니다.
   * 플러그인의 onUnload 콜백을 호출합니다.
   */
  unloadAllPlugins(): void {
    for (const plugin of this.plugins) {
      if (plugin.onUnload) {
        try {
          plugin.onUnload();
        } catch (error) {
          console.error(`Error in plugin ${plugin.name} onUnload:`, error);
        }
      }
    }
    this.plugins = [];
  }

  /**
   * 특정 플러그인의 상태를 가져옵니다.
   */
  getPluginState(pluginName: string): unknown | null {
    const plugin = this.plugins.find((p) => p.name === pluginName) as PluginWithState | undefined;
    if (plugin && typeof plugin.getState === 'function') {
      return plugin.getState();
    }
    return null;
  }

  /**
   * 특정 플러그인의 상태를 설정합니다.
   */
  setPluginState(pluginName: string, state: unknown): boolean {
    const plugin = this.plugins.find((p) => p.name === pluginName) as PluginWithState | undefined;
    if (plugin && typeof plugin.setState === 'function') {
      plugin.setState(state);
      return true;
    }
    return false;
  }

  /**
   * 모든 플러그인의 상태를 가져옵니다.
   * 상태 저장을 지원하는 플러그인만 포함됩니다.
   */
  getAllPluginStates(): Record<string, unknown> {
    const states: Record<string, unknown> = {};
    for (const plugin of this.plugins) {
      const p = plugin as PluginWithState;
      if (typeof p.getState === 'function') {
        const state = p.getState();
        if (state !== null && state !== undefined) {
          states[plugin.name] = state;
        }
      }
    }
    return states;
  }

  /**
   * 저장된 상태를 모든 플러그인에 복원합니다.
   */
  restoreAllPluginStates(states: Record<string, unknown>): void {
    for (const [pluginName, state] of Object.entries(states)) {
      this.setPluginState(pluginName, state);
    }
  }
}

export { createPlugin } from './api';
export { PluginLoader } from './loader';
