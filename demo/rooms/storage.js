(function() {
  let roomEls = {};
  let powerbankChargeTicks = 0;
  let powerbankInterval = null;

  function toggleFlashlight() {
      const flags = GameState.flags;
      if (GameState.smartphoneBattery <= 0) {
          showDialogue("แบตเตอรี่โทรศัพท์หมดเกลี้ยง เปิดแฟลชไม่ได้แล้ว!");
          return;
      }
      
      flags['storage_flashLightOn'] = !flags['storage_flashLightOn'];
      updateRoomVisuals();
      
      if (flags['storage_flashLightOn']) {
          showDialogue("คุณเปิดไฟแฟลชจากสมาร์ทโฟน");
      } else {
          showDialogue("คุณปิดไฟแฟลช");
      }
  }

  function chargePowerbank() {
      if (hasItem('powerbank')) {
          removeItem('powerbank');
          if (roomEls.flashlightChargeBtn) roomEls.flashlightChargeBtn.disabled = true;
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

  window.RoomData = window.RoomData || {};

Object.assign(GameState.flags, {
  storage_flashLightOn: false,
  storage_doorWedged: false,
  storage_doorClosed: false,
  storage_woodStickAcquired: false,
  storage_foundNote: false,
  storage_foundKey: false,
  storage_foundPowerbank: false,
  storage_boxOpened: false,
  storage_gotHammer: false,
  storage_doorTimerStarted: false,
  storage_doorSmallOpenedCount: 0,
  storage_boxSearchView: 0,
  storage_doorTimer: 0,
  storage_panicTimer: 0
});

window.RoomData.storage = {
    styles: `
.room-storage {
  background-image: url('assets/storage_bg.png');
  background-color: #050505;
}
#flashlight-ui-container {
  position: absolute;
  top: 15px;
  left: 240px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px;
  background: rgba(0,0,0,0.75);
  padding: 5px 15px;
  border: 1px solid #444;
  border-radius: 8px;
  z-index: 50;
  pointer-events: auto;
}
#battery-bar-container {
  font-size: 14px;
  color: #ccc;
  display: flex;
  align-items: center;
  gap: 5px;
}
#battery-text {
  font-weight: bold;
  color: #4f4;
}
#battery-text.low {
  color: #ff4444;
}
.door-closing-animation {
  transform-origin: left;
  transition: transform 30s linear;
  transform: perspective(600px) rotateY(0deg);
}
.door-closing-animation.closing {
  transform: perspective(600px) rotateY(-85deg);
}
.door-closing-animation.wedged {
  transform: perspective(600px) rotateY(-10deg) !important;
  transition: transform 0.5s ease-out;
  border-right: 5px solid #8B4513;
}
    `,
    objects: [
      { id: 'door_main', name: 'ประตูบานพับ (ทางเข้า)', bounds: { left: 5, top: 10, width: 20, height: 80 },
        onInteract: (element) => {
           const flags = GameState.flags;
           if (flags['storage_doorClosed']) {
               showDialogue("ประตูพับปิดสนิทแล้ว คุณออกไม่ได้แล้ว!");
           } else if (flags['storage_doorWedged']) {
               showDialogue("คุณใช้ไม้ขัดค้ำประตูไว้แล้ว เดินกลับออกไปโถงทางเดิน...");
               saveCheckpoint();
               loadRoom('hallway_f1');
           } else if (flags['storage_doorTimerStarted'] && !flags['storage_doorWedged'] && !flags['storage_doorClosed']) {
               if (hasItem('wood_stick')) {
                   flags['storage_doorWedged'] = true;
                   removeItem('wood_stick');
                   showDialogue("คุณเอาไม้ขัดประตูมาค้ำยันบานพับไว้ ประตูจะไม่พับปิดลงมาอีกแล้ว!");
                   updateRoomVisuals();
               } else {
                   showDialogue("ประตูบานพับนี้มันค่อยๆ พับจะปิดลงมา! ต้องหา 'ไม้ขัดประตู' มาค้ำยัน หรือรีบออกไปก่อนที่ประตูจะปิดสนิท");
                   saveCheckpoint();
                   loadRoom('hallway_f1');
               }
           } else {
               showDialogue("คุณเดินกลับออกไปโถงทางเดิน...");
               saveCheckpoint();
               loadRoom('hallway_f1');
           }
        }
      },
      { id: 'switch', name: 'สวิตช์ไฟ (ช็อต)', bounds: { left: 30, top: 40, width: 10, height: 10 }, classes: 'flickering',
        onInteract: (element) => {
           die("คุณพยายามกดสวิตช์ใฟที่พัง กระแสไฟฟ้าลัดวงจรช็อตคุณอย่างรุนแรงจนสิ้นใจ!");
        }
      },
      { id: 'door_small', name: 'ประตูขนาดเล็กฝั่งพื้น', bounds: { left: 70, top: 80, width: 20, height: 15 },
        onInteract: (element) => {
           const flags = GameState.flags;
           if (!flags['storage_flashLightOn']) {
               showDialogue("มืดเกินไป มองไม่เห็นประตูเล็กที่พื้นชัดเจน เปิดไฟแฟชก่อน");
               return;
           }
           if (flags['storage_doorSmallOpenedCount'] === 0) {
               flags['storage_doorSmallOpenedCount'] = 1;
               showDialogue("คุณส่องแฟชไปที่ประตูเล็กฝั่งพื้นบริเวณมุมห้อง... พบว่ามี 'ไม้ขัดประตู' โดยขัดล็อคไว้ทางด้านนี้ (กดอีกครั้งเพื่อดึงออกมา)");
           } else if (flags['storage_doorSmallOpenedCount'] === 1 && !flags['storage_woodStickAcquired']) {
               flags['storage_doorSmallOpenedCount'] = 2;
               flags['storage_woodStickAcquired'] = true;
               addItem('wood_stick', 'ไม้ขัดประตู');
               showDialogue("คุณดึงไม้ขัดออกจากประตูเล็ก... ได้รับ 'ไม้ขัดประตู' เก็บเข้ากระเป๋า (ใช้ค้ำยันประตูบานพับทางเข้าได้!)");
           } else {
               die("คุณพยายามเปิดประตูขนาดเล็กฝั่งพื้นอีกครั้ง... บางอย่างจากด้านล่างกระชากดึงตัวคุณตกลงไปในความมืด ประตูพับปิดลงทันที!");
           }
        }
      },
      { id: 'box_open', name: 'ลังกระดาษไม่มีฝาปิด', bounds: { left: 40, top: 70, width: 20, height: 20 },
        onInteract: (element) => {
           const flags = GameState.flags;
           if (!flags['storage_flashLightOn']) {
               showDialogue("ห้องมืดเกินไป คุณมองไม่เห็นว่ามีอะไรอยู่ในลัง");
               return;
           }
           if (flags['storage_boxSearchView'] === 0) {
               flags['storage_boxSearchView'] = 1;
               showDialogue("ค้นลังกระดาษครั้งแรก เจอ 'กระดาษโน้ต' เขียนคำเตือนว่า 'สิ่งที่ถูกซ่อนไว้ในส่วนลึก ไม่ควรเปิดเผยมันออกมา'");
               addLog("กระดาษโน้ต: สิ่งที่ถูกซ่อนไว้ในส่วนลึก ไม่ควรเปิดเผยมันออกมา");
           } else if (flags['storage_boxSearchView'] === 1) {
               flags['storage_boxSearchView'] = 2;
               flags['storage_foundKey'] = true;
               addItem('key_toolbox', 'กุญแจกล่องอุปกรณ์');
               showDialogue("ค้นลังกระดาษครั้งที่สอง คุณเจอ 'กุญแจกล่องอุปกรณ์ช่าง'");
           } else if (flags['storage_boxSearchView'] === 2) {
               flags['storage_boxSearchView'] = 3;
               flags['storage_foundPowerbank'] = true;
               addItem('powerbank', 'พาวเวอร์แบงค์เก่า');
               showDialogue("ค้นลังกระดาษครั้งที่สาม คุณเจอ 'พาวเวอร์แบงค์เก่า' (เก็บเข้ากระเป๋า สามารถกดชาร์จได้ที่เมนูไฟฉาย)");
           } else {
               showDialogue("ลังเปิดโล่ง ไม่มีอะไรให้ค้นอีกแล้ว");
           }
        }
      },
      { id: 'box_closed', name: 'ลังกระดาษมีฝาปิด', bounds: { left: 80, top: 60, width: 15, height: 20 },
        onInteract: (element) => {
           const flags = GameState.flags;
           if (!flags['storage_boxOpened']) {
               flags['storage_boxOpened'] = true;
               showDialogue("เปิดฝาลังออก... ดันมีหนูตัวใหญ่กระโดดสวนขึ้นมาเฉี่ยวแขนคุณ!");
               takeDamage("โดนหนูกัดหรือข่วนด้วยความตกใจ", 0.5);
           } else {
               showDialogue("ลังกระดาษมีฝาปิด มีแต่เศษฝุ่นและกลิ่นสาบหนู");
           }
        }
      },
      { id: 'toolbox', name: 'กล่องอุปกรณ์ช่าง', bounds: { left: 45, top: 55, width: 15, height: 15 },
        onInteract: (element) => {
           const flags = GameState.flags;
           if (!flags['storage_flashLightOn']) {
               showDialogue("มืดเกินไป คุณคลำหากุญแจล็อคไม่เจอ เปิดไฟฉายก่อน");
               return;
           }
           if (!flags['storage_gotHammer']) {
               if (hasItem('key_toolbox')) {
                   flags['storage_gotHammer'] = true;
                   removeItem('key_toolbox');
                   showDialogue("คุณใช้กุญแจไขแม่กุญแจออกสำเร็จ! หยิบ 'ค้อน' ออกมาได้แล้ว (ตอนนี้คุณพังประตูใดก็ได้ที่แข็งๆ ได้แล้ว)");
                   addItem('hammer', 'ค้อน');
                   updateRoomVisuals(); // Hide flashlight UI if hammer gets found
               } else {
                   showDialogue("กล่องถูกล็อคด้วยแม่กุญแจแน่นหนา ต้องหากุญแจมาไข");
               }
           } else {
               showDialogue("กล่องอุปกรณ์ว่างเปล่า คุณเอาค้อนมาแล้ว");
           }
        }
      }
    ],
    decorations: [],
    setupUI: function() {
      const container = document.getElementById('game-container');
      const uiHTML = `
        <div id="flashlight-ui-container" class="ui-overlay hidden" style="pointer-events: none;">
          <div class="ui-panel" style="pointer-events: auto; position: absolute; top: 10px; right: 10px; left: auto; transform: none;">
             <h3>สมาร์ทโฟน</h3>
             <div class="pill-grid">
               <button class="pill-btn" id="flashlight-toggle-btn">เปิด/ปิดไฟฉาย</button>
               <button class="pill-btn" id="flashlight-charge-btn" disabled>ชาร์จพลังงาน</button>
             </div>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', uiHTML);

      roomEls = {
        flashlightUiContainer: document.getElementById('flashlight-ui-container'),
        flashlightToggleBtn: document.getElementById('flashlight-toggle-btn'),
        flashlightChargeBtn: document.getElementById('flashlight-charge-btn')
      };

      roomEls.flashlightToggleBtn.addEventListener('click', toggleFlashlight);
      roomEls.flashlightChargeBtn.addEventListener('click', chargePowerbank);
    },
    updateVisuals: function() {
      const flags = GameState.flags;
      const scene = document.getElementById('scene');
      const interactiveLayer = document.getElementById('interactive-layer');

      if (flags['storage_flashLightOn']) {
          scene.style.backgroundImage = '';
          scene.style.backgroundColor = 'transparent';
          if (els.flashlightMask) els.flashlightMask.classList.remove('hidden');
          if (interactiveLayer) interactiveLayer.style.display = 'block';
      } else {
          scene.style.backgroundImage = "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('assets/storage_bg.png')";
          scene.style.backgroundColor = '#000';
          if (els.flashlightMask) els.flashlightMask.classList.add('hidden');
          if (interactiveLayer) interactiveLayer.style.display = 'none';
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

      if (GameState.currentRoom === 'storage' && !flags['storage_gotHammer']) {
         if (roomEls.flashlightUiContainer) roomEls.flashlightUiContainer.classList.remove('hidden');
         
         const batteryBarContainer = document.getElementById('battery-bar-container');
         const batteryText = document.getElementById('battery-text');
         if (batteryBarContainer) batteryBarContainer.classList.remove('hidden');
         if (batteryText) {
             batteryText.innerText = `${Math.floor(GameState.smartphoneBattery)}%`;
             if (GameState.smartphoneBattery < 20) {
                 batteryText.classList.add('low');
             } else {
                 batteryText.classList.remove('low');
             }
         }
         
         if (hasItem('powerbank') && roomEls.flashlightChargeBtn) {
             roomEls.flashlightChargeBtn.disabled = false;
         } else if (roomEls.flashlightChargeBtn) {
             roomEls.flashlightChargeBtn.disabled = true;
         }
      } else {
         if (roomEls.flashlightUiContainer) roomEls.flashlightUiContainer.classList.add('hidden');
         const batteryBarContainer = document.getElementById('battery-bar-container');
         if (batteryBarContainer) batteryBarContainer.classList.add('hidden');
      }
    },
    onSecondTimer: function() {
      const flags = GameState.flags;

      // Battery Drain
      if (flags['storage_flashLightOn']) {
          GameState.smartphoneBattery -= 0.5; // 200 seconds total battery
          if (GameState.smartphoneBattery <= 0) {
              GameState.smartphoneBattery = 0;
              flags['storage_flashLightOn'] = false;
              this.updateVisuals();
          }
      }
      
      this.updateVisuals(); // Constant update for UI battery change
      
      // Door closing timer
      if (!flags['storage_doorWedged'] && flags['storage_doorTimerStarted'] && !flags['storage_gotHammer']) {
          flags.storage_doorTimer++;
          if (flags.storage_doorTimer > 30) {
              flags['storage_doorClosed'] = true;
              die("ประตูบานพับของห้องเก็บของพับเข้าหากันจนปิดสนิท คุณถูกขังและตายด้วยการขาดอากาศหายใจ");
          }
      }

      // Panic timer in Storage
      flags.storage_panicTimer++;
      if (!flags['storage_flashLightOn'] && flags.storage_panicTimer > 210) { // 3 min 30 sec = 210s
          if (GameState.hpDrainRate === 0) {
              showDialogue("มืดสนิท... อา อาการ Panic กำเริบระดับ 1! (บาดเจ็บต่อเนื่อง)");
              GameState.hpDrainRate = 0.2;
          }
      } else if (flags['storage_flashLightOn'] && flags.storage_panicTimer > 300) { // 5 mins = 300s
          if (GameState.hpDrainRate <= 0.2) {
              showDialogue("อยู่ในที่แคบนานเกินไป... แสงแฟลชก็ช่วยไม่ได้ อาการ Panic กำเริบระดับ 2! (บาดเจ็บต่อเนื่อง)");
              GameState.hpDrainRate = 0.4;
          }
      }
      
      // Auto-death when dark for too long without hammer
      if (!flags['storage_flashLightOn'] && GameState.smartphoneBattery <= 0 && !hasItem('powerbank') && !flags['storage_gotHammer']) {
         die("ความมืดเข้าปกคลุม ประตูบานพับของห้องปิดกระแทกอย่างรวดเร็ว ถูกขังตายด้วยการขาดอากาศหายใจ");
      }
    }
  };
})();
