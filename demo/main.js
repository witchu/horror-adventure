// --- Main Entry and Game Flow ---

function init() {
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
  
  if (els.flashlightToggleBtn) {
      els.flashlightToggleBtn.addEventListener('click', toggleFlashlight);
  }
  if (els.flashlightChargeBtn) {
      els.flashlightChargeBtn.addEventListener('click', chargePowerbank);
  }
  
  // Start window timing loop for bedroom
  setInterval(toggleWindowSwing, 1500); // Window "closes" every 1.5s
  
  // Start bathroom flicker loop
  setInterval(checkBathroomLight, 1000);
  
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
  
  // Rely on the single global checkpoint to restore inventory and flat flags
  loadCheckpoint();

  // Handle specific room dynamic state clearing that aren't stored in checkpoint
  if (GameState.currentRoom === 'bathroom') {
    bathtubState.volume = 0; bathtubState.hotAmt = 0; bathtubState.coldAmt = 0; bathtubState.active = false; bathtubState.mode = 'close';
    closeFaucetUI();
    closePillUI();
    closeBathtubChoiceUI();
  } else if (GameState.currentRoom === 'kitchen') {
    closeKitchenUI();
  } else if (GameState.currentRoom === 'dining_room') {
    closeDiningUI();
  } else if (GameState.currentRoom === 'storage') {
    GameState.smartphoneBattery = 100; // restore battery on die
  }
  
  GameState.hp = GameState.maxHp; // Restore HP
  GameState.hpDrainRate = 0; // Restore drain status
  roomTimers.bedroom = 0;
  roomTimers.bathroomSoap = 0;
  roomTimers.kitchenWater = 0;
  roomTimers.kitchenKettle = 0;
  roomTimers.kitchenCabinet = 0;
  roomTimers.kitchenGas = 0;
  roomTimers.diningClock = 0;
  roomTimers.storageDoor = 0;
  roomTimers.storagePanic = 0;
  timeInBathroom = 0;
  
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
