// --- Core UI Functions ---

function renderHUD() {
  const hpFill = document.getElementById('hp-bar-fill');
  const hpText = document.getElementById('hp-text');
  
  if (hpFill && hpText) {
    const pct = Math.max(0, (GameState.hp / GameState.maxHp) * 100);
    hpFill.style.width = `${pct}%`;
    hpText.innerText = `${Math.max(0, GameState.hp).toFixed(2)} / ${GameState.maxHp}`;
  }
  
  if (els.flashlightUiContainer && els.batteryText) {
    if (GameState.currentRoom === 'storage' && !RoomFlags.storage.gotHammer) {
       els.flashlightUiContainer.classList.remove('hidden');
       els.batteryText.innerText = `${Math.floor(GameState.smartphoneBattery)}%`;
       
       if (GameState.smartphoneBattery < 20) {
           els.batteryText.classList.add('low');
       } else {
           els.batteryText.classList.remove('low');
       }
       if (hasItem('powerbank') && els.flashlightChargeBtn) {
           els.flashlightChargeBtn.disabled = false;
       } else if (els.flashlightChargeBtn) {
           els.flashlightChargeBtn.disabled = true;
       }
    } else {
       els.flashlightUiContainer.classList.add('hidden');
    }
  }
  
  if (GameState.hp <= 0 && els.deathScreen && els.deathScreen.classList.contains('hidden')) {
    if (typeof die === 'function') die("คุณบาดเจ็บทนพิษบาดแผลไม่ไหว... สิ้นใจตาย");
  }
}

function addLog(text) {
  if (!GameState.logs.includes(text)) {
    GameState.logs.push(text);
    const li = document.createElement('li');
    li.innerText = text;
    els.logList.appendChild(li);
    els.logList.scrollTop = els.logList.scrollHeight; // auto scroll
  }
}

function addActionLog(text) {
  const li = document.createElement('li');
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  li.innerText = `[${time}] ${text}`;
  els.actionLogList.appendChild(li);
  if(els.actionLogContent) els.actionLogContent.scrollTop = els.actionLogContent.scrollHeight;
}

function showDialogue(text) {
  els.dialogueText.innerText = text;
  els.dialogueBox.classList.remove('hidden');
  els.dialogueBtn.classList.remove('hidden');
  addActionLog(text);
}

function closeDialogue() {
  els.dialogueBox.classList.add('hidden');
  els.dialogueBtn.classList.add('hidden');
}
