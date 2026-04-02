// --- Timers and Hazards ---

// Continuous HP drain loop (10 ticks per second)
setInterval(() => {
  if (GameState.hp > 0 && GameState.hpDrainRate > 0) {
    GameState.hp -= (GameState.hpDrainRate / 10);
    if (GameState.hp < 0) GameState.hp = 0;
    renderHUD();
  }
}, 100);

// Room Hazards Timer (Runs every second)
setInterval(() => {
  if (GameState.hp <= 0) return;

  if (GameState.currentRoom === 'bedroom' && !RoomFlags.bedroom.windowClosed) {
    roomTimers.bedroom++;
    const fanEl = document.getElementById('deco-fan');
    if (fanEl) {
      if (roomTimers.bedroom > 45) { 
         die("พัดลมเพดานหมุนส่ายอย่างรุนแรงจนใบพัดหลุดกระเด็นใส่คุณตายคาที่...");
      } else if (roomTimers.bedroom > 30) {
         fanEl.innerText = 'พัดลมเพดาน (สั่นแรงมาก อันตราย!)';
         fanEl.className = 'non-interactive-object danger-high';
      } else if (roomTimers.bedroom > 15) {
         fanEl.innerText = 'พัดลมเพดาน (ส่ายเริ่มแรงขึ้น)';
         fanEl.className = 'non-interactive-object danger-low';
      }
    }
  }

  if (GameState.currentRoom === 'bathroom' && !RoomFlags.bathroom.soapPicked) {
    roomTimers.bathroomSoap++;
    const spillEl = document.getElementById('deco-soap-spill');
    if (spillEl) {
      if (roomTimers.bathroomSoap > 25) { 
         spillEl.innerText = 'พื้นห้องน้ำ (สบู่ไหลลามเต็มพื้น อันตรายมาก!)';
         spillEl.className = 'non-interactive-object danger-high';
      } else if (roomTimers.bathroomSoap > 10) {
         spillEl.innerText = 'ฟองสบู่บนพื้น (เริ่มไหลลามกว้างขึ้น)';
         spillEl.className = 'non-interactive-object danger-low';
      }
    }
  }

  if (GameState.currentRoom === 'hallway_f2' && RoomFlags.hallway_f2.chandelierSwinging) {
    roomTimers.hallwayChandelier++;
    const chandelierEl = document.getElementById('deco-chandelier');
    if (chandelierEl) {
      if (roomTimers.hallwayChandelier > 45) { 
         die("โคมไฟระย้าที่แกว่งไปมาทนสภาพไม่ไหวหลุดร่วงลงมาทับคุณตายคาที่...");
      } else if (roomTimers.hallwayChandelier > 30) {
         chandelierEl.innerText = 'โคมไฟระย้า (แกว่งรุนแรง สายสะบัดจะขาดแล้ว!)';
         chandelierEl.className = 'non-interactive-object chandelier-swing swinging danger-high';
      } else if (roomTimers.hallwayChandelier > 15) {
         chandelierEl.innerText = 'โคมไฟระย้า (แกว่งแรงขึ้น เสียงเอี๊ยดอ๊าดดังมาก)';
         chandelierEl.className = 'non-interactive-object chandelier-swing swinging danger-low';
      }
    }
  }

  // Kitchen Hazards
  if (GameState.currentRoom !== 'kitchen') {
      if (GameState.hpDrainRate === 0.5) GameState.hpDrainRate = 0;
  }
  
  if (GameState.currentRoom === 'kitchen') {
      const kf = RoomFlags.kitchen;
      if (!kf.sinkOff) {
          roomTimers.kitchenWater++;
          const spill = document.getElementById('deco-water_spill');
          if (roomTimers.kitchenWater > 15) {
              if(spill) { spill.classList.remove('hidden'); spill.innerText = "น้ำท่วมพื้นห้องครัว!"; spill.classList.add('danger-high'); }
          }
      }
      if (!kf.kettleOff) {
          roomTimers.kitchenKettle++;
          const kettle = document.getElementById('obj-kettle');
          if (roomTimers.kitchenKettle > 40) {
              die("กาต้มน้ำเดือดจัดจนแรงดันเกินพิกัดและระเบิดใส่อย่างรุนแรง!");
          } else if (roomTimers.kitchenKettle > 20 && kettle) {
              kettle.innerText = "กาต้มน้ำ (เสียงหวีดร้องดังมาก!)";
              kettle.classList.add('danger-high');
          }
      }
      if (!kf.cabinetClosed) {
          roomTimers.kitchenCabinet++;
          const cab = document.getElementById('obj-cabinet');
          if (roomTimers.kitchenCabinet > 30) {
              cab.innerText = "ตู้เก็บจาน (เปิดกว้างมาก อันตราย!)";
              cab.classList.add('danger-high');
              kf.cabinetOpenLevel = 2;
          } else if (roomTimers.kitchenCabinet > 15) {
              cab.innerText = "ตู้เก็บจานแขวนผนัง (เริ่มเปิดกว้างขึ้น)";
              cab.classList.add('danger-low');
              kf.cabinetOpenLevel = 1;
          }
      }
      if (!kf.gasOff) {
          roomTimers.kitchenGas++;
          if (roomTimers.kitchenGas > 15) {
             if (GameState.hpDrainRate === 0) {
                 showDialogue("สูดดมควันไหม้จากอาหารบนเตา! (บาดเจ็บต่อเนื่อง)");
                 GameState.hpDrainRate = 0.5; // Drain faster
             }
          }
      } else {
          if (GameState.hpDrainRate === 0.5) GameState.hpDrainRate = 0;
      }
  }

  // Storage Hazards
  if (GameState.currentRoom === 'storage') {
      const sf = RoomFlags.storage;
      // Battery Drain
      if (sf.flashLightOn) {
          GameState.smartphoneBattery -= 0.5; // 200 seconds total battery
          if (GameState.smartphoneBattery <= 0) {
              GameState.smartphoneBattery = 0;
              sf.flashLightOn = false;
              updateRoomVisuals('storage');
          }
          renderHUD(); // to update battery bar
      }
      
      // Door closing timer
      if (!sf.doorWedged && sf.doorTimerStarted && !sf.gotHammer) {
          roomTimers.storageDoor++;
          if (roomTimers.storageDoor > 30) {
              sf.doorClosed = true;
              die("ประตูบานพับของห้องเก็บของพับเข้าหากันจนปิดสนิท คุณถูกขังและตายด้วยการขาดอากาศหายใจ");
          }
      }

      // Panic timer in Storage
      roomTimers.storagePanic++;
      if (!sf.flashLightOn && roomTimers.storagePanic > 210) { // 3 min 30 sec = 210s
          if (GameState.hpDrainRate === 0) {
              showDialogue("มืดสนิท... อาการ Panic กำเริบระดับ 1! (บาดเจ็บต่อเนื่อง)");
              GameState.hpDrainRate = 0.2;
          }
      } else if (sf.flashLightOn && roomTimers.storagePanic > 300) { // 5 mins = 300s
          if (GameState.hpDrainRate <= 0.2) {
              showDialogue("อยู่ในที่แคบนานเกินไป... แสงแฟลชก็ช่วยไม่ได้ อาการ Panic กำเริบระดับ 2! (บาดเจ็บต่อเนื่อง)");
              GameState.hpDrainRate = 0.4;
          }
      }
      
      // Auto-death when dark for too long without hammer
      if (!sf.flashLightOn && GameState.smartphoneBattery <= 0 && !hasItem('powerbank') && !sf.gotHammer) {
         die("ความมืดเข้าปกคลุม ประตูบานพับของห้องปิดกระแทกอย่างรวดเร็ว ถูกขังตายด้วยการขาดอากาศหายใจ");
      }
  }

  // Dining Room Hazards
  if (GameState.currentRoom === 'dining_room') {
      const df = RoomFlags.dining_room;
      if (df.coffeeDrank && !df.waterDrank) {
          roomTimers.diningClock++;
          if (roomTimers.diningClock % 1 === 0) {
              const ticks = roomTimers.diningClock;
              if (ticks === 1) addActionLog("ติ๊ก... (1)");
              else if (ticks === 2) addActionLog("ติ๊ก... (2)");
              else if (ticks === 3) addActionLog("ติ๊ก... (3)");
              else if (ticks === 4) addActionLog("ติ๊ก... (4)");
              else if (ticks >= 5) {
                  die("เสียงนาฬิกาดังครบ 5 ครั้ง อาการ Panic กำเริบรุนแรงจากคาเฟอีนจนหัวใจวายตาย!");
              }
          }
      }
  }
}, 1000);

// Bathtub Interval Logic
setInterval(() => {
  if (GameState.hp <= 0 || !bathtubState.active) return;
  if (bathtubState.mode === 'close') return;

  // Add water
  bathtubState.volume += 10;
  if (bathtubState.mode === 'hot') {
     bathtubState.hotAmt += 10;
  } else if (bathtubState.mode === 'cold') {
     bathtubState.coldAmt += 10;
  }
  
  updateFaucetUI();

  if (bathtubState.volume > 100) {
      bathtubState.active = false;
      closeFaucetUI();
      if (!RoomFlags.bathroom.dryerUnplugged) {
          die("ปล่อยน้ำล้นอ่าง ท่วมพื้นไหลไปโดนไดร์เป่าผมที่เสียบปลั๊กอยู่ ไฟช็อตตายคาที่!");
      } else {
          die("ปล่อยน้ำล้นอ่าง ท่วมพื้นจำนวนมากจนคุณลื่นล้มหัวฟาดพื้นตาย!");
      }
  }
}, 1000);
