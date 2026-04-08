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
.traffic-green { color: lime !important; background-color: lime !important; }
.traffic-yellow { color: yellow !important; background-color: yellow !important; }
.traffic-red { color: red !important; background-color: red !important; }
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
         if (GameState.flags.road_attacked_man) {
             showDialogue('ชายคนนี้นอนจมกองเลือด...');
             return;
         }
         
         const actSayHi = () => {
             showDialogue('คุณทักทาย เขาพยักหน้าตอบรับอย่างเย็นชา ไม่พูดอะไร');
         };
         
         const actCurse = () => {
             if (hasItem('fish_knife')) {
                 GameState.flags.road_attacked_man = true;
                 showDialogue('คุณต่อว่าเขา เขาด่ากลับ เกิดการถกเถียง คุณใช้มีดแล่ปลาแทงเขาจนล้มลง! (Panic กำเริบอย่างรุนแรง)');
                 GameState.hpDrainRate += 0.02;
             } else {
                 triggerDeath('คุณไปด่าเขา เขาโกรธจัดและกระหน่ำทำร้ายคุณจนตายคาฟุตบาท!');
             }
         };

         if (window.showRoadUI) {
             window.showRoadUI("คุณต้องการทำอะไรกับชายสูบบุหรี่?", [
                 { text: "[ทักทายอย่างสนิท]", action: actSayHi },
                 { text: "[ต่อว่าอย่างหยาบคาย]", action: actCurse }
             ]);
         }
      }
    },
    { id: 'crosswalk', name: 'ข้ามทางม้าลาย', bounds: { left: 40, top: 60, width: 20, height: 40 },
      onInteract: (element) => {
         let color = getTrafficColor(GameState.flags.road_traffic_timer);
         if (GameState.flags.road_crossed) {
             if (color === 'green') {
                 triggerDeath('คุณข้ามกลับตอนไฟเขียว รถพุ่งมาชนคุณกระเด็นตาย!');
             } else if (color === 'yellow') {
                 showDialogue('ไฟเหลือง! คุณรีบวิ่งข้ามกลับมาฝั่งเดิมอย่างหวุดหวิด');
                 takeDamage('ตกใจรถเบรก', 0.5);
                 GameState.flags.road_crossed = false;
                 window.RoomData.road.updateVisuals();
             } else {
                 showDialogue('ไฟแดง คุณข้ามทางม้าลายกลับมาอย่างปลอดภัย');
                 GameState.flags.road_crossed = false;
                 window.RoomData.road.updateVisuals();
             }
             return;
         }

         if (color === 'green') {
             triggerDeath('คุณข้ามตอนไฟเขียว รถพุ่งมาด้วยความเร็ว ชนคุณตายคาที่!');
         } else if (color === 'yellow') {
             showDialogue('ไฟเหลือง! รถพุ่งมาแต่เบรกทันอย่างหวุดหวิด คุณตกใจมากข้ามมาถึงอีกฝั่ง');
             takeDamage('ตกใจรถเบรก', 0.5);
             GameState.flags.road_crossed = true;
             window.RoomData.road.updateVisuals();
         } else { // red
             showDialogue('ไฟแดง คุณข้ามทางม้าลายอย่างปลอดภัย ไปถึงฝั่งผู้หญิง');
             GameState.flags.road_crossed = true;
             window.RoomData.road.updateVisuals();
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
    },
    { id: 'woman', name: 'ผู้หญิงในเงามืด', bounds: { left: 70, top: 40, width: 15, height: 40 },
      onInteract: (element) => {
         if (!GameState.flags.road_crossed) {
             showDialogue('เธออยู่ไกลเกินไป ต้องข้ามถนนไปก่อน');
             return;
         }
         if (window.showRoadUI) {
             window.showRoadUI("พบผู้หญิงในเงามืด... คุณจะทำอย่างไร?", [
                 { text: "[ทักทาย]", action: () => {
                     winGame('ผู้หญิงยิ้มตอบรับเบาๆ... คุณเดินจากไปสู่อิสรภาพ จบเกมส์');
                 }},
                 { text: "[เดินผ่านไปเฉยๆ]", action: () => {
                     winGame('คุณเลี่ยงไม่สนใจ เดินผ่านเธอไปเงียบๆ... จบเกมส์');
                 }},
                 { text: "[ทำร้าย]", action: () => {
                     if (hasItem('fish_knife')) {
                         GameState.flags.road_attacked_woman = true;
                         winGame('คุณใช้มีดทำร้ายผู้หญิงจนแน่นิ่ง... แล้วเดินจากไปในความมืด จบเกมส์');
                     } else {
                         showDialogue('คุณพยายามเข้าไปทำร้าย เธอร้องกรี๊ด! คุณตกใจถอยหลัง...');
                         takeDamage('ตกใจเสียงกรี๊ด', 0.5, false);
                         if (GameState.hp > 0) {
                             winGame('คุณตกใจ วิ่งหนีออกจากฉากไป... จบเกมส์');
                         }
                     }
                 }}
             ]);
         }
      }
    }
  ],
  decorations: [],
  setupUI: function() {
    if (!document.getElementById('road-ui-container')) {
        const uiStr = `
          <div id="road-ui-container" class="ui-overlay hidden">
              <div class="ui-panel">
                  <h3 id="road-ui-title">...</h3>
                  <div class="pill-grid" id="road-ui-options"></div>
              </div>
          </div>
        `;
        const d = document.createElement('div');
        d.innerHTML = uiStr;
        document.body.appendChild(d.firstElementChild);

        window.showRoadUI = function(title, options) {
            const container = document.getElementById('road-ui-container');
            document.getElementById('road-ui-title').innerText = title;
            const optsDiv = document.getElementById('road-ui-options');
            optsDiv.innerHTML = '';
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'pill-btn';
                btn.innerText = opt.text;
                btn.onclick = () => {
                    container.classList.add('hidden');
                    if (opt.action) opt.action();
                };
                optsDiv.appendChild(btn);
            });
            container.classList.remove('hidden');
        };
    }
  },
  updateVisuals: function() {
      // Re-apply traffic light style based on timer
      let el = document.getElementById('obj-traffic_light');
      if (el) {
          let color = getTrafficColor(GameState.flags.road_traffic_timer);
          el.className = 'interactive-object traffic-light traffic-' + color;
      }
      
      let manEl = document.getElementById('obj-man');
      let outEl = document.getElementById('obj-road_outside');
      let womEl = document.getElementById('obj-woman');
      
      const isCrossed = GameState.flags.road_crossed;
      if (manEl) manEl.style.display = isCrossed ? 'none' : 'flex';
      if (outEl) outEl.style.display = isCrossed ? 'none' : 'flex';
      if (womEl) womEl.style.display = isCrossed ? 'flex' : 'none';
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

// Removed handleWomanInteraction

function winGame(msg) {
    // Prevent double-trigger once win flow has started
    if (GameState.isWon) return;
    GameState.isWon = true;

    // --- Hide HUD elements for clean result display ---
    const hudEl = document.getElementById('hud');
    if (hudEl) hudEl.classList.add('hidden');
    const actionLogEl = document.getElementById('action-log-container');
    if (actionLogEl) actionLogEl.classList.add('hidden');

    // --- Determine ending ---
    const flags = GameState.flags;
    const killedInHouse = flags.fence_house_door_opened;
    const attackedInRoad = flags.road_attacked_man || flags.road_attacked_woman;

    let endingTitleName = '';
    let endingSubtitle = '';
    let finalActionText = '';

    if (killedInHouse && !attackedInRoad) {
        // Ending 1 — Liberated
        endingTitleName = 'จบแบบที่ 1 : หลุดพ้นจากความรู้สึก';
        endingSubtitle = 'เป็นฆาตกรฆ่าคนในบ้าน';
        finalActionText = 'คุณเปิดประตูบ้านและจัดการกับสิ่งชั่วร้ายที่ซ่อนอยู่ข้างใน...\nแล้วเดินออกมาสู่ความมืดโดยไม่หันกลับ';
    } else if (killedInHouse && attackedInRoad) {
        // Ending 2 — Frenzied
        endingTitleName = 'จบแบบที่ 2 : ศัตรูอยู่รอบตัว';
        endingSubtitle = 'เป็นฆาตกรคลุ้มคลั่ง';
        if (flags.road_attacked_woman) {
            finalActionText = 'คุณใช้มีดทำร้ายผู้หญิงที่คุณไม่รู้จักจนแน่นิ่ง...\nแล้วเดินจากไปในความมืด';
        } else {
            finalActionText = 'คุณต่อว่าเขา ถกเถียง และใช้มีดแล่ปลาแทงชายสูบบุหรี่จนล้มลง...\nแล้วเดินจากไปเงียบๆ ในยามดึก';
        }
    } else if (!killedInHouse && attackedInRoad) {
        // Ending 2 fallback — no house kill but attacked on road
        endingTitleName = 'จบแบบที่ 2 : ศัตรูอยู่รอบตัว';
        endingSubtitle = 'เป็นฆาตกรคลุ้มคลั่ง';
        if (flags.road_attacked_woman) {
            finalActionText = 'คุณใช้มีดทำร้ายผู้หญิงที่คุณไม่รู้จักจนแน่นิ่ง...\nแล้วเดินจากไปในความมืด';
        } else {
            finalActionText = 'คุณต่อว่าชายสูบบุหรี่และใช้มีดแล่ปลาแทงเขาจนล้มลง...\nแล้วเดินจากไปในยามดึกเพียงลำพัง';
        }
    } else {
        // Ending 3 — Safe
        endingTitleName = 'จบแบบที่ 3 : ออกจากบ้านอย่างปลอดภัย';
        endingSubtitle = 'เริ่มต้นชีวิต.. เร็วๆ นี้ (ปกติ?)';
        finalActionText = 'คุณเดินออกจากบ้านและข้ามถนนอย่างปลอดภัย...\nไม่แน่ใจว่าคืนนี้เกิดอะไรขึ้น แต่ตอนนี้คุณเป็นอิสระแล้ว';
    }

    // --- Calculate Stats ---
    let timeStr = 'ไม่ทราบเวลา';
    if (GameState.stats && GameState.stats.startTime) {
        const totalSecs = Math.floor((Date.now() - GameState.stats.startTime) / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        timeStr = `${mins} นาที ${secs} วินาที`;
    }

    const deaths = GameState.stats ? GameState.stats.deaths : 0;
    const panicTriggers = GameState.stats ? GameState.stats.panicTriggers : 0;
    const cluesFound = GameState.logs ? GameState.logs.length : 0;
    const itemsFound = GameState.stats ? GameState.stats.uniqueItems.length : 0;

    const statsHtml = `
        <div class="win-stats-grid">
            <div class="win-stat-row">
                <span class="win-stat-label">💀 ตายทั้งหมด</span>
                <span class="win-stat-value" style="color:#ff6b6b;">${deaths} ครั้ง</span>
            </div>
            <div class="win-stat-row">
                <span class="win-stat-label">😱 อาการ Panic กำเริบ</span>
                <span class="win-stat-value" style="color:#ffb84d;">${panicTriggers} ครั้ง</span>
            </div>
            <div class="win-stat-row">
                <span class="win-stat-label">📝 เบาะแสที่พบ</span>
                <span class="win-stat-value" style="color:#4dd2ff;">${cluesFound} / 15</span>
            </div>
            <div class="win-stat-row">
                <span class="win-stat-label">🎒 ไอเท็มที่รวบรวมได้</span>
                <span class="win-stat-value" style="color:#4dff4d;">${itemsFound} / 20</span>
            </div>
            <div class="win-stat-row">
                <span class="win-stat-label">⏱️ เวลาที่ใช้เล่น</span>
                <span class="win-stat-value" style="color:#fff;">${timeStr}</span>
            </div>
        </div>
    `;

    // --- Phase 1: Final Action Screen ---
    const finalScreen = document.getElementById('final-action-screen');
    const finalText = document.getElementById('final-action-text');
    if (finalText) finalText.innerText = finalActionText;
    if (finalScreen) finalScreen.classList.remove('hidden');

    // --- Phase 2: Win Screen (built now, shown on OK click) ---
    const winScreen = document.getElementById('win-screen');
    if (winScreen) {
        winScreen.innerHTML = `
            <div class="win-box">
                <h1 class="win-title">${endingTitleName}</h1>
                <div class="win-subtitle">${endingSubtitle}</div>
                ${statsHtml}
                <button class="win-btn" onclick="location.reload()">MAIN MENU</button>
            </div>
        `;
        // win-screen stays hidden until OK is clicked (handled in main.js)
    }
}

