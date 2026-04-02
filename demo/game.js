const GameState = {
  hp: 3,
  maxHp: 3,
  hpDrainRate: 0,
  inventory: [], // Array of item objects: { id, name }
  logs: [], // Array of log text strings
  currentRoom: 'bedroom',
  inventoryCheckpoints: { bedroom: [], bathroom: [], hallway_f2: [], hallway_f1: [], kitchen: [], dining_room: [], storage: [] },
  smartphoneBattery: 52 // Flashlight battery for storage starts at 52%
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
    backpackSearched2: false,
    storageUnlocked: false
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
    poisonedFood: false,
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
    doorTimerStarted: false,
    doorSmallOpenedCount: 0,
    boxSearchView: 0
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
  storagePanic: 0,
  hallwayChandelier: 0
};

// Bathtub state
const bathtubState = {
  active: false,
  volume: 0,
  hotAmt: 0,
  coldAmt: 0,
  mode: 'close' // hot, cold, close
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
  stoveUiContainer: document.getElementById('stove-ui-container'),
  stoveInputDisplay: document.getElementById('stove-input-display'),
  diningUiContainer: document.getElementById('dining-ui-container'),
  drinkOptions: document.getElementById('drink-options'),
  flashlightMask: document.getElementById('flashlight-mask'),
  flashlightUiContainer: document.getElementById('flashlight-ui-container'),
  flashlightToggleBtn: document.getElementById('flashlight-toggle-btn'),
  flashlightChargeBtn: document.getElementById('flashlight-charge-btn'),
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
  
  if (els.flashlightToggleBtn) {
      els.flashlightToggleBtn.addEventListener('click', toggleFlashlight);
  }
  if (els.flashlightChargeBtn) {
      els.flashlightChargeBtn.addEventListener('click', chargePowerbank);
  }
  // NOTE: Battery drain is handled inside the 1-second hazard timer only (updateFlashlightBattery interval removed to prevent double-drain)
  
  // Start window timing loop for bedroom
  setInterval(toggleWindowSwing, 1500); // Window "closes" every 1.5s
  
  // Start bathroom flicker loop
  setInterval(checkBathroomLight, 1000);
  
  // NOTE: Flashlight battery is drained in the 1-second hazard timer (storageDoor block) — no separate interval needed
  
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
  
  if (els.flashlightUiContainer && els.batteryText) {
    if (GameState.currentRoom === 'storage' && !RoomFlags.storage.gotHammer) {
       els.flashlightUiContainer.classList.remove('hidden');
       els.batteryText.innerText = `${Math.floor(GameState.smartphoneBattery)}%`;
       
       if (GameState.smartphoneBattery < 20) {
           els.batteryText.classList.add('low');
       } else {
           els.batteryText.classList.remove('low');
       }
       if (hasItem('powerbank') && els.flashlightChargeBtn) {
           els.flashlightChargeBtn.disabled = false;
       } else if (els.flashlightChargeBtn) {
           els.flashlightChargeBtn.disabled = true;
       }
    } else {
       els.flashlightUiContainer.classList.add('hidden');
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
    RoomFlags.hallway_f1 = { backpackSearched1: false, backpackSearched2: false, storageUnlocked: false };
    GameState.inventory = JSON.parse(JSON.stringify(GameState.inventoryCheckpoints.hallway_f1));
  } else if (GameState.currentRoom === 'kitchen') {
    RoomFlags.kitchen = { sinkOff: false, kettleOff: false, cabinetClosed: false, gasNotesFound: false, gasStep: 0, gasOff: false, tastedFirst: false, ingredientsAdded: false, poisonedFood: false, tastedSecond: false, drawerRightOpened: false, cabinetOpenLevel: 0 };
    closeKitchenUI();
    GameState.inventory = JSON.parse(JSON.stringify(GameState.inventoryCheckpoints.kitchen));
  } else if (GameState.currentRoom === 'dining_room') {
    const wasAppeared = RoomFlags.dining_room.drinksAppeared;
    RoomFlags.dining_room = { lightSwitchState: 1, teaDrank: false, coffeeDrank: false, waterDrank: false, newspaperRead: false, keyAcquired: false, wheelsChecked: false, clockMoved: false, tableClimbed: false, drinksAppeared: wasAppeared };
    closeDiningUI();
    GameState.inventory = JSON.parse(JSON.stringify(GameState.inventoryCheckpoints.dining_room));
  } else if (GameState.currentRoom === 'storage') {
    // Reset all storage puzzle flags on death (including boxSearchView which was previously missing)
    RoomFlags.storage = { flashLightOn: false, doorWedged: false, doorClosed: false, woodStickAcquired: false, foundNote: false, foundKey: false, foundPowerbank: false, boxOpened: false, gotHammer: false, doorTimerStarted: false, doorSmallOpenedCount: 0, boxSearchView: 0 };
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
  els.interactiveLayer.style.display = 'block';
  els.scene.style.backgroundImage = '';
  
  // ซ่อน flashlightMask เสมอเมื่อเปลี่ยนห้อง — updateRoomVisuals จะแสดงอีกครั้งเฉพาะในห้องเก็บของเท่านั้น
  if (els.flashlightMask) els.flashlightMask.classList.add('hidden');
  
  // Add dark overlay if light is flickering
  els.scene.classList.remove('flickering');
  els.scene.classList.remove('flicker-dining');
  els.scene.style.filter = 'brightness(1)';
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
  // NOTE: Kitchen timers deliberately DO NOT reset here to preserve state across rooms
  if (roomId === 'dining_room') roomTimers.diningClock = 0;
  if (roomId === 'storage') {
      if(!RoomFlags.storage.doorTimerStarted && !RoomFlags.storage.gotHammer){
          roomTimers.storageDoor = 0;
          RoomFlags.storage.doorTimerStarted = true;
      }
      roomTimers.storagePanic = 0;
  }
  
  updateRoomVisuals(roomId);
  renderHUD();
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
        if(lamp) { lamp.className = 'interactive-object flickering'; lamp.innerHTML = 'โคมไฟเพดาน'; }
    } else if (flags.lightSwitchState === 0) {
        els.scene.classList.remove('flicker-dining');
        els.scene.style.filter = 'brightness(0.3)';
        if(lamp) {
            lamp.className = 'interactive-object';
            lamp.innerHTML = !flags.keyAcquired ? 'โคมไฟเพดาน <span style="text-shadow: 0 0 5px yellow;">✨</span>' : 'โคมไฟเพดาน';
        }
    } else if (flags.lightSwitchState === 2) {
        els.scene.classList.remove('flicker-dining');
        els.scene.style.filter = 'brightness(1)';
        if(lamp) { lamp.className = 'interactive-object'; lamp.innerHTML = 'โคมไฟเพดาน'; }
    }
    
    if (flags.clockMoved && clock) {
        clock.innerText = 'นาฬิกาลูกตุ้ม (เลื่อนพ้นทางแล้ว)';
        clock.style.left = '70%'; // moved aside
    }

    if (flags.drinksAppeared && drinks) {
        drinks.classList.remove('hidden');
    }
  } else if (roomId === 'storage') {
    if (flags.flashLightOn) {
        els.flashlightMask.classList.remove('hidden');
        els.scene.style.backgroundImage = '';
        els.scene.style.backgroundColor = 'transparent';
        els.interactiveLayer.style.display = 'block';
    } else {
        els.flashlightMask.classList.add('hidden');
        els.scene.style.backgroundImage = "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('assets/storage_bg.png')";
        els.scene.style.backgroundColor = '#000';
        els.interactiveLayer.style.display = 'none';
    }
    
    const dMain = document.getElementById('obj-door_main');
    if (dMain) {
        if (flags.doorWedged) {
            // ประตูถูกค้ำด้วยไม้แล้ว — ไม่มี animation พับปิด คงสถานะนี้ตลอดแม้ออก-กลับเข้ามาใหม่
            dMain.classList.remove('door-closing-animation', 'closing');
            dMain.classList.add('wedged');
            dMain.innerText = 'ประตูทางเข้า (ค้ำด้วยไม้แล้ว)';
        } else if (!flags.doorClosed) {
            // ประตูกำลังค่อย ๆ พับปิดเอง
            dMain.classList.add('door-closing-animation', 'closing');
            dMain.classList.remove('wedged');
        }
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

  if (GameState.currentRoom === 'hallway_f2' && RoomFlags.hallway_f2.chandelierSwinging) {
    roomTimers.hallwayChandelier++;
    const chandelierEl = document.getElementById('deco-chandelier');
    if (chandelierEl) {
      if (roomTimers.hallwayChandelier > 45) { 
         die("โคมไฟระย้าที่แกว่งไปมาทนสภาพไม่ไหวหลุดร่วงลงมาทับคุณตายคาที่...");
      } else if (roomTimers.hallwayChandelier > 30) {
         chandelierEl.innerText = 'โคมไฟระย้า (แกว่งรุนแรง สายสะบัดจะขาดแล้ว!)';
         chandelierEl.className = 'non-interactive-object chandelier-swing swinging danger-high';
      } else if (roomTimers.hallwayChandelier > 15) {
         chandelierEl.innerText = 'โคมไฟระย้า (แกว่งแรงขึ้น เสียงเอี๊ยดอ๊าดดังมาก)';
         chandelierEl.className = 'non-interactive-object chandelier-swing swinging danger-low';
      }
    }
  }

  // Kitchen Hazards
  if (GameState.currentRoom !== 'kitchen') {
      if (GameState.hpDrainRate === 0.5) GameState.hpDrainRate = 0;
  }
  
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
  { id: 1, name: "กระปุกที่ 1 (เกล็ดสีน้ำตาลอ่อน มีกลิ่นหอมหวาน)" },
  { id: 2, name: "กระปุกที่ 2 (เกล็ดใหญ่สีขาวขุ่น ไม่มีกลิ่น)" },
  { id: 3, name: "กระปุกที่ 3 (ผงละเอียดสีดำ กลิ่นเคมี)" },
  { id: 4, name: "กระปุกที่ 4 (เกล็ดละเอียดสีขาวใส ไม่มีกลิ่น)" },
  { id: 5, name: "กระปุกที่ 5 (ผงหยาบสีน้ำตาลเข้ม กลิ่นฉุน)" },
  { id: 6, name: "กระปุกที่ 6 (ผงหยาบสีแดง กลิ่นเผ็ดร้อน)" }
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
  
  kf.ingredientsAdded = true;
  if (id === 3) {
      // Poison
      kf.poisonedFood = true;
  }
  
  showDialogue("คุณใส่เครื่องปรุงลงไปในอาหาร... ลองชิมดูอีกครั้งเพื่อความแน่ใจ");
}


// --- Dining Room UI Logic ---
const drinks = [
  { id: 'tea', name: 'ชามิ้นต์' },
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
  
  if (df.lightSwitchState !== 2) {
      takeDamage("มองไม่ถนัดในความมืด/แสงกะพริบ ทำให้ทำน้ำร้อนหกรดมือ ถูกลวกจนบาดเจ็บ!", 0.25);
      if (GameState.hp <= 0) return;
  }
  
  if (id === 'tea') {
      if (!df.teaDrank) {
          df.teaDrank = true;
          GameState.hpDrainRate = 0;
          showDialogue("คุณดื่มชามิ้นต์อุ่นๆ รสชาติเย็นซ่าและกลิ่นหอมสมุนไพรทำให้รู้สึกผ่อนคลายขึ้น");
      } else {
          showDialogue("ชามิ้นต์ถูกดื่มไปหมดแล้ว");
      }
  } else if (id === 'coffee') {
      if (!df.coffeeDrank) {
          df.coffeeDrank = true;
          showDialogue("กาแฟดำเข้มข้นทำให้ใจคุณเต้นแรงขึ้น อาการแพนิคกำเริบ... คุณได้ยินเสียงนาฬิกาดังเคาะบอกเวลาอย่างรวดเร็ว (ต้องรีบดื่มน้ำ!)");
          
          roomTimers.diningCoffeeDeath = setTimeout(() => {
              die("ระบบประสาทถูกกระตุ้นจากคาเฟอีนประกอบกับเสียงดัง อาการแพนิคกำเริบรุนแรงจนหัวใจวาย!");
          }, 5000);
      } else {
          showDialogue("กาแฟหมดแล้ว");
      }
  } else if (id === 'water') {
      if (!df.waterDrank) {
          df.waterDrank = true;
          if (df.coffeeDrank) {
              clearTimeout(roomTimers.diningCoffeeDeath);
              showDialogue("น้ำเย็นช่วยเจือจางฤทธิ์คาเฟอีน... อาการใจสั่นลดลง เสียงนาฬิกาดังเบาลง รอดตายอย่างหวุดหวิด");
          } else {
              showDialogue("ดื่มน้ำเปล่าชื่นใจดี... (ไม่มีผลอะไรพิเศษ)");
          }
      } else {
          showDialogue("น้ำเปล่าหมดแล้ว");
      }
  }
}

let stoveInputSeq = [];

function openStoveUI() {
    stoveInputSeq = [];
    updateStoveDisplay();
    els.stoveUiContainer.classList.remove('hidden');
}

function closeStoveUI() {
    els.stoveUiContainer.classList.add('hidden');
}

function inputStove(dir) {
    if (stoveInputSeq.length < 4) {
        stoveInputSeq.push(dir);
        updateStoveDisplay();
        
        if (stoveInputSeq.length === 4) {
            checkStoveSequence();
        }
    }
}

function updateStoveDisplay() {
    let displayStr = "";
    for(let i=0; i<4; i++) {
        if(i < stoveInputSeq.length) {
            displayStr += (stoveInputSeq[i] === 'left' ? 'L ' : 'R ');
        } else {
            displayStr += '_ ';
        }
    }
    if (els.stoveInputDisplay) els.stoveInputDisplay.innerText = displayStr.trim();
}

function checkStoveSequence() {
    const seqStr = stoveInputSeq.join(',');
    const correctSeq = 'right,left,left,right';
    
    setTimeout(() => {
        closeStoveUI();
        if (seqStr === correctSeq) {
            RoomFlags.kitchen.gasOff = true;
            showDialogue("คุณหมุนวาล์วเตาแก๊สได้ถูกต้อง! เตาแก๊สถูกปิด อาหารบนเตาหยุดเดือด ควันและกลิ่นไหม้ค่อยๆ จางหายไป");
            updateRoomVisuals('kitchen');
        } else {
            takeDamage("หมุนผิดจังหวะ ไฟพุ่งพึ่บใส่แขนคุณ!", 0.25);
            stoveInputSeq = []; // Reset sequence
        }
    }, 400);
}

// --- Interaction Logic ---

function toggleFlashlight() {
    const flags = RoomFlags.storage;
    if (GameState.smartphoneBattery <= 0) {
        showDialogue("แบตเตอรี่โทรศัพท์หมดเกลี้ยง เปิดแฟลชไม่ได้แล้ว!");
        return;
    }
    
    flags.flashLightOn = !flags.flashLightOn;
    updateRoomVisuals('storage');
    
    if (flags.flashLightOn) {
        showDialogue("คุณเปิดไฟแฟลชจากสมาร์ทโฟน");
    } else {
        showDialogue("คุณปิดไฟแฟลช");
    }
}

let powerbankChargeTicks = 0;
let powerbankInterval = null;

function chargePowerbank() {
    if (hasItem('powerbank')) {
        removeItem('powerbank');
        if (els.flashlightChargeBtn) els.flashlightChargeBtn.disabled = true;
        showDialogue("คุณเสียบชาร์จพาวเวอร์แบงค์... แบตเตอรี่จะค่อยๆ เพิ่มขึ้น (1% ทุก 5 วินาที)");
        powerbankChargeTicks = 0;
        
        if (powerbankInterval) clearInterval(powerbankInterval);
        
        powerbankInterval = setInterval(() => {
            if (GameState.hp <= 0) {
                clearInterval(powerbankInterval);
                return;
            }
            if (GameState.smartphoneBattery < 100 && powerbankChargeTicks < 15) {
                GameState.smartphoneBattery += 1;
                powerbankChargeTicks++;
                renderHUD();
                
                if (GameState.smartphoneBattery >= 100 || powerbankChargeTicks >= 15) {
                    clearInterval(powerbankInterval);
                    showDialogue("พาวเวอร์แบงค์พลังงานหมดแล้ว!");
                }
            } else {
                clearInterval(powerbankInterval);
            }
        }, 5000);
    }
}

function updateFlashlightBattery() {
    if (GameState.currentRoom === 'storage' && RoomFlags.storage.flashLightOn) {
        if (GameState.smartphoneBattery > 0) {
            GameState.smartphoneBattery -= 1;
            renderHUD();
            
            // Check if battery just died
            if (GameState.smartphoneBattery <= 0) {
                RoomFlags.storage.flashLightOn = false;
                updateRoomVisuals('storage');
                showDialogue("แบตเตอรี่โทรศัพท์หมดแล้ว... ความมืดมิดเข้าปกคลุม");
            }
        }
    }
}

function handleInteraction(room, objId, element) {
  const roomData = RoomData[room];
  if (!roomData) return;
  
  let obj = roomData.objects.find(o => o.id === objId);
  if (!obj && roomData.decorations) {
    obj = roomData.decorations.find(d => d.id === objId);
  }
  
  if (obj && obj.onInteract) {
    obj.onInteract(element);
  }
}

// Start Game
window.onload = init;
