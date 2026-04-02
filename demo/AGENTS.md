# Panic : Home Episode — Demo Development Guide

> Reference document for developing the Web-based Point-and-Click demo.  
> Room designs → see `../design/rooms/`
> Room map & connections → see `../design/map.md`

---

## 1. Tech Stack

| File | Purpose |
|------|---------|
| `index.html` | Layout for HUD, Scene, UI overlays (pill, faucet, stove, drinks, flashlight), Death/Win screens, Inventory, Log panel |
| `style.css` | Horror theme in muted green tones, animation classes (`swinging`, `flickering`, `danger-low/high`, `smoke-effect`, `chandelier-swing`), responsive layout |
| `game.js` | Core engine — State, UI rendering, timers, and interaction bridging |
| `room.js` | Room declarations — `RoomData` containing room objects and their inline `onInteract(element)` callback logic |
| `assets/` | Room background images (`bedroom_bg.png`, `bathroom_bg.png`, ...) |

No frameworks — self-contained vanilla HTML/CSS/JS.

---

## 2. State Architecture

### 2.1 GameState (global, mutable)

```js
GameState = {
  hp: 3,               // 0 → dead, max 3
  maxHp: 3,
  hpDrainRate: 0,       // units/sec, drained every 100ms (÷10)
  inventory: [],        // [{id, name}], max 6 items
  logs: [],             // log text strings (deduped)
  currentRoom: 'bedroom',
  inventoryCheckpoints: { bedroom: [], bathroom: [], ... },
  smartphoneBattery: 52 // flashlight battery % (used only in storage)
}
```

### 2.2 RoomFlags (boolean/number state per room)

Each room has an object in `RoomFlags` tracking puzzle progress, e.g.:
```js
RoomFlags.bedroom = { stoodUp, alarmOff, windowClosed, wardrobeClosed, gotTowel, doorUnlocked, windowClosingState }
RoomFlags.bathroom = { soapPicked, pillTaken, dryerUnplugged, dryerStored, waterFilled, bathed, dried, waterDrained, gotKey, doorUnlocked }
```

**On death** → all flags for that room reset, HP restored to 3, hpDrainRate = 0, inventory restored to checkpoint.

### 2.3 roomTimers (escalating hazards)

```js
roomTimers = { bedroom, bathroomSoap, kitchenWater, kitchenKettle, kitchenCabinet, kitchenGas, diningClock, storageDoor, storagePanic, hallwayChandelier }
```

Timers increment every 1 second → at thresholds they change CSS class (`danger-low` → `danger-high`) → if ignored further → `die()`.

---

## 3. Core Systems

### 3.1 Damage Types

| Type | Mechanism | Example |
|------|-----------|---------|
| **Instant** | `takeDamage(reason, amount)` default 0.25 | Kicking bed edge, taking wrong pill |
| **Continuous (DoT)** | Set `GameState.hpDrainRate` > 0 | Bathroom light flicker (0.1/s), kitchen smoke (0.5/s), storage panic |
| **Instant Kill** | `die(reason)` → HP=0, show death screen | Electrocution, crushed, time ran out |

### 3.2 Room Loading

```
loadRoom(roomId)
  ├─ set currentRoom, scene className
  ├─ clear & rebuild interactive-layer from RoomData[roomId]
  │   ├─ .objects → div.interactive-object (clickable → handleInteraction)
  │   └─ .decorations → div.non-interactive-object (non-clickable, status display)
  ├─ reset room-specific timers
  ├─ updateRoomVisuals(roomId) → update labels/classes based on flags
  └─ renderHUD()
```

### 3.3 Interaction Flow

```
click object → handleInteraction(roomId, objId, element)
  ├─ fetch RoomData[roomId].objects (or decorations)
  ├─ check if obj.onInteract exists → execute obj.onInteract(element)
  │    ├─ check flags / inventory → showDialogue / addItem / takeDamage / die / addLog
  │    ├─ update RoomFlags
  │    └─ updateRoomVisuals(roomId)
  └─ if changing rooms:
       ├─ save inventoryCheckpoints[nextRoom] = deep copy inventory
       └─ loadRoom(nextRoom)
```

### 3.4 Inventory Checkpoints

Before entering a new room, **snapshot inventory**:
```js
GameState.inventoryCheckpoints[nextRoom] = JSON.parse(JSON.stringify(GameState.inventory));
loadRoom(nextRoom);
```
This allows restoring inventory to the room's starting state on death.

---

## 4. Pattern for Adding a New Room

### Step 1: Add RoomFlags

```js
RoomFlags.laundry = {
  // booleans/numbers matching puzzles designed in GDD file
};
```

### Step 2: Add RoomData

In `room.js`, add your new room to `RoomData`:
```js
RoomData.laundry = {
  objects: [
    { 
      id: 'obj_id', name: 'Display Name', bounds: { left, top, width, height },
      onInteract: (element) => {
          const flags = RoomFlags.laundry;
          // check conditions → showDialogue / addItem / die / etc.
      }
    },
    // bounds are % of the scene container
    // classes: optional, e.g. 'swinging', 'flickering', 'light-shake', 'heavy-shake'
  ],
  decorations: [
    // scenery / escalating hazards — non-clickable
    // use classes: 'hidden' to reveal later
  ]
};
```

### Step 3: Add roomTimers (if the room has hazards)

```js
// Add key to the roomTimers object in game.js
roomTimers.laundryFlood = 0;

// Add logic inside the existing 1-second hazard setInterval block
if (GameState.currentRoom === 'laundry') {
  if (!RoomFlags.laundry.someFlag) {
    roomTimers.laundryFlood++;
    if (roomTimers.laundryFlood > 30) die("...");
    else if (roomTimers.laundryFlood > 20) /* danger-high */;
    else if (roomTimers.laundryFlood > 10) /* danger-low */;
  }
}
```

### Step 4: Add updateRoomVisuals

```js
// Inside function updateRoomVisuals(roomId)
} else if (roomId === 'laundry') {
  const flags = RoomFlags.laundry;
  // update element text, classes based on state
}
```

### Step 5: Add restartRoom reset

```js
// Inside function restartRoom()
} else if (GameState.currentRoom === 'laundry') {
  RoomFlags.laundry = { /* reset all values */ };
  GameState.inventory = JSON.parse(JSON.stringify(GameState.inventoryCheckpoints.laundry));
}
```

### Step 6: Connect entrances & exits

In the source room (e.g. kitchen) in `room.js`, add within `door_laundry`'s `onInteract`:
```js
case 'door_laundry':
  if (/* unlock condition met */) {
    GameState.inventoryCheckpoints.laundry = JSON.parse(JSON.stringify(GameState.inventory));
    loadRoom('laundry');
  }
  break;
```

### Step 7: Add UI overlay (if the room has a mini-game)

1. Add HTML in `index.html` (see `pill-ui-container` or `stove-ui-container` as examples)
2. Cache the element in the `els` object in `game.js`
3. Create open/close UI functions in `game.js`
4. Invoke these UI functions from `room.js` `onInteract` callbacks

---

## 5. Room Status

| # | Room (Room ID) | GDD | Implemented | Notes |
|---|----------------|-----|-------------|-------|
| 01 | `bedroom` | ✅ | ✅ | Starting room |
| 02 | `bathroom` | ✅ | ✅ | Pill UI, Faucet UI, Bathtub choice |
| 03 | `hallway_f2` | ✅ | ✅ | Curtain / rug / light switch / chandelier |
| 04 | `hallway_f1` | — | ✅ | Backpack + branching paths |
| 05 | `kitchen` | ✅ | ✅ | Stove UI, Ingredient UI, multi-hazard |
| 06 | `dining_room` | ✅ | ✅ | Drinks UI, clock puzzle, lamp / table climb |
| 07 | `storage` | ✅ | ✅ | Flashlight, darkness, door timer, panic |
| 08 | `laundry` | ❌ | ❌ | Needs GDD + implementation |
| 09 | `living_room` | ❌ | ❌ | Needs GDD + implementation |
| 10 | `front_garden` | ❌ | ❌ | Needs GDD + implementation |
| 11 | `fence_gate` | ❌ | ❌ | 4-digit code puzzle + implementation |
| 12 | `road` | ❌ | ❌ | Game ending (ending screen) |

**Current Win Screen:** Shown when using hammer on the laundry door (temporary demo endpoint).

---

## 6. Key Systems Reference

### CSS Animation Classes

| Class | Effect |
|-------|--------|
| `swinging` | Swing left-right |
| `flickering` | Opacity flicker |
| `light-shake` | Gentle shake |
| `heavy-shake` | Violent shake |
| `danger-low` | Orange border + pulse |
| `danger-high` | Red border + shake |
| `timing-safe` | Green border (safe to click) |
| `timing-unsafe` | Red border (clicking causes damage) |
| `hidden` | display: none |
| `smoke-effect` | Smoke (used in kitchen) |

### Core Functions

```
showDialogue(text)        – display message + log to action log
addItem(id, name)         – add to inventory (max 6)
removeItem(id)            – remove from inventory
hasItem(id)               – check if item exists
addLog(text)              – add clue note (deduped)
addActionLog(text)        – add timestamped action entry
takeDamage(reason, amt)   – deduct HP + notify
die(reason)               – show death screen
loadRoom(roomId)          – load a room
updateRoomVisuals(roomId) – update labels/classes per flags
renderHUD()               – update HP bar + battery display
```

### Hint System

"Toggle Hint Light" button → toggles class `show-hints` on scene → CSS highlights all interactive objects with visible borders.

---

## 7. Cross-Room Dependencies

| Item / Condition | Obtained In | Used In | Effect |
|-----------------|-------------|---------|--------|
| Towel (gotTowel) | bedroom | bathroom | Can dry off after bathing |
| Key (key) | bathroom | bedroom → hallway | Unlock hallway door |
| Employee badge + Smartphone | hallway_f1 | storage (flashlight), fence_gate (code digit 1) | |
| Storage room key | dining_room | hallway_f1 → storage | Unlock storage door |
| Hammer (hammer) | storage | kitchen → laundry | Break rusted doorknob |
| Wheel repair kit | laundry | dining_room | Repair clock wheels → move pendulum clock |
| Garden map | living_room | front_garden | Navigate traps safely |
| 4-digit code | hallway_f1 + dining + living + garden | fence_gate | Unlock fence gate |
| Mint tea (teaDrank) | dining_room | dining_room | Suppress panic before drinking coffee |

---

## 8. Development Rules

1. **Read the GDD before implementing** — files at `../design/rooms/XX_name.md` contain full details on interactables, win flow, death/injury conditions.
2. **Do not create new JS files** — core tracking logic goes in `game.js`, room data interactions go in `room.js`.
3. **inventoryCheckpoints** — must be saved before every `loadRoom()` call.
4. **restartRoom** — must reset flags + restore inventory checkpoint.
5. **Hazard timers** — add to the existing 1-second `setInterval` block; do not create new intervals.
6. **CSS classes** — use existing classes (`danger-low`, `danger-high`, etc.); avoid creating new ones unless necessary.
7. **Background assets** — name as `{roomId}_bg.png` and store in `assets/`.
8. **Test the death loop** — every room must restart cleanly with no state leaks.