window.RoomData = window.RoomData || {};
window.RoomData.kitchen = {
  objects: [
    { id: 'sink', name: 'ก๊อกน้ำอ่างล้างจาน', bounds: { left: 10, top: 40, width: 20, height: 30 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags['kitchen_sinkOff']) {
            flags['kitchen_sinkOff'] = true;
            showDialogue("คุณรีบปิดก๊อกน้ำ น้ำหยุดไหลลงพื้นแล้ว (ลื่นลดลง)");
            updateRoomVisuals('kitchen');
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
            updateRoomVisuals('kitchen');
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
            updateRoomVisuals('kitchen');
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
  ]
};
