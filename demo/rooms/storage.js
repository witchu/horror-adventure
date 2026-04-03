window.RoomData = window.RoomData || {};
window.RoomData.storage = {
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
                 updateRoomVisuals('storage');
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
             } else {
                 showDialogue("กล่องถูกล็อคด้วยแม่กุญแจแน่นหนา ต้องหากุญแจมาไข");
             }
         } else {
             showDialogue("กล่องอุปกรณ์ว่างเปล่า คุณเอาค้อนมาแล้ว");
         }
      }
    }
  ],
  decorations: []
};
