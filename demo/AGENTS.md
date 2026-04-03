# Panic : Home Episode — Demo Development Guide

> Reference document for developing the Web-based Point-and-Click demo.  
> Room designs → see `../design/rooms/`
> Room map & connections → see `../design/map.md`

---

## 1. Tech Stack

| File | Purpose |
|------|---------|
| `index.html` | Layout for HUD, Scene, UI overlays, Inventory, Log panel, and script inclusions. |
| `style.css` | Horror theme in muted green tones, animation classes, responsive layout |
| `state.js` | Global state (GameState, flattened flags, items, checkpoint), Player logic, Inventory logic, timers |
| `ui_elements.js`| DOM Element map (`els`) |
| `ui.js` | HUD rendering, logs, and dialogue functions |
| `minigames.js` | Custom UI interactions (Pills, Faucet, Kitchen, Stove, Drinks) |
| `room_logic.js` | Room manager (`loadRoom`, `updateRoomVisuals`, `handleInteraction`, `toggleFlashlight`) |
| `timers.js` | Game loops (HP drain, hazard timers, bathtub fill interval) |
| `rooms/*.js` | Individual room declarations attached to `window.RoomData` containing `objects`, `decorations`, and interaction logic. |
| `main.js` | `init()`, `restartRoom()`, and window listeners |
| `assets/` | Room background images (`bedroom_bg.png`, `bathroom_bg.png`, ...) |

No frameworks — self-contained vanilla HTML/CSS/JS loaded sequentially as global scripts.

---

## 2. State Architecture

### 2.1 GameState (global, mutable)

All mutable data (Player health, Inventory, and Room Flags) has been merged into a single state object. This ensures saving and reverting state is predictable.

```js
GameState = {
  hp: 3,               // 0 → dead, max 3
  maxHp: 3,
  hpDrainRate: 0,       // units/sec, drained every 100ms (÷10)
  logs: [],             // log text strings (deduped)
  currentRoom: 'bedroom',
  smartphoneBattery: 52, // flashlight battery % 
  items: [],            // inventory array of objects
  flags: {              // Flattened map of room states
    bedroom_stoodUp: false,
    bathroom_pillTaken: false,
    // ...
  },
  checkpoint: null      // Deep copy snapshot of items + flags
}
```

### 2.2 Global Single Checkpoint

Each time the player enters a new room, we take a single global snapshot:
```js
saveCheckpoint();
loadRoom('new_room');
```
This stores a deep clone of `GameState.items` and `GameState.flags`.

**On death** → via `restartRoom()`, the game calls `loadCheckpoint()`. This seamlessly reverts all interactions (items gained/lost, flags modified) to the moment the player entered the room, avoiding any state leaks. GameState HP/damage restores, and timers reset to `0`.

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
  ├─ clear & rebuild interactive-layer from window.RoomData[roomId]
  │   ├─ .objects → div.interactive-object (clickable → handleInteraction)
  │   └─ .decorations → div.non-interactive-object (non-clickable, status display)
  ├─ reset room-specific timers
  ├─ updateRoomVisuals(roomId) → update labels/classes based on flags
  └─ renderHUD()
```

### 3.3 Interaction Flow

```
click object → handleInteraction(roomId, objId, element)
  ├─ fetch window.RoomData[roomId].objects
  ├─ check if obj.onInteract exists → execute obj.onInteract(element)
  │    ├─ check GameState.flags / GameState.items → showDialogue / addItem / takeDamage / die
  │    ├─ modify GameState.flags['room_var'] = true
  │    └─ updateRoomVisuals(roomId)
  └─ if changing rooms:
       ├─ saveCheckpoint()  // Replaces the old dictionary method
       └─ loadRoom(nextRoom)
```

---

## 4. Pattern for Adding a New Room

### Step 1: Add new script and `window.RoomData`

Create `rooms/laundry.js`:
```js
window.RoomData = window.RoomData || {};
window.RoomData.laundry = {
  objects: [
    { 
      id: 'obj_name', name: 'Display Name', bounds: { left: 0, top: 0, width: 20, height: 20 },
      onInteract: (element) => {
          const flags = GameState.flags;
          // Action logic here...
          flags['laundry_checkedMachine'] = true;
      }
    }
  ],
  decorations: []
};
```

### Step 2: Define default flags in `state.js`

Add to `GameState.flags`:
```js
    laundry_checkedMachine: false,
    laundry_doorUnlocked: false
```

### Step 3: Link script in `index.html`

```html
<script src="rooms/laundry.js"></script>
```

### Step 4: Add roomTimers (if the room has hazards)

1. Add key to the `roomTimers` object in `state.js`.
2. Add logic inside the existing 1-second `setInterval` block in `timers.js`:
```js
if (GameState.currentRoom === 'laundry' && !flags['laundry_someFlag']) {
  roomTimers.laundryFlood++;
  if (roomTimers.laundryFlood > 30) die("...");
}
```

### Step 5: Add updateRoomVisuals

```js
// Inside function updateRoomVisuals(roomId) in room_logic.js
} else if (roomId === 'laundry') {
  const flags = GameState.flags; // flat flags
  if (flags['laundry_checkedMachine']) {
      // update text, CSS classes
  }
}
```

**(No need to update restartRoom!)** Because we now use a global checkpoint, as long as you use the `saveCheckpoint()` → `loadRoom()` pattern, state is restored automatically on death.

### Step 6: Connect entrances & exits

In the source room (e.g. kitchen) in `rooms/kitchen.js`, update the interaction:
```js
case 'door_laundry':
  if (/* unlock condition met */) {
    saveCheckpoint();
    loadRoom('laundry');
  }
  break;
```

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

### Core Functions (`state.js` & `ui.js`)

```
showDialogue(text)        – display message + log to action log
addItem(id, name)         – add to inventory (max 6)
removeItem(id)            – remove from inventory
hasItem(id)               – check if item exists
addLog(text)              – add clue note (deduped)
addActionLog(text)        – add timestamped action entry
takeDamage(reason, amt)   – deduct HP + notify
die(reason)               – show death screen
saveCheckpoint()          - snapshot items + flags map
loadCheckpoint()          - revert to snapshot
loadRoom(roomId)          – load a room
updateRoomVisuals(roomId) – update labels/classes per flags
renderHUD()               – update HP bar + battery display
```

### Hint System

"Toggle Hint Light" button → toggles class `show-hints` on scene → CSS highlights all interactive objects with visible borders.

---

## 7. Development Rules

1. **Read the GDD before implementing** — files at `../design/rooms/XX_name.md` contain full details on interactables, win flow, death/injury conditions.
2. **Global Scripts usage** — core tracking logic is divided across specific JS files (`state.js`, `room_logic.js`, etc.), while room data interactions go in `rooms/*.js`.
3. **Checkpoints** — must be saved (`saveCheckpoint()`) before every `loadRoom()` call.
4. **Hazard timers** — add to the existing 1-second `setInterval` block in `timers.js`; do not create new intervals.
5. **CSS classes** — use existing classes (`danger-low`, `danger-high`, etc.); avoid creating new ones unless necessary.
6. **Background assets** — name as `{roomId}_bg.png` and store in `assets/`.
7. **Test the death loop** — every room must restart cleanly using `loadCheckpoint()`.