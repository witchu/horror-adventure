// --- Main Entry and Game Flow ---

function init() {
  window.triggerDeath = (msg) => { if (typeof die === 'function') die(msg); else console.error('die function not found'); };
  if (els.dialogueBtn) els.dialogueBtn.addEventListener('click', closeDialogue);
  if (els.restartBtn) els.restartBtn.addEventListener('click', restartRoom);
  
  if (els.hintBtn) {
      els.hintBtn.addEventListener('click', () => {
        if(els.scene) els.scene.classList.toggle('show-hints');
      });
  }

  if (els.actionLogToggle) {
      els.actionLogToggle.addEventListener('click', () => {
        if(els.actionLogContainer) els.actionLogContainer.classList.toggle('collapsed');
      });
  }
  
  // Initialize dynamic room UIs
  if (window.RoomData) {
      for (const roomId in window.RoomData) {
          const room = window.RoomData[roomId];
          if (room && typeof room.setupUI === 'function') {
              room.setupUI();
          }
      }
  }
  
  renderHUD();
  
  // Save initial checkpoint for the very first room
  saveCheckpoint();
  loadRoom('bedroom');
}

function restartRoom() {
  if (els.deathScreen) {
      els.deathScreen.classList.remove('hidden'); // Ensure we can remove it
      els.deathScreen.classList.add('hidden');
  }
  
  GameState.hp = GameState.maxHp; // Restore HP (default)
  GameState.hpDrainRate = 0; // Restore drain status

  // Rely on the single global checkpoint to restore inventory, flat flags, and current HP
  loadCheckpoint();

  // Hide any overlays
  document.querySelectorAll('.ui-overlay').forEach(el => el.classList.add('hidden'));
  
  renderInventory();
  renderHUD();
  
  // Log the restart cleanly
  const li = document.createElement('li');
  li.innerText = `[RESTART] เริ่มต้นห้อง ${GameState.currentRoom} ใหม่อีกครั้ง`;
  li.style.color = "yellow";
  if (els.actionLogList) els.actionLogList.appendChild(li);
  if (els.actionLogContent) els.actionLogContent.scrollTop = els.actionLogContent.scrollHeight;
  
  closeDialogue();
  loadRoom(GameState.currentRoom);
}

// Ensure the game only initializes after the window has loaded.
window.onload = init;
