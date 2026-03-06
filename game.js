// ====== 던전의 망자들 - Buriedbornes 스타일 턴제 로그라이크 ======

// === 데이터 ===
const JOBS = [
  {
    id: "warrior", name: "전사", emoji: "🗡️",
    hp: 120, atk: 15, def: 8, cost: 0,
    skills: [
      { name: "강타", desc: "강력한 일격", type: "attack", power: 1.5, maxCooldown: 0 },
      { name: "방어", desc: "방어 태세", type: "defend", power: 2, maxCooldown: 0 },
      { name: "돌진", desc: "전력 돌진", type: "attack", power: 2.0, maxCooldown: 3 }
    ]
  },
  {
    id: "mage", name: "마법사", emoji: "🔮",
    hp: 80, atk: 22, def: 4, cost: 50,
    skills: [
      { name: "화염구", desc: "불꽃 마법", type: "attack", power: 1.8, maxCooldown: 0 },
      { name: "마나실드", desc: "마법 방어막", type: "defend", power: 3, maxCooldown: 2 },
      { name: "번개", desc: "천둥 마법", type: "attack", power: 2.5, maxCooldown: 4 }
    ]
  },
  {
    id: "cleric", name: "성직자", emoji: "✝️",
    hp: 100, atk: 12, def: 6, cost: 100,
    skills: [
      { name: "신성타격", desc: "성스러운 일격", type: "attack", power: 1.3, maxCooldown: 0 },
      { name: "치유", desc: "HP 30% 회복", type: "heal", power: 0.3, maxCooldown: 3 },
      { name: "축복", desc: "3턴 공격력 증가", type: "buff", power: 1.5, maxCooldown: 5 }
    ]
  }
];

const MONSTERS = {
  tier1: [
    { name: "슬라임", emoji: "🟢", hp: 40, atk: 8, def: 2 },
    { name: "박쥐", emoji: "🦇", hp: 30, atk: 12, def: 1 },
    { name: "고블린", emoji: "👺", hp: 50, atk: 10, def: 4 }
  ],
  tier2: [
    { name: "해골전사", emoji: "💀", hp: 80, atk: 16, def: 8 },
    { name: "오크", emoji: "🐗", hp: 100, atk: 14, def: 6 },
    { name: "다크메이지", emoji: "🧙", hp: 60, atk: 22, def: 3 }
  ],
  tier3: [
    { name: "미노타우르스", emoji: "🐂", hp: 140, atk: 20, def: 10 },
    { name: "뱀파이어", emoji: "🧛", hp: 110, atk: 24, def: 7 },
    { name: "리치", emoji: "☠️", hp: 90, atk: 28, def: 5 }
  ],
  boss: [
    { name: "드래곤", emoji: "🐉", hp: 300, atk: 30, def: 15 }
  ]
};

const WEAPONS = [
  { name: "녹슨 검", bonus: 3 },
  { name: "강철 검", bonus: 6 },
  { name: "마법 검", bonus: 10 }
];

const ARMORS = [
  { name: "가죽 갑옷", bonus: 3 },
  { name: "사슬 갑옷", bonus: 6 },
  { name: "판금 갑옷", bonus: 10 }
];

const EVENTS = [
  {
    title: "🔮 수상한 제단",
    desc: "어둠 속에서 빛나는 제단이 보인다...",
    optionA: "피를 바치다 (HP -20%, 공격력 +5)",
    optionB: "무시하고 지나간다",
    doA(g) { g.player.hp -= Math.floor(g.player.maxHp * 0.2); g.player.bonusAtk += 5; return "피를 바쳐 공격력이 5 증가했다!"; },
    doB(g) { return "제단을 무시하고 지나갔다."; }
  },
  {
    title: "🧳 떠돌이 상인",
    desc: "\"좋은 물건 있어요~\" 상인이 포션을 보여준다.",
    optionA: "포션 구매 (💎 10)",
    optionB: "무시한다",
    doA(g) { if (g.save.soulstones >= 10 && g.player.potions < 3) { g.save.soulstones -= 10; g.player.potions++; saveMeta(g.save); return "포션을 구매했다! (💎 -10)"; } return g.player.potions >= 3 ? "포션이 이미 가득 찼다." : "소울스톤이 부족하다."; },
    doB(g) { return "상인을 지나쳤다."; }
  },
  {
    title: "⚙️ 고대의 함정",
    desc: "정교한 장치가 보인다. 해제하면 보물이?",
    optionA: "해제 시도 (50% 보물 / 50% 데미지)",
    optionB: "우회한다",
    doA(g) { if (Math.random() < 0.5) { g.player.potions = Math.min(3, g.player.potions + 1); return "함정을 해제하고 포션을 발견했다!"; } else { const dmg = Math.floor(g.player.maxHp * 0.15); g.player.hp -= dmg; return `함정이 작동하여 ${dmg} 데미지를 받았다!`; } },
    doB(g) { return "안전하게 우회했다."; }
  },
  {
    title: "🩹 부상당한 모험가",
    desc: "쓰러진 모험가가 도움을 요청한다.",
    optionA: "포션을 준다 (💎 +20)",
    optionB: "무시한다",
    doA(g) { if (g.player.potions > 0) { g.player.potions--; g.save.soulstones += 20; g.runSoulstones += 20; saveMeta(g.save); return "포션을 건네주자 감사의 표시로 소울스톤 20개를 받았다!"; } return "줄 포션이 없다..."; },
    doB(g) { return "모험가를 지나쳤다."; }
  },
  {
    title: "✨ 신비한 샘",
    desc: "맑은 물이 빛나고 있다.",
    optionA: "마신다 (50% 전회복 / 50% 독)",
    optionB: "무시한다",
    doA(g) { if (Math.random() < 0.5) { g.player.hp = g.player.maxHp; return "신비한 힘으로 HP가 완전 회복되었다!"; } else { const dmg = Math.floor(g.player.maxHp * 0.25); g.player.hp -= dmg; return `독이었다! ${dmg} 데미지를 받았다!`; } },
    doB(g) { return "샘을 지나쳤다."; }
  }
];

// === 저장 ===
function loadMeta() {
  try { return JSON.parse(localStorage.getItem("dungeonSave")) || { soulstones: 0, unlockedJobs: ["warrior"] }; }
  catch(e) { return { soulstones: 0, unlockedJobs: ["warrior"] }; }
}
function saveMeta(data) { localStorage.setItem("dungeonSave", JSON.stringify(data)); }

// === 유틸 ===
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function calcDamage(atk, power, def) { return Math.max(1, Math.floor(atk * power * (0.9 + Math.random() * 0.2) - def * 0.5)); }

// === 게임 상태 ===
const G = {
  state: "title",
  save: loadMeta(),
  player: null,
  enemy: null,
  floor: 1,
  room: 1,
  totalRooms: 0,
  roomType: "",
  log: [],
  skills: [],
  runSoulstones: 0,
  currentEvent: null,
  eventResult: null,
  lootItem: null,
  roomCleared: false
};

// === 렌더링 ===
function render() {
  const app = document.getElementById("app");
  switch(G.state) {
    case "title": app.innerHTML = renderTitle(); break;
    case "jobSelect": app.innerHTML = renderJobSelect(); break;
    case "dungeon": app.innerHTML = renderDungeon(); break;
    case "combat": app.innerHTML = renderCombat(); break;
    case "treasure": app.innerHTML = renderTreasure(); break;
    case "trap": app.innerHTML = renderTrap(); break;
    case "rest": app.innerHTML = renderRest(); break;
    case "event": app.innerHTML = renderEvent(); break;
    case "loot": app.innerHTML = renderLoot(); break;
    case "gameOver": app.innerHTML = renderGameOver(); break;
    case "victory": app.innerHTML = renderVictory(); break;
  }
}

function renderTitle() {
  return `
    <div class="card text-center">
      <div class="title">⚰️ 던전의 망자들</div>
      <div class="subtitle">턴제 로그라이크 던전 크롤러</div>
      <div class="soulstone mb-8">💎 소울스톤: ${G.save.soulstones}개</div>
      <button class="btn btn-primary" onclick="startJobSelect()">⚔️ 던전 입장</button>
    </div>`;
}

function renderJobSelect() {
  let html = `<div class="card"><div class="floor-info">직업 선택</div>`;
  JOBS.forEach(job => {
    const unlocked = G.save.unlockedJobs.includes(job.id);
    if (unlocked) {
      html += `<div class="job-card" onclick="selectJob('${job.id}')">
        <div style="font-size:1.2em;font-weight:bold;">${job.emoji} ${job.name}</div>
        <div class="stat-row"><span class="stat-label">HP</span><span>${job.hp}</span></div>
        <div class="stat-row"><span class="stat-label">공격</span><span>${job.atk}</span></div>
        <div class="stat-row"><span class="stat-label">방어</span><span>${job.def}</span></div>
        <div style="font-size:0.8em;color:#888;margin-top:4px;">스킬: ${job.skills.map(s=>s.name).join(", ")}</div>
      </div>`;
    } else {
      html += `<div class="job-card locked">
        <div style="font-size:1.2em;">${job.emoji} ${job.name} 🔒</div>
        <button class="btn btn-secondary mt-8" onclick="unlockJob('${job.id}')" ${G.save.soulstones < job.cost ? 'disabled' : ''}>
          🔓 해금 (💎 ${job.cost})
        </button>
      </div>`;
    }
  });
  html += `<button class="btn btn-secondary mt-8" onclick="goTitle()">← 돌아가기</button></div>`;
  return html;
}

function renderCombat() {
  const p = G.player, e = G.enemy;
  const pHpPct = Math.max(0, Math.floor(p.hp / p.maxHp * 100));
  const eHpPct = Math.max(0, Math.floor(e.hp / e.maxHp * 100));
  let skillBtns = G.skills.map((s, i) => {
    const cd = s.cooldown > 0;
    const cdText = cd ? `<span class="cooldown-badge">${s.cooldown}턴</span>` : '';
    return `<button class="btn btn-skill" onclick="useSkill(${i})" ${cd ? 'disabled' : ''}>
      ${s.name} ${cdText}<br><span style="font-size:0.8em;color:#888;">${s.desc}</span>
    </button>`;
  }).join('');
  let potionBtn = p.potions > 0 ? `<button class="btn btn-success" onclick="usePotion()">🧪 포션 사용 (${p.potions}개)</button>` : '';

  return `
    <div class="card">
      <div class="floor-info">⚔️ ${G.floor}층 - 방 ${G.room}/${G.totalRooms}</div>
      <div class="enemy-display">${e.emoji}</div>
      <div class="text-center mb-8" style="font-size:1.2em;font-weight:bold;">${e.name}</div>
      <div class="stat-row"><span class="stat-label">적 HP</span><span>${e.hp}/${e.maxHp}</span></div>
      <div class="hp-bar-bg"><div class="hp-bar hp-bar-enemy" style="width:${eHpPct}%"></div><div class="hp-text">${e.hp}/${e.maxHp}</div></div>
      <hr class="divider">
      <div class="stat-row"><span class="stat-label">${p.jobEmoji} ${p.jobName}</span><span>ATK ${p.atk + p.bonusAtk + p.weaponBonus} / DEF ${p.def + p.armorBonus}</span></div>
      <div class="stat-row"><span class="stat-label">HP</span><span>${p.hp}/${p.maxHp}</span></div>
      <div class="hp-bar-bg"><div class="hp-bar hp-bar-player" style="width:${pHpPct}%"></div><div class="hp-text">${p.hp}/${p.maxHp}</div></div>
      ${p.weapon ? `<div class="equip-info">🗡️ ${p.weapon.name} (+${p.weapon.bonus})</div>` : ''}
      ${p.armor ? `<div class="equip-info">🛡️ ${p.armor.name} (+${p.armor.bonus})</div>` : ''}
      ${p.buffTurns > 0 ? `<div class="equip-info text-gold">✨ 축복 ${p.buffTurns}턴 (공격 x${p.buffPower})</div>` : ''}
    </div>
    <div class="card">
      ${skillBtns}
      ${potionBtn}
    </div>
    <div class="card">
      <div class="log">${G.log.slice(-5).map(l => `<div class="log-line">${l}</div>`).join('')}</div>
    </div>`;
}

function renderDungeon() {
  return `
    <div class="card text-center">
      <div class="floor-info">🏰 ${G.floor}층 - 방 ${G.room}/${G.totalRooms}</div>
      <div class="subtitle">다음 방을 탐색하시겠습니까?</div>
      <div class="stat-row"><span class="stat-label">HP</span><span>${G.player.hp}/${G.player.maxHp}</span></div>
      <div class="hp-bar-bg"><div class="hp-bar hp-bar-player" style="width:${Math.floor(G.player.hp/G.player.maxHp*100)}%"></div></div>
      <div class="stat-row"><span class="stat-label">💎 소울스톤</span><span class="soulstone">${G.save.soulstones} (+${G.runSoulstones})</span></div>
      <div class="stat-row"><span class="stat-label">🧪 포션</span><span>${G.player.potions}/3</span></div>
      <button class="btn btn-primary mt-8" onclick="enterRoom()">다음 방으로 ➡️</button>
    </div>`;
}

function renderTreasure() {
  return `
    <div class="card text-center">
      <div class="floor-info">🎁 보물방!</div>
      <div style="font-size:3em;margin:20px;">🎁</div>
      <div class="mb-8">${G.eventResult || "보물을 발견했다!"}</div>
      <button class="btn btn-primary" onclick="nextRoom()">계속 진행 ➡️</button>
    </div>`;
}

function renderTrap() {
  return `
    <div class="card text-center">
      <div class="floor-info">⚠️ 함정!</div>
      <div style="font-size:3em;margin:20px;">⚠️</div>
      <div class="mb-8 text-red">${G.eventResult || ""}</div>
      <div class="stat-row"><span class="stat-label">HP</span><span>${G.player.hp}/${G.player.maxHp}</span></div>
      <div class="hp-bar-bg"><div class="hp-bar hp-bar-player" style="width:${Math.floor(G.player.hp/G.player.maxHp*100)}%"></div></div>
      <button class="btn btn-primary mt-8" onclick="nextRoom()">계속 진행 ➡️</button>
    </div>`;
}

function renderRest() {
  return `
    <div class="card text-center">
      <div class="floor-info">🏕️ 휴식처</div>
      <div style="font-size:3em;margin:20px;">🏕️</div>
      <div class="mb-8 text-green">${G.eventResult || ""}</div>
      <div class="stat-row"><span class="stat-label">HP</span><span>${G.player.hp}/${G.player.maxHp}</span></div>
      <div class="hp-bar-bg"><div class="hp-bar hp-bar-player" style="width:${Math.floor(G.player.hp/G.player.maxHp*100)}%"></div></div>
      <button class="btn btn-primary mt-8" onclick="nextRoom()">계속 진행 ➡️</button>
    </div>`;
}

function renderEvent() {
  const ev = G.currentEvent;
  if (G.eventResult) {
    return `
      <div class="card text-center">
        <div class="floor-info">${ev.title}</div>
        <div class="mb-8">${G.eventResult}</div>
        <div class="stat-row"><span class="stat-label">HP</span><span>${G.player.hp}/${G.player.maxHp}</span></div>
        <button class="btn btn-primary mt-8" onclick="nextRoom()">계속 진행 ➡️</button>
      </div>`;
  }
  return `
    <div class="card">
      <div class="floor-info">${ev.title}</div>
      <div class="event-card">${ev.desc}</div>
      <button class="btn btn-primary" onclick="eventChoice('A')">${ev.optionA}</button>
      <button class="btn btn-secondary" onclick="eventChoice('B')">${ev.optionB}</button>
    </div>`;
}

function renderLoot() {
  const item = G.lootItem;
  if (!item) { nextRoom(); return ''; }
  const isWeapon = item.type === "weapon";
  const current = isWeapon ? G.player.weapon : G.player.armor;
  return `
    <div class="card text-center">
      <div class="floor-info">${isWeapon ? '🗡️' : '🛡️'} 장비 발견!</div>
      <div style="font-size:1.2em;margin:10px;">${item.name} (+${item.bonus})</div>
      ${current ? `<div style="color:#888;">현재: ${current.name} (+${current.bonus})</div>` : '<div style="color:#888;">현재: 없음</div>'}
      <button class="btn btn-primary mt-8" onclick="equipItem(true)">장착하기</button>
      <button class="btn btn-secondary" onclick="equipItem(false)">버리기</button>
    </div>`;
}

function renderGameOver() {
  return `
    <div class="card text-center">
      <div class="title">💀 사망</div>
      <div class="subtitle">${G.floor}층에서 쓰러졌다...</div>
      <div class="soulstone mb-8">이번 탐색에서 획득한 💎: ${G.runSoulstones}개</div>
      <div class="soulstone mb-8">총 보유 💎: ${G.save.soulstones}개</div>
      <button class="btn btn-danger" onclick="goTitle()">타이틀로 돌아가기</button>
    </div>`;
}

function renderVictory() {
  return `
    <div class="card text-center">
      <div class="title">🏆 축하합니다!</div>
      <div class="subtitle">던전을 정복했다!</div>
      <div class="soulstone mb-8">이번 탐색에서 획득한 💎: ${G.runSoulstones}개</div>
      <div class="soulstone mb-8">총 보유 💎: ${G.save.soulstones}개</div>
      <button class="btn btn-success" onclick="goTitle()">타이틀로 돌아가기</button>
    </div>`;
}

// === 게임 로직 ===
function goTitle() { G.state = "title"; G.save = loadMeta(); render(); }
function startJobSelect() { G.state = "jobSelect"; render(); }

function unlockJob(jobId) {
  const job = JOBS.find(j => j.id === jobId);
  if (!job || G.save.soulstones < job.cost) return;
  G.save.soulstones -= job.cost;
  G.save.unlockedJobs.push(jobId);
  saveMeta(G.save);
  render();
}

function selectJob(jobId) {
  const job = JOBS.find(j => j.id === jobId);
  if (!job) return;
  G.player = {
    jobId: job.id, jobName: job.name, jobEmoji: job.emoji,
    hp: job.hp, maxHp: job.hp, atk: job.atk, def: job.def,
    bonusAtk: 0, weapon: null, armor: null, weaponBonus: 0, armorBonus: 0,
    potions: 1, buffTurns: 0, buffPower: 1, defendMultiplier: 1
  };
  G.skills = job.skills.map(s => ({...s, cooldown: 0}));
  G.floor = 1;
  G.room = 0;
  G.totalRooms = rand(3, 5);
  G.log = [];
  G.runSoulstones = 0;
  G.state = "dungeon";
  render();
}

function getMonster(floor) {
  if (floor === 10) return {...pick(MONSTERS.boss), maxHp: MONSTERS.boss[0].hp};
  let tier;
  if (floor <= 3) tier = MONSTERS.tier1;
  else if (floor <= 6) tier = MONSTERS.tier2;
  else tier = MONSTERS.tier3;
  const m = pick(tier);
  return {...m, maxHp: m.hp};
}

function pickRoomType() {
  if (G.floor === 10 && G.room === G.totalRooms) return "combat";
  const r = Math.random();
  if (r < 0.50) return "combat";
  if (r < 0.65) return "treasure";
  if (r < 0.75) return "trap";
  if (r < 0.85) return "rest";
  return "event";
}

function enterRoom() {
  G.room++;
  G.roomCleared = false;
  G.eventResult = null;
  G.lootItem = null;
  const type = pickRoomType();
  G.roomType = type;

  if (type === "combat") {
    G.enemy = getMonster(G.floor);
    G.log = [`${G.enemy.emoji} ${G.enemy.name}이(가) 나타났다!`];
    G.player.defendMultiplier = 1;
    G.state = "combat";
  } else if (type === "treasure") {
    doTreasure();
    G.state = "treasure";
  } else if (type === "trap") {
    const dmg = Math.floor(G.player.maxHp * (0.1 + Math.random() * 0.1));
    G.player.hp -= dmg;
    G.eventResult = `함정에 걸려 ${dmg} 데미지를 받았다!`;
    if (G.player.hp <= 0) { G.player.hp = 0; G.state = "gameOver"; saveMeta(G.save); render(); return; }
    G.state = "trap";
  } else if (type === "rest") {
    const heal = Math.floor(G.player.maxHp * 0.2);
    G.player.hp = Math.min(G.player.maxHp, G.player.hp + heal);
    G.eventResult = `휴식하여 HP를 ${heal} 회복했다!`;
    G.state = "rest";
  } else if (type === "event") {
    G.currentEvent = pick(EVENTS);
    G.eventResult = null;
    G.state = "event";
  }
  render();
}

function doTreasure() {
  const r = Math.random();
  if (r < 0.4) {
    G.player.potions = Math.min(3, G.player.potions + 1);
    G.eventResult = "🧪 포션을 발견했다!";
  } else if (r < 0.7) {
    const tier = G.floor <= 3 ? 0 : G.floor <= 6 ? 1 : 2;
    const w = WEAPONS[tier];
    G.lootItem = { type: "weapon", name: w.name, bonus: w.bonus };
    G.state = "loot";
    return;
  } else {
    const tier = G.floor <= 3 ? 0 : G.floor <= 6 ? 1 : 2;
    const a = ARMORS[tier];
    G.lootItem = { type: "armor", name: a.name, bonus: a.bonus };
    G.state = "loot";
    return;
  }
}

function equipItem(equip) {
  if (equip && G.lootItem) {
    if (G.lootItem.type === "weapon") {
      G.player.weapon = { name: G.lootItem.name, bonus: G.lootItem.bonus };
      G.player.weaponBonus = G.lootItem.bonus;
    } else {
      G.player.armor = { name: G.lootItem.name, bonus: G.lootItem.bonus };
      G.player.armorBonus = G.lootItem.bonus;
    }
  }
  G.lootItem = null;
  nextRoom();
}

function eventChoice(choice) {
  const ev = G.currentEvent;
  if (choice === 'A') {
    G.eventResult = ev.doA(G);
  } else {
    G.eventResult = ev.doB(G);
  }
  if (G.player.hp <= 0) { G.player.hp = 0; G.state = "gameOver"; saveMeta(G.save); }
  render();
}

function nextRoom() {
  if (G.player.hp <= 0) { G.state = "gameOver"; saveMeta(G.save); render(); return; }
  if (G.room >= G.totalRooms) {
    const bonus = 10;
    G.save.soulstones += bonus;
    G.runSoulstones += bonus;
    saveMeta(G.save);
    if (G.floor >= 10) {
      G.save.soulstones += 100;
      G.runSoulstones += 100;
      saveMeta(G.save);
      G.state = "victory";
      render();
      return;
    }
    G.floor++;
    G.room = 0;
    G.totalRooms = rand(3, 5);
  }
  G.state = "dungeon";
  render();
}

function useSkill(idx) {
  const skill = G.skills[idx];
  if (skill.cooldown > 0) return;
  const p = G.player, e = G.enemy;
  p.defendMultiplier = 1;

  const totalAtk = p.atk + p.bonusAtk + p.weaponBonus;
  const buffMult = p.buffTurns > 0 ? p.buffPower : 1;
  const totalDef = p.def + p.armorBonus;

  if (skill.type === "attack") {
    const dmg = calcDamage(totalAtk * buffMult, skill.power, e.def);
    e.hp -= dmg;
    G.log.push(`⚔️ ${skill.name}! ${e.name}에게 ${dmg} 데미지!`);
  } else if (skill.type === "defend") {
    p.defendMultiplier = skill.power;
    G.log.push(`🛡️ ${skill.name}! 방어력 ${skill.power}배!`);
  } else if (skill.type === "heal") {
    const heal = Math.floor(p.maxHp * skill.power);
    p.hp = Math.min(p.maxHp, p.hp + heal);
    G.log.push(`💚 ${skill.name}! HP ${heal} 회복!`);
  } else if (skill.type === "buff") {
    p.buffTurns = 3;
    p.buffPower = skill.power;
    G.log.push(`✨ ${skill.name}! ${p.buffTurns}턴간 공격력 ${skill.power}배!`);
  }

  if (skill.maxCooldown > 0) skill.cooldown = skill.maxCooldown;

  // 적 사망 체크
  if (e.hp <= 0) {
    e.hp = 0;
    const ss = rand(2, 5);
    const bossBonus = G.floor === 10 ? 50 : 0;
    G.save.soulstones += ss + bossBonus;
    G.runSoulstones += ss + bossBonus;
    saveMeta(G.save);
    G.log.push(`🎉 ${e.name}을(를) 처치! 💎 +${ss + bossBonus}`);

    // 드롭 체크
    if (Math.random() < 0.3) {
      const isWeapon = Math.random() < 0.5;
      const tier = G.floor <= 3 ? 0 : G.floor <= 6 ? 1 : 2;
      if (isWeapon) {
        G.lootItem = { type: "weapon", name: WEAPONS[tier].name, bonus: WEAPONS[tier].bonus };
      } else {
        G.lootItem = { type: "armor", name: ARMORS[tier].name, bonus: ARMORS[tier].bonus };
      }
      G.state = "loot";
      render();
      return;
    }
    G.roomCleared = true;
    nextRoom();
    return;
  }

  // 적 턴
  enemyTurn();

  // 쿨다운 감소
  G.skills.forEach(s => { if (s.cooldown > 0) s.cooldown--; });
  if (p.buffTurns > 0) p.buffTurns--;

  // 플레이어 사망 체크
  if (p.hp <= 0) {
    p.hp = 0;
    G.log.push("💀 쓰러졌다...");
    G.state = "gameOver";
    saveMeta(G.save);
  }
  render();
}

function enemyTurn() {
  const e = G.enemy, p = G.player;
  const totalDef = (p.def + p.armorBonus) * p.defendMultiplier;
  const dmg = calcDamage(e.atk, 1, totalDef);
  p.hp -= dmg;
  G.log.push(`👊 ${e.name}의 공격! ${dmg} 데미지!`);
  p.defendMultiplier = 1;
}

function usePotion() {
  if (G.player.potions <= 0) return;
  G.player.potions--;
  const heal = 30;
  G.player.hp = Math.min(G.player.maxHp, G.player.hp + heal);
  G.log.push(`🧪 포션 사용! HP ${heal} 회복!`);

  // 적 턴
  enemyTurn();
  G.skills.forEach(s => { if (s.cooldown > 0) s.cooldown--; });
  if (G.player.buffTurns > 0) G.player.buffTurns--;

  if (G.player.hp <= 0) {
    G.player.hp = 0;
    G.state = "gameOver";
    saveMeta(G.save);
  }
  render();
}

// === 시작 ===
render();