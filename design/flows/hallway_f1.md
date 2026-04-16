# Hallway F1 — Player Flow

## Room Overview

The first-floor hallway is a calm hub connecting multiple rooms. The player **searches a backpack for a clue and smartphone**, and uses keys to unlock the storage room. No timed hazards exist in this room.

- **Entry:** Hallway F2 (บันไดลงไปชั้นล่าง)
- **Exit:** Kitchen (ทางเข้าไปยังห้องครัว), Storage (ประตูห้องเก็บของ), Hallway F2 (บันไดขึ้นชั้น 2)

---

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `hallway_f1_backpackSearched1` | `false` | First backpack search done |
| `hallway_f1_backpackSearched2` | `false` | Second backpack search done (smartphone) |
| `hallway_f1_storageUnlocked` | `false` | Storage room door unlocked |

---

## Room Entry (setupUI)

> [!NOTE]
> `setupUI` is empty. No dynamic UI, no timers, no HP drain in this room.

---

## All Interactable Objects

```mermaid
flowchart TD
    START(("🏠 Hallway F1"))

    BACKPACK["กระเป๋าสะพาย<br/>(backpack)"]
    DOOR_LIVING["ประตูห้องนั่งเล่น<br/>(door_living)"]
    DOOR_STORAGE["ประตูห้องเก็บของ<br/>(door_storage)"]
    DOOR_KITCHEN["ทางเข้าไปยังห้องครัว<br/>(door_kitchen)"]
    STAIRS["บันไดขึ้นชั้น 2<br/>(stairs_up)"]

    START --> BACKPACK & DOOR_LIVING & DOOR_STORAGE & DOOR_KITCHEN & STAIRS
```

---

## Interactable Details

### 1. กระเป๋าสะพาย (backpack)

Two-stage search yielding a clue and a smartphone.

```mermaid
flowchart TD
    A["Interact: กระเป๋าสะพาย"]
    CHK1{{"backpackSearched1?"}}
    FIND1["✅ พบบอดี้พาสพนักงาน<br/>backpackSearched1 = true<br/>+ addLog: เบาะแสรั้วลำดับที่ 1"]
    CHK2{{"backpackSearched2?"}}
    FIND2["✅ เจอสมาร์ทโฟน!<br/>backpackSearched2 = true<br/>add smartphone"]
    EMPTY["ไม่มีอะไรในกระเป๋าแล้ว"]

    A --> CHK1
    CHK1 -- No --> FIND1
    CHK1 -- Yes --> CHK2
    CHK2 -- No --> FIND2
    CHK2 -- Yes --> EMPTY
```

---

### 2. ประตูห้องนั่งเล่น (door_living)

Currently locked / inaccessible from this side.

```mermaid
flowchart TD
    A["Interact: ประตูห้องนั่งเล่น"]
    LOCKED["❌ ประตูล็อค ทางนี้ยังไปไม่ได้"]

    A --> LOCKED
```

---

### 3. ประตูห้องเก็บของ (door_storage)

Room exit → `storage`. Requires `key_storage`.

```mermaid
flowchart TD
    A["Interact: ประตูห้องเก็บของ"]
    CHK_UNLOCKED{{"storageUnlocked?"}}
    EXIT["🚪 เข้าห้องเก็บของ<br/>saveCheckpoint<br/>loadRoom: storage"]
    HAS_KEY{{"has key_storage?"}}
    UNLOCK["✅ ไขกุญแจเปิดประตู<br/>storageUnlocked = true<br/>remove key_storage<br/>saveCheckpoint<br/>loadRoom: storage"]
    LOCKED["❌ ประตูล็อค<br/>ต้องการกุญแจห้องเก็บของ"]

    A --> CHK_UNLOCKED
    CHK_UNLOCKED -- Yes --> EXIT
    CHK_UNLOCKED -- No --> HAS_KEY
    HAS_KEY -- Yes --> UNLOCK
    HAS_KEY -- No --> LOCKED
```

> [!IMPORTANT]
> `key_storage` is obtained from the Dining Room (โคมไฟเพดาน).

---

### 4. ทางเข้าไปยังห้องครัว (door_kitchen)

Room exit → `kitchen`. Always accessible.

```mermaid
flowchart TD
    A["Interact: ทางเข้าไปยังห้องครัว"]
    EXIT["🚪 เข้าห้องครัว<br/>saveCheckpoint<br/>loadRoom: kitchen"]

    A --> EXIT
```

---

### 5. บันไดขึ้นชั้น 2 (stairs_up)

Room exit → `hallway_f2`. Always accessible.

```mermaid
flowchart TD
    A["Interact: บันไดขึ้นชั้น 2"]
    EXIT["🚪 กลับชั้น 2<br/>loadRoom: hallway_f2"]

    A --> EXIT
```

---

## Timed Events (onSecondTimer)

> [!NOTE]
> No timed events in this room. `onSecondTimer` is empty.

---

## Critical Path (Optimal Solution)

```mermaid
flowchart LR
    S["🚪 Enter Hallway F1"]
    S1["1. กระเป๋าสะพาย (×2)<br/>Get fence clue #1<br/>+ smartphone"]
    S2["2. ทางเข้าไปยังห้องครัว<br/>→ kitchen"]

    S --> S1 --> S2
```

> [!IMPORTANT]
> Return here later with `key_storage` (from Dining Room) to unlock the Storage room.

---

## Death Summary

*No deaths possible in this room.*

---

## Damage Sources

*No damage sources in this room.*

---

## Item Inventory

### Required from Other Rooms

| Item | Usage in This Room |
|------|---------------------|
| `key_storage` | Unlock storage room door (obtained from Dining Room) |

### Obtainable in This Room

| Item | Source | Usage |
|------|--------|-------|
| `smartphone` | กระเป๋าสะพาย (2nd search) | ✅ Flashlight in Storage room |
