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
    { id: 'cage_toggle', name: 'กรงสุนัข', bounds: { left: 14.1, top: 49.0, width: 13.8, height: 26.8 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags.garden_cage_closed) {
           showDialogue('ประตูกรงปิดสนิท เข้าออกไม่ได้');
           return;
        }
        if (flags.garden_on_cage) {
           showDialogue('คุณอยู่บนกรง กรุณาลงมาก่อน');
           return;
        }
        if (flags.garden_in_cage) {
           flags.garden_in_cage = false;
           showDialogue('คุณเดินออกมาจากกรง');
        } else {
           flags.garden_in_cage = true;
           showDialogue('คุณเดินเข้าไปในกรงเหล็กที่มีชามอาหารวางอยู่');
        }
      }
    },
    { id: 'cage_door', name: 'ประตูกรง', bounds: { left: 28.2, top: 52.5, width: 9.2, height: 21.5 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags.garden_on_cage) { showDialogue('ต้องลงจากกรงก่อน'); return; }
        if (flags.garden_cage_locked) {
           showDialogue('ประตูกรงถูกผูกเชือคล็อคล็อคแน่นหนาแล้ว');
           return;
        }
        if (flags.garden_dog_state === 'absent') {
           showDialogue('ตอนนี้ยังไม่มีสุนัขในกรง คุณต้องรอให้มันเข้าไปก่อนถึงจะคุ้มค่าที่จะปิดมัน');
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
    { id: 'cage_roof', name: 'หลังคากรงเหล็ก', bounds: { left: 10.3, top: 41.8, width: 19.8, height: 6.8 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags.garden_in_cage) {
           showDialogue("คุณอยู่ในกรง ปีนขึ้นหลังคาไม่ได้");
           return;
        }
        if (flags.garden_on_cage) {
           flags.garden_on_cage = false;
           showDialogue('คุณปีนลงจากกรงเหล็กอย่างระมัดระวัง');
           return;
        }
        
        if (hasItem('pot_b') || flags.garden_pot_b_placed) {
           flags.garden_on_cage = true;
           if (hasItem('pot_b')) {
               flags.garden_pot_b_placed = true;
               removeItem('pot_b'); 
           }
           showDialogue('คุณนำกระถาง B วางช่วยเสริมความสูง แล้วปีนขึ้นไปบนกรงสำเร็จ ปลอดภัยจากสุนัขด้านล่าง!');
           addLog("ปีนขึ้นมาอยู่บนหลังคากรงเหล็กแล้ว");
        } else if (hasItem('pot_a')) {
           showDialogue('คุณพยายามใช้กระถาง A เป็นขั้นบันได แต่มันแตกออก! เศษดินเผาบาดเท้า!');
           takeDamage('กระถางบาดเท้า', 0.5);
           removeItem('pot_a');
        } else {
           showDialogue('กรงสูงเกินไป ปีนไม่ถึง ต้องการสิ่งของช่วยเสริมความสูง');
        }
      }
    },
    { id: 'bowl', name: 'ชามอาหาร', bounds: { left: 7.5, top: 65.2, width: 6.2, height: 8.0 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags.garden_on_cage) { showDialogue('ต้องลงจากกรงก่อน'); return; }
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
    { id: 'rope', name: 'เชือกห่วงบนกิ่งไม้', bounds: { left: 23.2, top: 14.5, width: 5.2, height: 26.5 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags.garden_on_cage) {
           showDialogue('เชือกอยู่สูงเกินไป คุณเอื้อมไม่ถึงจากตรงนี้');
           return;
        }

           const uiHTML = `
             <div id="garden-rope-ui" class="ui-overlay">
                 <div class="ui-panel">
                     <h3>เชือกห่วงแขวนอยู่บนกิ่งไม้ มันเย้ายวนให้พังสิ้นทุกสิ่ง...</h3>
                     <div class="pill-grid">
                         <button class="pill-btn" id="btn-rope-take">ใช้พลั่วเกี่ยวเชือกมาเก็บไว้</button>
                         <button class="pill-btn" id="btn-rope-hang">ผูกคอตาย จบความทรมาน</button>
                     </div>
                     <button class="pill-btn mt-10" id="btn-rope-cancel">ไม่ทำอะไร</button>
                 </div>
             </div>
           `;
           const container = document.getElementById('scene');
           container.insertAdjacentHTML('beforeend', uiHTML);

           const overlay = document.getElementById('garden-rope-ui');
           document.getElementById('btn-rope-take').addEventListener('click', () => {
               if (hasItem('shovel')) {
                   if (flags.garden_wind_timer >= 300) {
                      overlay.remove();
                      triggerDeath('กิ่งไม้สั่นแรงมาก พอคุณใช้พลั่วดึง กิ่งไม้ก็หักลงมาทับคุณตาย!');
                   } else {
                      showDialogue('คุณใช้พลั่วเกี่ยวเชือกห่วงลงมาได้สำเร็จ [ได้รับเชือกห่วง] พลั่วหักในระหว่างใช้งาน');
                      addItem('rope_loop', 'เชือกห่วง');
                      removeItem('shovel');
                      overlay.remove();
                   }
               } else {
                   showDialogue('คุณเอื้อมไม่ถึง และไม่มีอุปกรณ์แบบด้ามยาวเพื่อใช้ดึงเชือกลงมา');
                   overlay.remove();
               }
           });
           document.getElementById('btn-rope-hang').addEventListener('click', () => {
               overlay.remove();
               triggerDeath('คุณทนความกดดันไม่ไหว ตัดสินใจผูกคอตายกับเชือกห่วงบนต้นไม้...');
           });
           document.getElementById('btn-rope-cancel').addEventListener('click', () => {
               overlay.remove();
           });
      }
    },
    { id: 'pots', name: 'กองกระถาง', bounds: { left: 65.5, top: 58.5, width: 18.0, height: 20.0 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags.garden_on_cage) { showDialogue('ต้องลงจากกรงก่อน'); return; }
        if (flags.garden_pots_checked_count === 0) {
           flags.garden_pots_checked_count++;
           showDialogue('ตรวจสอบกระถาง... คางคกกระโดดออกมา! ตกใจสะดุ้ง!');
           takeDamage('ตกใจคางคก', 0.2);
        } else if (hasItem('pot_b') || flags.garden_pot_b_placed) {
           showDialogue('มีกระถางแล้ว ไม่จำเป็นต้องเก็บเพิ่มอีก');
        } else {
           // Provide UI choice
           const uiHTML = `
             <div id="garden-pot-ui" class="ui-overlay">
                 <div class="ui-panel">
                     <h3>ค้นพบกระถางสองใบ คุณจะเลือกเก็บใบไหน?</h3>
                     <div class="pill-grid">
                         <button class="pill-btn" id="btn-pot-a">กระถาง A (มีรอยร้าว)</button>
                         <button class="pill-btn" id="btn-pot-b">กระถาง B (สภาพใหม่แข็งแรง)</button>
                     </div>
                     <button class="pill-btn mt-10" id="btn-pot-cancel">ไม่เก็บอะไรเลย</button>
                 </div>
             </div>
           `;
           const container = document.getElementById('scene');
           container.insertAdjacentHTML('beforeend', uiHTML);

           const overlay = document.getElementById('garden-pot-ui');
           document.getElementById('btn-pot-a').addEventListener('click', () => {
               addItem('pot_a', 'กระถาง A');
               showDialogue('คุณหยิบ กระถาง A (มีรอยร้าว) ขึ้นมา');
               overlay.remove();
           });
           document.getElementById('btn-pot-b').addEventListener('click', () => {
               addItem('pot_b', 'กระถาง B');
               showDialogue('คุณหยิบ กระถาง B (สภาพดี) ขึ้นมา');
               overlay.remove();
           });
           document.getElementById('btn-pot-cancel').addEventListener('click', () => {
               overlay.remove();
           });
        }
      }
    },
    { id: 'hole_left', name: 'หลุมซ้าย', bounds: { left: 34.5, top: 84.2, width: 13.5, height: 10.5 },
      onInteract: (element) => {
         if (GameState.flags.garden_on_cage) { showDialogue('ต้องลงจากกรงก่อน'); return; }
         if (!hasItem('shovel')) {
            showDialogue('พบ [พลั่วขุดดินด้ามยาว] พิงอยู่ข้างหลุม');
            addItem('shovel', 'พลั่วขุดดินด้ามยาว');
         } else {
            showDialogue('หลุมขุดเตรียมไว้');
         }
      }
    },
    { id: 'hole_center', name: 'หลุมกลาง', bounds: { left: 54.8, top: 84.2, width: 13.5, height: 10.5 },
      onInteract: (element) => {
         if (GameState.flags.garden_on_cage) { showDialogue('ต้องลงจากกรงก่อน'); return; }
         triggerDeath('ตกใจสุดขีดจากการพบสิ่งที่น่าสะพรึงกลัวและสยดสยองซ่อนอยู่ในหลุม — ช็อกตาย!');
      }
    },
    { id: 'hole_right', name: 'หลุมขวา', bounds: { left: 78.8, top: 84.2, width: 13.5, height: 10.5 },
      onInteract: (element) => {
         if (GameState.flags.garden_on_cage) { showDialogue('ต้องลงจากกรงก่อน'); return; }
         if (!GameState.flags.garden_hole_right_checked) {
             GameState.flags.garden_hole_right_checked = true;
             showDialogue('ตกใจ เห็นหลุมลึกผิดปกติ ดูหวาดกลัวดั่งจุดลึกผิดปกติ');
             takeDamage('หวาดกลัว', 0.2);
         } else {
             showDialogue('หลุมลึกน่ากลัว ดูผิดปกติ');
         }
      }
    },
    { id: 'door_fence', name: 'ทางไปรั้วหน้าบ้าน', bounds: { left: 40.1, top: 10.2, width: 16.5, height: 51.0 },
      onInteract: (element) => {
         const flags = GameState.flags;
         if (flags.garden_on_cage) { showDialogue('ต้องลงจากกรงก่อน'); return; }
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
    { id: 'clothesline', name: 'ราวตากผ้า', bounds: { left: 83.8, top: 38.2, width: 9.2, height: 22.5 },
      onInteract: (element) => {
         if (GameState.flags.garden_on_cage) { showDialogue('ต้องลงจากกรงก่อน'); return; }
         showDialogue('กระดาษโน้ตในเสื้อ: "ถ้าไม่มีใครอยู่ ต้องให้อาหารเจ้าร็อคกี้ไว้ ให้เขาอยู่ในกรงและปิดให้แน่นหนา"');
         addLog("ให้อาหารและล็อคกรงสัตว์เลี้ยงให้แน่นหนา");
      }
    },
    { id: 'laundry_window', name: 'กลับห้องซักล้าง', bounds: { left: 68.8, top: 5.8, width: 26.0, height: 29.5 },
      onInteract: (element) => {
         if (GameState.flags.garden_on_cage) { showDialogue('ต้องลงจากกรงก่อน'); return; }
         showDialogue('คุณปีนกลับเข้าไปในห้องซักล้าง (โดนกระจกบาดอีกครั้ง)');
         takeDamage('เศษกระจกบาด', 0.2, false);
         saveCheckpoint();
         loadRoom('laundry');
      }
    }
  ],
  decorations: [],
  setupUI: function() {
    const flags = GameState.flags;
    if (flags.garden_dog_state !== 'furious') {
        GameState.hpDrainRate = 0; // stop any previous room's panic draining if safe
    }
  },
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
       if (flags.garden_bowl_full && !flags.garden_in_cage && !flags.garden_cage_closed) {
           flags.garden_feed_delay_timer = (flags.garden_feed_delay_timer || 0) + 1;
           if (flags.garden_feed_delay_timer >= 5) {
               showDialogue('สุนัขเข้าไปอยู่ในกรง เพื่อกินและหลับ');
               flags.garden_dog_state = 'eating';
               flags.garden_dog_action_timer = 0;
           }
       } else {
           flags.garden_dog_timer++;
           if (flags.garden_dog_timer >= 240) { 
               showDialogue('สุนัขร็อตไวเลอร์ดุร้ายโผล่มาแล้ว!');
               if (flags.garden_bowl_full && !flags.garden_cage_closed) {
                   flags.garden_dog_state = 'eating';
                   flags.garden_dog_action_timer = 0;
               } else {
                   flags.garden_dog_state = 'furious';
               }
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
        if (!flags.garden_on_cage && !flags.garden_in_cage) {
            triggerDeath('สุนัขพุ่งเข้ามากัดคุณจนตาย!');
        } else if (flags.garden_in_cage && !flags.garden_cage_closed) {
            triggerDeath('สุนัขพุ่งทะลุประตูกรงที่เปิดอ้าเข้ามากัดคุณจนตายคาที่!');
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
