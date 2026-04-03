window.RoomData = window.RoomData || {};
window.RoomData.bathroom = {
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
            updateRoomVisuals('bathroom');
        } else if (!flags['bathroom_dryerStored']) {
            flags['bathroom_dryerStored'] = true;
            showDialogue("เก็บไดร์เป่าผมเข้าที่เรียบร้อย ปลอดภัยหายห่วง");
            updateRoomVisuals('bathroom');
        }
      }
    },
    { id: 'bathtub', name: 'อ่างอาบน้ำ', bounds: { left: 65, top: 40, width: 30, height: 40 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags['bathroom_doorUnlocked']) {
          if (!bathtubState.active && !flags['bathroom_waterFilled']) {
             bathtubState.active = true;
             bathtubState.mode = 'hot';
             openFaucetUI();
          } else if (bathtubState.active && !flags['bathroom_waterFilled']) {
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
        if (!flags['bathroom_soapPicked'] && roomTimers.bathroomSoap > 25) {
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
  ]
};
