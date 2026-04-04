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
  flags: {
    bedroom_stoodUp: false,
    bedroom_alarmOff: false,
    bedroom_windowClosed: false,
    bedroom_wardrobeClosed: false,
    bedroom_gotTowel: false,
    bedroom_doorUnlocked: false,
    bedroom_windowClosingState: false, // Used for timing

    bathroom_soapPicked: false,
    bathroom_pillTaken: false,
    bathroom_dryerUnplugged: false,
    bathroom_dryerStored: false,
    bathroom_waterFilled: false,
    bathroom_bathed: false,
    bathroom_dried: false,
    bathroom_waterDrained: false,
    bathroom_gotKey: false,
    bathroom_doorUnlocked: false,

    hallway_f2_curtainClosed: false,
    hallway_f2_rugSorted: false,
    hallway_f2_lightOn: false,
    hallway_f2_chandelierSwinging: true,

    hallway_f1_backpackSearched1: false,
    hallway_f1_backpackSearched2: false,
    hallway_f1_storageUnlocked: false,

    kitchen_sinkOff: false,
    kitchen_kettleOff: false,
    kitchen_cabinetClosed: false,
    kitchen_gasNotesFound: false,
    kitchen_gasStep: 0, // 0 to 4
    kitchen_gasOff: false,
    kitchen_tastedFirst: false,
    kitchen_ingredientsAdded: false,
    kitchen_poisonedFood: false,
    kitchen_tastedSecond: false,
    kitchen_drawerRightOpened: false,
    kitchen_cabinetOpenLevel: 0,

    dining_room_lightSwitchState: 1, // 1: flickering, 0: off, 2: on-full
    dining_room_teaDrank: false,
    dining_room_coffeeDrank: false,
    dining_room_waterDrank: false,
    dining_room_newspaperRead: false,
    dining_room_keyAcquired: false,
    dining_room_wheelsChecked: false,
    dining_room_clockMoved: false,
    dining_room_drinksAppeared: false,

    storage_flashLightOn: false,
    storage_doorWedged: false,
    storage_doorClosed: false,
    storage_woodStickAcquired: false,
    storage_foundNote: false,
    storage_foundKey: false,
    storage_foundPowerbank: false,
    storage_boxOpened: false,
    storage_gotHammer: false,
    storage_doorTimerStarted: false,
    storage_doorSmallOpenedCount: 0,
    storage_boxSearchView: 0,

    bathroom_timer: 0,
    bedroom_timer: 0,
    bathroom_soapTimer: 0,
    kitchen_waterTimer: 0,
    kitchen_kettleTimer: 0,
    kitchen_cabinetTimer: 0,
    kitchen_gasTimer: 0,
    dining_room_clockTimer: 0,
    storage_doorTimer: 0,
    storage_panicTimer: 0,
    hallway_f2_chandelierTimer: 0,

    bathroom_bathtubActive: false,
    bathroom_bathtubVolume: 0,
    bathroom_bathtubHotAmt: 0,
    bathroom_bathtubColdAmt: 0,
    bathroom_bathtubMode: 'close',

    bedroom_windowTick: 0
  },

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
