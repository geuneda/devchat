import { Plugin, PluginContext } from '../../src/types';

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

interface GameState {
  players: Map<string, Player>;
  currentBattle: Map<string, Monster>;
  dungeonLevel: Map<string, number>;
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

// Game state (in-memory, will reset on restart)
const gameState: GameState = {
  players: new Map(),
  currentBattle: new Map(),
  dungeonLevel: new Map(),
};

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
  if (!gameState.players.has(userId)) {
    gameState.players.set(userId, createPlayer(name));
  }
  return gameState.players.get(userId)!;
}

function spawnMonster(dungeonLevel: number): Monster {
  const maxIndex = Math.min(dungeonLevel, MONSTERS.length - 1);
  const monster = MONSTERS[Math.floor(Math.random() * (maxIndex + 1))];
  // Scale monster with dungeon level
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

function calculateDamage(attacker: { attack: number }, defender: { defense: number }): number {
  const baseDamage = attacker.attack - defender.defense / 2;
  const variance = Math.random() * 0.4 + 0.8; // 0.8 - 1.2
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

function getStatusBar(current: number, max: number, length: number = 10): string {
  const filled = Math.round((current / max) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

const textRpgPlugin: Plugin = {
  name: 'text-rpg',
  description: 'A simple text-based RPG game',
  version: '1.0.0',
  commands: {
    '/rpg': (args, ctx) => {
      ctx.broadcast(`
🎮 === TEXT RPG === 🎮
채팅방에서 즐기는 미니 RPG!

명령어:
  /rpg         - 이 도움말
  /rpg start   - 게임 시작
  /rpg status  - 내 상태 보기
  /rpg hunt    - 몬스터 사냥
  /rpg attack  - 전투 중 공격
  /rpg run     - 전투에서 도망
  /rpg heal    - 포션 사용
  /rpg shop    - 상점 보기
  /rpg buy <item> - 아이템 구매
  /rpg dungeon - 던전 탐험
`);
    },

    '/rpg-start': (args, ctx) => {
      const player = getPlayer(ctx.user.id, ctx.user.nick);
      gameState.dungeonLevel.set(ctx.user.id, 1);
      ctx.broadcast(`
⚔️ ${ctx.user.nick}님이 모험을 시작했습니다!

${ctx.user.nick}의 초기 스탯:
  ❤️ HP: ${player.hp}/${player.maxHp}
  ⚔️ 공격력: ${player.attack}
  🛡️ 방어력: ${player.defense}
  💰 골드: ${player.gold}
  
/rpg hunt 로 몬스터를 사냥하세요!
`);
    },

    '/rpg-status': (args, ctx) => {
      const player = getPlayer(ctx.user.id, ctx.user.nick);
      const expNeeded = player.level * 50;
      
      ctx.broadcast(`
📊 ${player.name}의 상태
━━━━━━━━━━━━━━━━━━━━
  📈 레벨: ${player.level}
  ⭐ 경험치: ${player.exp}/${expNeeded}
  ❤️ HP: ${player.hp}/${player.maxHp} [${getStatusBar(player.hp, player.maxHp)}]
  ⚔️ 공격력: ${player.attack}
  🛡️ 방어력: ${player.defense}
  💰 골드: ${player.gold}
  🎒 인벤토리: ${player.inventory.map(i => ITEMS[i]?.name || i).join(', ') || '비어있음'}
`);
    },

    '/rpg-hunt': (args, ctx) => {
      const player = getPlayer(ctx.user.id, ctx.user.nick);
      
      if (gameState.currentBattle.has(ctx.user.id)) {
        ctx.broadcast(`❌ 이미 전투 중입니다! /rpg attack 또는 /rpg run`);
        return;
      }

      if (player.hp <= 0) {
        ctx.broadcast(`💀 ${player.name}은(는) 쓰러져 있습니다. 마을에서 회복하세요. (/rpg heal)`);
        return;
      }

      const dungeonLevel = gameState.dungeonLevel.get(ctx.user.id) || 1;
      const monster = spawnMonster(dungeonLevel);
      gameState.currentBattle.set(ctx.user.id, monster);

      ctx.broadcast(`
⚔️ ${monster.name}이(가) 나타났다!

${monster.name}
  ❤️ HP: ${monster.hp}/${monster.maxHp} [${getStatusBar(monster.hp, monster.maxHp)}]
  ⚔️ 공격력: ${monster.attack}
  🛡️ 방어력: ${monster.defense}

/rpg attack - 공격!
/rpg run - 도망!
`);
    },

    '/rpg-attack': (args, ctx) => {
      const player = getPlayer(ctx.user.id, ctx.user.nick);
      const monster = gameState.currentBattle.get(ctx.user.id);

      if (!monster) {
        ctx.broadcast(`❌ 전투 중이 아닙니다. /rpg hunt 로 몬스터를 찾으세요.`);
        return;
      }

      // Player attacks
      const playerDamage = calculateDamage(player, monster);
      monster.hp -= playerDamage;

      let result = `⚔️ ${player.name}의 공격! ${monster.name}에게 ${playerDamage} 데미지!\n`;

      if (monster.hp <= 0) {
        // Monster defeated
        player.gold += monster.goldDrop;
        player.exp += monster.expDrop;
        gameState.currentBattle.delete(ctx.user.id);

        result += `
🎉 ${monster.name}을(를) 처치했습니다!
  💰 +${monster.goldDrop} 골드
  ⭐ +${monster.expDrop} 경험치
`;

        if (checkLevelUp(player)) {
          result += `\n🎊 레벨 업! Lv.${player.level}이 되었습니다!\n`;
          result += `  ❤️ HP 회복 & 스탯 상승!`;
        }
      } else {
        // Monster counter-attacks
        const monsterDamage = calculateDamage(monster, player);
        player.hp -= monsterDamage;

        result += `\n🗡️ ${monster.name}의 반격! ${player.name}에게 ${monsterDamage} 데미지!\n`;
        result += `\n현재 상태:\n`;
        result += `  ${player.name}: ${player.hp}/${player.maxHp} [${getStatusBar(player.hp, player.maxHp)}]\n`;
        result += `  ${monster.name}: ${monster.hp}/${monster.maxHp} [${getStatusBar(monster.hp, monster.maxHp)}]`;

        if (player.hp <= 0) {
          result += `\n\n💀 ${player.name}이(가) 쓰러졌습니다...`;
          player.hp = 0;
          player.gold = Math.floor(player.gold * 0.5);
          gameState.currentBattle.delete(ctx.user.id);
          result += `\n💰 골드의 절반을 잃었습니다...`;
        }
      }

      ctx.broadcast(result);
    },

    '/rpg-run': (args, ctx) => {
      const player = getPlayer(ctx.user.id, ctx.user.nick);
      const monster = gameState.currentBattle.get(ctx.user.id);

      if (!monster) {
        ctx.broadcast(`❌ 전투 중이 아닙니다.`);
        return;
      }

      // 70% chance to escape
      if (Math.random() < 0.7) {
        gameState.currentBattle.delete(ctx.user.id);
        ctx.broadcast(`🏃 ${player.name}이(가) 도망쳤습니다!`);
      } else {
        const damage = calculateDamage(monster, player);
        player.hp -= damage;
        ctx.broadcast(`
❌ 도망 실패!
🗡️ ${monster.name}의 공격! ${damage} 데미지!
❤️ HP: ${player.hp}/${player.maxHp}
`);
        
        if (player.hp <= 0) {
          player.hp = 0;
          player.gold = Math.floor(player.gold * 0.5);
          gameState.currentBattle.delete(ctx.user.id);
          ctx.broadcast(`💀 ${player.name}이(가) 쓰러졌습니다...`);
        }
      }
    },

    '/rpg-heal': (args, ctx) => {
      const player = getPlayer(ctx.user.id, ctx.user.nick);

      if (gameState.currentBattle.has(ctx.user.id)) {
        // Use potion in battle
        const potionIndex = player.inventory.indexOf('potion');
        if (potionIndex === -1) {
          ctx.broadcast(`❌ 포션이 없습니다!`);
          return;
        }

        player.inventory.splice(potionIndex, 1);
        player.hp = Math.min(player.hp + 30, player.maxHp);
        ctx.broadcast(`🧪 포션 사용! HP +30\n❤️ HP: ${player.hp}/${player.maxHp}`);
      } else {
        // Rest at village (free but slow)
        const healAmount = Math.floor(player.maxHp * 0.3);
        player.hp = Math.min(player.hp + healAmount, player.maxHp);
        ctx.broadcast(`🏥 마을에서 휴식... HP +${healAmount}\n❤️ HP: ${player.hp}/${player.maxHp}`);
      }
    },

    '/rpg-shop': (args, ctx) => {
      const player = getPlayer(ctx.user.id, ctx.user.nick);
      
      let shopText = `
🏪 상점 (보유 골드: ${player.gold}💰)
━━━━━━━━━━━━━━━━━━━━
`;
      for (const [key, item] of Object.entries(ITEMS)) {
        shopText += `  ${key}: ${item.name} - ${item.price}💰 (${item.effect})\n`;
      }
      shopText += `\n/rpg buy <아이템명> 으로 구매`;
      
      ctx.broadcast(shopText);
    },

    '/rpg-buy': (args, ctx) => {
      const player = getPlayer(ctx.user.id, ctx.user.nick);
      const itemKey = args[0]?.toLowerCase();

      if (!itemKey || !ITEMS[itemKey]) {
        ctx.broadcast(`❌ 없는 아이템입니다. /rpg shop 으로 확인하세요.`);
        return;
      }

      const item = ITEMS[itemKey];
      if (player.gold < item.price) {
        ctx.broadcast(`❌ 골드가 부족합니다! (필요: ${item.price}, 보유: ${player.gold})`);
        return;
      }

      player.gold -= item.price;

      // Apply effect
      if (item.effect.startsWith('hp+')) {
        const amount = parseInt(item.effect.slice(3));
        player.hp = Math.min(player.hp + amount, player.maxHp);
        ctx.broadcast(`✅ ${item.name} 사용! HP +${amount}\n❤️ HP: ${player.hp}/${player.maxHp}`);
      } else if (item.effect.startsWith('attack+')) {
        const amount = parseInt(item.effect.slice(7));
        player.attack += amount;
        ctx.broadcast(`✅ ${item.name} 장착! 공격력 +${amount}\n⚔️ 공격력: ${player.attack}`);
      } else if (item.effect.startsWith('defense+')) {
        const amount = parseInt(item.effect.slice(8));
        player.defense += amount;
        ctx.broadcast(`✅ ${item.name} 장착! 방어력 +${amount}\n🛡️ 방어력: ${player.defense}`);
      } else {
        player.inventory.push(itemKey);
        ctx.broadcast(`✅ ${item.name} 구매! 인벤토리에 추가됨.`);
      }
    },

    '/rpg-dungeon': (args, ctx) => {
      const player = getPlayer(ctx.user.id, ctx.user.nick);
      let dungeonLevel = gameState.dungeonLevel.get(ctx.user.id) || 1;

      if (args[0] === 'up' && dungeonLevel < 6) {
        dungeonLevel++;
        gameState.dungeonLevel.set(ctx.user.id, dungeonLevel);
        ctx.broadcast(`
🏰 던전 ${dungeonLevel}층으로 내려갑니다...
⚠️ 몬스터가 더 강해집니다!
`);
      } else if (args[0] === 'down' && dungeonLevel > 1) {
        dungeonLevel--;
        gameState.dungeonLevel.set(ctx.user.id, dungeonLevel);
        ctx.broadcast(`🏰 던전 ${dungeonLevel}층으로 올라갑니다.`);
      } else {
        ctx.broadcast(`
🏰 현재 던전 ${dungeonLevel}층
━━━━━━━━━━━━━━━━━━━━
층이 깊을수록 강한 몬스터 등장!
1층: 슬라임
2층: + 고블린
3층: + 오크, 스켈레톤
4층: + 트롤
5층+: + 드래곤

/rpg dungeon up - 더 깊이 내려가기
/rpg dungeon down - 위로 올라가기
`);
      }
    },
  },
};

// Handle compound commands like "/rpg start" -> "/rpg-start"
const wrappedPlugin: Plugin = {
  ...textRpgPlugin,
  commands: {
    '/rpg': (args, ctx) => {
      if (args.length === 0) {
        textRpgPlugin.commands['/rpg'](args, ctx);
        return;
      }

      const subCommand = `/rpg-${args[0]}`;
      if (subCommand in textRpgPlugin.commands) {
        textRpgPlugin.commands[subCommand](args.slice(1), ctx);
      } else {
        textRpgPlugin.commands['/rpg']([], ctx);
      }
    },
  },
};

export default wrappedPlugin;
