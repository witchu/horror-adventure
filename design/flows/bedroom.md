# Bedroom — Player Flow

## Room Overview

The Bedroom is the game's starting room. The player must **wake up, stabilize hazards (alarm, window, wardrobe, fan), obtain a towel, and exit** — all within a timed window before the ceiling fan breaks loose.

- **Entry:** Game start (wake up in bed)
- **Exit:** Bathroom (ประตูห้องน้ำ), Hallway F2 (ประตูออกโถง)

---

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `bedroom_stoodUp` | `false` | Player has gotten out of bed |
| `bedroom_alarmOff` | `false` | Alarm clock has been turned off |
| `bedroom_windowClosed` | `false` | Window has been closed successfully |
| `bedroom_wardrobeClosed` | `false` | Wardrobe has been closed (towel obtained) |
| `bedroom_gotTowel` | `false` | Player has the towel |
| `bedroom_doorUnlocked` | `false` | Bathroom door is unlocked |
| `bedroom_windowClosingState` | `false` | Timing toggle for window QTE |
| `bedroom_timer` | `0` | Seconds elapsed (fan danger escalation) |
| `bedroom_windowTick` | `0` | Tick counter for window swing cycle |
| `hallway_f2_unlocked` | `false` | Hallway F2 door unlocked with key |

---

## Room Entry (setupUI)

> [!NOTE]
> `setupUI` is empty — no dynamically injected UI is required for this room.

---

## All Interactable Objects

```mermaid
flowchart TD
    START(("🛏️ Bedroom"))

    BED["เตียงนอน<br/>(bed)"]
    ALARM["นาฬิกาปลุก<br/>(alarm)"]
    WINDOW["หน้าต่าง<br/>(window)"]
    WARDROBE["ตู้เสื้อผ้า<br/>(wardrobe)"]
    FAN["พัดลมเพดาน<br/>(fan)"]
    DOOR_BATH["ประตูห้องน้ำ<br/>(door_bathroom)"]
    DOOR_HALL["ประตูออกโถง<br/>(door_hallway)"]

    START --> BED & ALARM & WINDOW & WARDROBE & FAN & DOOR_BATH & DOOR_HALL
```

---

## Interactable Details

### 1. เตียงนอน (bed)

Wake up / get out of bed. First interaction required before anything else.

```mermaid
flowchart TD
    A["Interact: เตียงนอน"]
    CHK{{"stoodUp?"}}
    WAKE["ลุกขึ้นนั่งบนเตียง<br/>stoodUp = true"]
    DONE["ลงจากเตียงแล้ว ไม่ควรกลับไปนอน"]

    A --> CHK
    CHK -- No --> WAKE
    CHK -- Yes --> DONE
```

---

### 2. นาฬิกาปลุก (alarm)

Turn off alarm and find the medicine hint note.

```mermaid
flowchart TD
    A["Interact: นาฬิกาปลุก"]
    CHK_UP{{"stoodUp?"}}
    DMG1["💥 เอื้อมหยิบนาฬิการ่วงใส่หน้า<br/>-0.2 HP"]
    CHK_OFF{{"alarmOff?"}}
    OFF["✅ ปิดนาฬิกาปลุก<br/>alarmOff = true<br/>+ addLog: ยาเม็ดสีชมพูเข้ม"]
    DONE["นาฬิกาหยุดร้องแล้ว"]

    A --> CHK_UP
    CHK_UP -- No --> DMG1
    CHK_UP -- Yes --> CHK_OFF
    CHK_OFF -- No --> OFF
    CHK_OFF -- Yes --> DONE
```

---

### 3. หน้าต่าง (window)

Close the swinging window with correct timing (QTE). Toggles every 2 seconds.

```mermaid
flowchart TD
    A["Interact: หน้าต่าง"]
    CHK_UP{{"stoodUp?"}}
    BLOCK1["ยังไม่ได้ลุกจากเตียงเลย"]
    CHK_ALARM{{"alarmOff?"}}
    DMG1["💥 เดินสะดุดขอบเตียง<br/>-0.2 HP"]
    CHK_CLOSED{{"windowClosed?"}}
    DONE["หน้าต่างปิดสนิทแล้ว"]
    CHK_TIMING{{"windowClosingState?<br/>(safe timing)"}}
    SUCCESS["✅ ปิดหน้าต่างสำเร็จ<br/>windowClosed = true"]
    DEATH["💀 ดึงผิดจังหวะ!<br/>พัดตกลงไปข้างล่าง"]

    A --> CHK_UP
    CHK_UP -- No --> BLOCK1
    CHK_UP -- Yes --> CHK_ALARM
    CHK_ALARM -- No --> DMG1
    CHK_ALARM -- Yes --> CHK_CLOSED
    CHK_CLOSED -- Yes --> DONE
    CHK_CLOSED -- No --> CHK_TIMING
    CHK_TIMING -- Yes --> SUCCESS
    CHK_TIMING -- No --> DEATH
```

> [!WARNING]
> The window swings on a 2-second cycle. `windowClosingState` toggles every 2 ticks. The player must click during the "safe" phase to close it. Clicking during the "unsafe" phase causes instant death.

---

### 4. ตู้เสื้อผ้า (wardrobe)

Close the shaking wardrobe and obtain a towel. Requires window closed first.

```mermaid
flowchart TD
    A["Interact: ตู้เสื้อผ้า"]
    CHK_UP{{"stoodUp?"}}
    DMG1["💥 กลิ้งตกเตียง<br/>-0.2 HP"]
    CHK_ALARM{{"alarmOff?"}}
    DMG2["💥 เดินสะดุดขอบเตียง<br/>-0.2 HP"]
    CHK_WIN{{"windowClosed?"}}
    DMG3["💥 ตู้สั่นแรงหนีบมือ!<br/>-0.2 HP"]
    CHK_DONE{{"wardrobeClosed?"}}
    CLOSE["✅ ปิดตู้เสื้อผ้า<br/>wardrobeClosed = true<br/>gotTowel = true<br/>doorUnlocked = true<br/>add towel"]
    DONE["ตู้เสื้อผ้าปิดสนิทดีแล้ว"]

    A --> CHK_UP
    CHK_UP -- No --> DMG1
    CHK_UP -- Yes --> CHK_ALARM
    CHK_ALARM -- No --> DMG2
    CHK_ALARM -- Yes --> CHK_WIN
    CHK_WIN -- No --> DMG3
    CHK_WIN -- Yes --> CHK_DONE
    CHK_DONE -- No --> CLOSE
    CHK_DONE -- Yes --> DONE
```

---

### 5. พัดลมเพดาน (fan)

Environmental hazard — lethal when window is open.

```mermaid
flowchart TD
    A["Interact: พัดลมเพดาน"]
    CHK_UP{{"stoodUp?"}}
    SAFE_BED["อยู่บนเตียง ปลอดภัย"]
    CHK_WIN{{"windowClosed?"}}
    DEATH["💀 ใบพัดหลุดกระเด็นใส่ตาย!"]
    SAFE["พัดลมหมุนเบาลง ลอดผ่านได้"]

    A --> CHK_UP
    CHK_UP -- No --> SAFE_BED
    CHK_UP -- Yes --> CHK_WIN
    CHK_WIN -- No --> DEATH
    CHK_WIN -- Yes --> SAFE
```

---

### 6. ประตูห้องน้ำ (door_bathroom)

Room exit → `bathroom`. Requires towel (doorUnlocked).

```mermaid
flowchart TD
    A["Interact: ประตูห้องน้ำ"]
    CHK_UP{{"stoodUp?"}}
    DMG["💥 รีบร้อนลุกไปที่ประตู<br/>กลิ้งตกเตียง<br/>-0.2 HP"]
    CHK_TOWEL{{"gotTowel?"}}
    LOCKED["❌ ประตูล็อค<br/>ต้องหาผ้าเช็ดตัวก่อน"]
    EXIT["🚪 เดินเข้าสู่ห้องน้ำ<br/>saveCheckpoint<br/>loadRoom: bathroom"]

    A --> CHK_UP
    CHK_UP -- No --> DMG
    CHK_UP -- Yes --> CHK_TOWEL
    CHK_TOWEL -- No --> LOCKED
    CHK_TOWEL -- Yes --> EXIT
```

---

### 7. ประตูออกโถง (door_hallway)

Room exit → `hallway_f2`. Requires `key` item (from bathroom).

```mermaid
flowchart TD
    A["Interact: ประตูออกโถง"]
    CHK_UP{{"stoodUp?"}}
    NOP["(ไม่ทำอะไร)"]
    CHK_UNLOCKED{{"hallway_f2_unlocked?"}}
    EXIT["🚪 ไปโถงทางเดินชั้น 2<br/>saveCheckpoint<br/>loadRoom: hallway_f2"]
    HAS_KEY{{"has key?"}}
    LOCKED["❌ ประตูล็อค<br/>ต้องหากุญแจ"]
    UNLOCK["✅ ไขกุญแจเปิดประตู<br/>hallway_f2_unlocked = true<br/>remove key<br/>saveCheckpoint<br/>loadRoom: hallway_f2"]

    A --> CHK_UP
    CHK_UP -- No --> NOP
    CHK_UP -- Yes --> CHK_UNLOCKED
    CHK_UNLOCKED -- Yes --> EXIT
    CHK_UNLOCKED -- No --> HAS_KEY
    HAS_KEY -- No --> LOCKED
    HAS_KEY -- Yes --> UNLOCK
```

> [!IMPORTANT]
> The `key` item is obtained from the Bathroom (by draining the bathtub). The player must complete the Bathroom puzzle first to unlock this exit.

---

## Timed Events (onSecondTimer)

### Window Swing Cycle

```mermaid
flowchart TD
    TICK["⏱ windowTick++"]
    CHK_MOD{{"windowTick % 2 == 0?"}}
    TOGGLE["Toggle windowClosingState<br/>(safe ↔ unsafe)"]
    SKIP["No toggle"]

    TICK --> CHK_MOD
    CHK_MOD -- Yes --> TOGGLE
    CHK_MOD -- No --> SKIP
```

### Fan Escalation

```mermaid
flowchart TD
    CHK_WIN{{"windowClosed?"}}
    SAFE["No timer tick"]
    INC["bedroom_timer++"]
    CHK_45{{"timer > 45?"}}
    DEATH["💀 ใบพัดหลุดกระเด็นใส่ตาย!"]
    CHK_30{{"timer > 30?"}}
    WARN["พัดลม: สั่นแรงมาก อันตราย!"]
    CHK_15{{"timer > 15?"}}
    CAUTION["พัดลม: ส่ายเริ่มแรงขึ้น"]
    OK["Normal"]

    CHK_WIN -- Yes --> SAFE
    CHK_WIN -- No --> INC --> CHK_45
    CHK_45 -- Yes --> DEATH
    CHK_45 -- No --> CHK_30
    CHK_30 -- Yes --> WARN
    CHK_30 -- No --> CHK_15
    CHK_15 -- Yes --> CAUTION
    CHK_15 -- No --> OK
```

> [!WARNING]
> At 45 seconds without closing the window, the fan kills the player. The visual warnings begin at 15s and escalate at 30s.

---

## Critical Path (Optimal Solution)

```mermaid
flowchart LR
    S["🚪 Wake Up"]
    S1["1. เตียงนอน<br/>Stand up"]
    S2["2. นาฬิกาปลุก<br/>Turn off alarm<br/>+ read hint note"]
    S3["3. หน้าต่าง<br/>Wait for safe timing<br/>Close window"]
    S4["4. ตู้เสื้อผ้า<br/>Close wardrobe<br/>Get towel"]
    S5["5. ประตูห้องน้ำ<br/>→ bathroom"]

    S --> S1 --> S2 --> S3 --> S4 --> S5
```

> [!IMPORTANT]
> After completing the Bathroom, return here and use the `key` to exit through ประตูออกโถง → `hallway_f2`.

---

## Death Summary

| # | Source | Trigger | Death Message |
|---|--------|---------|---------------|
| 1 | หน้าต่าง | Click during unsafe timing | ดึงผิดจังหวะ! บานหน้าต่างอ้าออก พัดตกลงไปข้างล่าง |
| 2 | พัดลมเพดาน | Interact while window open | ใบพัดหลุดกระเด็นใส่ตาย |
| 3 | onSecondTimer | `bedroom_timer > 45` | พัดลมเพดานหมุนส่ายรุนแรงจนใบพัดหลุดกระเด็นใส่ตาย |

---

## Damage Sources

| Source | HP Loss | Condition |
|--------|---------|-----------|
| นาฬิกาปลุก (not stood up) | -0.2 | Interact before standing |
| หน้าต่าง (alarm not off) | -0.2 | Interact before alarm off |
| ตู้เสื้อผ้า (not stood up) | -0.2 | Interact before standing |
| ตู้เสื้อผ้า (alarm not off) | -0.2 | Interact before alarm off |
| ตู้เสื้อผ้า (window open) | -0.2 | Wardrobe shaking from wind |
| ประตูห้องน้ำ (not stood up) | -0.2 | Interact before standing |

---

## Item Inventory

### Required from Other Rooms

| Item | Usage in This Room |
|------|---------------------|
| `key` | Unlock hallway F2 door (obtained from Bathroom) |

### Obtainable in This Room

| Item | Source | Usage |
|------|--------|-------|
| `towel` | ตู้เสื้อผ้า | ✅ Dry off after bathing in Bathroom (consumed) |
