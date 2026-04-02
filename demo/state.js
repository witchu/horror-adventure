const GameState = {
  hp: 3,
  maxHp: 3,
  hpDrainRate: 0,
  logs: [], // Array of log text strings
  currentRoom: 'bedroom',
  smartphoneBattery: 52 // Flashlight battery for storage starts at 52%
};

const RoomFlags = {
  bedroom: {
    stoodUp: false,
    alarmOff: false,
    windowClosed: false,
    wardrobeClosed: false,
    gotTowel: false,
    doorUnlocked: false,
    windowClosingState: false // Used for timing
  },
  bathroom: {
    soapPicked: false,
    pillTaken: false,
    dryerUnplugged: false,
    dryerStored: false,
    waterFilled: false,
    bathed: false,
    dried: false,
    waterDrained: false,
    gotKey: false,
    doorUnlocked: false
  },
  hallway_f2: {
    curtainClosed: false,
    rugSorted: false,
    lightOn: false,
    chandelierSwinging: true
  },
  hallway_f1: {
    backpackSearched1: false,
    backpackSearched2: false,
    storageUnlocked: false
  },
  kitchen: {
    sinkOff: false,
    kettleOff: false,
    cabinetClosed: false,
    gasNotesFound: false,
    gasStep: 0, // 0 to 4
    gasOff: false,
    tastedFirst: false,
    ingredientsAdded: false,
    poisonedFood: false,
    tastedSecond: false,
    drawerRightOpened: false,
    cabinetOpenLevel: 0
  },
  dining_room: {
    lightSwitchState: 1, // 1: flickering, 0: off, 2: on-full
    teaDrank: false,
    coffeeDrank: false,
    waterDrank: false,
    newspaperRead: false,
    keyAcquired: false,
    wheelsChecked: false,
    clockMoved: false,
    drinksAppeared: false
  },
  storage: {
    flashLightOn: false,
    doorWedged: false,
    doorClosed: false,
    woodStickAcquired: false,
    foundNote: false,
    foundKey: false,
    foundPowerbank: false,
    boxOpened: false,
    gotHammer: false,
    doorTimerStarted: false,
    doorSmallOpenedCount: 0,
    boxSearchView: 0
  }
};

let roomTimers = {
  bedroom: 0,
  bathroomSoap: 0,
  kitchenWater: 0,
  kitchenKettle: 0,
  kitchenCabinet: 0,
  kitchenGas: 0,
  diningClock: 0,
  storageDoor: 0,
  storagePanic: 0,
  hallwayChandelier: 0
};

// Bathtub state
const bathtubState = {
  active: false,
  volume: 0,
  hotAmt: 0,
  coldAmt: 0,
  mode: 'close' // hot, cold, close
};
