window.RoomData = window.RoomData || {};

Object.assign(GameState.flags, {
  hallway_f2_curtainClosed: false,
  hallway_f2_rugSorted: false,
  hallway_f2_lightOn: false,
  hallway_f2_chandelierSwinging: true,
  hallway_f2_chandelierTimer: 0
});

window.RoomData.hallway_f2 = {
  styles: `
.room-hallway_f2 { background-image: url('assets/hallway_f2_bg.png'); }
  `,
  objects: [
    { id: 'curtain', name: 'ผ้าม่านหน้าต่างบานใหญ่', bounds: { left: 20, top: 20, width: 30, height: 50 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags['hallway_f2_curtainClosed']) {
          flags['hallway_f2_curtainClosed'] = true;
          flags['hallway_f2_chandelierSwinging'] = false; // Add explicit flag toggle
          showDialogue("คุณปิดผ้าม่านบานใหญ่... โคมไฟระย้าหยุดแกว่ง โถงทางเดินเริ่มมืดลง");
          updateRoomVisuals();
        } else {
          showDialogue("ผ้าม่านปิดสนิทแล้ว");
        }
      }
    },
    { id: 'rug', name: 'พรมเช็ดเท้า', bounds: { left: 30, top: 80, width: 40, height: 15 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags['hallway_f2_chandelierSwinging'] && !flags['hallway_f2_rugSorted']) {
          flags['hallway_f2_rugSorted'] = true;
          showDialogue("คุณจัดพรมเช็ดเท้าให้เรียบร้อยเพื่อไม่ให้สะดุดเวลาเดิน");
          updateRoomVisuals();
        } else if (flags['hallway_f2_chandelierSwinging']) {
           takeDamage("ขณะเอื้อมไปจัดพรม โคมไฟระย้าที่แกว่งอยู่ร่วงลงมาเฉี่ยวคุณอย่างหวุดหวิด!");
        } else {
           showDialogue("พรมจัดเรียบร้อยดีแล้ว");
        }
      }
    },
    { id: 'light_switch', name: 'สวิตช์ไฟขั้นบันได', bounds: { left: 80, top: 30, width: 10, height: 20 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags['hallway_f2_chandelierSwinging']) {
            die("ยังไม่ทันได้กดสวิตช์ โคมไฟระย้าก็หลุดร่วงลงมาทับคุณตายทันที!");
            return;
        }
        if (!flags['hallway_f2_rugSorted']) {
            takeDamage("ขณะเอื้อมกดปุ่ม คุณสะดุดพรมที่พับอยู่ล้มหัวฟาด!");
            return;
        }
        if (!flags['hallway_f2_lightOn']) {
            flags['hallway_f2_lightOn'] = true;
            showDialogue("คุณกดเปิดสวิตช์ไฟ ไฟทางเดินบันไดสว่างขึ้น มองเห็นเส้นทางลงไปชั้น 1 ชัดเจน");
            updateRoomVisuals();
        } else {
            showDialogue("ไฟสว่างอยู่แล้ว");
        }
      }
    },
    { id: 'stairs_down', name: 'บันไดลงไปชั้นล่าง', bounds: { left: 40, top: 40, width: 20, height: 40 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags['hallway_f2_chandelierSwinging']) {
            die("ยังไม่ทันก้าวลงบันได โคมไฟระย้าก็หลุดร่วงลงมาทับคุณตายทันที!");
            return;
        }
        if (!flags['hallway_f2_rugSorted']) {
            die("คุณสะดุดพรมที่ยับยู่ยี่ หัวคะมำตกบันไดคอหักตาย!");
            return;
        }
        if (!flags['hallway_f2_lightOn']) {
            die("ทางลงบันไดมืดเกินไป คุณก้าวพลาดลื่นตกบันไดหัวฟาดพื้นตาย!");
            return;
        }
        showDialogue("คุณเดินลงบันไดมายังโถงทางเดินชั้น 1");
        saveCheckpoint();
        loadRoom('hallway_f1');
      }
    },
    { id: 'door_bedroom', name: 'กลับห้องนอน', bounds: { left: -5, top: 20, width: 20, height: 50 },
      onInteract: (element) => {
        showDialogue("คุณเปิดประตูกลับเข้าไปในห้องนอน");
        saveCheckpoint();
        loadRoom('bedroom');
      }
    }
  ],
  decorations: [
    { id: 'chandelier', name: 'โคมไฟระย้า', bounds: { left: 30, top: -10, width: 40, height: 30 }, classes: 'chandelier-swing swinging',
      onInteract: (element) => {}
    }
  ],
  setupUI: function() {},
  updateVisuals: function() {
    const flags = GameState.flags;
    const curtain = document.getElementById('obj-curtain');
    const ch = document.getElementById('deco-chandelier');
    const rug = document.getElementById('obj-rug');
    const switchEl = document.getElementById('obj-light_switch');
    
    if (flags['hallway_f2_curtainClosed'] && curtain && ch) {
        curtain.innerText = 'ผ้าม่าน (ปิดสนิท)';
        ch.classList.remove('swinging');
        ch.classList.remove('chandelier-swing');
    }
    if (flags['hallway_f2_rugSorted'] && rug) {
        rug.innerText = 'พรมเช็ดเท้า (จัดระเบียบแล้ว)';
    }
    if (flags['hallway_f2_lightOn'] && switchEl) {
        switchEl.innerText = 'สวิตช์ไฟ (เปิด)';
        switchEl.style.backgroundColor = 'rgba(255,255,200,0.2)';
    }
  },
  onSecondTimer: function() {
    const flags = GameState.flags;

    if (flags['hallway_f2_chandelierSwinging']) {
      flags.hallway_f2_chandelierTimer++;
      const chandelierEl = document.getElementById('deco-chandelier');
      if (chandelierEl) {
        if (flags.hallway_f2_chandelierTimer > 45) { 
           die("โคมไฟระย้าที่แกว่งไปมาทนสภาพไม่ไหวหลุดร่วงลงมาทับคุณตายคาที่...");
        } else if (flags.hallway_f2_chandelierTimer > 30) {
           chandelierEl.innerText = 'โคมไฟระย้า (แกว่งรุนแรง สายสะบัดจะขาดแล้ว!)';
           chandelierEl.classList.remove('danger-low');
           chandelierEl.classList.add('danger-high');
        } else if (flags.hallway_f2_chandelierTimer > 15) {
           chandelierEl.innerText = 'โคมไฟระย้า (แกว่งแรงขึ้น เสียงเอี๊ยดอ๊าดดังมาก)';
           chandelierEl.classList.add('danger-low');
        }
      }
    }
  }
};
