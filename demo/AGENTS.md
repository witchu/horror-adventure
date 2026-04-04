# Panic : Home Episode — Demo Dev Guide

> Room designs → `../design/rooms/` · Room map → `../design/map.md`

---

## 1. Architecture

| File | Role |
|------|------|
| `index.html` | DOM layout (HUD, scene, overlays, inventory, log panel) + script tags |
| `style.css` | Global theme & shared CSS classes (animations, danger states, UI layout) |
| `state.js` | `GameState` object, player functions (`takeDamage`, `die`), inventory, checkpoint |
| `ui.js` | DOM element map (`els`), `renderHUD`, `showDialogue`, `addLog`, `addActionLog` |
| `room.js` | `loadRoom`, `updateRoomVisuals`, `handleInteraction` |
| `timers.js` | HP drain loop (100ms), hazard dispatcher (1s → `room.onSecondTimer()`) |
| `rooms/*.js` | **Self-contained room modules** — flags, styles, objects, decorations, `setupUI`, `updateVisuals`, `onSecondTimer` |
| `main.js` | `init()`, `restartRoom()`, `window.onload` |
| `assets/` | Room backgrounds (`{roomId}_bg.png`) |

Vanilla HTML/CSS/JS — no frameworks, global scripts loaded sequentially.

---

## 2. GameState

```js
GameState = {
  hp, maxHp,            // HP (0 = dead, max 3)
  hpDrainRate,          // units/sec, drained every 100ms
  logs: [],             // deduped log strings
  currentRoom,          // active room ID
  items: [],            // inventory [{id, name}], max 6
  flags: {},            // flattened room flags (e.g. bedroom_stoodUp)
  checkpoint: null      // deep clone of {items, flags}
}
```

**Checkpoint:** `saveCheckpoint()` before every `loadRoom()`. On death → `restartRoom()` calls `loadCheckpoint()` to revert all flags/items, restores HP, reloads room.

**Damage types:** instant (`takeDamage`), continuous (`hpDrainRate > 0`), instant kill (`die`).

---

## 3. Room Module Format (`rooms/*.js`)

Each room file is self-contained. Pattern:

```js
window.RoomData = window.RoomData || {};

// 1. Register default flags
Object.assign(GameState.flags, {
  roomId_flagName: false,
  roomId_timer: 0
});

// 2. Define room data
window.RoomData.roomId = {
  // Room-specific CSS (injected on loadRoom, replaces previous)
  styles: `
    .room-roomId { background-image: url('assets/roomId_bg.png'); }
    /* custom animations, UI widget styles, etc. */
  `,

  objects: [
    { id: 'obj_id', name: 'Display', bounds: { left, top, width, height },
      classes: 'swinging',  // optional initial CSS class
      onInteract: (element) => {
        const flags = GameState.flags;
        // logic → showDialogue / addItem / takeDamage / die
        flags['roomId_flagName'] = true;
        updateRoomVisuals();
      }
    }
  ],

  decorations: [],  // non-clickable status elements (unless onInteract provided)

  setupUI: function() {
    // inject custom DOM overlays (called once at init for ALL rooms)
  },

  updateVisuals: function() {
    // update DOM classes/text based on GameState.flags
  },

  onSecondTimer: function() {
    // per-second hazard logic (only runs when this room is active)
  }
};
```

---

## 4. Adding a New Room

1. **Create `rooms/{roomId}.js`** following the pattern above
2. **Add `<script>` tag** in `index.html` (before `main.js`)
3. **Connect exits** — in source room's `onInteract`: `saveCheckpoint(); loadRoom('roomId');`
4. **Add background** — `assets/{roomId}_bg.png`, referenced in `styles`
5. **Read the GDD first** — `../design/rooms/XX_name.md`

No need to modify `restartRoom()` — checkpoint system handles state revert automatically.

---

## 5. Room Status

| # | Room | Implemented | Notes |
|---|------|:-----------:|-------|
| 01 | `bedroom` | ✅ | Starting room |
| 02 | `bathroom` | ✅ | Pill UI, Faucet UI, Bathtub choice |
| 03 | `hallway_f2` | ✅ | Curtain / rug / light switch / chandelier |
| 04 | `hallway_f1` | ✅ | Backpack + branching paths |
| 05 | `kitchen` | ✅ | Stove UI, Ingredient UI, multi-hazard |
| 06 | `dining_room` | ✅ | Drinks UI, clock puzzle, lamp / table climb |
| 07 | `storage` | ✅ | Flashlight, darkness, door timer, panic |
| 08 | `laundry` | ❌ | — |
| 09 | `living_room` | ❌ | — |
| 10 | `front_garden` | ❌ | — |
| 11 | `fence_gate` | ❌ | 4-digit code puzzle |
| 12 | `road` | ❌ | Game ending |

**Current demo endpoint:** Win screen on hammer + laundry door.

---

## 6. Shared CSS Classes (in `style.css`)

| Class | Effect |
|-------|--------|
| `swinging` | Swing left-right |
| `flickering` | Opacity flicker |
| `light-shake` / `heavy-shake` | Gentle / violent shake |
| `danger-low` / `danger-high` | Orange pulse / red shake border |
| `timing-safe` / `timing-unsafe` | Green / red border (timed clicks) |
| `hidden` | `display: none` |

Room-specific CSS (backgrounds, custom animations, widget styles) goes in the room's `styles` property — **not** in `style.css`.

---

## 7. Core Functions

| Function | Source | Purpose |
|----------|--------|---------|
| `showDialogue(text)` | `ui.js` | Display message + log action |
| `addItem(id, name)` | `state.js` | Add to inventory (max 6) |
| `removeItem(id)` | `state.js` | Remove from inventory |
| `hasItem(id)` | `state.js` | Check if item exists |
| `addLog(text)` | `ui.js` | Add clue note (deduped) |
| `addActionLog(text)` | `ui.js` | Add timestamped action entry |
| `takeDamage(reason, amt)` | `state.js` | Deduct HP (default 0.25) |
| `die(reason)` | `state.js` | Show death screen |
| `saveCheckpoint()` | `state.js` | Snapshot items + flags |
| `loadCheckpoint()` | `state.js` | Revert to snapshot |
| `loadRoom(roomId)` | `room.js` | Load a room |
| `updateRoomVisuals()` | `room.js` | Delegate to room's `updateVisuals()` |
| `renderHUD()` | `ui.js` | Update HP bar + battery |

---

## 8. Rules

1. **Read the GDD** before implementing any room
2. **Room modules are self-contained** — flags, styles, objects, `setupUI`, `updateVisuals`, `onSecondTimer` all live in `rooms/*.js`. Use IIFEs for local scope when needed
3. **Always `saveCheckpoint()` before `loadRoom()`**
4. **Room-specific CSS** → room's `styles` property, **not** `style.css`
5. **Background naming** → `assets/{roomId}_bg.png`, referenced as `.room-{roomId} { background-image: url('assets/{roomId}_bg.png'); }`
6. **Test death/restart loop** — every room must restart cleanly via `loadCheckpoint()`