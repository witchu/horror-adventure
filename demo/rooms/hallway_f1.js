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
    { id: 'backpack', name: 'กระเป๋าสะพาย', bounds: { left: 4.5, top: 41.5, width: 7.5, height: 24.5 },
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
    { id: 'door_living', name: 'ประตูห้องนั่งเล่น', bounds: { left: 86.5, top: 28.5, width: 10.2, height: 68.5 },
      onInteract: (element) => {
        showDialogue("ประตูล็อค หรือ ทางนี้ยังไปไม่ได้");
      }
    },
    { id: 'door_storage', name: 'ประตูห้องเก็บของ', bounds: { left: 18.5, top: 42.5, width: 6.5, height: 25.5 },
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
    { id: 'door_kitchen', name: 'ทางเข้าไปยังห้องครัว', bounds: { left: 63.5, top: 35.5, width: 15.2, height: 48.5 },
      onInteract: (element) => {
        showDialogue("ประตูเปิดออกสู่ห้องครัว...");
        saveCheckpoint();
        loadRoom('kitchen');
      }
    },
    { id: 'stairs_up', name: 'บันไดขึ้นชั้น 2', bounds: { left: 33.2, top: 39.5, width: 19.5, height: 43.5 },
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
