window.RoomData = window.RoomData || {};

Object.assign(GameState.flags, {
  laundry_fan_on: false,
  laundry_iron_up: false,
  laundry_iron_plugged: true,
  laundry_washer_has_clothes: false,
  laundry_washer_running: false,
  laundry_floor_wet: false,
  laundry_basket_empty: false,
  laundry_wheel_taken: false,
  laundry_on_board: false,
  laundry_window_broken: false,
  laundry_washer_timer: 0,
  laundry_iron_timer: 0
});

window.RoomData.laundry = {
  styles: `
.room-laundry { background-image: url('assets/laundry_bg.png'); }
.laundry-fan-on { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.washer-shaking { animation: shake 0.2s infinite; }
.floor-wet { background-color: rgba(173, 216, 230, 0.5); border-bottom: 5px solid blue; }
  `,
  objects: [
    {
      id: 'dryer', name: 'เครื่องอบผ้า', bounds: { left: 10, top: 50, width: 20, height: 30 },
      onInteract: (element) => {
        showDialogue('เครื่องอบผ้าทำงานหนัก เสียงดังอื้ออึงและแผ่ความร้อน ปิดไม่ได้!');
      }
    },
    {
      id: 'iron', name: 'เตารีด', bounds: { left: 40, top: 45, width: 10, height: 10 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags.laundry_iron_plugged) {
          showDialogue('เตารีดถูกถอดปลั๊กแล้ว ปลอดภัย');
          return;
        }

        if (!flags.laundry_iron_up) {
          flags.laundry_iron_up = true;
          showDialogue('คุณตั้งเตารีดขึ้น (ยังเสียบปลั๊กอยู่)');
        } else {
          showDialogue('เตารีดถูกตั้งขึ้นแล้ว');
        }
      }
    },
    {
      id: 'iron_plug', name: 'ปลั๊กเตารีด', bounds: { left: 35, top: 40, width: 5, height: 5 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags.laundry_iron_plugged) {
          showDialogue('ปลั๊กถูกถอดออกแล้ว');
          return;
        }

        if (flags.laundry_floor_wet) {
          triggerDeath('ไฟดูด! ถอดปลั๊กขณะพื้นเปียก กระแสไฟฟ้าวิ่งผ่านน้ำเข้าสู่ร่างกายทันที!');
        } else if (!flags.laundry_iron_up) {
          showDialogue('ควรตั้งเตารีดขึ้นก่อนจะเอื้อมไปถอดปลั๊ก เพื่อความปลอดภัย');
        } else {
          flags.laundry_iron_plugged = false;
          showDialogue('คุณถอดปลั๊กเตารีดสำเร็จ ตอนนี้เตารีดและที่รองรีดปลอดภัยแล้ว');
        }
      }
    },
    {
      id: 'fan', name: 'พัดลมระบายอากาศ', bounds: { left: 80, top: 10, width: 10, height: 10 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags.laundry_fan_on) {
          flags.laundry_fan_on = true;
          showDialogue('เปิดพัดลมระบายอากาศ ลดความร้อนสะสมในห้องลงได้บ้าง');
          element.classList.add('laundry-fan-on');
        } else {
          showDialogue('พัดลมระบายอากาศเปิดอยู่แล้ว');
        }
      }
    },
    {
      id: 'basket', name: 'ตะกร้าผ้า', bounds: { left: 70, top: 70, width: 15, height: 20 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags.laundry_basket_empty) {
          flags.laundry_basket_empty = true;
          flags.laundry_washer_has_clothes = true;
          showDialogue('คุณเทเสื้อผ้าทั้งหมดลงเครื่องซักผ้า... มีกระดาษโน้ตหลุดออกมา: "ห้องนี้อบอ้าวไปด้วยความร้อน ควรทำให้อากาศถ่ายเทเสมอ"');
          addLog('ข้อความ: ควรทำให้อากาศถ่ายเทเสมอ สำหรับห้องซักล้าง');
        } else if (!flags.laundry_wheel_taken) {
          flags.laundry_wheel_taken = true;
          showDialogue('คุณถอดอะไหล่ล้อจากตะกร้าผ้าที่ว่างเปล่า [ได้อะไหล่ล้อตะกร้าผ้า]');
          addItem('basket_wheel', 'อะไหล่ล้อตะกร้าผ้า');
        } else {
          showDialogue('ตะกร้าผ้าว่างเปล่า ไม่มีอะไรให้ใช้แล้ว');
        }
      }
    },
    {
      id: 'washer', name: 'เครื่องซักผ้า', bounds: { left: 40, top: 60, width: 25, height: 30 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags.laundry_washer_running) {
          flags.laundry_washer_running = false;
          showDialogue('คุณกดปิดเครื่องซักผ้า');
          element.classList.remove('washer-shaking');
        } else {
          flags.laundry_washer_running = true;
          if (!flags.laundry_washer_has_clothes) {
            showDialogue('คุณเปิดเครื่องซักผ้าโดยที่ไม่มีเสื้อผ้าอยู่ข้างใน! ฟองจากผงซักฟอกเริ่มล้นออกมา!');
          } else {
            showDialogue('คุณเปิดเครื่องซักผ้า เครื่องเริ่มทำงานและสั่นอย่างแรง');
          }
          element.classList.add('washer-shaking');
        }
      }
    },
    {
      id: 'door_garden', name: 'ประตูล็อค', bounds: { left: 75, top: 30, width: 15, height: 60 },
      onInteract: (element) => {
        showDialogue('ประตูออกสู่สวนล็อคตายจากด้านใน เปิดไม่ได้');
      }
    },
    {
      id: 'pet_flap', name: 'ช่องสัตว์เลี้ยงบนประตู', bounds: { left: 80, top: 80, width: 5, height: 5 },
      onInteract: (element) => {
        showDialogue('เป็นประตูบานสวิงเล็กๆ คุณพยายามมุดออกไป...');
        triggerDeath('ร่างกายคุณติดอยู่กลางช่องแคบ ไม่มีใครช่วยเหลือ ขาดอากาศหายใจจนเสียชีวิต!');
      }
    },
    {
      id: 'ironing_board', name: 'โต๊ะรีดผ้า', bounds: { left: 20, top: 50, width: 20, height: 10 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags.laundry_on_board) {
          flags.laundry_on_board = false;
          showDialogue('คุณลงจากโต๊ะรีดผ้า');
        } else {
          if (flags.laundry_iron_plugged) {
            showDialogue('คุณพยายามปีนโต๊ะรีดผ้า... สัมผัสโดนเตารีดที่กำลังร้อนจัด!! (พุพอง)');
            takeDamage(1.0, 'เตารีดบาดเจ็บ!');
            flags.laundry_on_board = true;
          } else {
            flags.laundry_on_board = true;
            showDialogue('คุณปีนขึ้นมาบนโต๊ะรีดผ้า เพื่อเอื้อมถึงหน้าต่างบานเกร็ด');
          }
        }
      }
    },
    {
      id: 'window', name: 'หน้าต่างบานเกร็ด', bounds: { left: 20, top: 20, width: 20, height: 20 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags.laundry_on_board) {
          showDialogue('หน้าต่างอยู่สูงเกินไป คุณต้องปีนอะไรสักอย่างขึ้นไป');
          return;
        }

        if (flags.laundry_window_broken) {
          showDialogue('คุณปีนออกทางหน้าต่างซี่กระจกที่แตกแล้ว ถูกกระจกบาดเล็กน้อย... แต่คุณออกไปสู่สวนสำเร็จ!');
          takeDamage(0.2, 'เศษกระจกบาด', false);
          saveCheckpoint();
          loadRoom('front_garden');
        } else {
          if (hasItem('fire_extinguisher')) {
            flags.laundry_window_broken = true;
            showDialogue('คุณใช้ถังดับเพลิงกระแทกหน้าต่างบานเกร็ดจนแตก! ทางออกสู่สวนถูกเปิดออกแล้ว');
          } else {
            showDialogue('หน้าต่างบานเกร็ดฝืดสนิท หมุนไม่ได้ ต้องหาของหนักๆ มาทุบมัน');
          }
        }
      }
    },
    {
      id: 'door_kitchen', name: 'กลับห้องครัว', bounds: { left: 0, top: 20, width: 10, height: 70 },
      onInteract: (element) => {
        if (GameState.flags.laundry_on_board) {
          showDialogue('ลงจากโต๊ะรีดผ้าก่อน');
          return;
        }
        showDialogue('คุณเดินกลับไปยังห้องครัว');
        saveCheckpoint();
        loadRoom('kitchen');
      }
    }
  ],
  decorations: [],
  setupUI: function () { },
  updateVisuals: function () {
    const flags = GameState.flags;
    const fanEl = document.getElementById('obj-fan');
    if (fanEl && flags.laundry_fan_on) { fanEl.classList.add('laundry-fan-on'); }

    const washerEl = document.getElementById('obj-washer');
    if (washerEl && flags.laundry_washer_running) { washerEl.classList.add('washer-shaking'); }
  },
  onSecondTimer: function () {
    const flags = GameState.flags;

    // Engine heat
    if (!flags.laundry_fan_on) {
      GameState.hpDrainRate = 0.03;
    } else {
      GameState.hpDrainRate = 0; // Reduced drain
    }

    // Washer logic
    if (flags.laundry_washer_running) {
      GameState.hpDrainRate += 0.01; // panic from shaking

      if (!flags.laundry_washer_has_clothes) {
        flags.laundry_washer_timer++;
        if (flags.laundry_washer_timer >= 10 && !flags.laundry_floor_wet) {
          flags.laundry_floor_wet = true;
          if (els.interactiveLayer) els.interactiveLayer.classList.add('floor-wet');
        }
        if (flags.laundry_washer_timer >= 30) {
          triggerDeath('ฟองล้นเต็มพื้น ทำให้คุณลื่นล้มหัวใจวายตาย!');
        }
      }
    }

    // Iron logic
    if (flags.laundry_iron_plugged && !flags.laundry_iron_up) {
      flags.laundry_iron_timer++;
      if (flags.laundry_iron_timer >= 45) {
        triggerDeath('เตารีดที่คว่ำหน้าอยู่ความร้อนจัดลุกพรมจนไฟไหม้โต๊ะ ลามมาครอกคุณจนตาย!');
      }
    } else {
      flags.laundry_iron_timer = 0;
    }
  }
};
