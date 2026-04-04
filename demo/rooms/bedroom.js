window.RoomData = window.RoomData || {};
window.RoomData.bedroom = {
  objects: [
    { id: 'bed', name: 'เตียงนอน', bounds: { left: 10, top: 60, width: 40, height: 30 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags['bedroom_stoodUp']) {
          flags['bedroom_stoodUp'] = true;
          showDialogue("คุณลุกขึ้นนั่งบนเตียงอย่างงัวเงีย...");
        } else {
          showDialogue("คุณลงจากเตียงแล้ว ไม่ควรกลับไปนอนอีก");
        }
      }
    },
    { id: 'alarm', name: 'นาฬิกาปลุก', bounds: { left: 55, top: 55, width: 10, height: 10 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags['bedroom_stoodUp']) {
          takeDamage("เอื้อมหยิบนาฬิการ่วงใส่หน้า เพราะยังงัวเงีย");
        } else if (!flags['bedroom_alarmOff']) {
          flags['bedroom_alarmOff'] = true;
          addLog("อย่าลืมทานยาเม็ดสีชมพูเข้มนะ (จากโน้ตใต้นาฬิกา)");
          showDialogue("ปิดนาฬิกาปลุกแล้ว... พบโน้ตเตือนใจ: 'อย่าลืมทานยาเม็ดสีชมพูเข้มนะ'");
        } else {
          showDialogue("นาฬิกาหยุดร้องแล้ว");
        }
      }
    },
    { id: 'window', name: 'หน้าต่าง', bounds: { left: 40, top: 20, width: 20, height: 30 }, classes: 'swinging',
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags['bedroom_stoodUp']) {
          showDialogue("ยังไม่ได้ลุกจากเตียงเลย");
          return;
        }
        if (!flags['bedroom_alarmOff']) {
          takeDamage("เดินสะดุดขอบเตียง เพราะยังไม่ได้ปิดนาฬิกาให้ตื่นดี");
          return;
        }
        if (!flags['bedroom_windowClosed']) {
          if (flags['bedroom_windowClosingState']) {
            flags['bedroom_windowClosed'] = true;
            showDialogue("คุณดึงหน้าต่างปิดได้จังหวะพอดี พัดลมหมุนเบาลงแล้วและตู้เสื้อผ้าเริ่มนิ่งขึ้น");
            updateRoomVisuals();
          } else {
            die("ดึงผิดจังหวะ! บานหน้าต่างอ้าออก พัดคุณตกลงไปข้างล่าง...");
          }
        } else {
          showDialogue("หน้าต่างปิดสนิทแล้ว");
        }
      }
    },
    { id: 'wardrobe', name: 'ตู้เสื้อผ้า', bounds: { left: 70, top: 15, width: 20, height: 60 }, classes: 'heavy-shake',
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags['bedroom_stoodUp']) {
           takeDamage("รีบร้อนลุกไปที่ตู้เสื้อผ้าจนกลิ้งตกเตียง");
           return;
        }
        if (!flags['bedroom_alarmOff']) {
           takeDamage("เดินสะดุดขอบเตียง เพราะยังไม่ได้ปิดนาฬิกาให้ตื่นดี");
           return;
        }
        if (!flags['bedroom_windowClosed']) {
          takeDamage("ตู้เสื้อผ้าสั่นแรงหนีบมือ!");
          return;
        } else if (!flags['bedroom_wardrobeClosed']) {
          flags['bedroom_wardrobeClosed'] = true;
          showDialogue("คุณปิดประตูตู้เสื้อผ้าจนสนิท... มี 'ผ้าเช็ดตัว' แขวนอยู่ที่ประตู คุณจึงหยิบมา");
          addItem('towel', 'ผ้าเช็ดตัว');
          flags['bedroom_gotTowel'] = true;
          flags['bedroom_doorUnlocked'] = true;
          updateRoomVisuals();
        } else {
          showDialogue("ตู้เสื้อผ้าปิดสนิทดีแล้ว");
        }
      }
    },
    { id: 'fan', name: 'พัดลมเพดาน (ลอดผ่าน)', bounds: { left: 30, top: 0, width: 40, height: 15 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags['bedroom_stoodUp']) {
           showDialogue("ยังนอนอยู่บนเตียง รอดพ้นจากพัดลมไปได้");
           return;
        }
        if (!flags['bedroom_windowClosed']) {
           die("คุณเดินเข้าไปใกล้พัดลมที่กำลังส่ายแรง ใบพัดหลุดกระเด็นใส่คุณตายคาที่...");
        } else {
           showDialogue("พัดลมหมุนเบาลงแล้ว คุณเดินลอดผ่านไปได้อย่างปลอดภัยเพื่อทำธุระต่อ");
        }
      }
    },
    { id: 'door_bathroom', name: 'ประตูห้องน้ำ', bounds: { left: 5, top: 10, width: 15, height: 35 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags['bedroom_stoodUp']) {
           takeDamage("รีบร้อนลุกไปที่ประตูจนกลิ้งตกเตียง");
           return;
        }
        if (!flags['bedroom_gotTowel']) {
           showDialogue("ประตูล็อคอยู่... ต้องหาทางเตรียมตัวให้พร้อมก่อน (ได้ผ้าเช็ดตัวแล้วประตูจะแง้มเอง)");
        } else {
           showDialogue("คุณลงมือผลักประตูเดินเข้าสู่ห้องน้ำ");
           GameState.flags.timeInBathroom = 0;
           saveCheckpoint();
           loadRoom('bathroom');
        }
      }
    },
    { id: 'door_hallway', name: 'ประตูออกโถง', bounds: { left: 85, top: 20, width: 15, height: 40 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags['bedroom_stoodUp']) return;
        if (!hasItem('key')) {
           showDialogue("ประตูล็อคแน่นหนา ต้องหากุญแจมาไขเปิดเท่านั้น");
        } else {
           removeItem('key');
           showDialogue("คุณไขกุญแจและผลักประตูเปิดออกไปสู่โถงทางเดินชั้น 2...");
           saveCheckpoint();
           loadRoom('hallway_f2');
        }
      }
    }
  ],
  decorations: [],
  setupUI: function() {
    // No dynamically injected UI required
  },
  updateVisuals: function() {
    const flags = GameState.flags;
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
      wardrobeEl.classList.remove('heavy-shake', 'light-shake');
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
  },
  onSecondTimer: function() {
    const flags = GameState.flags;

    // Window swinging toggle (every 2 ticks = 2000ms)
    flags['bedroom_windowTick'] = (flags['bedroom_windowTick'] || 0) + 1;
    if (flags['bedroom_windowTick'] % 2 === 0) {
      this.toggleWindowSwing();
    }

    if (!flags['bedroom_windowClosed']) {
      flags.bedroom_timer++;
      const fanEl = document.getElementById('obj-fan');
      if (fanEl) {
        if (flags.bedroom_timer > 45) { 
           die("พัดลมเพดานหมุนส่ายอย่างรุนแรงจนใบพัดหลุดกระเด็นใส่คุณตายคาที่...");
        } else if (flags.bedroom_timer > 30) {
           fanEl.innerText = 'พัดลมเพดาน (สั่นแรงมาก อันตราย!)';
           fanEl.classList.remove('danger-low');
           fanEl.classList.add('danger-high');
        } else if (flags.bedroom_timer > 15) {
           fanEl.innerText = 'พัดลมเพดาน (ส่ายเริ่มแรงขึ้น)';
           fanEl.classList.add('danger-low');
        }
      }
    }
  },
  toggleWindowSwing: function() {
    if (!GameState.flags['bedroom_windowClosed']) {
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
};
