# Storage — Player Flow

## Room Overview

The Storage room is a dark, claustrophobic puzzle room. The player must **use their smartphone flashlight to navigate, find items in boxes, wedge the folding door open, and retrieve a hammer from a locked toolbox** — all while managing battery drain and a door that slowly closes on a 30-second timer.

- **Entry:** Hallway F1 (ประตูห้องเก็บของ)
- **Exit:** Hallway F1 (ประตูบานพับ)

---

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `storage_flashLightOn` | `false` | Smartphone flashlight is on |
| `storage_doorWedged` | `false` | Door wedged open with wood stick |
| `storage_doorClosed` | `false` | Door has fully closed (trapped) |
| `storage_woodStickAcquired` | `false` | Wood stick picked up |
| `storage_foundNote` | `false` | Warning note found |
| `storage_foundKey` | `false` | Toolbox key found |
| `storage_foundPowerbank` | `false` | Powerbank found |
| `storage_boxOpened` | `false` | Closed box opened (rat scare) |
| `storage_gotHammer` | `false` | Hammer obtained from toolbox |
| `storage_doorTimerStarted` | `false` | (unused in code) |
| `storage_doorSmallOpenedCount` | `0` | Small door interaction count |
| `storage_boxSearchView` | `0` | Open box search progress (0→1→2→3) |
| `storage_doorTimer` | `0` | Door closing countdown |
| `storage_panicTimer` | `0` | Panic escalation timer |

---

## Room Entry (setupUI)

```mermaid
flowchart TD
    ENTRY["🚪 Enter from Hallway F1"]
    UI["Create Flashlight UI<br/>(toggle + battery display + charge)"]

    ENTRY --> UI
```

> [!NOTE]
> The room starts in near-total darkness. The flashlight UI is always visible. Interactive objects are hidden until flashlight is on.

---

## All Interactable Objects

```mermaid
flowchart TD
    START(("📦 Storage"))

    DOOR_MAIN["ประตูบานพับ<br/>(door_main)"]
    SWITCH["สวิตช์ไฟ (ช็อต)<br/>(switch)"]
    DOOR_SMALL["ประตูขนาดเล็กฝั่งพื้น<br/>(door_small)"]
    BOX_OPEN["ลังกระดาษไม่มีฝาปิด<br/>(box_open)"]
    BOX_CLOSED["ลังกระดาษมีฝาปิด<br/>(box_closed)"]
    TOOLBOX["กล่องอุปกรณ์ช่าง<br/>(toolbox)"]

    START --> DOOR_MAIN & SWITCH & DOOR_SMALL & BOX_OPEN & BOX_CLOSED & TOOLBOX
```

---

## Interactable Details

### 1. ประตูบานพับ (door_main)

Exit or wedge the folding door. Door slowly closes over 30 seconds.

```mermaid
flowchart TD
    A["Interact: ประตูบานพับ"]
    CHK_CLOSED{{"doorClosed?"}}
    TRAPPED["❌ ประตูปิดสนิท ออกไม่ได้!"]
    CHK_WEDGED{{"doorWedged?"}}
    EXIT_SAFE["🚪 เดินกลับโถงทางเดิน<br/>saveCheckpoint<br/>loadRoom: hallway_f1"]
    HAS_STICK{{"has wood_stick?"}}
    WEDGE["✅ ค้ำประตูด้วยไม้<br/>doorWedged = true<br/>remove wood_stick"]
    NO_STICK["ประตูกำลังจะปิด!<br/>🚪 รีบออกไปก่อน<br/>saveCheckpoint<br/>loadRoom: hallway_f1"]

    A --> CHK_CLOSED
    CHK_CLOSED -- Yes --> TRAPPED
    CHK_CLOSED -- No --> CHK_WEDGED
    CHK_WEDGED -- Yes --> EXIT_SAFE
    CHK_WEDGED -- No --> HAS_STICK
    HAS_STICK -- Yes --> WEDGE
    HAS_STICK -- No --> NO_STICK
```

> [!WARNING]
> Without the wood stick, interacting with the door always exits the room (saving you from being trapped). But you won't have completed the puzzle. You must find the wood stick from the small door first.

---

### 2. สวิตช์ไฟ (switch)

Instant death trap — broken electrical switch.

```mermaid
flowchart TD
    A["Interact: สวิตช์ไฟ"]
    DEATH["💀 กดสวิตช์ไฟที่พัง<br/>ไฟฟ้าลัดวงจรช็อตตาย!"]

    A --> DEATH
```

> [!CAUTION]
> Always-lethal. Never interact with this object.

---

### 3. ประตูขนาดเล็กฝั่งพื้น (door_small)

Three-stage interaction: discover → get wood stick → death trap.

```mermaid
flowchart TD
    A["Interact: ประตูขนาดเล็ก"]
    CHK_FLASH{{"flashLightOn?"}}
    DARK["❌ มืดเกินไป เปิดไฟแฟชก่อน"]
    CHK_COUNT{{"doorSmallOpenedCount?"}}
    FIND["ส่องแฟช พบไม้ขัดประตู<br/>count = 1"]
    PULL["✅ ดึงไม้ขัดออก<br/>count = 2<br/>woodStickAcquired = true<br/>add wood_stick"]
    DEATH["💀 บางอย่างกระชากดึง<br/>ตกลงไปในความมืด!"]

    A --> CHK_FLASH
    CHK_FLASH -- No --> DARK
    CHK_FLASH -- Yes --> CHK_COUNT
    CHK_COUNT -- "0" --> FIND
    CHK_COUNT -- "1" --> PULL
    CHK_COUNT -- "2+" --> DEATH
```

> [!CAUTION]
> After getting the wood stick, do NOT interact with this door again. Third interaction is instant death.

---

### 4. ลังกระดาษไม่มีฝาปิด (box_open)

Three-stage search: note → toolbox key → powerbank.

```mermaid
flowchart TD
    A["Interact: ลังกระดาษ (เปิด)"]
    CHK_FLASH{{"flashLightOn?"}}
    DARK["❌ มืดเกินไป มองไม่เห็น"]
    CHK{{"boxSearchView?"}}
    FIND1["📝 กระดาษโน้ตคำเตือน<br/>view = 1<br/>+ addLog"]
    FIND2["✅ พบกุญแจกล่องอุปกรณ์<br/>view = 2<br/>foundKey = true<br/>add key_toolbox"]
    FIND3["✅ พบพาวเวอร์แบงค์เก่า<br/>view = 3<br/>foundPowerbank = true<br/>add powerbank"]
    EMPTY["ไม่มีอะไรให้ค้นอีก"]

    A --> CHK_FLASH
    CHK_FLASH -- No --> DARK
    CHK_FLASH -- Yes --> CHK
    CHK -- "0" --> FIND1
    CHK -- "1" --> FIND2
    CHK -- "2" --> FIND3
    CHK -- "3" --> EMPTY
```

---

### 5. ลังกระดาษมีฝาปิด (box_closed)

Rat scare with damage.

```mermaid
flowchart TD
    A["Interact: ลังกระดาษ (ปิด)"]
    CHK{{"boxOpened?"}}
    SCARE["🐸 หนูตัวใหญ่กระโดดออกมา!<br/>boxOpened = true<br/>-0.5 HP"]
    DONE["มีแต่เศษฝุ่นและกลิ่นสาบหนู"]

    A --> CHK
    CHK -- No --> SCARE
    CHK -- Yes --> DONE
```

---

### 6. กล่องอุปกรณ์ช่าง (toolbox)

Unlock with key to get hammer.

```mermaid
flowchart TD
    A["Interact: กล่องอุปกรณ์ช่าง"]
    CHK_FLASH{{"flashLightOn?"}}
    DARK["❌ มืดเกินไป เปิดไฟฉายก่อน"]
    CHK_HAMMER{{"gotHammer?"}}
    DONE["กล่องว่างเปล่า"]
    HAS_KEY{{"has key_toolbox?"}}
    UNLOCK["✅ ไขกุญแจเปิดกล่อง<br/>gotHammer = true<br/>remove key_toolbox<br/>add hammer"]
    LOCKED["❌ กล่องถูกล็อค<br/>ต้องหากุญแจ"]

    A --> CHK_FLASH
    CHK_FLASH -- No --> DARK
    CHK_FLASH -- Yes --> CHK_HAMMER
    CHK_HAMMER -- Yes --> DONE
    CHK_HAMMER -- No --> HAS_KEY
    HAS_KEY -- Yes --> UNLOCK
    HAS_KEY -- No --> LOCKED
```

---

## Timed Events (onSecondTimer)

### Battery Drain

```mermaid
flowchart TD
    CHK{{"flashLightOn?"}}
    DRAIN["battery -= 0.5<br/>(~200s total)"]
    CHK_EMPTY{{"battery <= 0?"}}
    OFF["flashLightOn = false<br/>ห้องมืดสนิท"]
    OK["Battery draining..."]
    SKIP["No drain"]

    CHK -- Yes --> DRAIN --> CHK_EMPTY
    CHK_EMPTY -- Yes --> OFF
    CHK_EMPTY -- No --> OK
    CHK -- No --> SKIP
```

### Door Closing Timer

```mermaid
flowchart TD
    CHK{{"!doorWedged AND<br/>!gotHammer?"}}
    INC["doorTimer++"]
    CHK_30{{"timer > 30?"}}
    DEATH["💀 ประตูพับปิดสนิท<br/>ขาดอากาศตาย!<br/>doorClosed = true"]
    OK["Door still closing..."]
    SAFE["(door wedged or hammer obtained)"]

    CHK -- Yes --> INC --> CHK_30
    CHK_30 -- Yes --> DEATH
    CHK_30 -- No --> OK
    CHK -- No --> SAFE
```

### Panic Escalation

```mermaid
flowchart TD
    INC["panicTimer++"]
    CHK_DARK{{"!flashLightOn AND<br/>timer > 210? (3:30)"}}
    PANIC1["Panic L1: อาการกำเริบ!<br/>hpDrainRate = 0.02"]
    CHK_LIGHT{{"flashLightOn AND<br/>timer > 300? (5:00)"}}
    PANIC2["Panic L2: แม้มีแสงก็ช่วยไม่ได้!<br/>hpDrainRate = 0.02"]
    OK["No panic yet"]

    INC --> CHK_DARK
    CHK_DARK -- Yes --> PANIC1
    CHK_DARK -- No --> CHK_LIGHT
    CHK_LIGHT -- Yes --> PANIC2
    CHK_LIGHT -- No --> OK
```

### Auto-Death (No Resources)

```mermaid
flowchart TD
    CHK{{"!flashLightOn AND<br/>battery <= 0 AND<br/>!has powerbank AND<br/>!gotHammer?"}}
    DEATH["💀 ความมืดปกคลุม<br/>ประตูปิดกระแทก<br/>ขาดอากาศตาย!"]
    OK["Still have resources"]

    CHK -- Yes --> DEATH
    CHK -- No --> OK
```

---

## Critical Path (Optimal Solution)

```mermaid
flowchart LR
    S["🚪 Enter Storage"]
    S1["1. 🔦 Toggle flashlight ON"]
    S2["2. ประตูขนาดเล็ก (×2)<br/>Find + get wood_stick"]
    S3["3. ประตูบานพับ<br/>Wedge door with stick"]
    S4["4. ลังกระดาษเปิด (×3)<br/>Note → key_toolbox<br/>→ powerbank"]
    S5["5. กล่องอุปกรณ์ช่าง<br/>Unlock → get hammer"]
    S6["6. ประตูบานพับ<br/>→ hallway_f1"]

    S --> S1 --> S2 --> S3 --> S4 --> S5 --> S6
```

> [!IMPORTANT]
> **Required item from other rooms:** `smartphone` — obtained from Hallway F1 backpack. The smartphone flashlight is the only light source.

---

## Death Summary

| # | Source | Trigger | Death Message |
|---|--------|---------|---------------|
| 1 | สวิตช์ไฟ | Always on interact | ไฟฟ้าลัดวงจรช็อตตาย |
| 2 | ประตูขนาดเล็ก | 3rd interaction | ถูกกระชากลงไปในความมืด |
| 3 | onSecondTimer | doorTimer > 30 | ประตูบานพับปิดสนิท ขาดอากาศตาย |
| 4 | onSecondTimer | Battery dead + no powerbank + no hammer | ประตูปิดกระแทก ขาดอากาศตาย |

---

## Damage Sources

| Source | HP Loss | Condition |
|--------|---------|-----------|
| ลังกระดาษมีฝาปิด (first open) | -0.5 | Rat scare (first time) |
| Panic L1 (dark room) | +0.02/s drain | After 3:30 in darkness |
| Panic L2 (long stay) | +0.02/s drain | After 5:00 even with light |

---

## Item Inventory

### Required from Other Rooms

| Item | Usage in This Room |
|------|---------------------|
| `smartphone` | Flashlight (obtained from Hallway F1) |

### Obtainable in This Room

| Item | Source | Usage |
|------|--------|-------|
| `wood_stick` | ประตูขนาดเล็ก (2nd) | ✅ Wedge main door open (consumed) |
| `key_toolbox` | ลังกระดาษเปิด (2nd) | ✅ Unlock toolbox (consumed) |
| `powerbank` | ลังกระดาษเปิด (3rd) | ✅ Recharge phone battery +20% (consumed) |
| `hammer` | กล่องอุปกรณ์ช่าง | ✅ Break open laundry room door in Kitchen |
