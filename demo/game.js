// State Definitions
const GameState = {
  hp: 3,
  maxHp: 3,
  hpDrainRate: 0,
  inventory: [], // Array of item objects: { id, name }
  logs: [], // Array of log text strings
  currentRoom: 'bedroom',
  inventoryCheckpoints: { bedroom: [], bathroom: [] }
};

const RoomFlags = {
  bedroom: {
    stoodUp: false,
    alarmOff: false,
    windowClosed: false,
    wardrobeClosed: false,
    gotTowel: false,
    doorUnlocked: false,
    windowClosingState: false // Used for timing
  },
  bathroom: {
    soapPicked: false,
    pillTaken: false,
    dryerUnplugged: false,
    dryerStored: false,
    waterFilled: false,
    bathed: false,
    dried: false,
    waterDrained: false,
    gotKey: false,
    doorUnlocked: false
  }
};

let roomTimers = {
  bedroom: 0,
  bathroomSoap: 0
};

// Bathtub state
const bathtubState = {
  active: false,
  volume: 0,
  hotAmt: 0,
  coldAmt: 0,
  mode: 'close' // hot, cold, close
};

const RoomData = {
  bedroom: {
    objects: [
      { id: 'bed', name: 'เตียงนอน', bounds: { left: 10, top: 60, width: 40, height: 30 } },
      { id: 'alarm', name: 'นาฬิกาปลุก', bounds: { left: 55, top: 55, width: 10, height: 10 } },
      { id: 'window', name: 'หน้าต่าง', bounds: { left: 40, top: 20, width: 20, height: 30 }, classes: 'swinging' },
      { id: 'wardrobe', name: 'ตู้เสื้อผ้า', bounds: { left: 70, top: 15, width: 20, height: 60 }, classes: 'heavy-shake' },
      { id: 'fan', name: 'พัดลมเพดาน (ลอดผ่าน)', bounds: { left: 30, top: 0, width: 40, height: 15 } },
      { id: 'door_bathroom', name: 'ประตูห้องน้ำ', bounds: { left: 5, top: 20, width: 15, height: 40 } },
      { id: 'door_hallway', name: 'ประตูออกโถง', bounds: { left: 85, top: 20, width: 15, height: 40 } }
    ],
    decorations: []
  },
  bathroom: {
    objects: [
      { id: 'soap', name: 'ขวดสบู่', bounds: { left: 20, top: 80, width: 10, height: 10 } },
      { id: 'cabinet', name: 'ตู้ยา', bounds: { left: 45, top: 15, width: 15, height: 20 } },
      { id: 'dryer', name: 'ไดร์เป่าผม (เสียบปลั๊ก)', bounds: { left: 60, top: 80, width: 15, height: 10 } },
      { id: 'bathtub', name: 'อ่างอาบน้ำ', bounds: { left: 65, top: 40, width: 30, height: 40 } },
      { id: 'door_back', name: 'กลับเข้าห้องนอน', bounds: { left: 5, top: 15, width: 15, height: 60 } }
    ],
    decorations: [
      { id: 'soap-spill', name: 'ฟองสบู่บนพื้น (กองเล็ก)', bounds: { left: 20, top: 90, width: 20, height: 10 } }
    ]
  }
};

// UI Elements
const els = {
  hpBar: document.getElementById('hp-bar'),
  scene: document.getElementById('scene'),
  interactiveLayer: document.getElementById('interactive-layer'),
  dialogueBox: document.getElementById('dialogue-box'),
  dialogueText: document.getElementById('dialogue-text'),
  dialogueBtn: document.getElementById('dialogue-close'),
  deathScreen: document.getElementById('death-screen'),
  deathReason: document.getElementById('death-reason'),
  restartBtn: document.getElementById('restart-btn'),
  winScreen: document.getElementById('win-screen'),
  logList: document.getElementById('log-list'),
  inventorySlots: document.querySelectorAll('.slot'),
  hintBtn: document.getElementById('hint-btn'),
  actionLogToggle: document.getElementById('toggle-action-log'),
  actionLogContainer: document.getElementById('action-log-container'),
  actionLogList: document.getElementById('action-log-list'),
  actionLogContent: document.getElementById('action-log-content'),
  pillUiContainer: document.getElementById('pill-ui-container'),
  pillOptions: document.getElementById('pill-options'),
  faucetUiContainer: document.getElementById('faucet-ui-container'),
  waterGaugeFill: document.getElementById('water-gauge-fill'),
  waterVolText: document.getElementById('water-volume-text'),
  waterTempText: document.getElementById('water-temp-text')
};

// --- Initialization ---

function init() {
  els.dialogueBtn.addEventListener('click', closeDialogue);
  els.restartBtn.addEventListener('click', restartRoom);
  
  els.hintBtn.addEventListener('click', () => {
    els.scene.classList.toggle('show-hints');
  });

  els.actionLogToggle.addEventListener('click', () => {
    els.actionLogContainer.classList.toggle('collapsed');
  });
  
  // Start window timing loop for bedroom
  setInterval(toggleWindowSwing, 1500); // Window "closes" every 1.5s
  
  // Start bathroom flicker loop
  setInterval(checkBathroomLight, 1000);
  
  renderHUD();
  loadRoom('bedroom');
}

// --- Status Updates ---

function renderHUD() {
  const hpFill = document.getElementById('hp-bar-fill');
  const hpText = document.getElementById('hp-text');
  
  if (hpFill && hpText) {
    const pct = Math.max(0, (GameState.hp / GameState.maxHp) * 100);
    hpFill.style.width = `${pct}%`;
    hpText.innerText = `${Math.max(0, GameState.hp).toFixed(2)} / ${GameState.maxHp}`;
  }
  
  if (GameState.hp <= 0 && els.deathScreen.classList.contains('hidden')) {
    die("คุณบาดเจ็บทนพิษบาดแผลไม่ไหว... สิ้นใจตาย");
  }
}

function takeDamage(reason, amount = 0.25) {
  GameState.hp -= amount;
  showDialogue(`ได้รับบาดเจ็บ: ${reason} (-${amount} HP)`);
  renderHUD();
}

// Continuous HP drain loop (10 ticks per second)
setInterval(() => {
  if (GameState.hp > 0 && GameState.hpDrainRate > 0) {
    GameState.hp -= (GameState.hpDrainRate / 10);
    if (GameState.hp < 0) GameState.hp = 0;
    renderHUD();
  }
}, 100);

function die(reason) {
  els.deathReason.innerText = reason;
  els.deathScreen.classList.remove('hidden');
}

function restartRoom() {
  els.deathScreen.classList.remove('hidden'); // Ensure we can remove it
  els.deathScreen.classList.add('hidden');
  
  // Reset just the current room states and restore inventory checkpoint
  if (GameState.currentRoom === 'bedroom') {
    RoomFlags.bedroom = { stoodUp: false, alarmOff: false, windowClosed: false, wardrobeClosed: false, gotTowel: false, doorUnlocked: false, windowClosingState: false };
    GameState.inventory = JSON.parse(JSON.stringify(GameState.inventoryCheckpoints.bedroom));
  } else {
    RoomFlags.bathroom = { soapPicked: false, pillTaken: false, dryerUnplugged: false, dryerStored: false, waterFilled: false, bathed: false, dried: false, waterDrained: false, gotKey: false, doorUnlocked: false };
    bathtubState.volume = 0; bathtubState.hotAmt = 0; bathtubState.coldAmt = 0; bathtubState.active = false; bathtubState.mode = 'close';
    closeFaucetUI();
    closePillUI();
    closeBathtubChoiceUI();
    GameState.inventory = JSON.parse(JSON.stringify(GameState.inventoryCheckpoints.bathroom));
  }
  
  GameState.hp = GameState.maxHp; // Restore HP
  GameState.hpDrainRate = 0; // Restore drain status
  roomTimers.bedroom = 0;
  roomTimers.bathroomSoap = 0;
  timeInBathroom = 0;
  
  renderInventory();
  renderHUD();
  
  // Log the restart cleanly
  const li = document.createElement('li');
  li.innerText = `[RESTART] เริ่มต้นห้อง ${GameState.currentRoom} ใหม่อีกครั้ง`;
  li.style.color = "yellow";
  els.actionLogList.appendChild(li);
  if(els.actionLogContent) els.actionLogContent.scrollTop = els.actionLogContent.scrollHeight;
  
  closeDialogue();
  loadRoom(GameState.currentRoom);
}

function addItem(id, name) {
  if (GameState.inventory.length >= 6) {
    showDialogue("กระเป๋าเต็ม!");
    return;
  }
  GameState.inventory.push({ id, name });
  renderInventory();
  showDialogue(`ได้รับไอเทม: ${name}`);
}

function hasItem(id) {
  return GameState.inventory.some(item => item.id === id);
}

function removeItem(id) {
  GameState.inventory = GameState.inventory.filter(item => item.id !== id);
  renderInventory();
}

function renderInventory() {
  els.inventorySlots.forEach((slot, index) => {
    if (GameState.inventory[index]) {
      slot.innerText = GameState.inventory[index].name;
      slot.classList.add('filled');
    } else {
      slot.innerText = '';
      slot.classList.remove('filled');
    }
  });
}

function addLog(text) {
  if (!GameState.logs.includes(text)) {
    GameState.logs.push(text);
    const li = document.createElement('li');
    li.innerText = text;
    els.logList.appendChild(li);
    els.logList.scrollTop = els.logList.scrollHeight; // auto scroll
  }
}

function addActionLog(text) {
  const li = document.createElement('li');
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  li.innerText = `[${time}] ${text}`;
  els.actionLogList.appendChild(li);
  if(els.actionLogContent) els.actionLogContent.scrollTop = els.actionLogContent.scrollHeight;
}

function showDialogue(text) {
  els.dialogueText.innerText = text;
  els.dialogueBox.classList.remove('hidden');
  els.dialogueBtn.classList.remove('hidden');
  addActionLog(text);
}

function closeDialogue() {
  els.dialogueBox.classList.add('hidden');
  els.dialogueBtn.classList.add('hidden');
}

// --- Room Rendering ---

function loadRoom(roomId) {
  GameState.currentRoom = roomId;
  els.scene.className = `room-${roomId}`;
  els.interactiveLayer.innerHTML = ''; // clear objects
  
  // Add dark overlay if light is flickering
  els.scene.classList.remove('flickering');
  if (roomId === 'bathroom' && !RoomFlags.bathroom.pillTaken) {
    els.scene.classList.add('flickering');
  }

  const room = RoomData[roomId];
  room.objects.forEach(obj => {
    const el = document.createElement('div');
    el.className = `interactive-object ${obj.classes || ''}`;
    el.id = `obj-${obj.id}`;
    el.innerText = obj.name;
    el.style.left = `${obj.bounds.left}%`;
    el.style.top = `${obj.bounds.top}%`;
    el.style.width = `${obj.bounds.width}%`;
    el.style.height = `${obj.bounds.height}%`;
    
    el.addEventListener('click', () => handleInteraction(roomId, obj.id, el));
    els.interactiveLayer.appendChild(el);
  });

  if (room.decorations) {
    room.decorations.forEach(deco => {
      const el = document.createElement('div');
      el.className = `non-interactive-object ${deco.classes || ''}`;
      el.id = `deco-${deco.id}`;
      el.innerText = deco.name;
      el.style.left = `${deco.bounds.left}%`;
      el.style.top = `${deco.bounds.top}%`;
      el.style.width = `${deco.bounds.width}%`;
      el.style.height = `${deco.bounds.height}%`;
      els.interactiveLayer.appendChild(el);
    });
  }
  
  // reset room timer
  if (roomId === 'bedroom') roomTimers.bedroom = 0;
  if (roomId === 'bathroom') roomTimers.bathroomSoap = 0;
  
  updateRoomVisuals(roomId);
}

function updateRoomVisuals(roomId) {
  const flags = RoomFlags[roomId];
  if (roomId === 'bedroom') {
    const windowEl = document.getElementById('obj-window');
    const wardrobeEl = document.getElementById('obj-wardrobe');
    const fanEl = document.getElementById('obj-fan');
    
    if (flags.windowClosed && windowEl) {
      windowEl.classList.remove('swinging', 'timing-safe', 'timing-unsafe');
      windowEl.innerText = 'หน้าต่าง (ปิดแล้ว)';
      windowEl.style.borderColor = 'transparent';
    }
    if (flags.windowClosed && fanEl) {
      fanEl.innerText = 'พัดลมเพดาน (หมุนเอื่อย ปลอดภัยแล้ว)';
    }
    if (flags.wardrobeClosed && wardrobeEl) {
      wardrobeEl.classList.remove('heavy-shake');
      wardrobeEl.classList.remove('light-shake');
      wardrobeEl.innerText = 'ตู้เสื้อผ้า (ปิดสนิท)';
    } else if (flags.windowClosed && wardrobeEl) {
      wardrobeEl.classList.remove('heavy-shake');
      wardrobeEl.classList.add('light-shake');
    }
    
    const doorBathEl = document.getElementById('obj-door_bathroom');
    if (flags.gotTowel && doorBathEl) {
      doorBathEl.innerText = 'ประตูห้องน้ำ (เปิดแง้มอยู่)';
    }
    
    const doorHallEl = document.getElementById('obj-door_hallway');
    if (hasItem('key') && doorHallEl) {
      doorHallEl.innerText = 'ประตูออกโถง (ปลดล็อคแล้ว)';
    }
  } else if (roomId === 'bathroom') {
    if (flags.pillTaken) {
      els.scene.classList.remove('flickering');
    }
    const dryerEl = document.getElementById('obj-dryer');
    if (flags.dryerUnplugged && dryerEl && !flags.dryerStored) {
      dryerEl.innerText = 'ไดร์เป่าผม (ถอดปลั๊กแล้ว)';
    } else if (flags.dryerStored && dryerEl) {
      dryerEl.style.display = 'none'; // Stored
    }
    const spillEl = document.getElementById('deco-soap-spill');
    if (flags.soapPicked && spillEl) {
       spillEl.innerText = 'พื้นห้องน้ำ (เช็ดสบู่แล้ว)';
       spillEl.className = 'non-interactive-object';
    }
    
    const bathtubEl = document.getElementById('obj-bathtub');
    if (flags.waterDrained && bathtubEl) {
        bathtubEl.innerText = 'อ่างอาบน้ำ (ระบายน้ำแล้ว มีกุญแจ)';
    } else if (flags.bathed && bathtubEl) {
        bathtubEl.innerText = 'อ่างอาบน้ำ (ลงแช่แล้ว)';
    } else if (flags.waterFilled && bathtubEl) {
        bathtubEl.innerText = 'อ่างอาบน้ำ (น้ำเต็มอ่าง)';
    }
  }
}

function toggleWindowSwing() {
  if (GameState.currentRoom === 'bedroom' && !RoomFlags.bedroom.windowClosed) {
    RoomFlags.bedroom.windowClosingState = !RoomFlags.bedroom.windowClosingState;
    const w = document.getElementById('obj-window');
    if (w) {
      if (RoomFlags.bedroom.windowClosingState) {
        w.classList.remove('timing-unsafe');
        w.classList.add('timing-safe');
        w.innerText = 'หน้าต่าง (คลิกปิดตอนนี้!)';
      } else {
        w.classList.remove('timing-safe');
        w.classList.add('timing-unsafe');
        w.innerText = 'หน้าต่าง (รอจังหวะ...)';
      }
    }
  }
}

// Light logic for bathroom
// Room Hazards Timer (Runs every second)
setInterval(() => {
  if (GameState.hp <= 0) return;

  if (GameState.currentRoom === 'bedroom' && !RoomFlags.bedroom.windowClosed) {
    roomTimers.bedroom++;
    const fanEl = document.getElementById('deco-fan');
    if (fanEl) {
      if (roomTimers.bedroom > 45) { 
         die("พัดลมเพดานหมุนส่ายอย่างรุนแรงจนใบพัดหลุดกระเด็นใส่คุณตายคาที่...");
      } else if (roomTimers.bedroom > 30) {
         fanEl.innerText = 'พัดลมเพดาน (สั่นแรงมาก อันตราย!)';
         fanEl.className = 'non-interactive-object danger-high';
      } else if (roomTimers.bedroom > 15) {
         fanEl.innerText = 'พัดลมเพดาน (ส่ายเริ่มแรงขึ้น)';
         fanEl.className = 'non-interactive-object danger-low';
      }
    }
  }

  if (GameState.currentRoom === 'bathroom' && !RoomFlags.bathroom.soapPicked) {
    roomTimers.bathroomSoap++;
    const spillEl = document.getElementById('deco-soap-spill');
    if (spillEl) {
      if (roomTimers.bathroomSoap > 25) { 
         spillEl.innerText = 'พื้นห้องน้ำ (สบู่ไหลลามเต็มพื้น อันตรายมาก!)';
         spillEl.className = 'non-interactive-object danger-high';
      } else if (roomTimers.bathroomSoap > 10) {
         spillEl.innerText = 'ฟองสบู่บนพื้น (เริ่มไหลลามกว้างขึ้น)';
         spillEl.className = 'non-interactive-object danger-low';
      }
    }
  }
}, 1000);

let timeInBathroom = 0;
function checkBathroomLight() {
  if (GameState.currentRoom === 'bathroom' && !RoomFlags.bathroom.pillTaken) {
    timeInBathroom++;
    // Time limit before panic starts damaging
    if (timeInBathroom > 15 && GameState.hpDrainRate === 0) {
      showDialogue("ไฟกะพริบถี่ทำให้คุณเริ่มหลอน! (บาดเจ็บต่อเนื่อง)");
      GameState.hpDrainRate = 0.1; // 1 unit per 10 seconds
    }
  } else if (GameState.currentRoom === 'bathroom' && RoomFlags.bathroom.pillTaken) {
      GameState.hpDrainRate = 0; // stop panic
  }
}

// Bathtub Interval Logic
setInterval(() => {
  if (GameState.hp <= 0 || !bathtubState.active) return;
  if (bathtubState.mode === 'close') return;

  // Add water
  bathtubState.volume += 10;
  if (bathtubState.mode === 'hot') {
     bathtubState.hotAmt += 10;
  } else if (bathtubState.mode === 'cold') {
     bathtubState.coldAmt += 10;
  }
  
  updateFaucetUI();

  if (bathtubState.volume > 100) {
      bathtubState.active = false;
      closeFaucetUI();
      if (!RoomFlags.bathroom.dryerUnplugged) {
          die("ปล่อยน้ำล้นอ่าง ท่วมพื้นไหลไปโดนไดร์เป่าผมที่เสียบปลั๊กอยู่ ไฟช็อตตายคาที่!");
      } else {
          die("ปล่อยน้ำล้นอ่าง ท่วมพื้นจำนวนมากจนคุณลื่นล้มหัวฟาดพื้นตาย!");
      }
  }
}, 1000);

// --- Medicine Cabinet UI Logic ---
const pills = [
  { id: 1, name: "กระปุกที่ 1 : เม็ดเคลือบ สีชมพูเข้ม" },
  { id: 2, name: "กระปุกที่ 2 : แคปซูล สีเหลืองสด" },
  { id: 3, name: "กระปุกที่ 3 : ยาชนิดน้ำ สีฟ้า" },
  { id: 4, name: "กระปุกที่ 4 : แคปซูล สีดำ" },
  { id: 5, name: "กระปุกที่ 5 : เม็ดใหญ่ทรงรี สีส้ม" },
  { id: 6, name: "กระปุกที่ 6 : ยาชนิดน้ำ สีน้ำตาลเข้ม" }
];

function openPillUI() {
  els.pillOptions.innerHTML = '';
  pills.forEach(pill => {
    const btn = document.createElement('button');
    btn.className = 'pill-btn';
    btn.innerText = pill.name;
    btn.onclick = () => selectPill(pill.id);
    els.pillOptions.appendChild(btn);
  });
  els.pillUiContainer.classList.remove('hidden');
}

function closePillUI() {
  els.pillUiContainer.classList.add('hidden');
}

function selectPill(id) {
  closePillUI();
  if (id === 1) {
    RoomFlags.bathroom.pillTaken = true;
    showDialogue("คุณทานยาสีชมพูเข้ม... ทันใดนั้นไฟห้องน้ำที่กะพริบก็กลับมาสว่างเป็นปกติ จิตใจคุณสงบลง");
    updateRoomVisuals('bathroom');
  } else if (id === 2 || id === 5) {
    takeDamage("เกิดผลข้างเคียง มึนงง/สำลักเม็ดยา!", 0.25);
  } else {
    die("สารเคมีหรือพิษทำลายระบบภายในร่างกายอย่างรุนแรง... ตายทันที");
  }
}

// --- Faucet UI Logic ---
function openFaucetUI() {
  els.faucetUiContainer.classList.remove('hidden');
  updateFaucetUI();
}

function closeFaucetUI() {
  els.faucetUiContainer.classList.add('hidden');
  if (bathtubState.volume >= 100 && bathtubState.mode === 'close') {
    bathtubState.active = false;
    RoomFlags.bathroom.waterFilled = true;
    showDialogue("น้ำเต็มอ่างแล้ว คุณเตรียมตัวลงไปแช่");
    updateRoomVisuals('bathroom');
  }
}

function setFaucetMode(mode) {
  if (bathtubState.volume >= 100 && mode !== 'close') {
      showDialogue("น้ำเต็มอ่างแล้ว ต้องกดปิดเท่านั้น!");
      return;
  }
  bathtubState.mode = mode;
  
  // Update button active states
  document.querySelectorAll('.faucet-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.faucet-btn.${mode}`).classList.add('active');
  
  if (mode === 'close' && bathtubState.volume >= 100) {
      closeFaucetUI();
  }
}

function updateFaucetUI() {
  const tot = Math.max(1, bathtubState.hotAmt + bathtubState.coldAmt);
  const hotPct = Math.round((bathtubState.hotAmt / tot) * 100);
  const coldPct = Math.round((bathtubState.coldAmt / tot) * 100);
  
  els.waterGaugeFill.style.width = `${Math.min(100, bathtubState.volume)}%`;
  
  if (bathtubState.volume > 0) {
      els.waterGaugeFill.style.background = `linear-gradient(90deg, #aa3333 ${hotPct}%, #3333aa ${hotPct}%)`;
  }
  
  els.waterVolText.innerText = `ปริมาตร: ${Math.min(100, bathtubState.volume)}%`;
  els.waterTempText.innerText = `ร้อน: ${hotPct}% | เย็น: ${coldPct}%`;
  
  if (bathtubState.volume >= 100 && bathtubState.mode !== 'close') {
      els.waterVolText.innerText = `ปริมาตร: 100% (กำลังล้น!)`;
      els.waterVolText.style.color = "red";
  } else {
      els.waterVolText.style.color = "#ccc";
  }
}

function openBathtubChoiceUI() {
  document.getElementById('bathtub-choice-ui').classList.remove('hidden');
}

function closeBathtubChoiceUI() {
  document.getElementById('bathtub-choice-ui').classList.add('hidden');
}

function bathtubChoice(choice) {
  closeBathtubChoiceUI();
  
  const flags = RoomFlags.bathroom;
  const tot = bathtubState.hotAmt + bathtubState.coldAmt;
  const hotPct = Math.round((bathtubState.hotAmt / tot) * 100);
  const coldPct = Math.round((bathtubState.coldAmt / tot) * 100);
  
  if (hotPct > 80) {
      die("สัมผัสผิวน้ำอุณหภูมิที่ร้อนจัด ผิวหนังพุพองถูกลวกอย่างรุนแรงทนทานความเจ็บปวดไม่ไหว...");
      return;
  }
  if (coldPct > 80) {
      die("ร่างกายช็อคหัวใจวายจากการสูญเสียความร้อนอย่างเฉียบพลันในน้ำยะเยือก!");
      return;
  }
  
  if (choice === 'bathe') {
      flags.bathed = true;
      showDialogue("คุณลงแช่น้ำจนเสร็จ แล้วขึ้นจากอ่าง (ตอนนี้ตัวคุณเปียกชุ่ม)");
      updateRoomVisuals('bathroom');
  } else if (choice === 'drain') {
      flags.waterDrained = true;
      flags.gotKey = true;
      addItem('key', 'กุญแจห้องนอน');
      flags.doorUnlocked = true; // Unlocks hallway door
      showDialogue("คุณดึงจุกระบายน้ำออก น้ำแรงดันสูงไหลทิ้ง ช่วยผลักกุญแจลอยขึ้นมาให้คุณหยิบ!");
      updateRoomVisuals('bathroom');
  }
}

// --- Interaction Logic ---

function handleInteraction(room, objId, element) {
  const flags = RoomFlags[room];

  if (room === 'bedroom') {
    switch (objId) {
      case 'bed':
        if (!flags.stoodUp) {
          flags.stoodUp = true;
          showDialogue("คุณลุกขึ้นนั่งบนเตียงอย่างงัวเงีย...");
        } else {
          showDialogue("คุณลงจากเตียงแล้ว ไม่ควรกลับไปนอนอีก");
        }
        break;
        
      case 'alarm':
        if (!flags.stoodUp) {
          takeDamage("เอื้อมหยิบนาฬิการ่วงใส่หน้า เพราะยังงัวเงีย");
        } else if (!flags.alarmOff) {
          flags.alarmOff = true;
          addLog("อย่าลืมทานยาเม็ดสีชมพูเข้มนะ (จากโน้ตใต้นาฬิกา)");
          showDialogue("ปิดนาฬิกาปลุกแล้ว... พบโน้ตเตือนใจ: 'อย่าลืมทานยาเม็ดสีชมพูเข้มนะ'");
        } else {
          showDialogue("นาฬิกาหยุดร้องแล้ว");
        }
        break;

      case 'window':
        if (!flags.stoodUp) {
          showDialogue("ยังไม่ได้ลุกจากเตียงเลย");
          return;
        }
        if (!flags.alarmOff) {
          takeDamage("เดินสะดุดขอบเตียง เพราะยังไม่ได้ปิดนาฬิกาให้ตื่นดี");
          return;
        }
        
        if (!flags.windowClosed) {
          if (flags.windowClosingState) {
            // Success
            flags.windowClosed = true;
            showDialogue("คุณดึงหน้าต่างปิดได้จังหวะพอดี พัดลมหมุนเบาลงแล้วและตู้เสื้อผ้าเริ่มนิ่งขึ้น");
            updateRoomVisuals('bedroom');
          } else {
            // Fail timing
            die("ดึงผิดจังหวะ! บานหน้าต่างอ้าออก พัดคุณตกลงไปข้างล่าง...");
          }
        } else {
          showDialogue("หน้าต่างปิดสนิทแล้ว");
        }
        break;

      case 'wardrobe':
        if (!flags.stoodUp) {
           takeDamage("รีบร้อนลุกไปที่ตู้เสื้อผ้าจนกลิ้งตกเตียง");
           return;
        }
        if (!flags.alarmOff) {
           takeDamage("เดินสะดุดขอบเตียง เพราะยังไม่ได้ปิดนาฬิกาให้ตื่นดี");
           return;
        }
        if (!flags.windowClosed) {
          takeDamage("ตู้เสื้อผ้าสั่นแรงหนีบมือ!");
          return;
        } else if (!flags.wardrobeClosed) {
          flags.wardrobeClosed = true;
          showDialogue("คุณปิดประตูตู้เสื้อผ้าจนสนิท... มี 'ผ้าเช็ดตัว' แขวนอยู่ที่ประตู คุณจึงหยิบมา");
          addItem('towel', 'ผ้าเช็ดตัว');
          flags.gotTowel = true;
          flags.doorUnlocked = true;
          updateRoomVisuals('bedroom');
        } else {
          showDialogue("ตู้เสื้อผ้าปิดสนิทดีแล้ว");
        }
        break;

      case 'fan':
        if (!flags.stoodUp) {
           showDialogue("ยังนอนอยู่บนเตียง รอดพ้นจากพัดลมไปได้");
           return;
        }
        if (!flags.windowClosed) {
           die("คุณเดินเข้าไปใกล้พัดลมที่กำลังส่ายแรง ใบพัดหลุดกระเด็นใส่คุณตายคาที่...");
        } else {
           showDialogue("พัดลมหมุนเบาลงแล้ว คุณเดินลอดผ่านไปได้อย่างปลอดภัยเพื่อทำธุระต่อ");
        }
        break;

      case 'door_bathroom':
        if (!flags.stoodUp) {
           takeDamage("รีบร้อนลุกไปที่ประตูจนกลิ้งตกเตียง");
           return;
        }
        if (!flags.gotTowel) {
           showDialogue("ประตูล็อคอยู่... ต้องหาทางเตรียมตัวให้พร้อมก่อน (ได้ผ้าเช็ดตัวแล้วประตูจะแง้มเอง)");
        } else {
           // Go to bathroom
           showDialogue("คุณลงมือผลักประตูเดินเข้าสู่ห้องน้ำ");
           timeInBathroom = 0; // reset for light logic
           // Snapshot inventory for entering bathroom
           GameState.inventoryCheckpoints.bathroom = JSON.parse(JSON.stringify(GameState.inventory));
           loadRoom('bathroom');
        }
        break;

      case 'door_hallway':
        if (!flags.stoodUp) return;
        if (!hasItem('key')) {
           showDialogue("ประตูล็อคแน่นหนา ต้องหากุญแจมาไขเปิดเท่านั้น");
        } else {
           removeItem('key');
           els.winScreen.classList.remove('hidden'); // Win Demo
        }
        break;
    }
  } else if (room === 'bathroom') {
    switch (objId) {
      case 'soap':
        if (!flags.soapPicked) {
          flags.soapPicked = true;
          showDialogue("คุณจับขวดสบู่ที่หกตั้งขึ้นมา ป้องกันการลื่นล้ม");
          element.style.display = 'none';
        }
        break;

      case 'door_back': // Walk around area checking soap slip
        if (!flags.soapPicked && roomTimers.bathroomSoap > 25) {
          die("คุณเหยียบสบู่ที่ไหลลามจนเต็มพื้น ลื่นล้มหัวฟาดพื้นตายคาที่...");
          return;
        } else if (!flags.soapPicked) {
          takeDamage("ลื่นฟองสบู่เล็กน้อย โชคดีที่ยังไหลออกมาไม่เยอะ");
        }
        
        showDialogue("คุณเดินย้อนกลับเข้ามาในห้องนอน");
        // Snapshot inventory for returning to bedroom
        GameState.inventoryCheckpoints.bedroom = JSON.parse(JSON.stringify(GameState.inventory));
        loadRoom('bedroom');
        break;

      case 'cabinet':
        if (!flags.pillTaken) {
            openPillUI();
        } else {
            showDialogue("คุณกินยาไปแล้ว ไม่มียาอื่นที่ต้องกินอีก");
        }
        break;

      case 'dryer':
        if (flags.bathed && !flags.dried && !flags.dryerUnplugged) {
           die("ตัวเปียกๆ เอื้อมไปจับไดร์เป่าผมที่เสียบปลั๊กไฟอยู่ ไฟดูดตายสนิท!");
           return;
        }
        if (!flags.dryerUnplugged) {
            flags.dryerUnplugged = true;
            showDialogue("คุณถอดปลั๊กไดร์เป่าผมเรียบร้อยแล้ว");
            updateRoomVisuals('bathroom');
        } else if (!flags.dryerStored) {
            flags.dryerStored = true;
            showDialogue("เก็บไดร์เป่าผมเข้าที่เรียบร้อย ปลอดภัยหายห่วง");
            updateRoomVisuals('bathroom');
        }
        break;

      case 'bathtub':
        if (!flags.doorUnlocked) {
          if (!bathtubState.active && !flags.waterFilled) {
             const fill = confirm("เปิดน้ำใส่อ่างอาบน้ำไหม?");
             if (fill) {
                 bathtubState.active = true;
                 bathtubState.mode = 'hot';
                 openFaucetUI();
             }
          } else if (bathtubState.active && !flags.waterFilled) {
             openFaucetUI();
          } else if (flags.waterFilled && !flags.bathed && !flags.waterDrained) {
             openBathtubChoiceUI();
          } else if (flags.bathed && !flags.dried) {
             if (hasItem('towel')) {
                 flags.dried = true;
                 removeItem('towel');
                 showDialogue("คุณใช้ผ้าเช็ดตัวเช็ดตัวจนแห้งสนิท (ของถูกใช้ไปแล้ว) ปลอดภัยจากไฟดูด!");
             } else {
                 showDialogue("ขึ้นจากอ่างแล้วแต่คุณไม่มีผ้าเช็ดตัว ตัวยังเปียกชุ่ม... ระวังอุปกรณ์ไฟฟ้าให้ดี!");
             }
          } else if (flags.bathed && flags.dried && !flags.waterDrained) {
             const drain = confirm("ดึงจุกระบายน้ำทิ้งไหม?");
             if (drain) {
                 flags.waterDrained = true;
                 flags.gotKey = true;
                 addItem('key', 'กุญแจห้องนอน');
                 flags.doorUnlocked = true;
                 showDialogue("คุณดึงจุกระบายน้ำออก น้ำแรงดันสูงระบายทิ้ง พัดเอากุญแจลอยขึ้นมาให้คุณหยิบ!");
                 updateRoomVisuals('bathroom');
             }
          } else if (flags.waterDrained && flags.gotKey) {
             showDialogue("คุณได้กุญแจจากการระบายน้ำไปเรียบร้อยแล้ว");
          }
        } else {
            showDialogue("ได้กุญแจแล้ว... ไม่ต้องยุ่งกับอ่างอีก");
        }
        break;
    }
  }
}

// Start Game
window.onload = init;
