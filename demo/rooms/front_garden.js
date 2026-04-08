window.RoomData = window.RoomData || {};

Object.assign(GameState.flags, {
  garden_in_cage: false,
  garden_on_cage: false,
  garden_cage_closed: false,
  garden_cage_locked: false,
  garden_bowl_full: false,
  garden_pots_checked_count: 0,
  garden_hole_right_checked: false,
  garden_dog_timer: 0,
  garden_dog_state: 'absent', // absent, eating, sleeping, furious, caged
  garden_dog_action_timer: 0, // timer for eating/sleeping
  garden_wind_timer: 0
});

window.RoomData.front_garden = {
  styles: `
.room-front_garden { background-image: url('assets/front_garden_bg.png'); }
.branch-shaking { animation: shake 2s infinite; }
  `,
  objects: [
    { id: 'cage_inside', name: 'เข้าไปในกรง', bounds: { left: 45, top: 60, width: 10, height: 20 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags.garden_cage_closed) {
           showDialogue('ประตูกรงปิดอยู่');
           return;
        }
        if (flags.garden_on_cage) {
           showDialogue('คุณอยู่บนกรง กรุณาลงมาก่อน');
           return;
        }
        if (flags.garden_in_cage) {
           showDialogue('คุณอยู่ในกรงแล้ว');
        } else {
           flags.garden_in_cage = true;
           showDialogue('คุณเดินเข้าไปในกรงเหล็กที่มีชามอาหารวางอยู่');
        }
      }
    },
    { id: 'cage_outside', name: 'ออกจากกรง', bounds: { left: 40, top: 80, width: 20, height: 10 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags.garden_in_cage) {
           if (flags.garden_cage_closed) {
               showDialogue('ประตูกรงประแทกปิดไปแล้ว! คุณถูกขัง!');
           } else {
               flags.garden_in_cage = false;
               showDialogue('คุณเดินออกมาจากกรง');
           }
        } else {
           if (flags.garden_on_cage) {
               flags.garden_on_cage = false;
               showDialogue('คุณปีนลงจากกรงเหล็ก');
           }
        }
      }
    },
    { id: 'cage_door', name: 'ประตูกรง', bounds: { left: 40, top: 60, width: 5, height: 20 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags.garden_cage_locked) {
           showDialogue('ประตูกรงถูกผูกเชือคล็อคแน่นหนาแล้ว');
           return;
        }
        if (flags.garden_cage_closed) {
           if (hasItem('rope_loop')) {
              if (flags.garden_dog_state === 'eating' || flags.garden_dog_state === 'sleeping' || flags.garden_dog_state === 'absent') {
                  flags.garden_cage_locked = true;
                  flags.garden_dog_state = 'caged';
                  removeItem('rope_loop');
                  showDialogue('คุณใช้เชือกห่วงผูกมัดประตูกรงให้แน่นหนา! ขังสุนัขได้สำเร็จถาวร!');
              } else {
                  showDialogue('สุนัขตื่นแล้ว ผูกไม่ทัน!');
              }
           } else {
              showDialogue('ประตูกรงปิดอยู่ แต่ยังไม่ได้ล็อก ต้องหาเชือกมาผูก!');
           }
        } else {
           flags.garden_cage_closed = true;
           showDialogue('คุณปิดประตูกรง ทางเดินสู่โซนรั้วหน้าบ้านปลอดภัยขึ้น แต่ยังไม่ถาวร!');
        }
      }
    },
    { id: 'cage_roof', name: 'ปีนกรงเหล็ก', bounds: { left: 40, top: 40, width: 20, height: 20 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags.garden_in_cage || flags.garden_on_cage) return;
        
        if (hasItem('pot_b')) {
           flags.garden_on_cage = true;
           showDialogue('คุณนำกระถาง B วางช่วยเสริมความสูง แล้วปีนขึ้นไปบนกรงสำเร็จ ปลอดภัยจากสุนัขด้านล่าง!');
        } else if (hasItem('pot_a')) {
           showDialogue('คุณพยายามใช้กระถาง A เป็นขั้นบันได แต่มันแตกออก! เศษดินเผาบาดเท้า!');
           takeDamage('กระถางบาดเท้า', 0.5);
           removeItem('pot_a');
        } else {
           showDialogue('กรงสูงเกินไป ปีนไม่ถึง ต้องการสิ่งของช่วยเสริมความสูง');
        }
      }
    },
    { id: 'bowl', name: 'ชามอาหาร', bounds: { left: 48, top: 75, width: 5, height: 5 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags.garden_in_cage) {
           showDialogue('คุณต้องเข้าไปใกล้ชามอาหารข้างในกรงก่อน');
           return;
        }
        if (flags.garden_bowl_full) {
           showDialogue('ชามมีอาหารสุนัขอยู่แล้ว');
        } else {
           if (hasItem('dog_food')) {
              flags.garden_bowl_full = true;
              removeItem('dog_food');
              showDialogue('คุณเทอาหารสุนัขลงในชาม ชามพร้อมแล้ว!');
           } else {
              showDialogue('ชามอาหารว่างเปล่า ไม่มีอะไรในนี้ (คุณต้องหาอาหารมาใส่)');
           }
        }
      }
    },
    { id: 'rope', name: 'เชือกห่วงบนกิ่งไม้', bounds: { left: 45, top: 20, width: 10, height: 10 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags.garden_on_cage) {
           showDialogue('เชือกอยู่สูงเกินไป คุณเอื้อมไม่ถึงจากตรงนี้');
           return;
        }
        // Simplified decision: we auto use shovel if they have it
        if (hasItem('shovel')) {
           if (flags.garden_wind_timer >= 300) {
              triggerDeath('กิ่งไม้สั่นแรงมาก พอคุณใช้พลั่วดึง กิ่งไม้ก็หักลงมาทับคุณตาย!');
           } else {
              showDialogue('คุณใช้พลั่วเกี่ยวเชือกห่วงลงมา [ได้รับเชือกห่วง]');
              addItem('rope_loop', 'เชือกห่วง');
           }
        } else {
           // We ask for interaction
           showDialogue('คุณสามารถ [ผูกคอ] กับเชือกนี้ได้ หรือหาของมา [เกี่ยว] เชือกลงไป');
           // Let's implement death right away if they don't have shovel 
           // In demo context, just warn them
           showDialogue('มันหลอกล่อให้คุณอยากผูกคอตาย... คุณต้องหาพลั่วมาเกี่ยวเชือกลงไป');
        }
      }
    },
    { id: 'pots', name: 'กองกระถาง', bounds: { left: 65, top: 65, width: 15, height: 15 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags.garden_pots_checked_count === 0) {
           flags.garden_pots_checked_count++;
           showDialogue('ตรวจสอบกระถาง... คางคกกระโดดออกมา! ตกใจสะดุ้ง!');
           takeDamage('ตกใจคางคก', 0.2);
        } else if (flags.garden_pots_checked_count === 1) {
           flags.garden_pots_checked_count++;
           showDialogue('พบกระถาง A (มีรอยร้าว) และ กระถาง B (สภาพดี) คุณเก็บกระถาง B');
           // Demo simplicity: just give pot B to avoid complex menus
           addItem('pot_b', 'กระถาง B');
        } else {
           showDialogue('กองกระถางแตกๆ ไม่มีอะไรแล้ว');
        }
      }
    },
    { id: 'hole_left', name: 'หลุมซ้าย', bounds: { left: 10, top: 70, width: 10, height: 10 },
      onInteract: (element) => {
         if (!hasItem('shovel')) {
            showDialogue('พบ [พลั่วขุดดินด้ามยาว] พิงอยู่ข้างหลุม');
            addItem('shovel', 'พลั่วขุดดินด้ามยาว');
         } else {
            showDialogue('หลุมขุดเตรียมไว้');
         }
      }
    },
    { id: 'hole_center', name: 'หลุมกลาง', bounds: { left: 20, top: 75, width: 10, height: 10 },
      onInteract: (element) => {
         triggerDeath('ตกใจสุดขีดจากการพบสิ่งที่น่าสะพรึงกลัวและสยดสยองซ่อนอยู่ในหลุม — ช็อกตาย!');
      }
    },
    { id: 'hole_right', name: 'หลุมขวา', bounds: { left: 30, top: 70, width: 10, height: 10 },
      onInteract: (element) => {
         if (!GameState.flags.garden_hole_right_checked) {
             GameState.flags.garden_hole_right_checked = true;
             showDialogue('หลุมนี้ลึกผิดปกติมาก... รู้สึกหวาดกลัว');
             takeDamage('หวาดกลัว', 0.2);
         } else {
             showDialogue('หลุมลึกน่ากลัว');
         }
      }
    },
    { id: 'door_fence', name: 'ทางไปรั้วหน้าบ้าน', bounds: { left: 85, top: 40, width: 15, height: 40 },
      onInteract: (element) => {
         const flags = GameState.flags;
         if (flags.garden_dog_state === 'furious') {
             triggerDeath('สุนัขดุร้ายกระโดดกัดคุณจนตาย!');
         } else if (flags.garden_dog_state !== 'caged' && !flags.garden_cage_closed) {
             // Dog is either coming, or we haven't enclosed it at all
             showDialogue('สุนัขพุ่งมาจากเขตใกล้ๆ กัดตายทันที!');
             triggerDeath('สุนัขพุ่งออกมากัดตาย!');
         } else {
             showDialogue('คุณเดินผ่านเข้าสู่โซนรั้วหน้าบ้าน...');
             saveCheckpoint();
             loadRoom('fence_gate');
         }
      }
    },
    { id: 'clothesline', name: 'ราวตากผ้า', bounds: { left: 15, top: 30, width: 15, height: 15 },
      onInteract: (element) => {
         showDialogue('กระดาษโน้ตในเสื้อ: "ถ้าไม่มีใครอยู่ ต้องให้อาหารเจ้าร็อคกี้ไว้ ให้เขาอยู่ในกรงและปิดให้แน่นหนา"');
         addLog("ให้อาหารและล็อคกรงสัตว์เลี้ยงให้แน่นหนา");
      }
    },
    { id: 'laundry_window', name: 'กลับห้องซักล้าง', bounds: { left: 0, top: 30, width: 10, height: 40 },
      onInteract: (element) => {
         showDialogue('คุณปีนกลับเข้าไปในห้องซักล้าง (โดนกระจกบาดอีกครั้ง)');
         takeDamage('เศษกระจกบาด', 0.2, false);
         saveCheckpoint();
         loadRoom('laundry');
      }
    }
  ],
  decorations: [],
  setupUI: function() {},
  updateVisuals: function() {},
  onSecondTimer: function() {
    const flags = GameState.flags;
    flags.garden_wind_timer++;

    if (flags.garden_wind_timer >= 420) {
        triggerDeath('กิ่งไม้ยักษ์หักโค่นลงมาทับคุณตาย!');
    } else if (flags.garden_in_cage && Math.random() < 0.05 && flags.garden_wind_timer > 10) {
       // wind slams door
       if (!flags.garden_cage_closed) {
           flags.garden_cage_closed = true;
           showDialogue('ลมพัดแรงจนประตูกรงกระแทกปิด! คุณติดอยู่ในกรง!');
           GameState.hpDrainRate += 0.02; // panic
       }
    }

    if (flags.garden_dog_state === 'absent') {
       flags.garden_dog_timer++;
       if (flags.garden_dog_timer >= 60) { // For demo speed up, 60 instead of 120
           showDialogue('สุนัขร็อตไวเลอร์ดุร้ายโผล่มาแล้ว!');
           if (flags.garden_bowl_full) {
               flags.garden_dog_state = 'eating';
               flags.garden_dog_action_timer = 0;
           } else {
               flags.garden_dog_state = 'furious';
           }
       }
    } else if (flags.garden_dog_state === 'eating') {
       flags.garden_dog_action_timer++;
       if (flags.garden_dog_action_timer >= 10) {
           flags.garden_dog_state = 'sleeping';
           flags.garden_dog_action_timer = 0;
           showDialogue('สุนัขกินอิ่มแล้วก็ทิ้งตัวลงนอน... เวลานี้แหละต้องปิดกรง!');
       }
    } else if (flags.garden_dog_state === 'sleeping') {
       flags.garden_dog_action_timer++;
       if (flags.garden_dog_action_timer >= 30) {
           flags.garden_dog_state = 'furious';
           showDialogue('สุนัขตื่นขึ้นมาแล้ว เริ่มโกรธเกรี้ยวอีกครั้ง!');
       }
    }
    
    if (flags.garden_dog_state === 'furious') {
        if (!flags.garden_on_cage) {
            triggerDeath('สุนัขพุ่งเข้ามากัดคุณจนตาย!');
        } else {
            GameState.hpDrainRate = 0.02; // Dog barking
            // Wait out the dog
            flags.garden_dog_action_timer++;
            if (flags.garden_dog_action_timer > 15) {
                flags.garden_dog_state = 'absent';
                flags.garden_dog_timer = 0; // restart cycle
                flags.garden_dog_action_timer = 0;
                showDialogue('สุนัขยอมแพ้แล้ววิ่งกลับไปทางรั้วหน้าบ้าน...');
            }
        }
    }
  }
};
