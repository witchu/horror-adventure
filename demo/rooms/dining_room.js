window.RoomData = window.RoomData || {};
window.RoomData.dining_room = {
  objects: [
    { id: 'switch', name: 'สวิตช์ไฟ', bounds: { left: 10, top: 40, width: 5, height: 10 },
      onInteract: (element) => {
         const flags = GameState.flags;
         if (flags['dining_room_lightSwitchState'] === 1) { // Flickering -> Off
             flags['dining_room_lightSwitchState'] = 0;
             showDialogue("คุณกดสวิตช์ปิดไฟ... ห้องมืดลงอย่างน่าสะพรึง แต่ไฟเลิกกะพริบ");
             updateRoomVisuals('dining_room');
         } else if (flags['dining_room_lightSwitchState'] === 0) { // Off -> On
             flags['dining_room_lightSwitchState'] = 2;
             showDialogue("คุณกดสวิตช์อีกครั้ง... ไฟสว่างเต็มที่แล้ว! เห็นชุดเครื่องดื่มและหนังสือพิมพ์ชัดเจน");
             updateRoomVisuals('dining_room');
         } else { // On -> Off
             flags['dining_room_lightSwitchState'] = 0;
             showDialogue("คุณกดสวิตช์ปิดไฟ... ห้องกลับมามืดสนิทอีกครั้ง");
             updateRoomVisuals('dining_room');
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
             updateRoomVisuals('dining_room'); // Hide the sparkle
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
                 updateRoomVisuals('dining_room');
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
  decorations: []
};
