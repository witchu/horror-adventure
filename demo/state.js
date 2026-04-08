// --- Global Game State ---

const GameState = {
  hp: 3,
  maxHp: 3,
  hpDrainRate: 0,
  logs: [], // Array of log text strings
  currentRoom: 'bedroom',

  // Flattened inventory
  items: [],

  // Flattened RoomFlags
  flags: {},

  // Single Checkpoint
  checkpoint: null,

  // Guard: prevent duplicate death triggers
  isDead: false,

  // Persistent stats
  stats: {
    deaths: 0,
    panicTriggers: 0,
    startTime: Date.now(),
    uniqueItems: []
  }
};

// --- Player Functions ---

function takeDamage(reason, amount = 0.25) {
  GameState.hp -= amount;
  showDialogue(`ได้รับบาดเจ็บ: ${reason} (-${amount} HP)`);
  renderHUD();
}

function die(reason) {
  if (GameState.isDead) return;  // prevent double-trigger
  GameState.isDead = true;
  if (GameState.stats) GameState.stats.deaths++;
  if (els.deathReason) els.deathReason.innerText = reason;
  if (els.deathScreen) els.deathScreen.classList.remove('hidden');
}

// --- Inventory & Checkpoint Functions ---

function addItem(id, name) {
  if (GameState.items.length >= 9) {
    showDialogue("กระเป๋าเต็ม!");
    return false;
  }
  GameState.items.push({ id, name });
  
  if (GameState.stats && !GameState.stats.uniqueItems.includes(id)) {
      GameState.stats.uniqueItems.push(id);
  }

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
    flags: JSON.parse(JSON.stringify(GameState.flags)),
    hp: GameState.hp
  };
}

function loadCheckpoint() {
  if (GameState.checkpoint) {
    GameState.items = JSON.parse(JSON.stringify(GameState.checkpoint.items));
    GameState.flags = JSON.parse(JSON.stringify(GameState.checkpoint.flags));
    if (GameState.checkpoint.hp !== undefined) {
        GameState.hp = GameState.checkpoint.hp;
    }
    renderInventory();
  }
}

// --- Additional Trackers (Merged into GameState.flags) ---
