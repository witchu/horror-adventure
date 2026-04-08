(function() {
  const pills = [
    { id: 1, name: "กระปุกที่ 1 : เม็ดเคลือบ สีชมพูเข้ม" },
    { id: 2, name: "กระปุกที่ 2 : แคปซูล สีเหลืองสด" },
    { id: 3, name: "กระปุกที่ 3 : ยาชนิดน้ำ สีฟ้า" },
    { id: 4, name: "กระปุกที่ 4 : แคปซูล สีดำ" },
    { id: 5, name: "กระปุกที่ 5 : เม็ดใหญ่ทรงรี สีส้ม" },
    { id: 6, name: "กระปุกที่ 6 : ยาชนิดน้ำ สีน้ำตาลเข้ม" }
  ];

  let roomEls = {};

  function openPillUI() {
    roomEls.pillOptions.innerHTML = '';
    pills.forEach(pill => {
      const btn = document.createElement('button');
      btn.className = 'pill-btn';
      btn.innerText = pill.name;
      btn.onclick = () => selectPill(pill.id);
      roomEls.pillOptions.appendChild(btn);
    });
    roomEls.pillUiContainer.classList.remove('hidden');
  }

  function closePillUI() {
    roomEls.pillUiContainer.classList.add('hidden');
  }

  function selectPill(id) {
    closePillUI();
    if (id === 1) {
      GameState.flags['bathroom_pillTaken'] = true;
      GameState.hpDrainRate = 0; // อาการ panic หยุด, hp หยุดลด
      showDialogue("คุณทานยาสีชมพูเข้ม... ทันใดนั้นไฟห้องน้ำที่กะพริบก็กลับมาสว่างเป็นปกติ จิตใจคุณสงบลง");
      updateRoomVisuals();
    } else if (id === 2 || id === 5) {
      takeDamage("เกิดผลข้างเคียง มึนงง/สำลักเม็ดยา!", 0.25);
    } else {
      die("สารเคมีหรือพิษทำลายระบบภายในร่างกายอย่างรุนแรง... ตายทันที");
    }
  }

  function openFaucetUI() {
    roomEls.faucetUiContainer.classList.remove('hidden');
    updateFaucetUI();
  }

  function closeFaucetUI() {
    roomEls.faucetUiContainer.classList.add('hidden');
    if (GameState.flags.bathroom_bathtubVolume >= 100 && GameState.flags.bathroom_bathtubMode === 'close') {
      GameState.flags.bathroom_bathtubActive = false;
      GameState.flags['bathroom_waterFilled'] = true;
      showDialogue("น้ำเต็มอ่างแล้ว คุณเตรียมตัวลงไปแช่");
      updateRoomVisuals();
    }
  }

  function setFaucetMode(mode) {
    if (GameState.flags.bathroom_bathtubVolume >= 100 && mode !== 'close') {
        showDialogue("น้ำเต็มอ่างแล้ว ต้องกดปิดเท่านั้น!");
        return;
    }
    GameState.flags.bathroom_bathtubMode = mode;
    
    // Update button active states
    roomEls.faucetUiContainer.querySelectorAll('.faucet-btn').forEach(b => b.classList.remove('active'));
    roomEls.faucetUiContainer.querySelector(`.faucet-btn.${mode}`).classList.add('active');
    
    if (mode === 'close' && GameState.flags.bathroom_bathtubVolume >= 100) {
        closeFaucetUI();
    }
  }

  function updateFaucetUI() {
    const vol = GameState.flags.bathroom_bathtubVolume;
    const tot = Math.max(1, GameState.flags.bathroom_bathtubHotAmt + GameState.flags.bathroom_bathtubColdAmt);
    const hotPct = Math.round((GameState.flags.bathroom_bathtubHotAmt / tot) * 100);
    const coldPct = Math.round((GameState.flags.bathroom_bathtubColdAmt / tot) * 100);
    
    roomEls.waterGaugeFill.style.width = `${Math.min(100, vol)}%`;
    if (vol > 0) {
        roomEls.waterGaugeFill.style.background = `linear-gradient(90deg, #aa3333 ${hotPct}%, #3333aa ${hotPct}%)`;
    }
    
    roomEls.waterVolText.innerText = `ปริมาตร: ${Math.min(100, vol)}%`;
    roomEls.waterTempText.innerText = `ร้อน: ${hotPct}% | เย็น: ${coldPct}%`;
    
    if (vol >= 100 && GameState.flags.bathroom_bathtubMode !== 'close') {
        roomEls.waterVolText.innerText = `ปริมาตร: 100% (กำลังล้น!)`;
        roomEls.waterVolText.style.color = "red";
    } else {
        roomEls.waterVolText.style.color = "#ccc";
    }
  }

  function openBathtubChoiceUI() {
    roomEls.bathtubChoiceUi.classList.remove('hidden');
  }

  function closeBathtubChoiceUI() {
    roomEls.bathtubChoiceUi.classList.add('hidden');
  }

  function bathtubChoice(choice) {
    closeBathtubChoiceUI();
    
    const flags = GameState.flags;
    const tot = flags.bathroom_bathtubHotAmt + flags.bathroom_bathtubColdAmt;
    const hotPct = Math.round((flags.bathroom_bathtubHotAmt / tot) * 100);
    const coldPct = Math.round((flags.bathroom_bathtubColdAmt / tot) * 100);
    
    if (hotPct > 80) {
        die("สัมผัสผิวน้ำอุณหภูมิที่ร้อนจัด ผิวหนังพุพองถูกลวกอย่างรุนแรงทนทานความเจ็บปวดไม่ไหว...");
        return;
    }
    if (coldPct > 80) {
        die("ร่างกายช็อคหัวใจวายจากการสูญเสียความร้อนอย่างเฉียบพลันในน้ำยะเยือก!");
        return;
    }
    
    if (choice === 'bathe') {
        flags['bathroom_bathed'] = true;
        showDialogue("คุณลงแช่น้ำจนเสร็จ แล้วขึ้นจากอ่าง (ตอนนี้ตัวคุณเปียกชุ่ม)");
        updateRoomVisuals();
    } else if (choice === 'drain') {
        flags['bathroom_waterDrained'] = true;
        flags['bathroom_gotKey'] = true;
        addItem('key', 'กุญแจห้องนอน');
        flags['bathroom_doorUnlocked'] = true; // Unlocks hallway door
        showDialogue("คุณดึงจุกระบายน้ำออก น้ำแรงดันสูงไหลทิ้ง ช่วยผลักกุญแจลอยขึ้นมาให้คุณหยิบ!");
        updateRoomVisuals();
    }
  }

  window.RoomData = window.RoomData || {};

Object.assign(GameState.flags, {
  bathroom_soapPicked: false,
  bathroom_pillTaken: false,
  bathroom_dryerUnplugged: false,
  bathroom_dryerStored: false,
  bathroom_waterFilled: false,
  bathroom_bathed: false,
  bathroom_dried: false,
  bathroom_waterDrained: false,
  bathroom_gotKey: false,
  bathroom_doorUnlocked: false,
  bathroom_timer: 0,
  bathroom_soapTimer: 0,
  bathroom_bathtubActive: false,
  bathroom_bathtubVolume: 0,
  bathroom_bathtubHotAmt: 0,
  bathroom_bathtubColdAmt: 0,
  bathroom_bathtubMode: 'close'
});

window.RoomData.bathroom = {
    styles: `
.room-bathroom {
  background-image: url('assets/bathroom_bg.png');
}
.water-gauge-container { margin: 20px 0; }
.water-gauge-bg { width: 100%; height: 30px; background-color: #111; border: 1px solid #555; position: relative; overflow: hidden; }
#water-gauge-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #aa3333, #3333aa); transition: width 0.3s; }
.water-texts { display: flex; justify-content: space-between; margin-top: 5px; font-size: 13px; color: #ccc; }
.faucet-controls { display: flex; justify-content: space-between; gap: 10px; margin-top: 20px; }
.faucet-btn { flex: 1; padding: 10px 0; font-weight: bold; border: 1px solid #444; background-color: #222; cursor: pointer; color: #ccc; transition: 0.2s; }
.faucet-btn:hover { border-color: #fff; color: #fff; }
.faucet-btn.hot { border-bottom: 3px solid #aa3333; }
.faucet-btn.hot.active { background-color: #5a2222; color: #ff8888; border-color: #ff4444; }
.faucet-btn.cold { border-bottom: 3px solid #3333aa; }
.faucet-btn.cold.active { background-color: #22225a; color: #8888ff; border-color: #4444ff; }
.faucet-btn.close { border-bottom: 3px solid #888; }
.faucet-btn.close.active { background-color: #444; color: #fff; border-color: #aaa; }
    `,
    objects: [
      { id: 'soap', name: 'ขวดสบู่', bounds: { left: 20, top: 80, width: 10, height: 10 },
        onInteract: (element) => {
          const flags = GameState.flags;
          if (!flags['bathroom_soapPicked']) {
            flags['bathroom_soapPicked'] = true;
            showDialogue("คุณจับขวดสบู่ที่หกตั้งขึ้นมา ป้องกันการลื่นล้ม");
            element.style.display = 'none';
          }
        }
      },
      { id: 'cabinet', name: 'ตู้ยา', bounds: { left: 45, top: 15, width: 15, height: 20 },
        onInteract: (element) => {
          const flags = GameState.flags;
          if (!flags['bathroom_pillTaken']) {
              openPillUI();
          } else {
              showDialogue("คุณกินยาไปแล้ว ไม่มียาอื่นที่ต้องกินอีก");
          }
        }
      },
      { id: 'dryer', name: 'ไดร์เป่าผม (เสียบปลั๊ก)', bounds: { left: 60, top: 80, width: 15, height: 10 },
        onInteract: (element) => {
          const flags = GameState.flags;
          if (flags['bathroom_bathed'] && !flags['bathroom_dried'] && !flags['bathroom_dryerUnplugged']) {
             die("ตัวเปียกๆ เอื้อมไปจับไดร์เป่าผมที่เสียบปลั๊กไฟอยู่ ไฟดูดตายสนิท!");
             return;
          }
          if (!flags['bathroom_dryerUnplugged']) {
              flags['bathroom_dryerUnplugged'] = true;
              showDialogue("คุณถอดปลั๊กไดร์เป่าผมเรียบร้อยแล้ว");
              updateRoomVisuals();
          } else if (!flags['bathroom_dryerStored']) {
              flags['bathroom_dryerStored'] = true;
              showDialogue("เก็บไดร์เป่าผมเข้าที่เรียบร้อย ปลอดภัยหายห่วง");
              updateRoomVisuals();
          }
        }
      },
      { id: 'bathtub', name: 'อ่างอาบน้ำ', bounds: { left: 65, top: 40, width: 30, height: 40 },
        onInteract: (element) => {
          const flags = GameState.flags;
          if (!flags['bathroom_doorUnlocked']) {
            if (!flags.bathroom_bathtubActive && !flags['bathroom_waterFilled']) {
               flags.bathroom_bathtubActive = true;
               flags.bathroom_bathtubMode = 'hot';
               openFaucetUI();
            } else if (flags.bathroom_bathtubActive && !flags['bathroom_waterFilled']) {
               openFaucetUI();
            } else if (flags['bathroom_waterFilled'] && !flags['bathroom_bathed'] && !flags['bathroom_waterDrained']) {
               openBathtubChoiceUI();
            } else if (flags['bathroom_bathed'] && !flags['bathroom_dried']) {
               if (hasItem('towel')) {
                   flags['bathroom_dried'] = true;
                   removeItem('towel');
                   showDialogue("คุณใช้ผ้าเช็ดตัวเช็ดตัวจนแห้งสนิท (ของถูกใช้ไปแล้ว) ปลอดภัยจากไฟดูด!");
               } else {
                   showDialogue("ขึ้นจากอ่างแล้วแต่คุณไม่มีผ้าเช็ดตัว ตัวยังเปียกชุ่ม... ระวังอุปกรณ์ไฟฟ้าให้ดี!");
               }
            } else if (flags['bathroom_bathed'] && flags['bathroom_dried'] && !flags['bathroom_waterDrained']) {
               openBathtubChoiceUI();
            } else if (flags['bathroom_waterDrained'] && flags['bathroom_gotKey']) {
               showDialogue("คุณได้กุญแจจากการระบายน้ำไปเรียบร้อยแล้ว");
            }
          } else {
              showDialogue("ได้กุญแจแล้ว... ไม่ต้องยุ่งกับอ่างอีก");
          }
        }
      },
      { id: 'door_back', name: 'กลับเข้าห้องนอน', bounds: { left: 5, top: 15, width: 15, height: 60 },
        onInteract: (element) => {
          const flags = GameState.flags;
          if (!flags['bathroom_soapPicked'] && flags.bathroom_soapTimer > 25) {
            die("คุณเหยียบสบู่ที่ไหลลามจนเต็มพื้น ลื่นล้มหัวฟาดพื้นตายคาที่...");
            return;
          } else if (!flags['bathroom_soapPicked']) {
            takeDamage("ลื่นฟองสบู่เล็กน้อย โชคดีที่ยังไหลออกมาไม่เยอะ");
          }
          showDialogue("คุณเดินย้อนกลับเข้ามาในห้องนอน");
          saveCheckpoint();
          loadRoom('bedroom');
        }
      }
    ],
    decorations: [
      { id: 'soap-spill', name: 'ฟองสบู่บนพื้น (กองเล็ก)', bounds: { left: 20, top: 90, width: 20, height: 10 },
        onInteract: (element) => {}
      }
    ],
    setupUI: function() {
      // Dynamically create UIs
      const container = document.getElementById('game-container');
      
      const uiHTML = `
        <div id="pill-ui-container" class="ui-overlay hidden">
          <div class="ui-panel">
            <h3>ตู้ยา: เลือกกระปุกยา</h3>
            <div id="pill-options" class="pill-grid"></div>
            <button class="close-ui-btn" id="close-pill-btn">ปิดตู้ยา</button>
          </div>
        </div>

        <div id="faucet-ui-container" class="ui-overlay hidden">
          <div class="ui-panel">
            <h3>ก๊อกน้ำอ่างอาบน้ำ</h3>
            <div class="water-gauge-container">
               <div class="water-gauge-bg">
                  <div id="water-gauge-fill"></div>
               </div>
               <div class="water-texts">
                 <span id="water-volume-text">ปริมาตร: 0%</span>
                 <span id="water-temp-text">ร้อน: 0% | เย็น: 0%</span>
               </div>
            </div>
            <div class="faucet-controls">
               <button class="faucet-btn cold" id="faucet-cold-btn">ก๊อกน้ำเย็น</button>
               <button class="faucet-btn close" id="faucet-close-btn">ปิดน้ำ</button>
               <button class="faucet-btn hot" id="faucet-hot-btn">ก๊อกน้ำร้อน</button>
            </div>
          </div>
        </div>

        <div id="bathtub-choice-ui" class="ui-overlay hidden">
          <div class="ui-panel">
            <h3>อ่างอาบน้ำ (น้ำเต็ม)</h3>
            <p style="margin-bottom: 20px; font-size: 14px;">คุณต้องการทำสิ่งใดต่อไป?</p>
            <div class="pill-grid">
               <button class="pill-btn" id="bathtub-bathe-btn">ลงแช่น้ำ</button>
               <button class="pill-btn" id="bathtub-drain-btn">ดึงจุกระบายน้ำ</button>
            </div>
            <button class="close-ui-btn" id="close-bathtub-btn">ยกเลิก</button>
          </div>
        </div>
      `;
      
      container.insertAdjacentHTML('beforeend', uiHTML);
      
      // Cache elements
      roomEls = {
        pillUiContainer: document.getElementById('pill-ui-container'),
        pillOptions: document.getElementById('pill-options'),
        faucetUiContainer: document.getElementById('faucet-ui-container'),
        waterGaugeFill: document.getElementById('water-gauge-fill'),
        waterVolText: document.getElementById('water-volume-text'),
        waterTempText: document.getElementById('water-temp-text'),
        bathtubChoiceUi: document.getElementById('bathtub-choice-ui')
      };
      
      // Bind events
      document.getElementById('close-pill-btn').addEventListener('click', closePillUI);
      document.getElementById('faucet-cold-btn').addEventListener('click', () => setFaucetMode('cold'));
      document.getElementById('faucet-close-btn').addEventListener('click', () => setFaucetMode('close'));
      document.getElementById('faucet-hot-btn').addEventListener('click', () => setFaucetMode('hot'));
      document.getElementById('bathtub-bathe-btn').addEventListener('click', () => bathtubChoice('bathe'));
      document.getElementById('bathtub-drain-btn').addEventListener('click', () => bathtubChoice('drain'));
      document.getElementById('close-bathtub-btn').addEventListener('click', closeBathtubChoiceUI);
    },
    updateVisuals: function() {
      const flags = GameState.flags;
      if (flags['bathroom_pillTaken'] && els.scene) {
        els.scene.classList.remove('flickering');
      }
      const dryerEl = document.getElementById('obj-dryer');
      if (flags['bathroom_dryerUnplugged'] && dryerEl && !flags['bathroom_dryerStored']) {
        dryerEl.innerText = 'ไดร์เป่าผม (ถอดปลั๊กแล้ว)';
      } else if (flags['bathroom_dryerStored'] && dryerEl) {
        dryerEl.style.display = 'none';
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
    },
    onSecondTimer: function() {
      const flags = GameState.flags;

      // Global bathtub interval logic
      if (GameState.hp > 0 && flags.bathroom_bathtubActive && flags.bathroom_bathtubMode !== 'close') {
        flags.bathroom_bathtubVolume += 10;
        if (flags.bathroom_bathtubMode === 'hot') {
           flags.bathroom_bathtubHotAmt += 10;
        } else if (flags.bathroom_bathtubMode === 'cold') {
           flags.bathroom_bathtubColdAmt += 10;
        }
        
        // Update UI only if in the room and ui is open? Or just update anyway
        if (roomEls.faucetUiContainer && !roomEls.faucetUiContainer.classList.contains('hidden')) {
           updateFaucetUI();
        }
      
        if (flags.bathroom_bathtubVolume > 100) {
            flags.bathroom_bathtubActive = false;
            closeFaucetUI();
            if (!flags['bathroom_dryerUnplugged']) {
                die("ปล่อยน้ำล้นอ่าง ท่วมพื้นไหลไปโดนไดร์เป่าผมที่เสียบปลั๊กอยู่ ไฟช็อตตายคาที่!");
            } else {
                die("ปล่อยน้ำล้นอ่าง ท่วมพื้นจำนวนมากจนคุณลื่นล้มหัวฟาดพื้นตาย!");
            }
        }
      }

      // Contextual room timers
      if (!flags['bathroom_pillTaken']) {
        flags.bathroom_timer++;
        if (flags.bathroom_timer > 15 && GameState.hpDrainRate === 0) {
          showDialogue("ไฟกะพริบถี่ทำให้คุณเริ่มหลอน! (บาดเจ็บต่อเนื่อง)");
          GameState.hpDrainRate = 0.02;
        }
      } else {
        // Handled by room transition logic instead of continually overwriting here
      }

      if (!flags['bathroom_soapPicked']) {
        flags.bathroom_soapTimer++;
        const spillEl = document.getElementById('deco-soap-spill');
        if (spillEl) {
          if (flags.bathroom_soapTimer > 25) { 
             spillEl.innerText = 'พื้นห้องน้ำ (สบู่ไหลลามเต็มพื้น อันตรายมาก!)';
             spillEl.classList.remove('danger-low');
             spillEl.classList.add('danger-high');
          } else if (flags.bathroom_soapTimer > 10) {
             spillEl.innerText = 'ฟองสบู่บนพื้น (เริ่มไหลลามกว้างขึ้น)';
             spillEl.classList.add('danger-low');
          }
        }
      }
    }
  };
})();
