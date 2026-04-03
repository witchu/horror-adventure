// --- Medicine Cabinet UI Logic ---
const pills = [
  { id: 1, name: "กระปุกที่ 1 : เม็ดเคลือบ สีชมพูเข้ม" },
  { id: 2, name: "กระปุกที่ 2 : แคปซูล สีเหลืองสด" },
  { id: 3, name: "กระปุกที่ 3 : ยาชนิดน้ำ สีฟ้า" },
  { id: 4, name: "กระปุกที่ 4 : แคปซูล สีดำ" },
  { id: 5, name: "กระปุกที่ 5 : เม็ดใหญ่ทรงรี สีส้ม" },
  { id: 6, name: "กระปุกที่ 6 : ยาชนิดน้ำ สีน้ำตาลเข้ม" }
];

function openPillUI() {
  els.pillOptions.innerHTML = '';
  pills.forEach(pill => {
    const btn = document.createElement('button');
    btn.className = 'pill-btn';
    btn.innerText = pill.name;
    btn.onclick = () => selectPill(pill.id);
    els.pillOptions.appendChild(btn);
  });
  els.pillUiContainer.classList.remove('hidden');
}

function closePillUI() {
  els.pillUiContainer.classList.add('hidden');
}

function selectPill(id) {
  closePillUI();
  if (id === 1) {
    GameState.flags['bathroom_pillTaken'] = true;
    showDialogue("คุณทานยาสีชมพูเข้ม... ทันใดนั้นไฟห้องน้ำที่กะพริบก็กลับมาสว่างเป็นปกติ จิตใจคุณสงบลง");
    updateRoomVisuals('bathroom');
  } else if (id === 2 || id === 5) {
    takeDamage("เกิดผลข้างเคียง มึนงง/สำลักเม็ดยา!", 0.25);
  } else {
    die("สารเคมีหรือพิษทำลายระบบภายในร่างกายอย่างรุนแรง... ตายทันที");
  }
}

// --- Faucet UI Logic ---
function openFaucetUI() {
  els.faucetUiContainer.classList.remove('hidden');
  updateFaucetUI();
}

function closeFaucetUI() {
  els.faucetUiContainer.classList.add('hidden');
  if (bathtubState.volume >= 100 && bathtubState.mode === 'close') {
    bathtubState.active = false;
    GameState.flags['bathroom_waterFilled'] = true;
    showDialogue("น้ำเต็มอ่างแล้ว คุณเตรียมตัวลงไปแช่");
    updateRoomVisuals('bathroom');
  }
}

function setFaucetMode(mode) {
  if (bathtubState.volume >= 100 && mode !== 'close') {
      showDialogue("น้ำเต็มอ่างแล้ว ต้องกดปิดเท่านั้น!");
      return;
  }
  bathtubState.mode = mode;
  
  // Update button active states
  document.querySelectorAll('.faucet-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.faucet-btn.${mode}`).classList.add('active');
  
  if (mode === 'close' && bathtubState.volume >= 100) {
      closeFaucetUI();
  }
}

function updateFaucetUI() {
  const tot = Math.max(1, bathtubState.hotAmt + bathtubState.coldAmt);
  const hotPct = Math.round((bathtubState.hotAmt / tot) * 100);
  const coldPct = Math.round((bathtubState.coldAmt / tot) * 100);
  
  if (els.waterGaugeFill) {
      els.waterGaugeFill.style.width = `${Math.min(100, bathtubState.volume)}%`;
      if (bathtubState.volume > 0) {
          els.waterGaugeFill.style.background = `linear-gradient(90deg, #aa3333 ${hotPct}%, #3333aa ${hotPct}%)`;
      }
  }
  
  if (els.waterVolText) els.waterVolText.innerText = `ปริมาตร: ${Math.min(100, bathtubState.volume)}%`;
  if (els.waterTempText) els.waterTempText.innerText = `ร้อน: ${hotPct}% | เย็น: ${coldPct}%`;
  
  if (bathtubState.volume >= 100 && bathtubState.mode !== 'close') {
      if (els.waterVolText) {
          els.waterVolText.innerText = `ปริมาตร: 100% (กำลังล้น!)`;
          els.waterVolText.style.color = "red";
      }
  } else {
      if (els.waterVolText) els.waterVolText.style.color = "#ccc";
  }
}

function openBathtubChoiceUI() {
  const bathtubChoiceUi = document.getElementById('bathtub-choice-ui');
  if (bathtubChoiceUi) bathtubChoiceUi.classList.remove('hidden');
}

function closeBathtubChoiceUI() {
  const bathtubChoiceUi = document.getElementById('bathtub-choice-ui');
  if (bathtubChoiceUi) bathtubChoiceUi.classList.add('hidden');
}

function bathtubChoice(choice) {
  closeBathtubChoiceUI();
  
  const flags = GameState.flags;
  const tot = bathtubState.hotAmt + bathtubState.coldAmt;
  const hotPct = Math.round((bathtubState.hotAmt / tot) * 100);
  const coldPct = Math.round((bathtubState.coldAmt / tot) * 100);
  
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
      updateRoomVisuals('bathroom');
  } else if (choice === 'drain') {
      flags['bathroom_waterDrained'] = true;
      flags['bathroom_gotKey'] = true;
      addItem('key', 'กุญแจห้องนอน');
      flags['bathroom_doorUnlocked'] = true; // Unlocks hallway door
      showDialogue("คุณดึงจุกระบายน้ำออก น้ำแรงดันสูงไหลทิ้ง ช่วยผลักกุญแจลอยขึ้นมาให้คุณหยิบ!");
      updateRoomVisuals('bathroom');
  }
}

// --- Kitchen UI Logic ---
const ingredients = [
  { id: 1, name: "กระปุกที่ 1 (เกล็ดสีน้ำตาลอ่อน มีกลิ่นหอมหวาน)" },
  { id: 2, name: "กระปุกที่ 2 (เกล็ดใหญ่สีขาวขุ่น ไม่มีกลิ่น)" },
  { id: 3, name: "กระปุกที่ 3 (ผงละเอียดสีดำ กลิ่นเคมี)" },
  { id: 4, name: "กระปุกที่ 4 (เกล็ดละเอียดสีขาวใส ไม่มีกลิ่น)" },
  { id: 5, name: "กระปุกที่ 5 (ผงหยาบสีน้ำตาลเข้ม กลิ่นฉุน)" },
  { id: 6, name: "กระปุกที่ 6 (ผงหยาบสีแดง กลิ่นเผ็ดร้อน)" }
];

function openKitchenUI() {
  els.ingredientOptions.innerHTML = '';
  ingredients.forEach(ing => {
    const btn = document.createElement('button');
    btn.className = 'pill-btn';
    btn.innerText = ing.name;
    btn.onclick = () => selectIngredient(ing.id);
    els.ingredientOptions.appendChild(btn);
  });
  els.kitchenUiContainer.classList.remove('hidden');
}

function closeKitchenUI() {
  els.kitchenUiContainer.classList.add('hidden');
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

// --- Stove Gas UI Logic ---
let stoveInputSeq = [];

function openStoveUI() {
    stoveInputSeq = [];
    updateStoveDisplay();
    els.stoveUiContainer.classList.remove('hidden');
}

function closeStoveUI() {
    els.stoveUiContainer.classList.add('hidden');
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
    if (els.stoveInputDisplay) els.stoveInputDisplay.innerText = displayStr.trim();
}

function checkStoveSequence() {
    const seqStr = stoveInputSeq.join(',');
    const correctSeq = 'right,left,left,right';
    
    setTimeout(() => {
        closeStoveUI();
        if (seqStr === correctSeq) {
            GameState.flags['kitchen_gasOff'] = true;
            showDialogue("คุณหมุนวาล์วเตาแก๊สได้ถูกต้อง! เตาแก๊สถูกปิด อาหารบนเตาหยุดเดือด ควันและกลิ่นไหม้ค่อยๆ จางหายไป");
            updateRoomVisuals('kitchen');
        } else {
            takeDamage("หมุนผิดจังหวะ ไฟพุ่งพึ่บใส่แขนคุณ!", 0.25);
            stoveInputSeq = []; // Reset sequence
        }
    }, 400);
}

// --- Dining Room UI Logic ---
const drinks = [
  { id: 'tea', name: 'ชามิ้นต์' },
  { id: 'coffee', name: 'กาแฟดำ' },
  { id: 'water', name: 'น้ำเปล่าเย็น' }
];

function openDiningUI() {
  els.drinkOptions.innerHTML = '';
  drinks.forEach(d => {
    const btn = document.createElement('button');
    btn.className = 'pill-btn';
    btn.innerText = d.name;
    btn.onclick = () => selectDrink(d.id);
    els.drinkOptions.appendChild(btn);
  });
  els.diningUiContainer.classList.remove('hidden');
}

function closeDiningUI() {
  els.diningUiContainer.classList.add('hidden');
}

function selectDrink(id) {
  closeDiningUI();
  const flags = GameState.flags;
  
  if (flags['dining_room_lightSwitchState'] !== 2) {
      takeDamage("มองไม่ถนัดในความมืด/แสงกะพริบ ทำให้ทำน้ำร้อนหกรดมือ ถูกลวกจนบาดเจ็บ!", 0.25);
      if (GameState.hp <= 0) return;
  }
  
  if (id === 'tea') {
      if (!flags['dining_room_teaDrank']) {
          flags['dining_room_teaDrank'] = true;
          GameState.hpDrainRate = 0;
          showDialogue("คุณดื่มชามิ้นต์อุ่นๆ รสชาติเย็นซ่าและกลิ่นหอมสมุนไพรทำให้รู้สึกผ่อนคลายขึ้น");
      } else {
          showDialogue("ชามิ้นต์ถูกดื่มไปหมดแล้ว");
      }
  } else if (id === 'coffee') {
      if (!flags['dining_room_coffeeDrank']) {
          flags['dining_room_coffeeDrank'] = true;
          showDialogue("กาแฟดำเข้มข้นทำให้ใจคุณเต้นแรงขึ้น อาการแพนิคกำเริบ... คุณได้ยินเสียงนาฬิกาดังเคาะบอกเวลาอย่างรวดเร็ว (ต้องรีบดื่มน้ำ!)");
          
          roomTimers.diningCoffeeDeath = setTimeout(() => {
              if (GameState.hp > 0) die("ระบบประสาทถูกกระตุ้นจากคาเฟอีนประกอบกับเสียงดัง อาการแพนิคกำเริบรุนแรงจนหัวใจวาย!");
          }, 5000);
      } else {
          showDialogue("กาแฟหมดแล้ว");
      }
  } else if (id === 'water') {
      if (!flags['dining_room_waterDrank']) {
          flags['dining_room_waterDrank'] = true;
          if (flags['dining_room_coffeeDrank']) {
              clearTimeout(roomTimers.diningCoffeeDeath);
              showDialogue("น้ำเย็นช่วยเจือจางฤทธิ์คาเฟอีน... อาการใจสั่นลดลง เสียงนาฬิกาดังเบาลง รอดตายอย่างหวุดหวิด");
          } else {
              showDialogue("ดื่มน้ำเปล่าชื่นใจดี... (ไม่มีผลอะไรพิเศษ)");
          }
      } else {
          showDialogue("น้ำเปล่าหมดแล้ว");
      }
  }
}
