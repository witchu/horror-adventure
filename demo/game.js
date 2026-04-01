const GameState = {
  hp: 3,
  maxHp: 3,
  hpDrainRate: 0,
  inventory: [], // Array of item objects: { id, name }
  logs: [], // Array of log text strings
  currentRoom: 'bedroom',
  inventoryCheckpoints: { bedroom: [], bathroom: [], hallway_f2: [], hallway_f1: [], kitchen: [], dining_room: [], storage: [] },
  smartphoneBattery: 100 // Flashlight battery for storage
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
  },
  hallway_f2: {
    curtainClosed: false,
    rugSorted: false,
    lightOn: false,
    chandelierSwinging: true
  },
  hallway_f1: {
    backpackSearched1: false,
    backpackSearched2: false
  },
  kitchen: {
    sinkOff: false,
    kettleOff: false,
    cabinetClosed: false,
    gasNotesFound: false,
    gasStep: 0, // 0 to 4
    gasOff: false,
    tastedFirst: false,
    ingredientsAdded: false,
    tastedSecond: false,
    drawerRightOpened: false,
    cabinetOpenLevel: 0
  },
  dining_room: {
    lightSwitchState: 1, // 1: flickering, 0: off, 2: on-full
    teaDrank: false,
    coffeeDrank: false,
    waterDrank: false,
    newspaperRead: false,
    keyAcquired: false,
    wheelsChecked: false,
    clockMoved: false,
    drinksAppeared: false
  },
  storage: {
    flashLightOn: false,
    doorWedged: false,
    doorClosed: false,
    woodStickAcquired: false,
    foundNote: false,
    foundKey: false,
    foundPowerbank: false,
    boxOpened: false,
    gotHammer: false,
    doorTimerStarted: false
  }
};

let roomTimers = {
  bedroom: 0,
  bathroomSoap: 0,
  kitchenWater: 0,
  kitchenKettle: 0,
  kitchenCabinet: 0,
  kitchenGas: 0,
  diningClock: 0,
  storageDoor: 0,
  storagePanic: 0
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
  },
  hallway_f2: {
    objects: [
      { id: 'curtain', name: 'ผ้าม่านหน้าต่างบานใหญ่', bounds: { left: 40, top: 20, width: 30, height: 50 } },
      { id: 'rug', name: 'พรมเช็ดเท้า', bounds: { left: 30, top: 80, width: 40, height: 15 } },
      { id: 'light_switch', name: 'สวิตช์ไฟขั้นบันได', bounds: { left: 80, top: 30, width: 10, height: 20 } },
      { id: 'stairs_down', name: 'บันไดลงไปชั้นล่าง', bounds: { left: 20, top: 50, width: 60, height: 50 } }
    ],
    decorations: [
      { id: 'chandelier', name: 'โคมไฟระย้า', bounds: { left: 30, top: -10, width: 40, height: 30 }, classes: 'chandelier-swing swinging' }
    ]
  },
  hallway_f1: {
    objects: [
      { id: 'backpack', name: 'กระเป๋าสะพาย', bounds: { left: 10, top: 40, width: 15, height: 25 } },
      { id: 'door_living', name: 'ประตูห้องนั่งเล่น', bounds: { left: 60, top: 10, width: 15, height: 50 } },
      { id: 'door_storage', name: 'ประตูห้องเก็บของ', bounds: { left: 80, top: 10, width: 15, height: 50 } },
      { id: 'door_kitchen', name: 'ทางเข้าไปยังห้องครัว', bounds: { left: 5, top: 10, width: 15, height: 80 } },
      { id: 'stairs_up', name: 'บันไดขึ้นชั้น 2', bounds: { left: 40, top: 60, width: 40, height: 40 } }
    ],
    decorations: []
  },
  kitchen: {
    objects: [
      { id: 'sink', name: 'ก๊อกน้ำอ่างล้างจาน', bounds: { left: 10, top: 40, width: 20, height: 30 } },
      { id: 'kettle', name: 'กาต้มน้ำ', bounds: { left: 35, top: 35, width: 15, height: 20 }, classes: 'light-shake' },
      { id: 'cabinet', name: 'ตู้เก็บจานแขวนผนัง', bounds: { left: 10, top: 10, width: 30, height: 20 } },
      { id: 'drawer_left', name: 'ลิ้นชักซ้าย', bounds: { left: 10, top: 75, width: 15, height: 20 } },
      { id: 'drawer_right', name: 'ลิ้นชักขวา', bounds: { left: 30, top: 75, width: 15, height: 20 } },
      { id: 'stove', name: 'เตาแก๊ส', bounds: { left: 55, top: 45, width: 20, height: 20 } },
      { id: 'food', name: 'อาหารบนเตา', bounds: { left: 60, top: 35, width: 10, height: 10 } },
      { id: 'spice_rack', name: 'ชั้นวางเครื่องปรุง', bounds: { left: 75, top: 20, width: 20, height: 20 } },
      { id: 'fridge_note', name: 'กระดานโน๊ตบนตู้เย็น', bounds: { left: 85, top: 40, width: 10, height: 30 } },
      { id: 'door_laundry', name: 'ประตูห้องซักล้าง', bounds: { left: 80, top: 70, width: 15, height: 25 } },
      { id: 'door_dining', name: 'ทางไปห้องทานข้าว', bounds: { left: 0, top: 20, width: 10, height: 60 } },
      { id: 'door_hallway', name: 'กลับโถงทางเดิน', bounds: { left: 40, top: 85, width: 20, height: 10 } }
    ],
    decorations: [
      { id: 'water_spill', name: 'น้ำท่วมพื้น', bounds: { left: 0, top: 80, width: 40, height: 20 }, classes: 'hidden' },
      { id: 'smoke', name: 'ควันไหม้', bounds: { left: 50, top: 10, width: 30, height: 30 }, classes: 'smoke-effect' }
    ]
  },
  dining_room: {
    objects: [
      { id: 'switch', name: 'สวิตช์ไฟ', bounds: { left: 85, top: 40, width: 5, height: 10 } },
      { id: 'table', name: 'โต๊ะทานข้าว', bounds: { left: 20, top: 60, width: 60, height: 30 } },
      { id: 'drinks', name: 'ชุดเครื่องดื่ม', bounds: { left: 25, top: 50, width: 25, height: 20 }, classes: 'hidden' },
      { id: 'newspaper', name: 'หนังสือพิมพ์', bounds: { left: 55, top: 55, width: 15, height: 15 } },
      { id: 'lamp', name: 'โคมไฟเพดาน', bounds: { left: 35, top: 0, width: 30, height: 30 } },
      { id: 'clock', name: 'นาฬิกาลูกตุ้ม', bounds: { left: 5, top: 20, width: 15, height: 60 } },
      { id: 'door_living', name: 'ประตูห้องนั่งเล่น', bounds: { left: 0, top: 20, width: 10, height: 60 } },
      { id: 'door_kitchen', name: 'กลับห้องครัว', bounds: { left: 85, top: 70, width: 15, height: 30 } }
    ],
    decorations: []
  },
  storage: {
    objects: [
      { id: 'door_main', name: 'ประตูบานพับ (ทางเข้า)', bounds: { left: 5, top: 10, width: 20, height: 80 } },
      { id: 'switch', name: 'สวิตช์ไฟ (ช็อต)', bounds: { left: 30, top: 40, width: 10, height: 10 }, classes: 'flickering' },
      { id: 'door_small', name: 'ประตูขนาดเล็กฝั่งพื้น', bounds: { left: 70, top: 80, width: 20, height: 15 } },
      { id: 'box_open', name: 'ลังกระดาษไม่มีฝาปิด', bounds: { left: 40, top: 70, width: 20, height: 20 } },
      { id: 'box_closed', name: 'ลังกระดาษมีฝาปิด', bounds: { left: 80, top: 60, width: 15, height: 20 } },
      { id: 'toolbox', name: 'กล่องอุปกรณ์ช่าง', bounds: { left: 45, top: 55, width: 15, height: 15 } }
    ],
    decorations: []
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
  waterTempText: document.getElementById('water-temp-text'),
  kitchenUiContainer: document.getElementById('kitchen-ui-container'),
  ingredientOptions: document.getElementById('ingredient-options'),
  diningUiContainer: document.getElementById('dining-ui-container'),
  drinkOptions: document.getElementById('drink-options'),
  flashlightMask: document.getElementById('flashlight-mask'),
  batteryBarContainer: document.getElementById('battery-bar-container'),
  batteryBarFill: document.getElementById('battery-bar-fill'),
  batteryText: document.getElementById('battery-text')
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
  
  if (els.batteryBarContainer && els.batteryBarFill && els.batteryText) {
    if (GameState.currentRoom === 'storage' && !RoomFlags.storage.gotHammer) {
       els.batteryBarContainer.classList.remove('hidden');
       const bpct = Math.max(0, GameState.smartphoneBattery);
       els.batteryBarFill.style.width = `${bpct}%`;
       els.batteryText.innerText = `${Math.floor(bpct)}%`;
       if (bpct < 20) {
           els.batteryBarFill.style.backgroundColor = 'red';
       } else {
           els.batteryBarFill.style.backgroundColor = '#f1c40f';
       }
    } else {
       els.batteryBarContainer.classList.add('hidden');
    }
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
  
  if (GameState.currentRoom === 'bedroom') {
    RoomFlags.bedroom = { stoodUp: false, alarmOff: false, windowClosed: false, wardrobeClosed: false, gotTowel: false, doorUnlocked: false, windowClosingState: false };
    GameState.inventory = JSON.parse(JSON.stringify(GameState.inventoryCheckpoints.bedroom));
  } else if (GameState.currentRoom === 'bathroom') {
    RoomFlags.bathroom = { soapPicked: false, pillTaken: false, dryerUnplugged: false, dryerStored: false, waterFilled: false, bathed: false, dried: false, waterDrained: false, gotKey: false, doorUnlocked: false };
    bathtubState.volume = 0; bathtubState.hotAmt = 0; bathtubState.coldAmt = 0; bathtubState.active = false; bathtubState.mode = 'close';
    closeFaucetUI();
    closePillUI();
    closeBathtubChoiceUI();
    GameState.inventory = JSON.parse(JSON.stringify(GameState.inventoryCheckpoints.bathroom));
  } else if (GameState.currentRoom === 'hallway_f2') {
    RoomFlags.hallway_f2 = { curtainClosed: false, rugSorted: false, lightOn: false, chandelierSwinging: true };
    GameState.inventory = JSON.parse(JSON.stringify(GameState.inventoryCheckpoints.hallway_f2));
  } else if (GameState.currentRoom === 'hallway_f1') {
    RoomFlags.hallway_f1 = { backpackSearched1: false, backpackSearched2: false };
    GameState.inventory = JSON.parse(JSON.stringify(GameState.inventoryCheckpoints.hallway_f1));
  } else if (GameState.currentRoom === 'kitchen') {
    RoomFlags.kitchen = { sinkOff: false, kettleOff: false, cabinetClosed: false, gasNotesFound: false, gasStep: 0, gasOff: false, tastedFirst: false, ingredientsAdded: false, tastedSecond: false, drawerRightOpened: false, cabinetOpenLevel: 0 };
    closeKitchenUI();
    GameState.inventory = JSON.parse(JSON.stringify(GameState.inventoryCheckpoints.kitchen));
  } else if (GameState.currentRoom === 'dining_room') {
    RoomFlags.dining_room = { lightSwitchState: 1, teaDrank: false, coffeeDrank: false, waterDrank: false, newspaperRead: false, keyAcquired: false, wheelsChecked: false, clockMoved: false, drinksAppeared: false };
    closeDiningUI();
    GameState.inventory = JSON.parse(JSON.stringify(GameState.inventoryCheckpoints.dining_room));
  } else if (GameState.currentRoom === 'storage') {
    // Keep battery and found item state (based on design, storage doesn't fully reset puzzle state, but for death, reset puzzle logic that matters)
    RoomFlags.storage = { flashLightOn: false, doorWedged: false, doorClosed: false, woodStickAcquired: false, foundNote: false, foundKey: false, foundPowerbank: false, boxOpened: false, gotHammer: false, doorTimerStarted: false };
    GameState.smartphoneBattery = 100; // restore battery on die
    GameState.inventory = JSON.parse(JSON.stringify(GameState.inventoryCheckpoints.storage));
  }
  
  GameState.hp = GameState.maxHp; // Restore HP
  GameState.hpDrainRate = 0; // Restore drain status
  roomTimers.bedroom = 0;
  roomTimers.bathroomSoap = 0;
  roomTimers.kitchenWater = 0;
  roomTimers.kitchenKettle = 0;
  roomTimers.kitchenCabinet = 0;
  roomTimers.kitchenGas = 0;
  roomTimers.diningClock = 0;
  roomTimers.storageDoor = 0;
  roomTimers.storagePanic = 0;
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
  if (roomId === 'kitchen') {
      roomTimers.kitchenWater = 0;
      roomTimers.kitchenKettle = 0;
      roomTimers.kitchenCabinet = 0;
      roomTimers.kitchenGas = 0;
  }
  if (roomId === 'dining_room') roomTimers.diningClock = 0;
  if (roomId === 'storage') {
      if(!RoomFlags.storage.doorTimerStarted && !RoomFlags.storage.gotHammer){
          roomTimers.storageDoor = 0;
          RoomFlags.storage.doorTimerStarted = true;
      }
      roomTimers.storagePanic = 0;
  }
  
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
  } else if (roomId === 'hallway_f2') {
    const curtain = document.getElementById('obj-curtain');
    const ch = document.getElementById('deco-chandelier');
    const rug = document.getElementById('obj-rug');
    const switchEl = document.getElementById('obj-light_switch');
    if (flags.curtainClosed && curtain && ch) {
        curtain.innerText = 'ผ้าม่าน (ปิดสนิท)';
        ch.classList.remove('swinging');
        ch.classList.remove('chandelier-swing');
        flags.chandelierSwinging = false;
    }
    if (flags.rugSorted && rug) {
        rug.innerText = 'พรมเช็ดเท้า (จัดระเบียบแล้ว)';
    }
    if (flags.lightOn && switchEl) {
        switchEl.innerText = 'สวิตช์ไฟ (เปิด)';
        switchEl.style.backgroundColor = 'rgba(255,255,200,0.2)';
    }
  } else if (roomId === 'hallway_f1') {
    // Add visual states here if needed for f1
  } else if (roomId === 'kitchen') {
    if (flags.gasOff) {
        const smoke = document.getElementById('deco-smoke');
        if(smoke) smoke.classList.add('hidden');
        const stove = document.getElementById('obj-stove');
        if(stove) stove.innerText = 'เตาแก๊ส (ปิดแล้ว)';
    }
    if (flags.cabinetClosed) {
        const cab = document.getElementById('obj-cabinet');
        if(cab) cab.innerText = 'ตู้เก็บจาน (ปิดสนิท)';
    }
    if (flags.kettleOff) {
        const kettle = document.getElementById('obj-kettle');
        if(kettle) { kettle.innerText = 'กาต้มน้ำ (ปิดแล้ว)'; kettle.classList.remove('light-shake'); }
    }
    if (flags.sinkOff) {
        const sink = document.getElementById('obj-sink');
        if(sink) sink.innerText = 'ก๊อกน้ำอ่างล้างจาน (ปิดแล้ว)';
    }
  } else if (roomId === 'dining_room') {
    const lamp = document.getElementById('obj-lamp');
    const clock = document.getElementById('obj-clock');
    const drinks = document.getElementById('obj-drinks');

    if (flags.lightSwitchState === 1) {
        els.scene.classList.add('flicker-dining');
        if(lamp) lamp.className = 'interactive-object flickering';
    } else if (flags.lightSwitchState === 0) {
        els.scene.classList.remove('flicker-dining');
        els.scene.style.filter = 'brightness(0.3)';
        if(lamp) lamp.className = 'interactive-object';
    } else if (flags.lightSwitchState === 2) {
        els.scene.classList.remove('flicker-dining');
        els.scene.style.filter = 'brightness(1)';
        if(lamp) lamp.className = 'interactive-object';
    }
    
    if (flags.clockMoved && clock) {
        clock.innerText = 'นาฬิกาลูกตุ้ม (เลื่อนพ้นทางแล้ว)';
        clock.style.left = '15%'; // moved aside
    }

    if (flags.drinksAppeared && drinks) {
        drinks.classList.remove('hidden');
    }
  } else if (roomId === 'storage') {
    if (flags.flashLightOn) {
        els.flashlightMask.classList.remove('hidden');
        els.scene.style.backgroundColor = 'transparent';
    } else {
        els.flashlightMask.classList.add('hidden');
        els.scene.style.backgroundColor = '#000'; // Pure dark
    }
    
    const dMain = document.getElementById('obj-door_main');
    if (flags.doorWedged && dMain) {
        dMain.innerText = 'ประตูทางเข้า (ค้ำด้วยไม้แล้ว)';
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

  // Kitchen Hazards
  if (GameState.currentRoom === 'kitchen') {
      const kf = RoomFlags.kitchen;
      if (!kf.sinkOff) {
          roomTimers.kitchenWater++;
          const spill = document.getElementById('deco-water_spill');
          if (roomTimers.kitchenWater > 15) {
              if(spill) { spill.classList.remove('hidden'); spill.innerText = "น้ำท่วมพื้นห้องครัว!"; spill.classList.add('danger-high'); }
          }
      }
      if (!kf.kettleOff) {
          roomTimers.kitchenKettle++;
          const kettle = document.getElementById('obj-kettle');
          if (roomTimers.kitchenKettle > 40) {
              die("กาต้มน้ำเดือดจัดจนแรงดันเกินพิกัดและระเบิดใส่อย่างรุนแรง!");
          } else if (roomTimers.kitchenKettle > 20 && kettle) {
              kettle.innerText = "กาต้มน้ำ (เสียงหวีดร้องดังมาก!)";
              kettle.classList.add('danger-high');
          }
      }
      if (!kf.cabinetClosed) {
          roomTimers.kitchenCabinet++;
          const cab = document.getElementById('obj-cabinet');
          if (roomTimers.kitchenCabinet > 30) {
              cab.innerText = "ตู้เก็บจาน (เปิดกว้างมาก อันตราย!)";
              cab.classList.add('danger-high');
              kf.cabinetOpenLevel = 2;
          } else if (roomTimers.kitchenCabinet > 15) {
              cab.innerText = "ตู้เก็บจานแขวนผนัง (เริ่มเปิดกว้างขึ้น)";
              cab.classList.add('danger-low');
              kf.cabinetOpenLevel = 1;
          }
      }
      if (!kf.gasOff) {
          roomTimers.kitchenGas++;
          if (roomTimers.kitchenGas > 15) {
             if (GameState.hpDrainRate === 0) {
                 showDialogue("สูดดมควันไหม้จากอาหารบนเตา! (บาดเจ็บต่อเนื่อง)");
                 GameState.hpDrainRate = 0.5; // Drain faster
             }
          }
      } else {
          if (GameState.hpDrainRate === 0.5) GameState.hpDrainRate = 0;
      }
  }

  // Storage Hazards
  if (GameState.currentRoom === 'storage') {
      const sf = RoomFlags.storage;
      // Battery Drain
      if (sf.flashLightOn) {
          GameState.smartphoneBattery -= 0.5; // 200 seconds total battery
          if (GameState.smartphoneBattery <= 0) {
              GameState.smartphoneBattery = 0;
              sf.flashLightOn = false;
              updateRoomVisuals('storage');
          }
          renderHUD(); // to update battery bar
      }
      
      // Door closing timer
      if (!sf.doorWedged && sf.doorTimerStarted && !sf.gotHammer) {
          roomTimers.storageDoor++;
          if (roomTimers.storageDoor > 30) {
              sf.doorClosed = true;
              die("ประตูบานพับของห้องเก็บของพับเข้าหากันจนปิดสนิท คุณถูกขังและตายด้วยการขาดอากาศหายใจ");
          }
      }

      // Panic timer in Storage
      roomTimers.storagePanic++;
      if (!sf.flashLightOn && roomTimers.storagePanic > 210) { // 3 min 30 sec = 210s
          if (GameState.hpDrainRate === 0) {
              showDialogue("มืดสนิท... อาการ Panic กำเริบระดับ 1! (บาดเจ็บต่อเนื่อง)");
              GameState.hpDrainRate = 0.2;
          }
      } else if (sf.flashLightOn && roomTimers.storagePanic > 300) { // 5 mins = 300s
          if (GameState.hpDrainRate <= 0.2) {
              showDialogue("อยู่ในที่แคบนานเกินไป... แสงแฟลชก็ช่วยไม่ได้ อาการ Panic กำเริบระดับ 2! (บาดเจ็บต่อเนื่อง)");
              GameState.hpDrainRate = 0.4;
          }
      }
      
      // Auto-death when dark for too long without hammer
      if (!sf.flashLightOn && GameState.smartphoneBattery <= 0 && !hasItem('powerbank') && !sf.gotHammer) {
         die("ความมืดเข้าปกคลุม ประตูบานพับของห้องปิดกระแทกอย่างรวดเร็ว ถูกขังตายด้วยการขาดอากาศหายใจ");
      }
  }

  // Dining Room Hazards
  if (GameState.currentRoom === 'dining_room') {
      const df = RoomFlags.dining_room;
      if (df.coffeeDrank && !df.waterDrank) {
          roomTimers.diningClock++;
          if (roomTimers.diningClock % 1 === 0) {
              const ticks = roomTimers.diningClock;
              if (ticks === 1) addActionLog("ติ๊ก... (1)");
              else if (ticks === 2) addActionLog("ติ๊ก... (2)");
              else if (ticks === 3) addActionLog("ติ๊ก... (3)");
              else if (ticks === 4) addActionLog("ติ๊ก... (4)");
              else if (ticks >= 5) {
                  die("เสียงนาฬิกาดังครบ 5 ครั้ง อาการ Panic กำเริบรุนแรงจากคาเฟอีนจนหัวใจวายตาย!");
              }
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

// --- Kitchen UI Logic ---
const ingredients = [
  { id: 1, name: "กระปุกสีแดง (พริกป่น)" },
  { id: 2, name: "กระปุกสีขาว (เกลือ)" },
  { id: 3, name: "กระปุกสีดำ (พริกไทย)" },
  { id: 4, name: "ขวดสีน้ำตาล (ซีอิ๊ว)" }
];

function openKitchenUI() {
  els.ingredientOptions.innerHTML = '';
  ingredients.forEach(ing => {
    const btn = document.createElement('button');
    btn.className = 'pill-btn';
    btn.innerText = ing.name;
    btn.onclick = () => selectIngredient(ing.id);
    els.ingredientOptions.appendChild(btn);
  });
  els.kitchenUiContainer.classList.remove('hidden');
}

function closeKitchenUI() {
  els.kitchenUiContainer.classList.add('hidden');
}

function selectIngredient(id) {
  closeKitchenUI();
  const kf = RoomFlags.kitchen;
  
  if (kf.ingredientsAdded) {
      showDialogue("ปรุงไปแล้ว ไม่ควรใส่เพิ่มมั่วซั่ว");
      return;
  }
  
  if (id === 1 || id === 3) {
      // Success (Spicy/Pepper)
      kf.ingredientsAdded = true;
      kf.tastedSecond = true; // Skip to success since we didn't add multi-step spice in simplified demo, or keep it 1 step
      showDialogue("คุณใส่เครื่องปรุงรสเผ็ดร้อนลงไป... กลิ่นฉุนเตะจมูก! (ผ่านการปรุงสำเร็จ)");
      RoomFlags.dining_room.drinksAppeared = true; // unlocks dining room puzzle
  } else {
      // Fail
      takeDamage("คุณเผลอชิมอาหารที่รสชาติแย่ลงกว่าเดิมอย่างรุนแรง!", 0.5);
  }
}

// --- Dining Room UI Logic ---
const drinks = [
  { id: 'tea', name: 'ชาร้อน' },
  { id: 'coffee', name: 'กาแฟดำ' },
  { id: 'water', name: 'น้ำเปล่าเย็น' }
];

function openDiningUI() {
  els.drinkOptions.innerHTML = '';
  drinks.forEach(d => {
    const btn = document.createElement('button');
    btn.className = 'pill-btn';
    btn.innerText = d.name;
    btn.onclick = () => selectDrink(d.id);
    els.drinkOptions.appendChild(btn);
  });
  els.diningUiContainer.classList.remove('hidden');
}

function closeDiningUI() {
  els.diningUiContainer.classList.add('hidden');
}

function selectDrink(id) {
  closeDiningUI();
  const df = RoomFlags.dining_room;
  
  if (id === 'tea') {
      if (!df.teaDrank) {
          df.teaDrank = true;
          GameState.hpDrainRate = 0;
          showDialogue("ชาร้อนช่วยให้คุณผ่อนคลาย อาการ Panic สงบลงชั่วคราว");
      } else {
          showDialogue("ชาหมดแล้ว");
      }
  } else if (id === 'coffee') {
      if (!df.coffeeDrank) {
          df.coffeeDrank = true;
          showDialogue("กาแฟดำเข้มข้นทำให้ใจคุณเต้นแรงขึ้น... คุณได้ยินเสียงนาฬิกาดังชัดเจนมากขึ้น");
      } else {
          showDialogue("กาแฟหมดแล้ว");
      }
  } else if (id === 'water') {
      if (!df.waterDrank) {
          if (df.coffeeDrank) {
              df.waterDrank = true;
              showDialogue("น้ำเย็นช่วยเจือจางฤทธิ์คาเฟอีน... อาการใจสั่นลดลง เสียงนาฬิกาดังเบาลง");
          } else {
              showDialogue("ดื่มน้ำเปล่าชื่นใจดี... (ไม่มีผลอะไรพิเศษ)");
          }
      } else {
          showDialogue("น้ำเปล่าหมดแล้ว");
      }
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
           showDialogue("คุณไขกุญแจและผลักประตูเปิดออกไปสู่โถงทางเดินชั้น 2...");
           GameState.inventoryCheckpoints.hallway_f2 = JSON.parse(JSON.stringify(GameState.inventory));
           loadRoom('hallway_f2');
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
  } else if (room === 'hallway_f2') {
    switch (objId) {
      case 'curtain':
        if (!flags.curtainClosed) {
          flags.curtainClosed = true;
          showDialogue("คุณปิดผ้าม่านบานใหญ่... โคมไฟระย้าหยุดแกว่ง โถงทางเดินเริ่มมืดลง");
          updateRoomVisuals('hallway_f2');
        } else {
          showDialogue("ผ้าม่านปิดสนิทแล้ว");
        }
        break;
      case 'rug':
        if (!flags.chandelierSwinging && !flags.rugSorted) {
          flags.rugSorted = true;
          showDialogue("คุณจัดพรมเช็ดเท้าให้เรียบร้อยเพื่อไม่ให้สะดุดเวลาเดิน");
          updateRoomVisuals('hallway_f2');
        } else if (flags.chandelierSwinging) {
           takeDamage("ขณะเอื้อมไปจัดพรม โคมไฟระย้าที่แกว่งอยู่ร่วงลงมาเฉี่ยวคุณอย่างหวุดหวิด!");
        } else {
           showDialogue("พรมจัดเรียบร้อยดีแล้ว");
        }
        break;
      case 'light_switch':
        if (flags.chandelierSwinging) {
            die("ยังไม่ทันได้กดสวิตช์ โคมไฟระย้าก็หลุดร่วงลงมาทับคุณตายทันที!");
            return;
        }
        if (!flags.rugSorted) {
            takeDamage("ขณะเอื้อมกดปุ่ม คุณสะดุดพรมที่พับอยู่ล้มหัวฟาด!");
            return;
        }
        if (!flags.lightOn) {
            flags.lightOn = true;
            showDialogue("คุณกดเปิดสวิตช์ไฟ ไฟทางเดินบันไดสว่างขึ้น มองเห็นเส้นทางลงไปชั้น 1 ชัดเจน");
            updateRoomVisuals('hallway_f2');
        } else {
            showDialogue("ไฟสว่างอยู่แล้ว");
        }
        break;
      case 'stairs_down':
        if (flags.chandelierSwinging) {
            die("ยังไม่ทันก้าวลงบันได โคมไฟระย้าก็หลุดร่วงลงมาทับคุณตายทันที!");
            return;
        }
        if (!flags.rugSorted) {
            die("คุณสะดุดพรมที่ยับยู่ยี่ หัวคะมำตกบันไดคอหักตาย!");
            return;
        }
        if (!flags.lightOn) {
            die("ทางลงบันไดมืดเกินไป คุณก้าวพลาดลื่นตกบันไดหัวฟาดพื้นตาย!");
            return;
        }
        showDialogue("คุณเดินลงบันไดมายังโถงทางเดินชั้น 1");
        GameState.inventoryCheckpoints.hallway_f1 = JSON.parse(JSON.stringify(GameState.inventory));
        loadRoom('hallway_f1');
        break;
    }
  } else if (room === 'hallway_f1') {
    switch (objId) {
      case 'backpack':
        if (!flags.backpackSearched1) {
            flags.backpackSearched1 = true;
            showDialogue("ค้นคันแรกเจอบัตรพนักงานเขียนว่า 'Employee ID: 4022'");
            addItem('id_card', 'บัตรพนักงาน');
        } else if (!flags.backpackSearched2) {
            flags.backpackSearched2 = true;
            showDialogue("ค้นต่อ... เจอสมาร์ทโฟน! (แบต 100%) ใช้เปิดไฟฉายได้ถ้าจำเป็น");
            addItem('smartphone', 'สมาร์ทโฟน');
            GameState.smartphoneBattery = 100;
        } else {
            showDialogue("ไม่มีอะไรในกระเป๋าแล้ว");
        }
        break;
      case 'door_kitchen':
        if (hasItem('id_card')) {
            showDialogue("คุณนำบัตรพนักงานสแกนที่ประตู... ประตูเปิดออกสู่ห้องครัว");
            GameState.inventoryCheckpoints.kitchen = JSON.parse(JSON.stringify(GameState.inventory));
            loadRoom('kitchen');
        } else {
            showDialogue("ประตูนี้ต้องใช้บัตรพนักงานสแกนเพื่อเปิด");
        }
        break;
      case 'stairs_up':
        showDialogue("คุณเดินขึ้นบันไดกลับไปยังชั้น 2");
        loadRoom('hallway_f2');
        break;
      case 'door_living':
      case 'door_storage':
        showDialogue("ประตูล็อค หรือ ทางนี้ยังไปไม่ได้");
        break;
    }
  } else if (room === 'kitchen') {
    switch (objId) {
      case 'sink':
        if (!flags.sinkOff) {
            flags.sinkOff = true;
            showDialogue("คุณรีบปิดก๊อกน้ำ น้ำหยุดไหลลงพื้นแล้ว (ลื่นลดลง)");
            updateRoomVisuals('kitchen');
        } else {
            showDialogue("ก๊อกน้ำปิดดีแล้ว");
        }
        break;
      case 'kettle':
        if (!flags.sinkOff) {
            takeDamage("คุณเหยียบแอ่งน้ำที่นองพื้นจนลื่น ไถลไปชนเคาน์เตอร์เจ็บตัว!");
            return;
        }
        if (!flags.kettleOff) {
            flags.kettleOff = true;
            showDialogue("คุณปิดและยกกาต้มน้ำออกจากเตา เสียงหวีดร้องเงียบลงแล้ว");
            updateRoomVisuals('kitchen');
        } else {
            showDialogue("กาต้มน้ำถูกยกออกแล้ว");
        }
        break;
      case 'cabinet':
        if (!flags.kettleOff) {
            takeDamage("มัวแต่ไปปิดตู้ เสียงหวีดร้องของกาดังทะลุแก้วหูจนคุณมึนงง!");
            return;
        }
        if (!flags.cabinetClosed) {
            flags.cabinetClosed = true;
            showDialogue("คุณดันบานตู้กลับเข้าที่จนล็อคสนิท ไม่มีจานชามตกลงมาแล้ว");
            updateRoomVisuals('kitchen');
        } else {
            showDialogue("ตู้เก็บจานปิดสนิทแล้ว");
        }
        break;
      case 'drawer_right':
      case 'drawer_left':
        if (!flags.cabinetClosed) {
            takeDamage("ระหว่างก้มเปิดลิ้นชัก จานกระเบื้องร่วงจากตู้ด้านบนใส่หัวคุณเต็มๆ!");
            return;
        }
        if (objId === 'drawer_right' && !flags.drawerRightOpened) {
            flags.drawerRightOpened = true;
            showDialogue("พบกล่องปริศนา ต้องใส่รหัส 4 หลัก...");
            const code = prompt("ใส่รหัส 4 หลัก (จากบัตรพนักงาน):");
            if (code === "4022") {
                showDialogue("รหัสถูกต้อง! กล่องเปิดออก พบคู่มือหมุนวาล์วแก๊ส");
                flags.gasNotesFound = true;
                addLog("ลำดับหมุนวาล์ว: ขวา -> ซ้าย -> ขวา -> ซ้ายสุด");
            } else {
                showDialogue("รหัสผิด กล่องยังล็อคอยู่");
                flags.drawerRightOpened = false;
            }
        } else {
            showDialogue("ลิ้นชักตู้ธรรมดา ไม่มีอะไรน่าสนใจ");
        }
        break;
      case 'stove':
        if (!flags.gasNotesFound) {
            takeDamage("พยายามบิดวาล์วมั่วๆ ไฟลุกพึ่บใส่แขน!");
            return;
        }
        if (!flags.gasOff) {
            const stepName = ['ขวา', 'ซ้าย', 'ขวา', 'ซ้ายสุด'][flags.gasStep];
            const confirmStep = confirm(`หมุนวาล์วไปทาง [${stepName}] ไหม?`);
            if (confirmStep) {
                flags.gasStep++;
                showDialogue(`คุณหมุนไปทาง ${stepName}...`);
                if (flags.gasStep >= 4) {
                    flags.gasOff = true;
                    showDialogue("คุณปิดแก๊สสำเร็จ! ควันเริ่มจางหาย อาหารปลอดภัยแล้ว");
                    updateRoomVisuals('kitchen');
                }
            } else {
                takeDamage("หมุนผิดจังหวะ แก๊สรั่วใส่ตา!");
                flags.gasStep = 0;
            }
        } else {
            showDialogue("แก๊สปิดสนิทแล้ว");
        }
        break;
      case 'food':
        if (!flags.gasOff) {
            takeDamage("จะไปชิมอาหารที่กำลังไฟลุกได้ยังไง! ร้อนเดือดลวกปาก!");
            return;
        }
        if (!flags.tastedFirst) {
            flags.tastedFirst = true;
            showDialogue("คุณใช้ช้อนตักชิม... 'รสชาติจืดชืดมาก ขาดความเผ็ดร้อน'");
        } else if (!flags.ingredientsAdded && flags.tastedFirst) {
            showDialogue("ต้องเติมเครื่องปรุงรสเผ็ดร้อนสักหน่อย");
        } else if (flags.ingredientsAdded && flags.tastedSecond) {
            showDialogue("อาหารรสชาติเผ็ดร้อน กลมกล่อมลงตัว... คุณได้ยินเสียง 'คลิก' ดังมาจากประตูห้องทานข้าว");
        }
        break;
      case 'spice_rack':
        if (flags.tastedFirst && !flags.ingredientsAdded) {
            openKitchenUI();
        } else if (flags.ingredientsAdded) {
            showDialogue("ปรุงเสร็จแล้ว ไม่ต้องยุ่งกับเครื่องปรุงอีก");
        } else {
            showDialogue("ชั้นวางเครื่องปรุง... แต่ตอนนี้ยังไม่รู้จะปรุงอะไร");
        }
        break;
      case 'door_dining':
        if (RoomFlags.dining_room.drinksAppeared) {
            showDialogue("คุณเปิดประตูห้องทานข้าวเข้าไป");
            GameState.inventoryCheckpoints.dining_room = JSON.parse(JSON.stringify(GameState.inventory));
            loadRoom('dining_room');
        } else {
            showDialogue("ประตูล็อคอยู่... เหมือนต้องทำให้อาหารมีรสชาติสมบูรณ์ก่อนถึงจะไปต่อได้");
        }
        break;
      case 'door_hallway':
        showDialogue("กลับออกไปโถงทางเดินชั้น 1");
        GameState.inventoryCheckpoints.hallway_f1 = JSON.parse(JSON.stringify(GameState.inventory));
        loadRoom('hallway_f1');
        break;
      case 'fridge_note':
      case 'door_laundry':
        showDialogue("ไม่มีอะไรน่าสนใจ / ประตูล็อค");
        break;
    }
  } else if (room === 'dining_room') {
    switch(objId) {
      case 'switch':
         if (flags.lightSwitchState === 1) { // Flickering -> Off
             flags.lightSwitchState = 0;
             showDialogue("คุณกดสวิตช์ปิดไฟ... ห้องมืดลงอย่างน่าสะพรึง แต่ไฟเลิกกะพริบ");
             updateRoomVisuals('dining_room');
         } else if (flags.lightSwitchState === 0) { // Off -> On
             flags.lightSwitchState = 2;
             showDialogue("คุณกดสวิตช์อีกครั้ง... ไฟสว่างเต็มที่แล้ว! เห็นชุดเครื่องดื่มและหนังสือพิมพ์ชัดเจน");
             updateRoomVisuals('dining_room');
         } else { // On
             showDialogue("ไฟสว่างเต็มที่แล้ว ไม่จำเป็นต้องกดอีก");
         }
         break;
      case 'clock':
         if (flags.lightSwitchState !== 2) {
             showDialogue("มืดเกินไป หรือไฟกะพริบจนลายตา ไม่อยากขยับของใหญ่");
             return;
         }
         if (!flags.wheelsChecked) {
             showDialogue("ลองผลักดู... นาฬิกาน้ำหนักมากและแทบไม่ขยับเลย เหมือนจะต้องไปปลดล็อคล้อด้านล่างก่อน");
             flags.wheelsChecked = true;
         } else if (flags.wheelsChecked && !flags.clockMoved) {
             const ans = confirm("ก้มลงไปปลดตัวล็อคล้อฐานนาฬิกา?");
             if (ans) {
                 flags.clockMoved = true;
                 showDialogue("คุณปลดล็อคล้อและเลื่อนนาฬิกาออกพ้นทาง เผยให้เห็นประตูห้องนั่งเล่นที่ซ่อนอยู่ด้านหลัง!");
                 updateRoomVisuals('dining_room');
             }
         } else {
             showDialogue("นาฬิกาถูกเลื่อนออกไปแล้ว");
         }
         break;
      case 'newspaper':
         if (flags.lightSwitchState !== 2) {
             showDialogue("ไฟไม่สว่างพอจะอ่านหนังสือพิมพ์");
             return;
         }
         flags.newspaperRead = true;
         showDialogue("พาดหัวข่าว: 'ค้นพบพลังบำบัดของชาร้อน... ช่วยระงับอาการแพนิคได้ในทันที!'");
         addLog("ชาร้อนช่วยระงับอาการ Panic ได้");
         break;
      case 'drinks':
         if (flags.lightSwitchState !== 2) {
             showDialogue("ไฟไม่สว่างพอจะเลือกเครื่องดื่ม");
             return;
         }
         openDiningUI();
         break;
      case 'door_living':
         if (!flags.clockMoved) {
             showDialogue("ยังมาไม่ถึงตรงนี้ (นาฬิกาบังอยู่)");
             return;
         }
         if (!hasItem('key')) {
             if (!flags.keyAcquired) {
                 flags.keyAcquired = true;
                 addItem('key_living', 'กุญแจห้องนั่งเล่น'); // Just generic key, but we need specifically the hammer or go to storage
                 showDialogue("ประตูล็อค คุณเจอกุญแจที่ฐานนาฬิกา... แต่มันเขียนว่า 'กุญแจห้องเก็บของ'"); // Corrected from design, it leads to storage context or we just let it be generic
                 addItem('key_storage', 'กุญแจห้องเก็บของ');
             }
             showDialogue("ประตูล็อค ต้องไปหาทางอื่น (ในเกมนี้โถงบอกว่าทางไปหลุดพ้นคือโถง... อ้อต้องไปห้องเก็บของที่โถง!)");
         }
         break;
      case 'door_kitchen':
         showDialogue("กลับสู่ห้องครัว");
         GameState.inventoryCheckpoints.kitchen = JSON.parse(JSON.stringify(GameState.inventory));
         loadRoom('kitchen');
         break;
    }
  } else if (room === 'storage') {
    switch(objId) {
      case 'door_main':
         if (flags.doorTimerStarted && !flags.doorWedged && !flags.doorClosed) {
             if (hasItem('wood_stick')) {
                 flags.doorWedged = true;
                 removeItem('wood_stick');
                 showDialogue("คุณเอาท่อนไม้มาค้ำยันบานพับประตูไว้ ประตูจะไม่ปิดมากระแทกอีกแล้ว!");
                 updateRoomVisuals('storage');
             } else {
                 showDialogue("ประตูบานพับนี้มันพยายามจะงับปิดตลอดเวลา! คุณต้องหาอะไรมาค้ำมันไว้ (ต้องการไอเทมค้ำยัน)");
             }
         } else if (flags.doorWedged) {
             showDialogue("ประตูกลับโถงทางเดิน (ค้ำไม้ไว้แล้ว เปิดค้างตลอด)");
             const goBack = confirm("กลับไปโถงทางเดิน?");
             if (goBack) {
                 GameState.inventoryCheckpoints.hallway_f1 = JSON.parse(JSON.stringify(GameState.inventory));
                 loadRoom('hallway_f1');
             }
         } else if (flags.doorClosed) {
             showDialogue("ประตูถูกปิดตายจากภายนอก คุณออกไม่ได้แล้ว");
         }
         break;
      case 'door_small':
         if (!flags.doorWedged) {
             showDialogue("คุณไม่กล้ามุดเข้าไปในประตูเล็กขณะที่ประตูใหญ่พร้อมหนีบคุณตลอดเวลา! ต้องจัดการประตูหลังก่อน");
             return;
         }
         if (!flags.flashLightOn) {
             showDialogue("ประตูนี้ลึกและมืดมาก ต้องหาแสงสว่างส่องเข้าไป");
             return;
         }
         if (!flags.smdoorOpen) {
             flags.smdoorOpen = true;
             showDialogue("คุณเปิดประตูเล็กเข้าไป... เจอโน้ตเขียนว่า 'ลังกระดาษหมายเลข 2 ซ่อนแบตสำรองไว้'");
             addLog("ลังกระดาษหมายเลข 2 มีแบตสำรอง");
         } else {
             showDialogue("ไม่มีอะไรซ่อนอยู่ในนี้แล้ว");
         }
         break;
      case 'box_open':
         // Box 1 (Open)
         if (!flags.woodStickAcquired) {
             flags.woodStickAcquired = true;
             addItem('wood_stick', 'ท่อนไม้ค้ำยัน');
             showDialogue("คุณค้นลังกระดาษที่เปิดอยู่ เจอ 'ท่อนไม้' แข็งๆ หนึ่งอัน");
         } else {
             showDialogue("ลังเปิดโล่ง ไม่มีอะไรแล้ว");
         }
         break;
      case 'box_closed':
         // Box 2 (Closed)
         if (!flags.boxOpened) {
             flags.boxOpened = true;
             showDialogue("เปิดฝาลังออก... ดันมีค้างคาวบินสวนขึ้นมาเฉี่ยวหน้า!");
             takeDamage("ค้างคาวบินพุ่งชนหน้า!", 0.25);
             if (flags.smdoorOpen) {
                 showDialogue("ในลังนี้มี 'แบตเตอรี่สำรอง' ตามที่โน้ตบอก!");
                 addItem('powerbank', 'แบตสำรอง');
                 flags.foundPowerbank = true;
                 // Refill battery
                 if (hasItem('smartphone')) {
                     GameState.smartphoneBattery = 100;
                     showDialogue("คุณใช้แบตสำรองชาร์จสมาร์ทโฟน แบตเต็ม 100% อีกครั้ง!");
                     removeItem('powerbank');
                 }
             }
         } else {
             showDialogue("ลังกระดาษหมายเลข 2 ว่างเปล่า");
         }
         break;
      case 'toolbox':
         if (!flags.flashLightOn) {
             showDialogue("มืดเกินไป มองรหัสล็อคกล่องไม่ออก เปิดไฟฉายก่อน");
             return;
         }
         if (!flags.gotHammer) {
             const pin = prompt("กล่องมีแม่กุญแจรหัส 3 หลัก (สัญลักษณ์หน้ากล่องเหมือนจำนวนยาในห้องน้ำ? หรือเลข 402?): ลองเดาว่ารหัสคือสวิตช์ไฟที่พังในห้อง = 13 (หรือ 31?)... ไม่ใช่สิ (จาก GDD รหัสคือ 144)");
             if (pin === "144") {
                 flags.gotHammer = true;
                 showDialogue("รหัสถูกต้องแม่กุญแจปลดล็อค! คุณได้รับ 'ค้อน' ไว้สำหรับพังกำแพง/ประตูใหญ่เพื่อหนีออกไปสุดเกม!");
                 addItem('hammer', 'ค้อน');
                 els.winScreen.classList.remove('hidden'); // CLEARED END DEMO
             } else {
                 showDialogue("รหัสผิด... ลองนึกถึงคำใบ้หรือรหัสอื่นๆ (คำใบ้คือ วันวาเลนไทน์ 14 หรืออะไรสักอย่าง? เรามีเลข 144 จาก GDD)");
             }
         } else {
             showDialogue("กล่องว่างเปล่า");
         }
         break;
      case 'switch':
         showDialogue("สวิตช์ไฟพังและช็อตอยู่ อย่าไปยุ่งดีกว่า");
         break;
    }
  }
}

// Start Game
window.onload = init;
