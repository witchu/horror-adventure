// --- Room Rendering and Logic ---

function loadRoom(roomId) {
  GameState.currentRoom = roomId;
  if(els.scene) els.scene.className = `room-${roomId}`;
  if(els.interactiveLayer) {
      els.interactiveLayer.innerHTML = ''; // clear objects
      els.interactiveLayer.style.display = 'block';
  }
  if(els.scene) els.scene.style.backgroundImage = '';
  
  // ซ่อน flashlightMask เสมอเมื่อเปลี่ยนห้อง — updateRoomVisuals จะแสดงอีกครั้งเฉพาะในห้องเก็บของเท่านั้น
  if (els.flashlightMask) els.flashlightMask.classList.add('hidden');
  
  // Add dark overlay if light is flickering
  if(els.scene) {
      els.scene.classList.remove('flickering');
      els.scene.classList.remove('flicker-dining');
      els.scene.style.filter = 'brightness(1)';
  }
  
  if (roomId === 'bathroom' && !GameState.flags['bathroom_pillTaken']) {
    if(els.scene) els.scene.classList.add('flickering');
  }

  const room = (window.RoomData && window.RoomData[roomId]) ? window.RoomData[roomId] : null;
  if(room && room.objects) {
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
        if(els.interactiveLayer) els.interactiveLayer.appendChild(el);
      });
  }

  if (room && room.decorations) {
    room.decorations.forEach(deco => {
      const el = document.createElement('div');
      el.className = `non-interactive-object ${deco.classes || ''}`;
      el.id = `deco-${deco.id}`;
      el.innerText = deco.name;
      el.style.left = `${deco.bounds.left}%`;
      el.style.top = `${deco.bounds.top}%`;
      el.style.width = `${deco.bounds.width}%`;
      el.style.height = `${deco.bounds.height}%`;
      
      if(deco.onInteract) el.addEventListener('click', () => handleInteraction(roomId, deco.id, el));
      
      if(els.interactiveLayer) els.interactiveLayer.appendChild(el);
    });
  }
  
  // reset room timer
  if (roomId === 'bedroom') roomTimers.bedroom = 0;
  if (roomId === 'bathroom') roomTimers.bathroomSoap = 0;
  // NOTE: Kitchen timers deliberately DO NOT reset here to preserve state across rooms
  if (roomId === 'dining_room') roomTimers.diningClock = 0;
  if (roomId === 'storage') {
      if(!GameState.flags['storage_doorTimerStarted'] && !GameState.flags['storage_gotHammer']){
          roomTimers.storageDoor = 0;
          GameState.flags['storage_doorTimerStarted'] = true;
      }
      roomTimers.storagePanic = 0;
  }
  
  updateRoomVisuals(roomId);
  renderHUD();
}

function updateRoomVisuals(roomId) {
  const flags = GameState.flags;
  
  if (roomId === 'bedroom') {
    const windowEl = document.getElementById('obj-window');
    const wardrobeEl = document.getElementById('obj-wardrobe');
    const fanEl = document.getElementById('obj-fan');
    
    if (flags['bedroom_windowClosed'] && windowEl) {
      windowEl.classList.remove('swinging', 'timing-safe', 'timing-unsafe');
      windowEl.innerText = 'หน้าต่าง (ปิดแล้ว)';
      windowEl.style.borderColor = 'transparent';
    }
    if (flags['bedroom_windowClosed'] && fanEl) {
      fanEl.innerText = 'พัดลมเพดาน (หมุนเอื่อย ปลอดภัยแล้ว)';
    }
    if (flags['bedroom_wardrobeClosed'] && wardrobeEl) {
      wardrobeEl.classList.remove('heavy-shake');
      wardrobeEl.classList.remove('light-shake');
      wardrobeEl.innerText = 'ตู้เสื้อผ้า (ปิดสนิท)';
    } else if (flags['bedroom_windowClosed'] && wardrobeEl) {
      wardrobeEl.classList.remove('heavy-shake');
      wardrobeEl.classList.add('light-shake');
    }
    
    const doorBathEl = document.getElementById('obj-door_bathroom');
    if (flags['bedroom_gotTowel'] && doorBathEl) {
      doorBathEl.innerText = 'ประตูห้องน้ำ (เปิดแง้มอยู่)';
    }
    
    const doorHallEl = document.getElementById('obj-door_hallway');
    if (hasItem('key') && doorHallEl) {
      doorHallEl.innerText = 'ประตูออกโถง (ปลดล็อคแล้ว)';
    }
  } else if (roomId === 'bathroom') {
    if (flags['bathroom_pillTaken'] && els.scene) {
      els.scene.classList.remove('flickering');
    }
    const dryerEl = document.getElementById('obj-dryer');
    if (flags['bathroom_dryerUnplugged'] && dryerEl && !flags['bathroom_dryerStored']) {
      dryerEl.innerText = 'ไดร์เป่าผม (ถอดปลั๊กแล้ว)';
    } else if (flags['bathroom_dryerStored'] && dryerEl) {
      dryerEl.style.display = 'none'; // Stored
    }
    const spillEl = document.getElementById('deco-soap-spill');
    if (flags['bathroom_soapPicked'] && spillEl) {
       spillEl.innerText = 'พื้นห้องน้ำ (เช็ดสบู่แล้ว)';
       spillEl.className = 'non-interactive-object';
    }
    
    const bathtubEl = document.getElementById('obj-bathtub');
    if (flags['bathroom_waterDrained'] && bathtubEl) {
        bathtubEl.innerText = 'อ่างอาบน้ำ (ระบายน้ำแล้ว มีกุญแจ)';
    } else if (flags['bathroom_bathed'] && bathtubEl) {
        bathtubEl.innerText = 'อ่างอาบน้ำ (ลงแช่แล้ว)';
    } else if (flags['bathroom_waterFilled'] && bathtubEl) {
        bathtubEl.innerText = 'อ่างอาบน้ำ (น้ำเต็มอ่าง)';
    }
  } else if (roomId === 'hallway_f2') {
    const curtain = document.getElementById('obj-curtain');
    const ch = document.getElementById('deco-chandelier');
    const rug = document.getElementById('obj-rug');
    const switchEl = document.getElementById('obj-light_switch');
    if (flags['hallway_f2_curtainClosed'] && curtain && ch) {
        curtain.innerText = 'ผ้าม่าน (ปิดสนิท)';
        ch.classList.remove('swinging');
        ch.classList.remove('chandelier-swing');
        flags['hallway_f2_chandelierSwinging'] = false;
    }
    if (flags['hallway_f2_rugSorted'] && rug) {
        rug.innerText = 'พรมเช็ดเท้า (จัดระเบียบแล้ว)';
    }
    if (flags['hallway_f2_lightOn'] && switchEl) {
        switchEl.innerText = 'สวิตช์ไฟ (เปิด)';
        switchEl.style.backgroundColor = 'rgba(255,255,200,0.2)';
    }
  } else if (roomId === 'hallway_f1') {
    // Add visual states here if needed for f1
  } else if (roomId === 'kitchen') {
    if (flags['kitchen_gasOff']) {
        const smoke = document.getElementById('deco-smoke');
        if(smoke) smoke.classList.add('hidden');
        const stove = document.getElementById('obj-stove');
        if(stove) stove.innerText = 'เตาแก๊ส (ปิดแล้ว)';
    }
    if (flags['kitchen_cabinetClosed']) {
        const cab = document.getElementById('obj-cabinet');
        if(cab) cab.innerText = 'ตู้เก็บจาน (ปิดสนิท)';
    }
    if (flags['kitchen_kettleOff']) {
        const kettle = document.getElementById('obj-kettle');
        if(kettle) { kettle.innerText = 'กาต้มน้ำ (ปิดแล้ว)'; kettle.classList.remove('light-shake'); }
    }
    if (flags['kitchen_sinkOff']) {
        const sink = document.getElementById('obj-sink');
        if(sink) sink.innerText = 'ก๊อกน้ำอ่างล้างจาน (ปิดแล้ว)';
    }
  } else if (roomId === 'dining_room') {
    const lamp = document.getElementById('obj-lamp');
    const clock = document.getElementById('obj-clock');
    const drinksObj = document.getElementById('obj-drinks');

    if (flags['dining_room_lightSwitchState'] === 1 && els.scene) {
        els.scene.classList.add('flicker-dining');
        if(lamp) { lamp.className = 'interactive-object flickering'; lamp.innerHTML = 'โคมไฟเพดาน'; }
    } else if (flags['dining_room_lightSwitchState'] === 0 && els.scene) {
        els.scene.classList.remove('flicker-dining');
        els.scene.style.filter = 'brightness(0.3)';
        if(lamp) {
            lamp.className = 'interactive-object';
            lamp.innerHTML = !flags['dining_room_keyAcquired'] ? 'โคมไฟเพดาน <span style="text-shadow: 0 0 5px yellow;">✨</span>' : 'โคมไฟเพดาน';
        }
    } else if (flags['dining_room_lightSwitchState'] === 2 && els.scene) {
        els.scene.classList.remove('flicker-dining');
        els.scene.style.filter = 'brightness(1)';
        if(lamp) { lamp.className = 'interactive-object'; lamp.innerHTML = 'โคมไฟเพดาน'; }
    }
    
    if (flags['dining_room_clockMoved'] && clock) {
        clock.innerText = 'นาฬิกาลูกตุ้ม (เลื่อนพ้นทางแล้ว)';
        clock.style.left = '70%'; // moved aside
    }

    if (flags['dining_room_drinksAppeared'] && drinksObj) {
        drinksObj.classList.remove('hidden');
    }
  } else if (roomId === 'storage') {
    if (flags['storage_flashLightOn'] && els.flashlightMask && els.scene && els.interactiveLayer) {
        els.flashlightMask.classList.remove('hidden');
        els.scene.style.backgroundImage = '';
        els.scene.style.backgroundColor = 'transparent';
        els.interactiveLayer.style.display = 'block';
    } else if (els.flashlightMask && els.scene && els.interactiveLayer) {
        els.flashlightMask.classList.add('hidden');
        els.scene.style.backgroundImage = "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('assets/storage_bg.png')";
        els.scene.style.backgroundColor = '#000';
        els.interactiveLayer.style.display = 'none';
    }
    
    const dMain = document.getElementById('obj-door_main');
    if (dMain) {
        if (flags['storage_doorWedged']) {
            dMain.classList.remove('door-closing-animation', 'closing');
            dMain.classList.add('wedged');
            dMain.innerText = 'ประตูทางเข้า (ค้ำด้วยไม้แล้ว)';
        } else if (!flags['storage_doorClosed']) {
            dMain.classList.add('door-closing-animation', 'closing');
            dMain.classList.remove('wedged');
        }
    }
  }
}

function handleInteraction(room, objId, element) {
  const roomData = window.RoomData && window.RoomData[room];
  if (!roomData) return;
  
  let obj = roomData.objects.find(o => o.id === objId);
  if (!obj && roomData.decorations) {
    obj = roomData.decorations.find(d => d.id === objId);
  }
  
  if (obj && obj.onInteract) {
    obj.onInteract(element);
  }
}

function toggleWindowSwing() {
  if (GameState.currentRoom === 'bedroom' && !GameState.flags['bedroom_windowClosed']) {
    GameState.flags['bedroom_windowClosingState'] = !GameState.flags['bedroom_windowClosingState'];
    const w = document.getElementById('obj-window');
    if (w) {
      if (GameState.flags['bedroom_windowClosingState']) {
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

let timeInBathroom = 0;
function checkBathroomLight() {
  if (GameState.currentRoom === 'bathroom' && !GameState.flags['bathroom_pillTaken']) {
    timeInBathroom++;
    // Time limit before panic starts damaging
    if (timeInBathroom > 15 && GameState.hpDrainRate === 0) {
      showDialogue("ไฟกะพริบถี่ทำให้คุณเริ่มหลอน! (บาดเจ็บต่อเนื่อง)");
      GameState.hpDrainRate = 0.1; // 1 unit per 10 seconds
    }
  } else if (GameState.currentRoom === 'bathroom' && GameState.flags['bathroom_pillTaken']) {
      GameState.hpDrainRate = 0; // stop panic
  }
}

function toggleFlashlight() {
    const flags = GameState.flags;
    if (GameState.smartphoneBattery <= 0) {
        showDialogue("แบตเตอรี่โทรศัพท์หมดเกลี้ยง เปิดแฟลชไม่ได้แล้ว!");
        return;
    }
    
    flags['storage_flashLightOn'] = !flags['storage_flashLightOn'];
    updateRoomVisuals('storage');
    
    if (flags['storage_flashLightOn']) {
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
