window.RoomData = window.RoomData || {};

Object.assign(GameState.flags, {
  living_room_tv_on: true,
  living_room_phone_timer: 0,
  living_room_phone_missed: false,
  living_room_tv_timer: 0,
  living_room_door_broken: false,
  living_room_door_fixed: false,
  living_room_blanket_checked: false,
  living_room_dishes_checked: false,
  living_room_dishes_organized: false,
  living_room_drawer_open: false,
  living_room_dogbed_check_count: 0,
  living_room_extinguisher_taken: false,
  living_room_dining_door_closed: false,
});

window.RoomData.living_room = {
  styles: `
.room-living_room { background-image: url('assets/living_room_bg.png'); }
.living-room-tv-glow { box-shadow: 0 0 20px 10px rgba(150,150,150,0.5); }
.door-shaking { animation: shake 0.5s infinite; }
@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}
  `,
  objects: [
    { id: 'phone', name: 'โทรศัพท์บ้าน', bounds: { left: 20, top: 50, width: 10, height: 10 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags.living_room_phone_missed && flags.living_room_phone_timer < 30) {
          flags.living_room_phone_missed = true; // Stop ringing ringing
          showDialogue('รับสาย... "พกยาเม็ดสีฟ้าไปด้วย มันช่วยระงับอาการเฉียบพลันได้... ไม่ควรใช้บ่อย! ยาอยู่ในที่ปลอดภัย ห่างจากสัตว์เลี้ยง" (เสียงโทรศัพท์ตัดไป)');
          addLog("เบาะแส: พกยาเม็ดสีฟ้าติดตัว และเก็บที่เหลือไว้ที่ปลอดภัย");
        } else {
          showDialogue('โทรศัพท์เงียบสนิท');
        }
      }
    },
    { id: 'tv', name: 'ทีวี', bounds: { left: 40, top: 40, width: 25, height: 20 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (hasItem('tv_remote')) {
           if (flags.living_room_tv_on) {
             flags.living_room_tv_on = false;
             showDialogue('คุณใช้รีโมทปิดทีวี เสียงซ่าและเสียงรายงานข่าวหายไป ห้องเงียบลง');
             GameState.hpDrainRate = 0;
             window.RoomData.living_room.updateVisuals();
           } else {
             flags.living_room_tv_on = true;
             showDialogue('คุณใช้รีโมทเปิดทีวี');
             GameState.hpDrainRate = 0.02; // Drain HP
             window.RoomData.living_room.updateVisuals();
           }
        } else {
           if (flags.living_room_tv_on) {
             showDialogue('ทีวีเปิดค้างไว้ เสียงนักข่าวรายงานเหตุฆาตกรรมในท้องถิ่น... น่ากลัว (ต้องหารีโมทเพื่อปิดมัน)');
           } else {
             showDialogue('ทีวีปิดอยู่');
           }
        }
      }
    },
    { id: 'sofa_blanket', name: 'ผ้าห่มบนโซฟา', bounds: { left: 40, top: 65, width: 30, height: 20 },
      onInteract: (element) => {
        if (!GameState.flags.living_room_blanket_checked) {
          GameState.flags.living_room_blanket_checked = true;
          showDialogue('ตรวจสอบผ้าห่มที่ยู่ยี่... พบ [รีโมททีวี]');
          addItem('tv_remote', 'รีโมททีวี');
        } else {
          showDialogue('โซฟาเก่าๆ ไม่มีอะไรซ่อนอยู่อีก');
        }
      }
    },
    { id: 'dishes', name: 'จานชามสกปรก', bounds: { left: 50, top: 85, width: 20, height: 10 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags.living_room_dishes_checked) {
          flags.living_room_dishes_checked = true;
          takeDamage(0.2, "แมลงสาบวิ่งออกมาจากจานชามสกปรก!");
        } else if (!flags.living_room_dishes_organized) {
          flags.living_room_dishes_organized = true;
          showDialogue('คุณจัดจานชามให้เป็นระเบียบ... พบ [กุญแจตู้จดหมาย] ซ่อนอยู่!');
          addItem('key_mailbox', 'กุญแจตู้จดหมาย');
        } else {
          showDialogue('จานชามถูกจัดเรียงเป็นระเบียบแล้ว');
        }
      }
    },
    { id: 'tv_drawer', name: 'ลิ้นชักชั้นวางทีวี', bounds: { left: 40, top: 60, width: 25, height: 10 },
      onInteract: (element) => {
        if (!GameState.flags.living_room_drawer_open) {
          const ans = prompt('เปิดลิ้นชัก... พบยาเม็ดสีฟ้าจำนวนหนึ่ง คุณจะทำอะไร?\n1. เก็บเป็นเสบียงฉุกเฉิน\n2. ทานให้หมดตอนนี้เลย');
          if (ans === '1') {
            GameState.flags.living_room_drawer_open = true;
            showDialogue('คุณเลือกที่จะเก็บมันไว้เป็นเสบียงฉุกเฉิน (ไม่ใช่ควรกินทั้งหมด)');
            addLog("พกยาเม็ดสีฟ้าติดตัวไปนิดหน่อย และเก็บที่เหลือไว้ที่นี่");
          } else if (ans === '2') {
            triggerDeath('คุณกินยาเม็ดสีฟ้าทั้งหมดรวดเดียว อาการ Overdose ทำให้หัวใจวายเฉียบพลันและเสียชีวิตทันที!');
          }
        } else {
          showDialogue('ลิ้นชักเปิดอยู่ ไม่มียาเหลือแล้ว');
        }
      }
    },
    { id: 'dog_bed', name: 'เบาะนอนสุนัข', bounds: { left: 80, top: 75, width: 15, height: 15 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags.living_room_dogbed_check_count === 0) {
          flags.living_room_dogbed_check_count++;
          showDialogue('ตรวจสอบเบาะนอนสุนัข พบสมุดเบอร์โทรศัพท์ฉีกขาดด้วยรอยฟันแทะ มีรอยปากกาขีดซ้ำที่เบอร์แรกสุด... จดบันทึก: รหัสรั้วลำดับที่ 3 คือ 1');
          addLog('รหัสรั้วลำดับที่ 3 = "1"');
        } else if (flags.living_room_dogbed_check_count === 1) {
          flags.living_room_dogbed_check_count++;
          showDialogue('ตรวจสอบซ้ำด้านล่างเบาะ... พบ [ลูกบิดประตู (มีรอยถลอก)]!');
          addItem('door_knob', 'ลูกบิดประตู');
        } else {
          showDialogue('ไม่มีอะไรซ่อนอยู่ในเบาะนอนสุนัขแล้ว');
        }
      }
    },
    { id: 'dog_bowl', name: 'ชามอาหารสุนัข', bounds: { left: 75, top: 85, width: 8, height: 8 },
      onInteract: (element) => {
        showDialogue('คุณตักอาหารสุนัขที่เหลือเข้ากระเป๋า [ได้อาหารสุนัข]');
        if (!hasItem('dog_food')) {
            addItem('dog_food', 'อาหารสุนัข');
        }
      }
    },
    { id: 'door_hallway', name: 'ประตูโถงทางเดิน', bounds: { left: 5, top: 15, width: 15, height: 50 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags.living_room_door_broken) {
          showDialogue('คุณเปิดประตูที่พังออก... บางอย่างชั่วร้ายยืนรออยู่อีกฝั่ง!!');
          triggerDeath('ช็อกตายจากสิ่งน่าหวาดกลัวที่พังประตูเข้ามา');
        } else if (flags.living_room_door_fixed) {
           showDialogue('ประตูถูกซ่อมและล็อคแล้ว ประตูยังคงฝืดอยู่ มีกำลังในการดึงเปิดไม่พอ คุณออกทางนี้ไม่ได้');
        } else {
          if (hasItem('door_knob')) {
            flags.living_room_door_fixed = true;
            removeItem('door_knob');
            showDialogue('คุณใช้ลูกบิดประตูซ่อมทางออกฝั่งโถง และล็อคจากด้านในสำเร็จ! ประตูหยุดสั่นและปลอดภัยแล้ว');
            window.RoomData.living_room.updateVisuals();
          } else {
            showDialogue('ประตูเชื่อมห้องโถง ปิดแน่นแต่ลูกบิดหลุดหายไป ล็อกจากด้านในไม่ได้... (มันกำลังสั่น!)');
          }
        }
      }
    },
    { id: 'door_dining', name: 'ประตูทางเชื่อมห้องทานข้าว', bounds: { left: 80, top: 15, width: 15, height: 50 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags.living_room_dining_door_closed) {
          flags.living_room_dining_door_closed = false;
          showDialogue('เปิดประตูเชื่อมห้องทานข้าว');
        } else {
          showDialogue('คุณเดินกลับเข้าไปในห้องทานข้าว');
          saveCheckpoint();
          loadRoom('dining_room');
        }
      }
    },
    { id: 'door_dining_close', name: 'บานประตูห้องทานข้าว', bounds: { left: 70, top: 20, width: 10, height: 10 },
      onInteract: (element) => {
         const flags = GameState.flags;
         if (!flags.living_room_dining_door_closed) {
            flags.living_room_dining_door_closed = true;
            if (!flags.living_room_extinguisher_taken) {
                showDialogue('คุณปิดประตูห้องทานข้าว... เผยให้เห็น [ถังดับเพลิง] ซ่อนอยู่หลังประตู!');
            } else {
                showDialogue('คุณปิดประตูห้องทานข้าว');
            }
         } else {
            flags.living_room_dining_door_closed = false;
            showDialogue('คุณเปิดประตูห้องทานข้าวอ้าไว้ตามเดิม');
         }
         window.RoomData.living_room.updateVisuals();
      }
    },
    { id: 'fire_extinguisher_obj', name: 'ถังดับเพลิง', bounds: { left: 75, top: 25, width: 10, height: 20 },
      onInteract: (element) => {
         const flags = GameState.flags;
         if (flags.living_room_dining_door_closed && !flags.living_room_extinguisher_taken) {
             flags.living_room_extinguisher_taken = true;
             addItem('fire_extinguisher', 'ถังดับเพลิง');
             showDialogue('คุณหยิบถังดับเพลิงมาสะพายไว้ [ได้รับถังดับเพลิง]');
         } else {
             showDialogue('คุณเก็บถังดับเพลิงไปแล้ว');
         }
         window.RoomData.living_room.updateVisuals();
      }
    }
  ],
  decorations: [],
  setupUI: function() {},
  updateVisuals: function() {
    const flags = GameState.flags;
    const tvObj = document.getElementById('obj-tv');
    if (tvObj) {
      if (flags.living_room_tv_on) {
         tvObj.classList.add('living-room-tv-glow');
      } else {
         tvObj.classList.remove('living-room-tv-glow');
      }
    }
    const doorHallway = document.getElementById('obj-door_hallway');
    if (doorHallway) {
       if (!flags.living_room_door_fixed && flags.living_room_tv_on) {
          doorHallway.classList.add('door-shaking');
       } else {
          doorHallway.classList.remove('door-shaking');
       }
    }
    const extObj = document.getElementById('obj-fire_extinguisher_obj');
    if (extObj) {
        if (flags.living_room_dining_door_closed && !flags.living_room_extinguisher_taken) {
            extObj.style.display = 'block';
        } else {
            extObj.style.display = 'none';
        }
    }
  },
  onSecondTimer: function() {
    const flags = GameState.flags;
    if (flags.living_room_tv_on) {
       if (flags.living_room_door_fixed) {
           GameState.hpDrainRate = 0; // stop HP drain if door fixed
       } else {
           GameState.hpDrainRate = 0.02; // Drain slowly
       }
       
       if (!flags.living_room_door_fixed && !flags.living_room_door_broken) {
         flags.living_room_tv_timer++;
         if (flags.living_room_tv_timer >= 60) {
            flags.living_room_door_broken = true;
            triggerDeath("ประตูพังเข้ามา สิ่งชั่วร้ายทะลักเข้ามาในห้อง!");
         }
       }
    } else {
       GameState.hpDrainRate = 0;
       if (!flags.living_room_door_fixed) {
           flags.living_room_tv_timer = 0; // stop timer if TV is off
       }
    }

    if (!flags.living_room_phone_missed) {
        flags.living_room_phone_timer++;
        if (flags.living_room_phone_timer === 1 || flags.living_room_phone_timer === 15) {
            showDialogue("กริ๊งงงง! โทรศัพท์บ้านดังขึ้น...");
        }
    }
  }
};
