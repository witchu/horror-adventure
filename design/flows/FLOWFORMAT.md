# Room Flow Document Format

Guide for creating player flow diagrams for each room in the game. Each flow document maps directly to a `demo/rooms/<room_name>.js` file.

## File Naming

```
design/flows/<room_name>.md
```

Example: `front_garden.md` for `demo/rooms/front_garden.js`

---

## Document Structure

Every room flow document should follow this section order:

### 1. Room Overview

Brief description of the room's purpose, core puzzle/challenge, and connections.

```markdown
# <Room Name> — Player Flow

## Room Overview

<1-2 sentences describing the room's purpose and main challenge.>

- **Entry:** <source room(s) and method>
- **Exit:** <destination room(s) and method>
```

---

### 2. Flags

Table of all `GameState.flags` registered by this room.

```markdown
## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `room_flag_name` | `false` | What this flag tracks |
```

---

### 3. Room Entry (setupUI)

Flowchart showing the logic that runs when the room loads.

```markdown
## Room Entry (setupUI)

<mermaid flowchart TD showing setupUI logic>
```

Use `> [!NOTE]` alert if setupUI is trivial (e.g., just resets drain rate).

---

### 4. All Interactable Objects

Overview diagram showing all objects the player can interact with.

```markdown
## All Interactable Objects

<mermaid flowchart TD with room center node connecting to all object nodes>
```

Each node should show the Thai display name and the code `id`:

```
OBJECT["<Thai name><br/>(<id>)"]
```

---

### 5. Interactable Details

One subsection per object, numbered. Each contains:

1. **Heading** — Thai name + code id
2. **One-line description** — what this object does
3. **Mermaid flowchart** — full decision tree from the `onInteract` handler
4. **Alert annotations** (optional) — `[!TIP]`, `[!WARNING]`, `[!IMPORTANT]`, `[!CAUTION]`

```markdown
### <N>. <Thai name> (<id>)

<One-line description.>

<mermaid flowchart TD showing all branches>
```

#### Flowchart Conventions

| Node Style | Usage |
|------------|-------|
| `{"condition?"}` | Decision / condition check |
| `["action or description"]` | Normal action |
| `["❌ blocked message"]` | Blocked interaction |
| `["✅ success result"]` | Successful outcome with state changes |
| `["💀 death message"]` | Triggers `triggerDeath()` |
| `["💥 damage event"]` | Triggers `takeDamage()` |
| `["😱 scare event"]` | Scare + damage |
| `["🐸 / 🐕 creature event"]` | Creature-related event |
| `["📝 hint text"]` | Hint / clue |
| `["🎮 UI Choice Panel"]` | Opens interactive UI overlay |
| `["🚪 room transition"]` | `loadRoom()` call |
| `["💨 environmental event"]` | Wind, weather, etc. |

#### State Change Notation

Show flag/inventory changes inside the result node:

```
["✅ Description<br/>flag_name = value<br/>remove item_name"]
```

Common patterns:
- `add <item>` — `addItem()` call
- `remove <item>` — `removeItem()` call
- `flag = value` — flag state change
- `+ addLog` — `addLog()` call
- `saveCheckpoint` — `saveCheckpoint()` call
- `loadRoom: <room>` — `loadRoom()` call
- `-X.X HP` — `takeDamage()` with amount
- `+X.XX/s drain` — `hpDrainRate` change

---

### 6. Timed Events (onSecondTimer)

If the room has an `onSecondTimer` function, document it with:

#### Sub-systems

Split complex timers into named sub-systems with separate diagrams:

```markdown
## Timed Events (onSecondTimer)

### <System Name> (e.g., Wind System)
<mermaid flowchart>

### <System Name> (e.g., Dog State Machine)
<mermaid stateDiagram-v2 for state machines>
<mermaid flowchart TD for detailed per-tick logic>
```

Use `stateDiagram-v2` for high-level state transitions, then a detailed `flowchart TD` for the per-tick branching logic.

---

### 7. Critical Path

The optimal step-by-step solution using a horizontal flowchart.

```markdown
## Critical Path (Optimal Solution)

<mermaid flowchart LR showing numbered steps>
```

Each step node:

```
S1["1. <object name><br/><action taken>"]
```

Add `> [!IMPORTANT]` alert for required items from other rooms or alternate viable paths.

---

### 8. Death Summary

Table of all death triggers.

```markdown
## Death Summary

| # | Source | Trigger | Death Message |
|---|--------|---------|---------------|
| 1 | <object or timer> | <condition> | <Thai message> |
```

---

### 9. Damage Sources

Table of all non-lethal damage.

```markdown
## Damage Sources

| Source | HP Loss | Condition |
|--------|---------|-----------|
| <source> | -X.X or +X.XX/s drain | <when it happens> |
```

Use `-X.X` for instant damage, `+X.XX/s drain` for ongoing `hpDrainRate`.

---

### 10. Item Inventory

Two sub-tables:

```markdown
## Item Inventory

### Required from Other Rooms

| Item | Usage in This Room |
|------|--------------------|
| `item_id` | What it's used for |

### Obtainable in This Room

| Item | Source | Usage |
|------|--------|-------|
| `item_id` | Where found | What it's for / where it's used |
```

Mark trap items with ❌ and correct items with ✅.

---

## Alert Usage Guide

Use GitHub-style alerts sparingly to highlight critical design information:

| Alert | When to Use |
|-------|-------------|
| `> [!NOTE]` | Background context, trivial logic explanation |
| `> [!TIP]` | Optimal strategy, correct choice hints |
| `> [!IMPORTANT]` | Cross-room dependencies, required items, key design notes |
| `> [!WARNING]` | Time-sensitive dangers, subtle death conditions |
| `> [!CAUTION]` | Unavoidable deaths, permanent traps |

---

## Example Reference

See [front_garden.md](front_garden.md) for a complete example following this format.
