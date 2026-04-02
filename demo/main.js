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
  loadRoom('bedroom');
}

function restartRoom() {
  if (els.deathScreen) {
      els.deathScreen.classList.remove('hidden'); // Ensure we can remove it
      els.deathScreen.classList.add('hidden');
  }
  
  if (GameState.currentRoom === 'bedroom') {
    RoomFlags.bedroom = { stoodUp: false, alarmOff: false, windowClosed: false, wardrobeClosed: false, gotTowel: false, doorUnlocked: false, windowClosingState: false };
    inventory.loadCheckpoint('bedroom');
  } else if (GameState.currentRoom === 'bathroom') {
    RoomFlags.bathroom = { soapPicked: false, pillTaken: false, dryerUnplugged: false, dryerStored: false, waterFilled: false, bathed: false, dried: false, waterDrained: false, gotKey: false, doorUnlocked: false };
    bathtubState.volume = 0; bathtubState.hotAmt = 0; bathtubState.coldAmt = 0; bathtubState.active = false; bathtubState.mode = 'close';
    closeFaucetUI();
    closePillUI();
    closeBathtubChoiceUI();
    inventory.loadCheckpoint('bathroom');
  } else if (GameState.currentRoom === 'hallway_f2') {
    RoomFlags.hallway_f2 = { curtainClosed: false, rugSorted: false, lightOn: false, chandelierSwinging: true };
    inventory.loadCheckpoint('hallway_f2');
  } else if (GameState.currentRoom === 'hallway_f1') {
    RoomFlags.hallway_f1 = { backpackSearched1: false, backpackSearched2: false, storageUnlocked: false };
    inventory.loadCheckpoint('hallway_f1');
  } else if (GameState.currentRoom === 'kitchen') {
    RoomFlags.kitchen = { sinkOff: false, kettleOff: false, cabinetClosed: false, gasNotesFound: false, gasStep: 0, gasOff: false, tastedFirst: false, ingredientsAdded: false, poisonedFood: false, tastedSecond: false, drawerRightOpened: false, cabinetOpenLevel: 0 };
    closeKitchenUI();
    inventory.loadCheckpoint('kitchen');
  } else if (GameState.currentRoom === 'dining_room') {
    const wasAppeared = RoomFlags.dining_room.drinksAppeared;
    RoomFlags.dining_room = { lightSwitchState: 1, teaDrank: false, coffeeDrank: false, waterDrank: false, newspaperRead: false, keyAcquired: false, wheelsChecked: false, clockMoved: false, tableClimbed: false, drinksAppeared: wasAppeared };
    closeDiningUI();
    inventory.loadCheckpoint('dining_room');
  } else if (GameState.currentRoom === 'storage') {
    RoomFlags.storage = { flashLightOn: false, doorWedged: false, doorClosed: false, woodStickAcquired: false, foundNote: false, foundKey: false, foundPowerbank: false, boxOpened: false, gotHammer: false, doorTimerStarted: false, doorSmallOpenedCount: 0, boxSearchView: 0 };
    GameState.smartphoneBattery = 100; // restore battery on die
    inventory.loadCheckpoint('storage');
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
