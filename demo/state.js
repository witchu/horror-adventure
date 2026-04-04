// --- Global Game State ---

const GameState = {
  hp: 3,
  maxHp: 3,
  hpDrainRate: 0,
  logs: [], // Array of log text strings
  currentRoom: 'bedroom',
  smartphoneBattery: 52, // Flashlight battery for storage starts at 52%

  // Flattened inventory
  items: [],

  // Flattened RoomFlags
  flags: {},

  // Single Checkpoint
  checkpoint: null
};

// --- Player Functions ---

function takeDamage(reason, amount = 0.25) {
  GameState.hp -= amount;
  showDialogue(`ได้รับบาดเจ็บ: ${reason} (-${amount} HP)`);
  renderHUD();
}

function die(reason) {
  if (els.deathReason) els.deathReason.innerText = reason;
  if (els.deathScreen) els.deathScreen.classList.remove('hidden');
}

// --- Inventory & Checkpoint Functions ---

function addItem(id, name) {
  if (GameState.items.length >= 6) {
    showDialogue("กระเป๋าเต็ม!");
    return false;
  }
  GameState.items.push({ id, name });
  renderInventory();
  showDialogue(`ได้รับไอเทม: ${name}`);
  return true;
}

function hasItem(id) {
  return GameState.items.some(item => item.id === id);
}

function removeItem(id) {
  GameState.items = GameState.items.filter(item => item.id !== id);
  renderInventory();
}

function renderInventory() {
  if (els.inventorySlots) {
    els.inventorySlots.forEach((slot, index) => {
      if (GameState.items[index]) {
        slot.innerText = GameState.items[index].name;
        slot.classList.add('filled');
      } else {
        slot.innerText = '';
        slot.classList.remove('filled');
      }
    });
  }
}

function saveCheckpoint() {
  GameState.checkpoint = {
    items: JSON.parse(JSON.stringify(GameState.items)),
    flags: JSON.parse(JSON.stringify(GameState.flags))
  };
}

function loadCheckpoint() {
  if (GameState.checkpoint) {
    GameState.items = JSON.parse(JSON.stringify(GameState.checkpoint.items));
    GameState.flags = JSON.parse(JSON.stringify(GameState.checkpoint.flags));
    renderInventory();
  }
}

// --- Additional Trackers (Merged into GameState.flags) ---
