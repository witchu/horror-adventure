window.RoomData = window.RoomData || {};

Object.assign(GameState.flags, {
  road_traffic_timer: 0,
  road_man_interacted: false,
  road_crossed: false // if true, hide the man and show woman interactions
});

window.RoomData.road = {
  styles: `
.room-road { background-image: url('assets/road_bg.png'); }
.traffic-light { border-radius: 50%; box-shadow: 0 0 10px 5px currentColor; }
.traffic-green { color: lime; background-color: lime; }
.traffic-yellow { color: yellow; background-color: yellow; }
.traffic-red { color: red; background-color: red; }
  `,
  objects: [
    { id: 'traffic_light', name: 'ไฟจราจร', bounds: { left: 45, top: 10, width: 10, height: 10 },
      onInteract: (element) => {
         const flags = GameState.flags;
         let color = getTrafficColor(flags.road_traffic_timer);
         let colorName = color === 'green' ? 'เขียว' : color === 'yellow' ? 'เหลือง' : 'แดง';
         showDialogue(`ไฟจราจรเป็นสี${colorName}`);
         addLog("ไฟจราจรยังคงใช้งานได้ รอจังหวะไฟแดงค่อยข้าม");
      }
    },
    { id: 'man', name: 'ชายสูบบุหรี่', bounds: { left: 10, top: 50, width: 15, height: 40 },
      onInteract: (element) => {
         if (GameState.flags.road_man_interacted) {
             showDialogue('คุณได้โต้ตอบกับเขาไปแล้ว');
             return;
         }
         
         const choice = prompt("คุณต้องการทำอะไรกับชายสูบบุหรี่?\n1: ทักทายอย่างสนิท\n2: ต่อว่าอย่างหยาบคาย");
         if (choice === '1') {
             GameState.flags.road_man_interacted = true;
             showDialogue('คุณทักทาย เขาพยักหน้าตอบรับอย่างเย็นชา ไม่พูดอะไร');
         } else if (choice === '2') {
             if (hasItem('fish_knife')) {
                 GameState.flags.road_man_interacted = true;
                 showDialogue('คุณต่อว่าเขา เขาด่ากลับ เกิดการถกเถียง คุณใช้มีดแล่ปลาแทงเขาจนล้มลง! (Panic กำเริบอย่างรุนแรง)');
                 GameState.hpDrainRate += 0.5;
             } else {
                 triggerDeath('คุณไปด่าเขา เขาโกรธจัดและกระหน่ำทำร้ายคุณจนตายคาฟุตบาท!');
             }
         }
      }
    },
    { id: 'crosswalk', name: 'ข้ามทางม้าลาย', bounds: { left: 40, top: 60, width: 20, height: 40 },
      onInteract: (element) => {
         let color = getTrafficColor(GameState.flags.road_traffic_timer);
         if (color === 'green') {
             triggerDeath('คุณข้ามตอนไฟเขียว รถพุ่งมาด้วยความเร็ว ชนคุณตายคาที่!');
         } else if (color === 'yellow') {
             showDialogue('ไฟเหลือง! รถพุ่งมาแต่เบรกทันอย่างหวุดหวิด คุณตกใจมากข้ามมาถึงอีกฝั่ง');
             takeDamage(0.5, 'ตกใจรถเบรก');
             // Proceed to woman
             handleWomanInteraction();
         } else { // red
             showDialogue('ไฟแดง คุณข้ามทางม้าลายอย่างปลอดภัย พบผู้หญิงฝั่งตรงข้าม');
             handleWomanInteraction();
         }
      }
    },
    { id: 'road_outside', name: 'ข้ามนอกทางม้าลาย', bounds: { left: 70, top: 60, width: 30, height: 40 },
      onInteract: (element) => {
         let color = getTrafficColor(GameState.flags.road_traffic_timer);
         if (color === 'green' || color === 'yellow') {
             triggerDeath('คุณข้ามถนนในจุดมืดและไม่ใช่ทางข้าม รถพุ่งมาชนคุณกระเด็นตาย!');
         } else {
             winGame('คุณข้ามถนนนอกทางม้าลายสำเร็จ เดินจากไปเงียบๆ... จบเกมส์');
         }
      }
    }
  ],
  decorations: [],
  setupUI: function() {},
  updateVisuals: function() {
      // Re-apply traffic light style based on timer
      let el = document.getElementById('obj-traffic_light');
      if (el) {
          let color = getTrafficColor(GameState.flags.road_traffic_timer);
          el.className = 'interactive-object traffic-light traffic-' + color;
      }
      
      let manEl = document.getElementById('obj-man');
      if (manEl && GameState.flags.road_man_interacted && hasItem('fish_knife')) {
          // If we stabbed him, technically he's on the ground.
          // In demo, we just rely on dialogue.
      }
  },
  onSecondTimer: function() {
      GameState.flags.road_traffic_timer++;
      if (GameState.flags.road_traffic_timer >= 30) {
          GameState.flags.road_traffic_timer = 0;
      }
      window.RoomData.road.updateVisuals();
  }
};

function getTrafficColor(timer) {
    if (timer < 15) return 'green';
    if (timer < 20) return 'yellow';
    return 'red';
}

function handleWomanInteraction() {
    // Hide standard objects to prevent clicking again
    const elsToHide = ['obj-crosswalk', 'obj-road_outside', 'obj-man'];
    elsToHide.forEach(id => {
       const domEl = document.getElementById(id);
       if(domEl) domEl.style.display = 'none';
    });

    setTimeout(() => {
        const choice = prompt("พบผู้หญิงในเงามืด... คุณจะทำอย่างไร?\n1: ทักทาย\n2: ทำร้าย");
        if (choice === '1') {
            winGame('ผู้หญิงยิ้มตอบรับเบาๆ... คุณเดินจากไปสู่อิสรภาพ จบเกมส์');
        } else if (choice === '2') {
            if (hasItem('fish_knife')) {
                winGame('คุณใช้มีดทำร้ายผู้หญิงจนแน่นิ่ง... แล้วเดินจากไปในความมืด จบเกมส์');
            } else {
                showDialogue('คุณพยายามเข้าไปทำร้าย เธอร้องกรี๊ด! คุณตกใจถอยหลัง...');
                takeDamage(0.5, 'ตกใจเสียงกรี๊ด', false);
                if (GameState.hp > 0) {
                    winGame('คุณตกใจ วิ่งหนีออกจากฉากไป... จบเกมส์');
                }
            }
        } else {
            winGame('คุณตัดสินใจไม่ทำอะไร แล้วเดินจากไป... จบเกมส์');
        }
    }, 500); // short delay so UI dialogue closes
}

function winGame(msg) {
    // Override the win screen globally
    const winScreen = document.getElementById('win-screen');
    if (winScreen) {
        winScreen.innerHTML = `<h1>SURVIVED</h1><p>${msg}</p><button onclick="location.reload()">MAIN MENU</button>`;
        winScreen.classList.remove('hidden');
    }
}
