window.RoomData = window.RoomData || {};

Object.assign(GameState.flags, {
  road_traffic_timer: 0,
  road_man_interacted: false,
  road_attacked_man: false,
  road_attacked_woman: false,
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
                 GameState.flags.road_attacked_man = true;
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
                GameState.flags.road_attacked_woman = true;
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
    const flags = GameState.flags;
    let endingTitle = "SURVIVED";
    
    const killedInHouse = flags.fence_house_door_opened;
    const attackedInRoad = flags.road_attacked_man || flags.road_attacked_woman;

    if (killedInHouse && !attackedInRoad) {
        endingTitle = "จบแบบที่ 1 : หลุดพ้นจากความรู้สึก<br><span style='font-size:0.5em;'>(เป็นฆาตกรฆ่าคนในบ้าน)</span>";
    } else if (killedInHouse && attackedInRoad) {
        endingTitle = "จบแบบที่ 2 : ศัตรูอยู่รอบตัว<br><span style='font-size:0.5em;'>(เป็นฆาตกรคลุ้มครั้ง)</span>";
    } else if (!killedInHouse && !attackedInRoad) {
        endingTitle = "จบแบบที่ 3 : ออกจากบ้านอย่างปลอดภัย เริ่มต้นชีวิต.. เร็วๆ นี้<br><span style='font-size:0.5em;'>(ปกติ?)</span>";
    } else if (!killedInHouse && attackedInRoad) {
        // Fallback condition if they didn't kill in house but still attacked people in the road
        endingTitle = "จบแบบที่ 2 : ศัตรูอยู่รอบตัว<br><span style='font-size:0.5em;'>(เป็นฆาตกรคลุ้มครั้ง)</span>";
    }

    // Calculate Stats
    let timeStr = "ไม่ทราบเวลา";
    if (GameState.stats && GameState.stats.startTime) {
        const timeSpentMs = Date.now() - GameState.stats.startTime;
        const totalSecs = Math.floor(timeSpentMs / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        timeStr = `${mins} นาที ${secs} วินาที`;
    }
    
    const deaths = GameState.stats ? GameState.stats.deaths : 0;
    const panicTriggers = GameState.stats ? GameState.stats.panicTriggers : 0;
    const cluesFound = GameState.logs ? GameState.logs.length : 0;
    const itemsFound = GameState.stats ? GameState.stats.uniqueItems.length : 0;

    const statsHtml = `
        <div style="background: rgba(0,0,0,0.6); padding: 15px 30px; border-radius: 10px; margin: 0 auto 30px auto; display: inline-block; text-align: left; font-size: 1.2rem; border: 1px solid #444; color: #ddd;">
            <p style="margin: 5px 0;">💀 ตายทั้งหมด: <span style="color:red; font-weight:bold;">${deaths}</span> ครั้ง</p>
            <p style="margin: 5px 0;">😱 อาการ Panic กำเริบ: <span style="color:orange; font-weight:bold;">${panicTriggers}</span> ครั้ง</p>
            <p style="margin: 5px 0;">📝 เบาะแสที่พบ: <span style="color:lightblue; font-weight:bold;">${cluesFound} / 15</span></p>
            <p style="margin: 5px 0;">🎒 ไอเท็มที่รวบรวมได้ (ไม่ซ้ำ): <span style="color:lightgreen; font-weight:bold;">${itemsFound} / 20</span></p>
            <p style="margin: 5px 0;">⏱️ เวลาที่ใช้เล่นทั้งหมด: <span style="font-weight:bold;">${timeStr}</span></p>
        </div>
    `;

    // Override the win screen globally
    const winScreen = document.getElementById('win-screen');
    if (winScreen) {
        winScreen.innerHTML = `
            <div style="text-align: center;">
                <h1 style="font-size: 3rem; margin-bottom: 20px;">${endingTitle}</h1>
                <p style="font-size: 1.5rem; margin-bottom: 20px;">${msg}</p>
                ${statsHtml}<br>
                <button onclick="location.reload()">MAIN MENU</button>
            </div>
        `;
        winScreen.classList.remove('hidden');
    }
}
