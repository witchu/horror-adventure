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
      id: 'iron_plug', name: 'ปลั๊กเตารีด', bounds: { left: 45, top: 40, width: 15, height: 15 },
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
          if (addItem('dirty_clothes', 'เสื้อผ้าสกปรก')) {
             flags.laundry_basket_empty = true;
             showDialogue('คุณหยิบเสื้อผ้าสกปรกจากตะกร้าเก็บไว้... มีกระดาษโน้ตหลุดออกมา: "ห้องนี้อบอ้าวไปด้วยความร้อน ควรทำให้อากาศถ่ายเทเสมอ"');
             addLog('ข้อความ: ควรทำให้อากาศถ่ายเทเสมอ สำหรับห้องซักล้าง');
          }
        } else if (!flags.laundry_wheel_taken) {
          if (addItem('basket_wheel', 'อะไหล่ล้อตะกร้าผ้า')) {
             flags.laundry_wheel_taken = true;
             showDialogue('คุณตรวจสอบตะกร้าผ้าที่ว่างเปล่า... ถอดอะไหล่ล้อจากตะกร้าผ้าได้ [ได้อะไหล่ล้อตะกร้าผ้า]');
          }
        } else {
          showDialogue('ตะกร้าผ้าว่างเปล่า ไม่มีอะไรให้ใช้แล้ว');
        }
      }
    },
    {
      id: 'washer', name: 'เครื่องซักผ้า', bounds: { left: 40, top: 60, width: 25, height: 30 },
      onInteract: (element) => {
        if (window.RoomData.laundry.openWasherUI) {
            window.RoomData.laundry.openWasherUI(element);
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
        showDialogue('เป็นประตูบานสวิงเล็กๆ คุณมุดหัวและลำตัวพยายามมุดออกไป...');
        triggerDeath('ร่างกายคุณติดอยู่กลางช่องแคบขยับไม่ได้ ไม่มีใครช่วยเหลือ ขาดอากาศหายใจจนเสียชีวิต!');
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
            takeDamage('เตารีดบาดเจ็บ!', 1.0);
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
          takeDamage('เศษกระจกบาด', 0.2, false);
          saveCheckpoint();
          loadRoom('front_garden');
        } else {
          if (hasItem('fire_extinguisher')) {
            flags.laundry_window_broken = true;
            removeItem('fire_extinguisher');
            showDialogue('คุณใช้ถังดับเพลิงทุบกระจกหน้าต่างบานเกล็ดจนแตก! กลิ่นอายความอิสระลอยเข้ามา... (ถังดับเพลิงพังเสียไปแล้ว)');
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
  setupUI: function () {
    if (!document.getElementById('laundry-ui-container')) {
        const uiStr = `
          <div id="laundry-ui-container" class="ui-overlay hidden">
              <div class="ui-panel">
                  <h3 id="laundry-washer-title">เครื่องซักผ้า</h3>
                  <div class="pill-grid" id="laundry-washer-options">
                  </div>
                  <button class="close-ui-btn" id="laundry-close-ui">ปิด</button>
              </div>
          </div>
        `;
        const d = document.createElement('div');
        d.innerHTML = uiStr;
        document.body.appendChild(d.firstElementChild);
        document.getElementById('laundry-close-ui').onclick = () => {
            document.getElementById('laundry-ui-container').classList.add('hidden');
        };
    }
  },
  openWasherUI: function(element) {
      const flags = GameState.flags;
      const opts = document.getElementById('laundry-washer-options');
      const title = document.getElementById('laundry-washer-title');
      opts.innerHTML = '';
      if (flags.laundry_washer_running) {
          title.innerText = 'เครื่องซักผ้ากำลังทำงาน คุณจะทำอะไร?';
          const btn = document.createElement('button');
          btn.className = 'pill-btn';
          btn.innerText = '[หยุดการทำงาน]';
          btn.onclick = () => {
              document.getElementById('laundry-ui-container').classList.add('hidden');
              flags.laundry_washer_running = false;
              showDialogue('คุณกดปิดเครื่องซักผ้า');
              element.classList.remove('washer-shaking');
          };
          opts.appendChild(btn);
      } else {
          title.innerText = 'เครื่องซักผ้าปิดอยู่ คุณจะทำอะไร?';
          const btn1 = document.createElement('button');
          btn1.className = 'pill-btn';
          btn1.innerText = '[เริ่มทำงาน]';
          btn1.onclick = () => {
              document.getElementById('laundry-ui-container').classList.add('hidden');
              flags.laundry_washer_running = true;
              if (!flags.laundry_washer_has_clothes) {
                  showDialogue('คุณเปิดเครื่องซักผ้าโดยที่ไม่มีเสื้อผ้าอยู่ข้างใน! ฟองจากผงซักฟอกเริ่มล้นออกมา!');
              } else {
                  showDialogue('คุณเปิดเครื่องซักผ้า เครื่องเริ่มทำงานและสั่นอย่างแรง');
              }
              element.classList.add('washer-shaking');
          };
          opts.appendChild(btn1);

          const btn2 = document.createElement('button');
          btn2.className = 'pill-btn';
          btn2.innerText = '[ใส่เสื้อผ้าลงไป]';
          btn2.onclick = () => {
              document.getElementById('laundry-ui-container').classList.add('hidden');
              if (hasItem('dirty_clothes')) {
                  removeItem('dirty_clothes');
                  flags.laundry_washer_has_clothes = true;
                  showDialogue('คุณเปิดฝาแล้วเอาเสื้อผ้าสกปรกใส่เข้าไปในเครื่องซักผ้า');
              } else if (flags.laundry_washer_has_clothes) {
                  showDialogue('มีเสื้อผ้าอยู่ข้างในเครื่องแล้ว');
              } else {
                  showDialogue('คุณไม่มีเสื้อผ้าให้ใส่ลงไป ลองหาตะกร้าผ้าดู');
              }
          };
          opts.appendChild(btn2);
      }
      document.getElementById('laundry-ui-container').classList.remove('hidden');
  },
  updateVisuals: function () {
    const flags = GameState.flags;
    const ironEl = document.getElementById('obj-iron');
    if (ironEl) {
        if (flags.laundry_iron_plugged && !flags.laundry_iron_up) {
            if (flags.laundry_iron_timer > 30) {
                ironEl.classList.add('danger-high');
                ironEl.classList.remove('danger-low');
            } else if (flags.laundry_iron_timer > 10) {
                ironEl.classList.add('danger-low');
                ironEl.classList.remove('danger-high');
            } else {
                ironEl.classList.remove('danger-low', 'danger-high');
            }
        } else {
            ironEl.classList.remove('danger-low', 'danger-high');
        }
    }
    const fanEl = document.getElementById('obj-fan');
    if (fanEl && flags.laundry_fan_on) { fanEl.classList.add('laundry-fan-on'); }

    const washerEl = document.getElementById('obj-washer');
    if (washerEl && flags.laundry_washer_running) { washerEl.classList.add('washer-shaking'); }
  },
  onSecondTimer: function () {
    const flags = GameState.flags;

    // Engine heat
    if (!flags.laundry_fan_on) {
      GameState.hpDrainRate = 0.02;
    } else {
      GameState.hpDrainRate = 0; // Reduced drain
    }

    // Washer logic
    if (flags.laundry_washer_running) {
      GameState.hpDrainRate += 0.02; // panic from shaking

      if (!flags.laundry_washer_has_clothes) {
        flags.laundry_washer_timer++;
        if (flags.laundry_washer_timer >= 20 && !flags.laundry_floor_wet) {
          flags.laundry_floor_wet = true;
          if (els.interactiveLayer) els.interactiveLayer.classList.add('floor-wet');
        }
        if (flags.laundry_washer_timer >= 60) {
          triggerDeath('ฟองล้นเต็มพื้นปริมาณมหาศาล ทำให้คุณลื่นล้มหัวใจวายตาย!');
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
