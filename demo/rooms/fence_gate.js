window.RoomData = window.RoomData || {};

Object.assign(GameState.flags, {
  fence_mailbox_unlocked: false,
  fence_net_taken: false,
  fence_fountain_key_taken: false,
  fence_left_bin_opened: false,
  fence_right_bin_opened: false,
  fence_house_door_opened: false,
  fence_gate_open: false,
  fence_code_attempts: 0,
  fence_code_lock_timer: 0
});

window.RoomData.fence_gate = {
  styles: `
.room-fence_gate { background-image: url('assets/fence_gate_bg.png'); }
  `,
  objects: [
    {
      id: 'gate_panel', name: 'แผงกรอกรหัส', bounds: { left: 55.2, top: 66.8, width: 4.8, height: 11.5 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags.garden_cage_locked) {
          triggerDeath('สุนัขพุ่งมาจากสวนหน้าบ้าน! กัดตายเพราะคุณขังและผูกเชือกมันไม่สำเร็จ!');
          return;
        }

        if (flags.fence_gate_open) {
          showDialogue('ประตูรั้วระบบล็อกปลดแล้ว ทางเปิดออกสู่ถนน');
          return;
        }

        if (flags.fence_code_lock_timer > 0) {
          showDialogue(`ระบบล็อกอยู่ กรุณารอ ${flags.fence_code_lock_timer} วินาที`);
          return;
        }

        if (window.openFenceNumpad) {
          window.openFenceNumpad();
        }
      }
    },
    {
      id: 'gate_door', name: 'ประตูรั้วออกสู่ถนน', bounds: { left: 36.2, top: 63.2, width: 19.2, height: 31.5 },
      onInteract: (element) => {
        if (GameState.flags.fence_gate_open) {
          showDialogue('คุณเดินผ่านประตูรั้วออกสู่ถนน');
          saveCheckpoint();
          loadRoom('road');
        } else {
          showDialogue('ประตูล็อคอยู่ ต้องป้อนรหัสที่แผงควบคุม');
        }
      }
    },
    {
      id: 'mailbox', name: 'ตู้จดหมาย', bounds: { left: 36.1, top: 39.5, width: 6.8, height: 11.2 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags.garden_cage_locked) { triggerDeath('สุนัขพุ่งออกมากัดตาย!'); return; }

        if (!flags.fence_mailbox_unlocked) {
          if (hasItem('key_mailbox')) {
            removeItem('key_mailbox');
            flags.fence_mailbox_unlocked = true;
            showDialogue('เปิดตู้จดหมายสำเร็จ พบตัวเลข "0" เขียนไว้ที่ฝาใน (รหัสหลักที่ 4)');
            addLog('รหัสรั้วลำดับที่ 4 = "0"');
            addLog('จดหมาย: "ไม่ต้องเหงา ฉันจะกลับไปหาคุณเร็วๆนี้" (ส่งมา 3 เดือนที่แล้ว)');
          } else {
            showDialogue('ตู้จดหมายล็อคอยู่ คุณต้องการกุญแจเปืด');
          }
        } else {
          showDialogue('ตู้จดหมายเปิดอยู่...');
        }
      }
    },
    {
      id: 'fountain', name: 'น้ำพุ', bounds: { left: 76.2, top: 38.5, width: 15.2, height: 35.2 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags.fence_fountain_key_taken) {
          if (hasItem('net')) {
            flags.fence_fountain_key_taken = true;
            showDialogue('คุณใช้ด้ามกระชอนเขี่ยของที่ก้นบ่อน้ำพุ... ได้ [กุญแจประตูบ้าน] กระชอนหักพังไปแล้ว');
            removeItem('net');
            addItem('key_house', 'กุญแจประตูบ้าน');
          } else {
            const uiHTML = `
              <div id="fence-fountain-ui" class="ui-overlay">
                  <div class="ui-panel">
                      <h3>คุณเห็นแสงวิบวับอยู่ก้นบ่อ คุณยังไม่มีไม้ยาว จะเอื้อมมือลงไปหยิบไหม?</h3>
                      <div class="pill-grid">
                          <button class="pill-btn" id="btn-fountain-yes">เอื้อมมือลงไปหยิบ</button>
                          <button class="pill-btn" id="btn-fountain-no">ไม่เอาดีกว่า</button>
                      </div>
                  </div>
              </div>
            `;
            const container = document.getElementById('scene');
            container.insertAdjacentHTML('beforeend', uiHTML);

            const overlay = document.getElementById('fence-fountain-ui');
            document.getElementById('btn-fountain-yes').addEventListener('click', () => {
              overlay.remove();
              triggerDeath('ลื่นตะไคร่ หัวฟาดขอบบ่อจมน้ำตายทันที!');
            });
            document.getElementById('btn-fountain-no').addEventListener('click', () => {
              overlay.remove();
            });
          }
        } else {
          showDialogue('ไม่มีอะไรน่าสนใจในน้ำพุแล้ว');
        }
      }
    },
    {
      id: 'bin_left', name: 'ถังขยะซ้าย', bounds: { left: 5.8, top: 31.0, width: 5.2, height: 17.8 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags.garden_cage_locked) { triggerDeath('สุนัขพุ่งออกมากัดตาย!'); return; }

        if (!flags.fence_left_bin_opened) {
          flags.fence_left_bin_opened = true;
          showDialogue('เปิดถังขยะ... กลิ่นเหม็นเน่ารุนแรงทะลักออกมา พบถุงดำขนาดใหญ่น่าสงสัยในนั้น ตกใจแทบอาเจียน!');
          takeDamage('ตกใจกลิ่นเหม็นเน่า', 0.75);
        } else {
          showDialogue('ถังขยะกะส่งกลิ่นเหม็น ไม่อยากยุ่งกับมันอีกแล้ว');
        }
      }
    },
    {
      id: 'bin_right', name: 'ถังขยะขวา', bounds: { left: 11.2, top: 30.8, width: 5.5, height: 18.2 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (!flags.garden_cage_locked) { triggerDeath('สุนัขพุ่งออกมากัดตาย!'); return; }

        if (!flags.fence_right_bin_opened) {
          flags.fence_right_bin_opened = true;
          showDialogue('ในถังขยะขวา... คุณพบ [มีดแล่ปลา] มีคราบสีน้ำตาลแห้งกรัง');
          addItem('fish_knife', 'มีดแล่ปลา');
        } else {
          showDialogue('ไม่มีอะไรในถังนี้แล้ว');
        }
      }
    },
    {
      id: 'net', name: 'กระชอนตักใบไม้', bounds: { left: 2.2, top: 30.8, width: 5.2, height: 17.8 },
      onInteract: (element) => {
        if (!GameState.flags.fence_net_taken) {
          GameState.flags.fence_net_taken = true;
          showDialogue('คุณหยิบกระชอนตักใบไม้ที่พิงถังขยะ (ตัวตะข่ายขาดแล้ว แต่ด้ามยังแข็งแรง)');
          addItem('net', 'กระชอน');
          element.style.display = 'none'; // hide object
        }
      }
    },
    {
      id: 'shoes', name: 'รองเท้า', bounds: { left: 53.0, top: 49.0, width: 5.8, height: 10.2 },
      onInteract: (element) => {
        showDialogue('รองเท้าเปรอะเปื้อนมีกระดาษโน้ต: "มีคนอยู่ในบ้าน"');
        addLog('มีคนอยู่ในบ้าน!');
      }
    },
    {
      id: 'house_door', name: 'ประตูบ้าน', bounds: { left: 45.8, top: 24.5, width: 9.5, height: 30.0 },
      onInteract: (element) => {
        const flags = GameState.flags;
        if (flags.fence_house_door_opened) {
          showDialogue('ประตูเปิดอ้าไว้ เลือดนองหน้าประตู...');
          return; // already handled
        }

        if (hasItem('key_house')) {
          removeItem('key_house');
          if (hasItem('fish_knife')) {
            flags.fence_house_door_opened = true;
            showDialogue('คุณเปิดประตูบ้าน! สิ่งชั่วร้ายรออยู่ คุณกระหน่ำแทงมันด้วยมีดแล่ปลาจนเลือดนอง! (เกิด Panic อย่างหนัก)');
            GameState.hpDrainRate += 0.02;
          } else {
            triggerDeath('คุณไขเปิดประตู... สิ่งชั่วร้ายที่รออยู่กระหน่ำทำร้ายคุณจนตายคาช่องประตู!');
          }
        } else {
          showDialogue('ประตูบ้านถูกล็อคด้วยแม่กุญแจ');
        }
      }
    },
    {
      id: 'spiky_fence_left', name: 'รั้วเหล็กแหลม (ซ้าย)', bounds: { left: 0.2, top: 61.8, width: 36.0, height: 31.5 },
      onInteract: (element) => {
        triggerDeath('คุณพยายามปีนรั้ว แต่ลื่นสะดุด ถูกเหล็กแหลมทิ่มแทงทะลุตัว!');
      }
    },
    {
      id: 'spiky_fence_right', name: 'รั้วเหล็กแหลม (ขวา)', bounds: { left: 60.0, top: 61.8, width: 39.4, height: 31.5 },
      onInteract: (element) => {
        triggerDeath('คุณพยายามปีนรั้ว แต่ลื่นสะดุด ถูกเหล็กแหลมทิ่มแทงทะลุตัว!');
      }
    },
    {
      id: 'garden_return', name: 'กลับเข้าสวนหน้าบ้าน', bounds: { left: 91.5, top: 16.8, width: 8.2, height: 37.2 },
      onInteract: (element) => {
        if (!GameState.flags.garden_cage_locked) {
          triggerDeath('สุนัขดันประตูหลุดออกมารออยู่! กัดคุณตายตอนเดินกลับเข้าไป!');
        } else {
          showDialogue('คุณเดินกลับเข้าสวนหน้าบ้าน');
          saveCheckpoint();
          loadRoom('front_garden');
        }
      }
    }
  ],
  decorations: [],
  setupUI: function () {
    if (!document.getElementById('fence-ui-container')) {
      let currentCode = "";
      const uiStr = `
          <div id="fence-ui-container" class="ui-overlay hidden">
              <div class="ui-panel gamepad-panel">
                  <h3>กรอกรหัสผ่าน 4 หลัก</h3>
                  <div class="numpad-display" id="fence-ui-display" style="font-size:24px; letter-spacing:8px; margin: 10px 0;">----</div>
                  <div class="numpad-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
                      <button class="numpad-btn pill-btn" data-val="1">1</button>
                      <button class="numpad-btn pill-btn" data-val="2">2</button>
                      <button class="numpad-btn pill-btn" data-val="3">3</button>
                      <button class="numpad-btn pill-btn" data-val="4">4</button>
                      <button class="numpad-btn pill-btn" data-val="5">5</button>
                      <button class="numpad-btn pill-btn" data-val="6">6</button>
                      <button class="numpad-btn pill-btn" data-val="7">7</button>
                      <button class="numpad-btn pill-btn" data-val="8">8</button>
                      <button class="numpad-btn pill-btn" data-val="9">9</button>
                      <button class="numpad-btn pill-btn" id="numpad-clear" style="background:none; border:2px solid #555; color:#fff;">C</button>
                      <button class="numpad-btn pill-btn" data-val="0">0</button>
                      <button class="numpad-btn pill-btn numpad-submit" id="numpad-submit" style="background:#550000; color:#fff;">OK</button>
                  </div>
                  <button class="close-ui-btn" id="fence-close-ui" style="margin-top:20px;">ปิด</button>
              </div>
          </div>
        `;
      const d = document.createElement('div');
      d.innerHTML = uiStr;
      document.body.appendChild(d.firstElementChild);

      const display = document.getElementById('fence-ui-display');
      const updateDisplay = () => {
        display.innerText = currentCode.padEnd(4, '-');
      };

      document.querySelectorAll('.numpad-btn[data-val]').forEach(btn => {
        btn.onclick = () => {
          if (currentCode.length < 4) {
            currentCode += btn.getAttribute('data-val');
            updateDisplay();
          }
        };
      });

      document.getElementById('numpad-clear').onclick = () => {
        currentCode = '';
        updateDisplay();
      };

      document.getElementById('fence-close-ui').onclick = () => {
        document.getElementById('fence-ui-container').classList.add('hidden');
      };

      document.getElementById('numpad-submit').onclick = () => {
        if (currentCode.length < 4) {
          showDialogue("กรุณากรอกรหัสให้ครบ 4 หลัก");
          return;
        }

        const flags = GameState.flags;
        document.getElementById('fence-ui-container').classList.add('hidden');

        if (currentCode === "0210") {
          flags.fence_gate_open = true;
          showDialogue('รหัสถูกต้อง! ประตูรั้วเปิดออก คุณสามารถออกสู่ถนนได้แล้ว');
        } else {
          flags.fence_code_attempts++;
          if (flags.fence_code_attempts >= 3) {
            showDialogue('รหัสผิดครบกำหนด! ระบบถูกล็อค 30 วินาที');
            flags.fence_code_lock_timer = 30;
            flags.fence_code_attempts = 0;
          } else {
            showDialogue('รหัสไม่ถูกต้อง (ระวัง หากผิด 3 ครั้งจะถูกล็อค)');
          }
        }
      };

      window.openFenceNumpad = function () {
        currentCode = '';
        updateDisplay();
        document.getElementById('fence-ui-container').classList.remove('hidden');
      };
    }
  },
  updateVisuals: function () {
    if (GameState.flags.fence_net_taken) {
      let el = document.getElementById('obj-net');
      if (el) el.style.display = 'none';
    }
  },
  onSecondTimer: function () {
    if (GameState.flags.fence_code_lock_timer > 0) {
      GameState.flags.fence_code_lock_timer--;
    }
  }
};
