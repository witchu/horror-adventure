(function() {
  let roomEls = {};
  let stoveInputSeq = [];

  const ingredients = [
    { id: 1, name: "กระปุกที่ 1 (เกล็ดสีน้ำตาลอ่อน มีกลิ่นหอมหวาน)" },
    { id: 2, name: "กระปุกที่ 2 (เกล็ดใหญ่สีขาวขุ่น ไม่มีกลิ่น)" },
    { id: 3, name: "กระปุกที่ 3 (ผงละเอียดสีดำ กลิ่นเคมี)" },
    { id: 4, name: "กระปุกที่ 4 (เกล็ดละเอียดสีขาวใส ไม่มีกลิ่น)" },
    { id: 5, name: "กระปุกที่ 5 (ผงหยาบสีน้ำตาลเข้ม กลิ่นฉุน)" },
    { id: 6, name: "กระปุกที่ 6 (ผงหยาบสีแดง กลิ่นเผ็ดร้อน)" }
  ];

  function openKitchenUI() {
    roomEls.ingredientOptions.innerHTML = '';
    ingredients.forEach(ing => {
      const btn = document.createElement('button');
      btn.className = 'pill-btn';
      btn.innerText = ing.name;
      btn.onclick = () => selectIngredient(ing.id);
      roomEls.ingredientOptions.appendChild(btn);
    });
    roomEls.kitchenUiContainer.classList.remove('hidden');
  }

  function closeKitchenUI() {
    roomEls.kitchenUiContainer.classList.add('hidden');
  }

  function selectIngredient(id) {
    closeKitchenUI();
    const flags = GameState.flags;
    
    if (flags['kitchen_ingredientsAdded']) {
        showDialogue("ปรุงไปแล้ว ไม่ควรใส่เพิ่มมั่วซั่ว");
        return;
    }
    
    flags['kitchen_ingredientsAdded'] = true;
    if (id === 3) {
        // Poison
        flags['kitchen_poisonedFood'] = true;
    }
    
    showDialogue("คุณใส่เครื่องปรุงลงไปในอาหาร... ลองชิมดูอีกครั้งเพื่อความแน่ใจ");
  }

  function openStoveUI() {
      stoveInputSeq = [];
      updateStoveDisplay();
      roomEls.stoveUiContainer.classList.remove('hidden');
  }

  function closeStoveUI() {
      roomEls.stoveUiContainer.classList.add('hidden');
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
      roomEls.stoveInputDisplay.innerText = displayStr.trim();
  }

  function checkStoveSequence() {
      const seqStr = stoveInputSeq.join(',');
      const correctSeq = 'right,left,left,right';
      
      setTimeout(() => {
          closeStoveUI();
          if (seqStr === correctSeq) {
              GameState.flags['kitchen_gasOff'] = true;
              showDialogue("คุณหมุนวาล์วเตาแก๊สได้ถูกต้อง! เตาแก๊สถูกปิด อาหารบนเตาหยุดเดือด ควันและกลิ่นไหม้ค่อยๆ จางหายไป");
              updateRoomVisuals();
          } else {
              takeDamage("หมุนผิดจังหวะ ไฟพุ่งพึ่บใส่แขนคุณ!", 0.25);
              stoveInputSeq = []; // Reset sequence
          }
      }, 400);
  }

  window.RoomData = window.RoomData || {};

  Object.assign(GameState.flags, {
    kitchen_sinkOff: false,
    kitchen_kettleOff: false,
    kitchen_cabinetClosed: false,
    kitchen_gasNotesFound: false,
    kitchen_gasStep: 0,
    kitchen_gasOff: false,
    kitchen_tastedFirst: false,
    kitchen_ingredientsAdded: false,
    kitchen_poisonedFood: false,
    kitchen_tastedSecond: false,
    kitchen_drawerRightOpened: false,
    kitchen_cabinetOpenLevel: 0,
    kitchen_waterTimer: 0,
    kitchen_kettleTimer: 0,
    kitchen_cabinetTimer: 0,
    kitchen_gasTimer: 0
  });

  window.RoomData.kitchen = {
    styles: `
.room-kitchen { background-image: url('assets/kitchen_bg.png'); }
@keyframes smokePulse {
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.6; }
}
.smoke-effect {
  animation: smokePulse 2s infinite ease-in-out;
  background-color: rgba(50, 50, 50, 0.4);
  border-radius: 50%;
  filter: blur(10px);
}
    `,
    objects: [
      { id: 'sink', name: 'ก๊อกน้ำอ่างล้างจาน', bounds: { left: 10, top: 40, width: 20, height: 30 },
        onInteract: (element) => {
          const flags = GameState.flags;
          if (!flags['kitchen_sinkOff']) {
              flags['kitchen_sinkOff'] = true;
              showDialogue("คุณรีบปิดก๊อกน้ำ น้ำหยุดไหลลงพื้นแล้ว (ลื่นลดลง)");
              updateRoomVisuals();
          } else {
              showDialogue("ก๊อกน้ำปิดดีแล้ว");
          }
        }
      },
      { id: 'kettle', name: 'กาต้มน้ำ', bounds: { left: 35, top: 35, width: 15, height: 20 }, classes: 'light-shake',
        onInteract: (element) => {
          const flags = GameState.flags;
          if (!flags['kitchen_kettleOff']) {
              flags['kitchen_kettleOff'] = true;
              showDialogue("คุณปิดและยกกาต้มน้ำออกจากเตา เสียงหวีดร้องเงียบลงแล้ว");
              updateRoomVisuals();
          } else {
              showDialogue("กาต้มน้ำถูกยกออกแล้ว");
          }
        }
      },
      { id: 'cabinet', name: 'ตู้เก็บจานแขวนผนัง', bounds: { left: 10, top: 10, width: 30, height: 20 },
        onInteract: (element) => {
          const flags = GameState.flags;
          if (!flags['kitchen_cabinetClosed']) {
              flags['kitchen_cabinetClosed'] = true;
              showDialogue("คุณดันบานตู้กลับเข้าที่จนล็อคสนิท ไม่มีจานชามตกลงมาแล้ว");
              updateRoomVisuals();
          } else {
              showDialogue("ตู้เก็บจานปิดสนิทแล้ว");
          }
        }
      },
      { id: 'drawer_left', name: 'ลิ้นชักซ้าย', bounds: { left: 10, top: 75, width: 15, height: 20 },
        onInteract: (element) => {
          const flags = GameState.flags;
          if (!flags['kitchen_gasNotesFound']) {
              flags['kitchen_gasNotesFound'] = true;
              showDialogue("เปิดลิ้นชักออก พบสมุดโน๊ตเขียนวิธีปิดเตาแก๊ส คุณจดไว้ในบันทึก");
              addLog("ลำดับหมุนวาล์วเตาแก๊ส: ขวา -> ซ้าย -> ซ้าย -> ขวา");
          } else {
              showDialogue("ในนี้มีแค่สมุดโน๊ตที่คุณอ่านแล้ว");
          }
        }
      },
      { id: 'drawer_right', name: 'ลิ้นชักขวา', bounds: { left: 30, top: 75, width: 15, height: 20 },
        onInteract: (element) => {
          takeDamage("เปิดลิ้นชักออกอย่างรวดเร็ว โดนของมีคมด้านในบาดมือ!", 0.25);
        }
      },
      { id: 'stove', name: 'เตาแก๊ส', bounds: { left: 55, top: 45, width: 20, height: 20 },
        onInteract: (element) => {
          const flags = GameState.flags;
          if (!flags['kitchen_gasOff']) {
              openStoveUI();
          } else {
              showDialogue("วาล์วแก๊สถูกปิดสนิทแล้ว");
          }
        }
      },
      { id: 'food', name: 'อาหารบนเตา', bounds: { left: 60, top: 35, width: 10, height: 10 },
        onInteract: (element) => {
          const flags = GameState.flags;
          if (!flags['kitchen_gasOff']) {
              takeDamage("จะไปชิมอาหารที่กำลังไฟลุกได้ยังไง! ร้อนเดือดลวกปาก!");
              return;
          }
          if (!flags['kitchen_tastedFirst']) {
              flags['kitchen_tastedFirst'] = true;
              showDialogue("คุณใช้ช้อนตักชิม... 'เป็นซุปที่จืดชืดมาก'");
          } else if (!flags['kitchen_ingredientsAdded'] && flags['kitchen_tastedFirst']) {
              openKitchenUI();
          } else if (flags['kitchen_ingredientsAdded'] && !flags['kitchen_tastedSecond']) {
              if (flags['kitchen_poisonedFood']) {
                  die("พิษเคมีทำลายระบบร่างกายอย่างรุนแรง นำไปสู่ความตาย");
              } else {
                  flags['kitchen_tastedSecond'] = true;
                  GameState.flags['dining_room_drinksAppeared'] = true;
                  showDialogue("อาหารรสชาติดีและปลอดภัย... คุณรู้สึกว่ารอดจากพิษแล้ว");
              }
          } else if (flags['kitchen_ingredientsAdded'] && flags['kitchen_tastedSecond']) {
              showDialogue("อาหารรสชาติกำลังดีแล้ว นำไปทานได้เลย");
          }
        }
      },
      { id: 'fridge_note', name: 'กระดานโน๊ตบนตู้เย็น', bounds: { left: 85, top: 40, width: 10, height: 30 },
        onInteract: (element) => {
          showDialogue("กระดานโน๊ตเขียนว่า: 'ทานอาหารด้วยนะ ฉันอุ่นเตรียมไว้ให้แล้ว...แต่รสชาติอาจไม่ถูกใจคุณเท่าไหร่ และอย่าลืมตรวจสอบทุกอย่างให้เรียบร้อยก่อนออกไปด้วยล่ะ'");
          addLog("พ่อบ้าน/แม่บ้านโน๊ตไว้: ทานอาหารด้วยนะ ฉันอุ่นเตรียมไว้ให้แล้ว...");
        }
      },
      { id: 'door_laundry', name: 'ประตูห้องซักล้าง', bounds: { left: 80, top: 70, width: 15, height: 25 },
        onInteract: (element) => {
          if (hasItem('hammer')) {
              showDialogue("คุณใช้ค้อนพังประตูห้องซักล้างจนพังทลายลงมา! ทางหนีถูกเปิดออกแล้ว...");
              if (els.winScreen) els.winScreen.classList.remove('hidden'); // CLEARED END DEMO
          } else {
              showDialogue("ประตูล็อคสนิท ลูกบิดขึ้นสนิม... ต้องหาค้อนหรืออะไรบางอย่างมาพังมัน");
          }
        }
      },
      { id: 'door_dining', name: 'ทางไปห้องทานข้าว', bounds: { left: 0, top: 20, width: 10, height: 60 },
        onInteract: (element) => {
          showDialogue("คุณเดินเปิดประตูเข้าไปยังห้องทานข้าว...");
          saveCheckpoint();
          loadRoom('dining_room');
        }
      },
      { id: 'door_hallway', name: 'กลับโถงทางเดิน', bounds: { left: 40, top: 85, width: 20, height: 10 },
        onInteract: (element) => {
          showDialogue("กลับออกไปโถงทางเดินชั้น 1");
          saveCheckpoint();
          loadRoom('hallway_f1');
        }
      }
    ],
    decorations: [
      { id: 'water_spill', name: 'น้ำท่วมพื้น', bounds: { left: 0, top: 80, width: 40, height: 20 }, classes: 'hidden',
        onInteract: (element) => {}
      },
      { id: 'smoke', name: 'ควันไหม้', bounds: { left: 50, top: 10, width: 30, height: 30 }, classes: 'smoke-effect',
        onInteract: (element) => {}
      }
    ],
    setupUI: function() {
      const container = document.getElementById('game-container');
      const uiHTML = `
        <div id="kitchen-ui-container" class="ui-overlay hidden">
          <div class="ui-panel">
            <h3>เติมเครื่องปรุง</h3>
            <div id="ingredient-options" class="pill-grid"></div>
            <button class="close-ui-btn" id="close-kitchen-btn">ปิด</button>
          </div>
        </div>

        <div id="stove-ui-container" class="ui-overlay hidden">
          <div class="ui-panel">
            <h3>วาล์วเตาแก๊ส</h3>
            <p style="margin-bottom: 10px; font-size: 14px; color: #ffcccc;">ต้องหมุนให้ถูกลำดับ 4 ขั้นตอนเพื่อปิดแก๊ส!</p>
            <div id="stove-input-display" style="font-size: 24px; letter-spacing: 10px; margin-bottom: 20px; text-align: center; font-weight: bold; min-height: 30px;">
              _ _ _ _
            </div>
            <div class="pill-grid">
               <button class="pill-btn" id="stove-btn-left">หมุนซ้าย (L)</button>
               <button class="pill-btn" id="stove-btn-right">หมุนขวา (R)</button>
            </div>
            <button class="close-ui-btn" id="close-stove-btn" style="margin-top: 15px;">ยกเลิก</button>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', uiHTML);

      roomEls = {
        kitchenUiContainer: document.getElementById('kitchen-ui-container'),
        ingredientOptions: document.getElementById('ingredient-options'),
        stoveUiContainer: document.getElementById('stove-ui-container'),
        stoveInputDisplay: document.getElementById('stove-input-display')
      };

      document.getElementById('close-kitchen-btn').addEventListener('click', closeKitchenUI);
      document.getElementById('stove-btn-left').addEventListener('click', () => inputStove('left'));
      document.getElementById('stove-btn-right').addEventListener('click', () => inputStove('right'));
      document.getElementById('close-stove-btn').addEventListener('click', closeStoveUI);
    },
    updateVisuals: function() {
      const flags = GameState.flags;
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
    },
    onSecondTimer: function() {
      const flags = GameState.flags;
      
      if (!flags['kitchen_sinkOff']) {
          flags.kitchen_waterTimer++;
          const spill = document.getElementById('deco-water_spill');
          if (flags.kitchen_waterTimer > 15) {
              if(spill) { spill.classList.remove('hidden'); spill.innerText = "น้ำท่วมพื้นห้องครัว!"; spill.classList.add('danger-high'); }
          }
      }
      if (!flags['kitchen_kettleOff']) {
          flags.kitchen_kettleTimer++;
          const kettle = document.getElementById('obj-kettle');
          if (flags.kitchen_kettleTimer > 40) {
              die("กาต้มน้ำเดือดจัดจนแรงดันเกินพิกัดและระเบิดใส่อย่างรุนแรง!");
          } else if (flags.kitchen_kettleTimer > 20 && kettle) {
              kettle.innerText = "กาต้มน้ำ (เสียงหวีดร้องดังมาก!)";
              kettle.classList.add('danger-high');
          }
      }
      if (!flags['kitchen_cabinetClosed']) {
          flags.kitchen_cabinetTimer++;
          const cab = document.getElementById('obj-cabinet');
          if (flags.kitchen_cabinetTimer > 30) {
              if(cab) cab.innerText = "ตู้เก็บจาน (เปิดกว้างมาก อันตราย!)";
              if(cab) cab.classList.add('danger-high');
              flags['kitchen_cabinetOpenLevel'] = 2;
          } else if (flags.kitchen_cabinetTimer > 15) {
              if(cab) cab.innerText = "ตู้เก็บจานแขวนผนัง (เริ่มเปิดกว้างขึ้น)";
              if(cab) cab.classList.add('danger-low');
              flags['kitchen_cabinetOpenLevel'] = 1;
          }
      }
      if (!flags['kitchen_gasOff']) {
          flags.kitchen_gasTimer++;
          if (flags.kitchen_gasTimer > 15) {
             if (GameState.hpDrainRate === 0) {
                 showDialogue("สูดดมควันไหม้จากอาหารบนเตา! (บาดเจ็บต่อเนื่อง)");
                 GameState.hpDrainRate = 0.5; // Drain faster
             }
          }
      } else {
          if (GameState.hpDrainRate === 0.5) GameState.hpDrainRate = 0;
      }
    }
  };
})();
