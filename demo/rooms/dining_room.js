(function() {
  let roomEls = {};

  const drinks = [
    { id: 'tea', name: 'ชามิ้นต์ (อุ่น)' },
    { id: 'coffee', name: 'กาแฟดำ (ร้อนจัด)' },
    { id: 'water', name: 'น้ำเปล่า (เย็น)' }
  ];

  function openDiningUI() {
    roomEls.drinkOptions.innerHTML = '';
    drinks.forEach(d => {
      const btn = document.createElement('button');
      btn.className = 'pill-btn';
      btn.innerText = d.name;
      btn.onclick = () => selectDrink(d.id);
      roomEls.drinkOptions.appendChild(btn);
    });
    roomEls.diningUiContainer.classList.remove('hidden');
  }

  function closeDiningUI() {
    roomEls.diningUiContainer.classList.add('hidden');
  }

  function selectDrink(id) {
    closeDiningUI();
    const flags = GameState.flags;
    
    if (flags['dining_room_lightSwitchState'] !== 2) {
        showDialogue("ในห้องมืดไป มองไม่เห็นเลยว่าแก้วไหนเป็นอะไร... รอให้ไฟเปิดก่อนดีกว่า");
        return;
    }
    
    if (id === 'tea') {
        if (!flags['dining_room_teaDrank']) {
            flags['dining_room_teaDrank'] = true;
            showDialogue("ชามิ้นต์ช่วยให้คุณผ่อนคลาย อาการแพนิคทุเลาลง... (ร่างกายคุณพร้อมสำหรับการปีนป่ายแล้ว)");
        } else {
            showDialogue("ชามิ้นต์ถูกดื่มไปหมดแล้ว");
        }
    } else if (id === 'coffee') {
        if (!flags['dining_room_coffeeDrank']) {
            flags['dining_room_coffeeDrank'] = true;
            showDialogue("กาแฟดำเข้มข้นทำให้ใจคุณเต้นแรงขึ้น อาการแพนิคกำเริบ... คุณได้ยินเสียงนาฬิกาดังเคาะบอกเวลาอย่างรวดเร็ว (ต้องรีบดื่มน้ำ!)");
            // The timer hazard is handled in onSecondTimer
        } else {
            showDialogue("กาแฟหมดแล้ว");
        }
    } else if (id === 'water') {
        if (!flags['dining_room_waterDrank']) {
            flags['dining_room_waterDrank'] = true;
            if (flags['dining_room_coffeeDrank']) {
                showDialogue("น้ำเย็นช่วยเจือจางฤทธิ์คาเฟอีน... อาการใจสั่นลดลง เสียงนาฬิกาดังเบาลง รอดตายอย่างหวุดหวิด");
            } else {
                showDialogue("ดื่มน้ำเปล่าชื่นใจดี... (ไม่มีผลอะไรพิเศษ)");
            }
        } else {
            showDialogue("น้ำเปล่าหมดแล้ว");
        }
    }
  }

  window.RoomData = window.RoomData || {};

Object.assign(GameState.flags, {
  dining_room_lightSwitchState: 1, // 1: flickering, 0: off, 2: on-full
  dining_room_teaDrank: false,
  dining_room_coffeeDrank: false,
  dining_room_waterDrank: false,
  dining_room_newspaperRead: false,
  dining_room_keyAcquired: false,
  dining_room_wheelsChecked: false,
  dining_room_clockMoved: false,
  dining_room_drinksAppeared: false,
  dining_room_clockTimer: 0
});

window.RoomData.dining_room = {
    objects: [
      { id: 'switch', name: 'สวิตช์ไฟ', bounds: { left: 10, top: 40, width: 5, height: 10 },
        onInteract: (element) => {
           const flags = GameState.flags;
           if (flags['dining_room_lightSwitchState'] === 1) { // Flickering -> Off
               flags['dining_room_lightSwitchState'] = 0;
               showDialogue("คุณกดสวิตช์ปิดไฟ... ห้องมืดลงอย่างน่าสะพรึง แต่ไฟเลิกกะพริบ");
               updateRoomVisuals();
           } else if (flags['dining_room_lightSwitchState'] === 0) { // Off -> On
               flags['dining_room_lightSwitchState'] = 2;
               showDialogue("คุณกดสวิตช์อีกครั้ง... ไฟสว่างเต็มที่แล้ว! เห็นชุดเครื่องดื่มและหนังสือพิมพ์ชัดเจน");
               updateRoomVisuals();
           } else { // On -> Off
               flags['dining_room_lightSwitchState'] = 0;
               showDialogue("คุณกดสวิตช์ปิดไฟ... ห้องกลับมามืดสนิทอีกครั้ง");
               updateRoomVisuals();
           }
        }
      },
      { id: 'table', name: 'โต๊ะทานข้าว', bounds: { left: 20, top: 60, width: 60, height: 30 },
        onInteract: (element) => {
           const flags = GameState.flags;
           if (flags['dining_room_tableClimbed']) {
               flags['dining_room_tableClimbed'] = false;
               showDialogue("คุณปีนลงมาจากโต๊ะทานข้าวอย่างระมัดระวัง");
               return;
           }
           if (!flags['dining_room_teaDrank']) {
               takeDamage("คุณปีนขึ้นไปบนโต๊ะทั้งที่ยังมีอาการแพนิค... ทรงตัวไม่อยู่และตกลงมาบาดเจ็บ!", 0.25);
               return;
           }
           flags['dining_room_tableClimbed'] = true;
           showDialogue("คุณปีนขึ้นไปบนโต๊ะทานข้าวอย่างมั่นคง สามารถเอื้อมถึงโคมไฟเพดานได้แล้ว (กดที่โต๊ะอีกครั้งเพื่อลง)");
        }
      },
      { id: 'drinks', name: 'ชุดเครื่องดื่ม', bounds: { left: 25, top: 45, width: 25, height: 15 }, classes: 'hidden',
        onInteract: (element) => {
           openDiningUI();
        }
      },
      { id: 'newspaper', name: 'หนังสือพิมพ์', bounds: { left: 55, top: 45, width: 15, height: 15 },
        onInteract: (element) => {
           const flags = GameState.flags;
           if (flags['dining_room_lightSwitchState'] !== 2) {
               showDialogue("ไฟไม่สว่างพอจะอ่านหนังสือพิมพ์");
               return;
           }
           flags['dining_room_newspaperRead'] = true;
           showDialogue("บนหน้ากระดาษหนังสือพิมพ์ มีรอยเขียนด้วยหมึกสีแดง... ลำดับที่สอง คือ 2");
           addLog("Fence Code 2: 2");
        }
      },
      { id: 'lamp', name: 'โคมไฟเพดาน', bounds: { left: 35, top: 0, width: 30, height: 30 },
        onInteract: (element) => {
           const flags = GameState.flags;
           if (!flags['dining_room_tableClimbed']) {
               showDialogue("โคมไฟอยู่สูงเกินไป คุณเอื้อมไม่ถึง (ลองปีนโต๊ะดูสิ)");
               return;
           }
           if (flags['dining_room_lightSwitchState'] !== 0) {
               die("คุณพยายามเอื้อมจับโคมไฟขณะที่ไฟยังมีกระแสไฟฟ้าวิ่งอยู่... ไฟลัดวงจรช็อตคุณอย่างรุนแรงจนสิ้นใจตายคาที่ และไม่ได้กุญแจ!");
               return;
           }
           if (!flags['dining_room_keyAcquired']) {
               flags['dining_room_keyAcquired'] = true;
               addItem('key_storage', 'กุญแจห้องเก็บของ');
               showDialogue("ในความมืด คุณหยิบของที่สะท้อนแสงวิบวับบนขอบโคมไฟ... มันคือ กุญแจห้องเก็บของ!");
               updateRoomVisuals();
           } else {
               showDialogue("ไม่มีอะไรอยู่บนโคมไฟแล้ว");
           }
        }
      },
      { id: 'clock', name: 'นาฬิกาลูกตุ้ม', bounds: { left: 80, top: 20, width: 15, height: 60 },
        onInteract: (element) => {
           const flags = GameState.flags;
           if (flags['dining_room_lightSwitchState'] !== 2) {
               showDialogue("มืดเกินไป หรือไฟกะพริบจนลายตา ไม่อยากขยับของใหญ่");
               return;
           }
           if (flags['dining_room_clockMoved']) {
               showDialogue("นาฬิกาลูกตุ้มถูกเลื่อนพ้นทางประตูแล้ว");
               return;
           }
           if (!flags['dining_room_wheelsChecked']) {
               showDialogue("ลองตรวจสอบดู... พบว่าล้อเลื่อนด้านล่างพัง ต้องการชุดอุปกรณ์ซ่อมล้อมาซ่อมก่อนถึงจะขยับได้");
               flags['dining_room_wheelsChecked'] = true;
           } else {
               if (hasItem('wheel_repair_kit')) {
                   flags['dining_room_clockMoved'] = true;
                   removeItem('wheel_repair_kit');
                   showDialogue("คุณใช้ชุดอุปกรณ์ซ่อมล้อจนเสร็จ และเลื่อนนาฬิกาลูกตุ้มออกจากทางประตูได้สำเร็จ!");
                   updateRoomVisuals();
               } else {
                   die("พยายามเลื่อนนาฬิกาลูกตุ้มที่ยังไม่ได้ซ่อมล้อ... ล้อที่พังทำให้นาฬิกาเอียงและล้มทับตัวคุณตายคาที่!");
               }
           }
        }
      },
      { id: 'door_living', name: 'ประตูห้องนั่งเล่น', bounds: { left: 90, top: 20, width: 10, height: 60 },
        onInteract: (element) => {
           const flags = GameState.flags;
           if (!flags['dining_room_clockMoved']) {
               showDialogue("นาฬิกาลูกตุ้มบังประตูห้องนั่งเล่นอยู่ คุณเข้าไม่ได้");
           } else {
               showDialogue("ประตูเปิดสู่ห้องนั่งเล่น...");
               // Currently this demo might not have living room, so just mock or lock
           }
        }
      },
      { id: 'door_kitchen', name: 'กลับห้องครัว', bounds: { left: 0, top: 70, width: 15, height: 30 },
        onInteract: (element) => {
           showDialogue("กลับสู่ห้องครัว");
           saveCheckpoint();
           loadRoom('kitchen');
        }
      }
    ],
    decorations: [],
    setupUI: function() {
      const container = document.getElementById('game-container');
      const uiHTML = `
        <div id="dining-ui-container" class="ui-overlay hidden">
          <div class="ui-panel">
            <h3>ชุดเครื่องดื่ม</h3>
            <p style="margin-bottom: 20px; font-size: 14px;">เลือกเครื่องดื่มเพื่อดับกระหาย (บางอย่างส่งผลต่อร่างกายชัดเจน)</p>
            <div id="drink-options" class="pill-grid"></div>
            <button class="close-ui-btn" id="close-dining-btn" style="margin-top: 15px;">ปิด</button>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', uiHTML);

      roomEls = {
        diningUiContainer: document.getElementById('dining-ui-container'),
        drinkOptions: document.getElementById('drink-options')
      };

      document.getElementById('close-dining-btn').addEventListener('click', closeDiningUI);
    },
    updateVisuals: function() {
      const flags = GameState.flags;
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
    },
    onSecondTimer: function() {
      const flags = GameState.flags;

      if (flags['dining_room_coffeeDrank'] && !flags['dining_room_waterDrank']) {
          flags.dining_room_clockTimer++;
          const ticks = flags.dining_room_clockTimer;
          if (ticks === 1) { addActionLog("ติ๊ก... (1)"); }
          else if (ticks === 2) { addActionLog("ติ๊ก... (2)"); }
          else if (ticks === 3) { addActionLog("ติ๊ก... (3)"); }
          else if (ticks === 4) { addActionLog("ติ๊ก... (4)"); }
          else if (ticks >= 5) {
              die("เสียงนาฬิกาดังครบ 5 ครั้ง อาการ Panic กำเริบรุนแรงจากคาเฟอีนจนหัวใจวายตาย!");
          }
      }
    }
  };
})();
