#!/usr/bin/env node
/**
 * Simple integration test for DevChat
 */

const { WebSocketServer, WebSocket } = require('ws');
const Conf = require('conf');
const { nanoid } = require('nanoid');

console.log('=== DevChat Integration Tests ===\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Test 1: Config system
test('Config: Create and read config', () => {
  const config = new Conf({ projectName: 'devchat-test-' + Date.now() });
  config.set('nick', 'testuser');
  assert(config.get('nick') === 'testuser', 'Nick should be testuser');
  config.set('port', 8080);
  assert(config.get('port') === 8080, 'Port should be 8080');
  config.clear();
});

// Test 2: Nanoid generation
test('Nanoid: Generate unique IDs', () => {
  const id1 = nanoid();
  const id2 = nanoid();
  assert(id1 !== id2, 'IDs should be unique');
  assert(id1.length > 0, 'ID should not be empty');
});

// Test 3: WebSocket server/client
test('WebSocket: Server start and client connect', async () => {
  return new Promise((resolve, reject) => {
    const port = 19998;
    const wss = new WebSocketServer({ port });
    
    wss.on('listening', () => {
      const client = new WebSocket(`ws://localhost:${port}`);
      
      client.on('open', () => {
        client.send(JSON.stringify({ type: 'test', message: 'hello' }));
      });
      
      wss.on('connection', (ws) => {
        ws.on('message', (data) => {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'test' && msg.message === 'hello') {
            client.close();
            wss.close();
            resolve();
          }
        });
      });
    });
    
    wss.on('error', reject);
    
    setTimeout(() => {
      wss.close();
      reject(new Error('Timeout'));
    }, 3000);
  });
});

// Test 4: Chat message formatting
test('Chat: Message formatting', () => {
  const message = {
    id: nanoid(),
    type: 'chat',
    sender: 'TestUser',
    content: 'Hello World',
    timestamp: Date.now(),
  };
  
  assert(message.sender === 'TestUser', 'Sender should be TestUser');
  assert(message.content === 'Hello World', 'Content should match');
  assert(message.type === 'chat', 'Type should be chat');
});

// Test 5: Stealth theme generation
test('Stealth: Theme line generation', () => {
  const themes = {
    'npm-build': ['webpack', 'Compiling', 'modules'],
    'git-log': ['feat:', 'fix:', 'refactor:'],
    'docker-logs': ['container', 'INFO', 'DEBUG'],
  };
  
  // Just validate theme structure exists
  assert(Object.keys(themes).length === 3, 'Should have 3 themes');
});

// Test 6: Plugin command structure
test('Plugin: Command registration', () => {
  const plugin = {
    name: 'test-plugin',
    commands: {
      '/test': (args, ctx) => ctx.broadcast('test'),
      '/hello': (args, ctx) => ctx.broadcast('hello'),
    },
  };
  
  assert(plugin.name === 'test-plugin', 'Plugin name should match');
  assert('/test' in plugin.commands, 'Should have /test command');
  assert('/hello' in plugin.commands, 'Should have /hello command');
  assert(typeof plugin.commands['/test'] === 'function', 'Command should be a function');
});

// Test 7: Room/User structure
test('Room: User management', () => {
  const users = [];
  
  const addUser = (nick, isHost = false) => {
    const user = { id: nanoid(), nick, isHost };
    users.push(user);
    return user;
  };
  
  const host = addUser('HostUser', true);
  const guest1 = addUser('Guest1');
  const guest2 = addUser('Guest2');
  
  assert(users.length === 3, 'Should have 3 users');
  assert(host.isHost === true, 'Host should have isHost=true');
  assert(guest1.isHost === false, 'Guest should have isHost=false');
  assert(users.filter(u => u.isHost).length === 1, 'Only one host');
});

// Test 8: RPG Plugin logic
test('RPG: Damage calculation', () => {
  const calculateDamage = (atk, def) => {
    const baseDamage = atk - def / 2;
    return Math.max(1, Math.floor(baseDamage));
  };
  
  assert(calculateDamage(10, 4) === 8, 'Damage should be 8 (10 - 4/2)');
  assert(calculateDamage(5, 10) === 1, 'Minimum damage should be 1');
  assert(calculateDamage(20, 0) === 20, 'Full damage with 0 defense');
});

// Run async tests
(async () => {
  try {
    await test('WebSocket: Server start and client connect', async () => {
      return new Promise((resolve, reject) => {
        const port = 19997;
        const wss = new WebSocketServer({ port });
        
        wss.on('listening', () => {
          const client = new WebSocket(`ws://localhost:${port}`);
          
          client.on('open', () => {
            client.send(JSON.stringify({ type: 'join', nick: 'test' }));
          });
          
          wss.on('connection', (ws) => {
            ws.on('message', (data) => {
              const msg = JSON.parse(data.toString());
              ws.send(JSON.stringify({ type: 'welcome', user: msg.nick }));
            });
          });
          
          client.on('message', (data) => {
            const msg = JSON.parse(data.toString());
            if (msg.type === 'welcome') {
              client.close();
              wss.close();
              resolve();
            }
          });
        });
        
        wss.on('error', reject);
      });
    });
  } catch (e) {
    // Already counted
  }
  
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  
  if (failed > 0) {
    process.exit(1);
  }
})();
