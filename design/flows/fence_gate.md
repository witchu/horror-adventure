# Fence Gate — Player Flow

## Room Overview

The Fence Gate is an outdoor puzzle area near the house entrance. The player must **find the 4-digit gate code from clues scattered across the house, unlock the mailbox, retrieve a key from the fountain, arm themselves, confront the entity at the house door, and input the code to escape** — all while checking that the dog is properly caged.

- **Entry:** Front Garden (ทางไปรั้วหน้าบ้าน)
- **Exit:** Road (ประตูรั้วออกสู่ถนน), Front Garden (กลับเข้าสวน)

---

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `fence_mailbox_unlocked` | `false` | Mailbox opened with key |
| `fence_net_taken` | `false` | Leaf net picked up |
| `fence_fountain_key_taken` | `false` | House key retrieved from fountain |
| `fence_left_bin_opened` | `false` | Left trash bin opened |
| `fence_right_bin_opened` | `false` | Right trash bin opened |
| `fence_house_door_opened` | `false` | House front door opened |
| `fence_gate_open` | `false` | Gate code entered correctly |
| `fence_code_attempts` | `0` | Failed code attempts counter |
| `fence_code_lock_timer` | `0` | Lockout countdown (seconds) |

---

## Room Entry (setupUI)

```mermaid
flowchart TD
    ENTRY["🚪 Enter from Front Garden"]
    UI["Create Numpad UI<br/>(4-digit code input)"]

    ENTRY --> UI
```

---

## All Interactable Objects

```mermaid
flowchart TD
    START(("🚧 Fence Gate"))

    GATE_PANEL["แผงกรอกรหัส<br/>(gate_panel)"]
    GATE_DOOR["ประตูรั้วออกสู่ถนน<br/>(gate_door)"]
    MAILBOX["ตู้จดหมาย<br/>(mailbox)"]
    FOUNTAIN["น้ำพุ<br/>(fountain)"]
    BIN_L["ถังขยะซ้าย<br/>(bin_left)"]
    BIN_R["ถังขยะขวา<br/>(bin_right)"]
    NET["กระชอนตักใบไม้<br/>(net)"]
    SHOES["รองเท้า<br/>(shoes)"]
    HOUSE_DOOR["ประตูบ้าน<br/>(house_door)"]
    SPIKY["รั้วเหล็กแหลม<br/>(spiky_fence)"]
    GARDEN_RET["กลับเข้าสวนหน้าบ้าน<br/>(garden_return)"]

    START --> GATE_PANEL & GATE_DOOR & MAILBOX & FOUNTAIN & BIN_L & BIN_R & NET & SHOES & HOUSE_DOOR & SPIKY & GARDEN_RET
```

---

## Interactable Details

### 1. แผงกรอกรหัส (gate_panel)

Enter the 4-digit gate code. Requires dog caged.

```mermaid
flowchart TD
    A["Interact: แผงกรอกรหัส"]
    CHK_DOG{{"garden_cage_locked?"}}
    DEATH_DOG["💀 สุนัขพุ่งมากัดตาย!"]
    CHK_OPEN{{"fence_gate_open?"}}
    DONE["ประตูรั้วปลดแล้ว"]
    CHK_LOCK{{"code_lock_timer > 0?"}}
    LOCKED["❌ ระบบล็อก รอ N วินาที"]
    UI["🎮 Numpad UI<br/>กรอกรหัส 4 หลัก"]
    CHK_CODE{{"code == 0210?"}}
    CORRECT["✅ รหัสถูกต้อง!<br/>fence_gate_open = true"]
    WRONG["❌ รหัสไม่ถูกต้อง<br/>attempts++"]
    CHK_3{{"attempts >= 3?"}}
    LOCKOUT["ผิด 3 ครั้ง ล็อค 30 วินาที!<br/>code_lock_timer = 30<br/>attempts = 0"]
    WARN["ระวัง ผิด 3 ครั้งจะถูกล็อค"]

    A --> CHK_DOG
    CHK_DOG -- No --> DEATH_DOG
    CHK_DOG -- Yes --> CHK_OPEN
    CHK_OPEN -- Yes --> DONE
    CHK_OPEN -- No --> CHK_LOCK
    CHK_LOCK -- Yes --> LOCKED
    CHK_LOCK -- No --> UI --> CHK_CODE
    CHK_CODE -- Yes --> CORRECT
    CHK_CODE -- No --> WRONG --> CHK_3
    CHK_3 -- Yes --> LOCKOUT
    CHK_3 -- No --> WARN
```

> [!IMPORTANT]
> The correct code is **0210**. Clues are scattered across rooms:
> - Digit 1 (= 0): Hallway F1 backpack (บอดี้พาสพนักงาน)
> - Digit 2 (= 2): Dining Room newspaper
> - Digit 3 (= 1): Living Room dog bed
> - Digit 4 (= 0): Fence Gate mailbox

---

### 2. ประตูรั้วออกสู่ถนน (gate_door)

Room exit → `road`. Requires gate code entered.

```mermaid
flowchart TD
    A["Interact: ประตูรั้ว"]
    CHK{{"fence_gate_open?"}}
    EXIT["🚪 ออกสู่ถนน<br/>saveCheckpoint<br/>loadRoom: road"]
    LOCKED["❌ ประตูล็อค ต้องป้อนรหัส"]

    A --> CHK
    CHK -- Yes --> EXIT
    CHK -- No --> LOCKED
```

---

### 3. ตู้จดหมาย (mailbox)

Unlock with key for fence code digit #4.

```mermaid
flowchart TD
    A["Interact: ตู้จดหมาย"]
    CHK_DOG{{"garden_cage_locked?"}}
    DEATH["💀 สุนัขพุ่งออกมากัดตาย!"]
    CHK_OPEN{{"mailbox_unlocked?"}}
    DONE["ตู้จดหมายเปิดอยู่"]
    HAS_KEY{{"has key_mailbox?"}}
    UNLOCK["✅ เปิดตู้จดหมาย<br/>mailbox_unlocked = true<br/>remove key_mailbox<br/>+ addLog: รหัสรั้ว #4 = 0<br/>+ addLog: จดหมาย"]
    LOCKED["❌ ตู้จดหมายล็อคอยู่"]

    A --> CHK_DOG
    CHK_DOG -- No --> DEATH
    CHK_DOG -- Yes --> CHK_OPEN
    CHK_OPEN -- Yes --> DONE
    CHK_OPEN -- No --> HAS_KEY
    HAS_KEY -- Yes --> UNLOCK
    HAS_KEY -- No --> LOCKED
```

---

### 4. น้ำพุ (fountain)

Retrieve the house key using the net. Without net = UI choice death trap.

```mermaid
flowchart TD
    A["Interact: น้ำพุ"]
    CHK{{"fountain_key_taken?"}}
    DONE["ไม่มีอะไรน่าสนใจ"]
    HAS_NET{{"has net?"}}
    NET_OK["✅ ใช้ด้ามกระชอนเขี่ย<br/>fountain_key_taken = true<br/>remove net<br/>add key_house"]
    UI["🎮 UI Choice Panel<br/>เห็นแสงวิบวับก้นบ่อ"]
    REACH["เอื้อมมือลงไปหยิบ"]
    SKIP["ไม่เอาดีกว่า"]
    DEATH["💀 ลื่นตะไคร่ หัวฟาดขอบบ่อ<br/>จมน้ำตาย!"]

    A --> CHK
    CHK -- Yes --> DONE
    CHK -- No --> HAS_NET
    HAS_NET -- Yes --> NET_OK
    HAS_NET -- No --> UI
    UI --> REACH & SKIP
    REACH --> DEATH
```

---

### 5. ถังขยะซ้าย (bin_left)

Disturbing discovery with heavy damage.

```mermaid
flowchart TD
    A["Interact: ถังขยะซ้าย"]
    CHK_DOG{{"garden_cage_locked?"}}
    DEATH["💀 สุนัขกัดตาย!"]
    CHK{{"left_bin_opened?"}}
    OPEN["กลิ่นเหม็นเน่ารุนแรง!<br/>ถุงดำน่าสงสัย<br/>left_bin_opened = true<br/>-0.75 HP"]
    DONE["ไม่อยากยุ่งอีกแล้ว"]

    A --> CHK_DOG
    CHK_DOG -- No --> DEATH
    CHK_DOG -- Yes --> CHK
    CHK -- No --> OPEN
    CHK -- Yes --> DONE
```

---

### 6. ถังขยะขวา (bin_right)

Find the fish knife.

```mermaid
flowchart TD
    A["Interact: ถังขยะขวา"]
    CHK_DOG{{"garden_cage_locked?"}}
    DEATH["💀 สุนัขกัดตาย!"]
    CHK{{"right_bin_opened?"}}
    FIND["✅ พบมีดแล่ปลา!<br/>right_bin_opened = true<br/>add fish_knife"]
    DONE["ไม่มีอะไรในถังนี้แล้ว"]

    A --> CHK_DOG
    CHK_DOG -- No --> DEATH
    CHK_DOG -- Yes --> CHK
    CHK -- No --> FIND
    CHK -- Yes --> DONE
```

---

### 7. กระชอนตักใบไม้ (net)

Pick up the leaf net tool.

```mermaid
flowchart TD
    A["Interact: กระชอนตักใบไม้"]
    CHK{{"net_taken?"}}
    PICK["✅ หยิบกระชอน<br/>net_taken = true<br/>add net"]
    DONE["(taken)"]

    A --> CHK
    CHK -- No --> PICK
    CHK -- Yes --> DONE
```

---

### 8. รองเท้า (shoes)

Lore hint object.

```mermaid
flowchart TD
    A["Interact: รองเท้า"]
    HINT["📝 มีคนอยู่ในบ้าน<br/>+ addLog"]

    A --> HINT
```

---

### 9. ประตูบ้าน (house_door)

Unlock and confront entity. Requires key + fish knife.

```mermaid
flowchart TD
    A["Interact: ประตูบ้าน"]
    CHK_OPENED{{"house_door_opened?"}}
    OPENED["ประตูเปิดอ้า เลือดนอง"]
    HAS_KEY{{"has key_house?"}}
    LOCKED["❌ ประตูล็อคด้วยแม่กุญแจ"]
    HAS_KNIFE{{"has fish_knife?"}}
    FIGHT["✅ เปิดประตู ต่อสู้สิ่งชั่วร้าย!<br/>house_door_opened = true<br/>remove key_house<br/>hpDrainRate += 0.02 (panic)"]
    DEATH["💀 สิ่งชั่วร้ายทำร้ายตาย!"]

    A --> CHK_OPENED
    CHK_OPENED -- Yes --> OPENED
    CHK_OPENED -- No --> HAS_KEY
    HAS_KEY -- No --> LOCKED
    HAS_KEY -- Yes --> HAS_KNIFE
    HAS_KNIFE -- Yes --> FIGHT
    HAS_KNIFE -- No --> DEATH
```

> [!CAUTION]
> Opening the door without the fish knife is instant death. Always get the knife from the right trash bin first.

---

### 10. รั้วเหล็กแหลม (spiky_fence)

Death trap — always lethal.

```mermaid
flowchart TD
    A["Interact: รั้วเหล็กแหลม"]
    DEATH["💀 ปีนรั้ว ลื่นสะดุด<br/>ถูกเหล็กแหลมทิ่มทะลุ!"]

    A --> DEATH
```

---

### 11. กลับเข้าสวนหน้าบ้าน (garden_return)

Room exit → `front_garden`. Requires dog caged.

```mermaid
flowchart TD
    A["Interact: กลับเข้าสวน"]
    CHK{{"garden_cage_locked?"}}
    DEATH["💀 สุนัขรอกัดตาย!"]
    EXIT["🚪 กลับเข้าสวนหน้าบ้าน<br/>saveCheckpoint<br/>loadRoom: front_garden"]

    A --> CHK
    CHK -- No --> DEATH
    CHK -- Yes --> EXIT
```

---

## Timed Events (onSecondTimer)

### Code Lock Countdown

```mermaid
flowchart TD
    CHK{{"code_lock_timer > 0?"}}
    DEC["code_lock_timer--"]
    SKIP["No lockout"]

    CHK -- Yes --> DEC
    CHK -- No --> SKIP
```

---

## Critical Path (Optimal Solution)

```mermaid
flowchart LR
    S["🚪 Enter Fence Gate"]
    S1["1. กระชอนตักใบไม้<br/>Pick up net"]
    S2["2. ถังขยะขวา<br/>Get fish_knife"]
    S3["3. น้ำพุ<br/>Use net → get key_house"]
    S4["4. ตู้จดหมาย<br/>Open → fence code #4"]
    S5["5. ประตูบ้าน<br/>Open with key + knife"]
    S6["6. แผงกรอกรหัส<br/>Enter 0210"]
    S7["7. ประตูรั้ว<br/>→ road ✅"]

    S --> S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7
```

> [!IMPORTANT]
> **Required items from other rooms:**
> - `key_mailbox` — from Living Room (จานชาม)
> - Dog must be caged (`garden_cage_locked`) from Front Garden
> - All 4 fence code digits collected from various rooms

---

## Death Summary

| # | Source | Trigger | Death Message |
|---|--------|---------|---------------|
| 1 | แผงกรอกรหัส | !garden_cage_locked | สุนัขพุ่งมากัดตาย |
| 2 | ตู้จดหมาย | !garden_cage_locked | สุนัขพุ่งออกมากัดตาย |
| 3 | ถังขยะซ้าย | !garden_cage_locked | สุนัขกัดตาย |
| 4 | ถังขยะขวา | !garden_cage_locked | สุนัขกัดตาย |
| 5 | น้ำพุ → เอื้อมมือ | Player choice (UI) | ลื่นตะไคร่ จมน้ำตาย |
| 6 | ประตูบ้าน | has key but no fish_knife | สิ่งชั่วร้ายทำร้ายตาย |
| 7 | รั้วเหล็กแหลม | Always on interact | ถูกเหล็กแหลมทิ่มทะลุ |
| 8 | กลับเข้าสวน | !garden_cage_locked | สุนัขรอกัดตาย |

---

## Damage Sources

| Source | HP Loss | Condition |
|--------|---------|-----------|
| ถังขยะซ้าย (first open) | -0.75 | First time opening |
| ประตูบ้าน (opened with knife) | +0.02/s drain | Panic from confrontation |

---

## Item Inventory

### Required from Other Rooms

| Item | Usage in This Room |
|------|---------------------|
| `key_mailbox` | Unlock mailbox (from Living Room) |

### Obtainable in This Room

| Item | Source | Usage |
|------|--------|-------|
| `net` | กระชอนตักใบไม้ | ✅ Retrieve key from fountain (consumed) |
| `fish_knife` | ถังขยะขวา | ✅ Defend against entity at house door / Road encounters |
| `key_house` | น้ำพุ (via net) | ✅ Unlock house front door (consumed) |
