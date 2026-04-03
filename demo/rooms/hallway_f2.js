window.RoomData = window.RoomData || {};
window.RoomData.hallway_f2 = {
  objects: [
    { id: 'curtain', name: 'ผ้าม่านหน้าต่างบานใหญ่', bounds: { left: 20, top: 20, width: 30, height: 50 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags['hallway_f2_curtainClosed']) {
          flags['hallway_f2_curtainClosed'] = true;
          showDialogue("คุณปิดผ้าม่านบานใหญ่... โคมไฟระย้าหยุดแกว่ง โถงทางเดินเริ่มมืดลง");
          updateRoomVisuals('hallway_f2');
        } else {
          showDialogue("ผ้าม่านปิดสนิทแล้ว");
        }
      }
    },
    { id: 'rug', name: 'พรมเช็ดเท้า', bounds: { left: 30, top: 80, width: 40, height: 15 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags['hallway_f2_chandelierSwinging'] && !flags['hallway_f2_rugSorted']) {
          flags['hallway_f2_rugSorted'] = true;
          showDialogue("คุณจัดพรมเช็ดเท้าให้เรียบร้อยเพื่อไม่ให้สะดุดเวลาเดิน");
          updateRoomVisuals('hallway_f2');
        } else if (flags['hallway_f2_chandelierSwinging']) {
           takeDamage("ขณะเอื้อมไปจัดพรม โคมไฟระย้าที่แกว่งอยู่ร่วงลงมาเฉี่ยวคุณอย่างหวุดหวิด!");
        } else {
           showDialogue("พรมจัดเรียบร้อยดีแล้ว");
        }
      }
    },
    { id: 'light_switch', name: 'สวิตช์ไฟขั้นบันได', bounds: { left: 80, top: 30, width: 10, height: 20 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags['hallway_f2_chandelierSwinging']) {
            die("ยังไม่ทันได้กดสวิตช์ โคมไฟระย้าก็หลุดร่วงลงมาทับคุณตายทันที!");
            return;
        }
        if (!flags['hallway_f2_rugSorted']) {
            takeDamage("ขณะเอื้อมกดปุ่ม คุณสะดุดพรมที่พับอยู่ล้มหัวฟาด!");
            return;
        }
        if (!flags['hallway_f2_lightOn']) {
            flags['hallway_f2_lightOn'] = true;
            showDialogue("คุณกดเปิดสวิตช์ไฟ ไฟทางเดินบันไดสว่างขึ้น มองเห็นเส้นทางลงไปชั้น 1 ชัดเจน");
            updateRoomVisuals('hallway_f2');
        } else {
            showDialogue("ไฟสว่างอยู่แล้ว");
        }
      }
    },
    { id: 'stairs_down', name: 'บันไดลงไปชั้นล่าง', bounds: { left: 40, top: 40, width: 20, height: 40 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags['hallway_f2_chandelierSwinging']) {
            die("ยังไม่ทันก้าวลงบันได โคมไฟระย้าก็หลุดร่วงลงมาทับคุณตายทันที!");
            return;
        }
        if (!flags['hallway_f2_rugSorted']) {
            die("คุณสะดุดพรมที่ยับยู่ยี่ หัวคะมำตกบันไดคอหักตาย!");
            return;
        }
        if (!flags['hallway_f2_lightOn']) {
            die("ทางลงบันไดมืดเกินไป คุณก้าวพลาดลื่นตกบันไดหัวฟาดพื้นตาย!");
            return;
        }
        showDialogue("คุณเดินลงบันไดมายังโถงทางเดินชั้น 1");
        saveCheckpoint();
        loadRoom('hallway_f1');
      }
    }
  ],
  decorations: [
    { id: 'chandelier', name: 'โคมไฟระย้า', bounds: { left: 30, top: -10, width: 40, height: 30 }, classes: 'chandelier-swing swinging',
      onInteract: (element) => {}
    }
  ]
};
