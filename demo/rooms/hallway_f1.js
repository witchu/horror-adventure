window.RoomData = window.RoomData || {};

Object.assign(GameState.flags, {
  hallway_f1_backpackSearched1: false,
  hallway_f1_backpackSearched2: false,
  hallway_f1_storageUnlocked: false
});

window.RoomData.hallway_f1 = {
  styles: `
.room-hallway_f1 { background-image: url('assets/hallway_f1_bg.png'); }
  `,
  objects: [
    { id: 'backpack', name: 'กระเป๋าสะพาย', bounds: { left: 25, top: 70, width: 15, height: 15 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags['hallway_f1_backpackSearched1']) {
            flags['hallway_f1_backpackSearched1'] = true;
            showDialogue("ค้นครั้งแรกพบบอดี้พาสพนักงาน... คุณจดเบาะแสรั้วลำดับที่ 1 ลงสมุดบันทึก");
            addLog("เบาะแสรั้วลำดับที่ 1 จากบัตรพนักงาน");
        } else if (!flags['hallway_f1_backpackSearched2']) {
            flags['hallway_f1_backpackSearched2'] = true;
            showDialogue("ค้นต่อ... เจอสมาร์ทโฟน! (แบต 100%) ใช้เปิดไฟฉายได้ถ้าจำเป็น");
            addItem('smartphone', 'สมาร์ทโฟน');
        } else {
            showDialogue("ไม่มีอะไรในกระเป๋าแล้ว");
        }
      }
    },
    { id: 'door_living', name: 'ประตูห้องนั่งเล่น', bounds: { left: 80, top: 10, width: 15, height: 50 },
      onInteract: (element) => {
        showDialogue("ประตูล็อค หรือ ทางนี้ยังไปไม่ได้");
      }
    },
    { id: 'door_storage', name: 'ประตูห้องเก็บของ', bounds: { left: 60, top: 10, width: 15, height: 50 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags['hallway_f1_storageUnlocked']) {
            showDialogue("ประตูห้องเก็บของถูกปลดล็อคแล้ว คุณเดินเข้าไปในความมืดที่รออยู่...");
            saveCheckpoint();
            loadRoom('storage');
        } else if (hasItem('key_storage')) {
            removeItem('key_storage');
            flags['hallway_f1_storageUnlocked'] = true;
            showDialogue("คุณใช้กุญแจห้องเก็บของไขเปิดประตู และเดินเข้าไปในความมืดที่รออยู่...");
            saveCheckpoint();
            loadRoom('storage');
        } else {
            showDialogue("ประตูล็อค หรือ ทางนี้ยังไปไม่ได้ (ต้องการกุญแจห้องเก็บของ)");
        }
      }
    },
    { id: 'door_kitchen', name: 'ทางเข้าไปยังห้องครัว', bounds: { left: 0, top: 20, width: 15, height: 70 },
      onInteract: (element) => {
        showDialogue("ประตูเปิดออกสู่ห้องครัว...");
        saveCheckpoint();
        loadRoom('kitchen');
      }
    },
    { id: 'stairs_up', name: 'บันไดขึ้นชั้น 2', bounds: { left: 40, top: 60, width: 40, height: 40 },
      onInteract: (element) => {
        showDialogue("คุณเดินขึ้นบันไดกลับไปยังชั้น 2");
        loadRoom('hallway_f2');
      }
    }
  ],
  decorations: [],
  setupUI: function() {},
  updateVisuals: function() {},
  onSecondTimer: function() {}
};
