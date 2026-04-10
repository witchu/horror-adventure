# Living Room — Player Flow

## Room Overview

The Living Room is a complex multi-hazard room. The player must **answer the phone for a clue, find and use a TV remote, find a door knob to fix the hallway door, discover items hidden in furniture, and collect the fire extinguisher** — all while managing a TV-triggered door-breaking event and phone timing.

- **Entry:** Dining Room (ประตูห้องนั่งเล่น)
- **Exit:** Dining Room (ประตูทางเชื่อมห้องทานข้าว)

---

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `living_room_tv_on` | `true` | TV is currently on (starts on!) |
| `living_room_phone_timer` | `0` | Seconds since room entry (phone timing) |
| `living_room_phone_missed` | `false` | Phone call missed/answered |
| `living_room_tv_timer` | `0` | Seconds TV has been on (door escalation) |
| `living_room_door_broken` | `false` | Hallway door has been broken open |
| `living_room_door_fixed` | `false` | Hallway door fixed with door knob |
| `living_room_blanket_checked` | `false` | Blanket searched (TV remote) |
| `living_room_dishes_checked` | `false` | Dishes first check (cockroach scare) |
| `living_room_dishes_organized` | `false` | Dishes organized (mailbox key) |
| `living_room_drawer_open` | `false` | TV drawer opened (blue pill found) |
| `living_room_dogbed_check_count` | `0` | Dog bed search count (0→1→2) |
| `living_room_extinguisher_taken` | `false` | Fire extinguisher picked up |
| `living_room_dining_door_closed` | `false` | Dining room door is closed |

---

## Room Entry (setupUI)

```mermaid
flowchart TD
    ENTRY["🚪 Enter from Dining Room"]
    UI["Create Blue Pill Choice UI"]

    ENTRY --> UI
```

> [!NOTE]
> The TV starts ON. This immediately starts the door-breaking timer. The player should prioritize finding the remote or door knob quickly.

---

## All Interactable Objects

```mermaid
flowchart TD
    START(("🛋️ Living Room"))

    PHONE["โทรศัพท์บ้าน<br/>(phone)"]
    TV["ทีวี<br/>(tv)"]
    BLANKET["ผ้าห่มบนโซฟา<br/>(sofa_blanket)"]
    DISHES["จานชามสกปรก<br/>(dishes)"]
    DRAWER["ลิ้นชักชั้นวางทีวี<br/>(tv_drawer)"]
    DOG_BED["เบาะนอนสุนัข<br/>(dog_bed)"]
    DOG_BOWL["ชามอาหารสุนัข<br/>(dog_bowl)"]
    DOOR_HALL["ประตูโถงทางเดิน<br/>(door_hallway)"]
    DOOR_DINING["ประตูทางเชื่อมห้องทานข้าว<br/>(door_dining)"]
    DOOR_CLOSE["บานประตูห้องทานข้าว<br/>(door_dining_close)"]
    EXTINGUISHER["ถังดับเพลิง<br/>(fire_extinguisher_obj)"]

    START --> PHONE & TV & BLANKET & DISHES & DRAWER & DOG_BED & DOG_BOWL & DOOR_HALL & DOOR_DINING & DOOR_CLOSE & EXTINGUISHER
```

---

## Interactable Details

### 1. โทรศัพท์บ้าน (phone)

Answer the phone for a clue. Time-limited (20 seconds).

```mermaid
flowchart TD
    A["Interact: โทรศัพท์บ้าน"]
    CHK{{"!phone_missed AND<br/>phone_timer < 30?"}}
    ANSWER["📝 รับสาย: พกยาเม็ดสีฟ้า<br/>ระวังสัตว์เลี้ยง<br/>phone_missed = true<br/>+ addLog"]
    SILENT["โทรศัพท์เงียบสนิท"]

    A --> CHK
    CHK -- Yes --> ANSWER
    CHK -- No --> SILENT
```

> [!WARNING]
> After 20 seconds, the phone stops ringing automatically. Must answer before then. Rings at t=1 and t=10.

---

### 2. ทีวี (tv)

Toggle TV on/off. Requires remote to turn off properly.

```mermaid
flowchart TD
    A["Interact: ทีวี"]
    HAS_REMOTE{{"has tv_remote?"}}
    REM_CHK{{"tv_on?"}}
    REM_OFF["ใช้รีโมทปิดทีวี<br/>tv_on = false"]
    REM_ON["ใช้รีโมทเปิดทีวี<br/>tv_on = true"]
    NO_REM_CHK{{"tv_on?"}}
    NO_REM_ON["เปิดทีวี (ปุ่มปิดพัง)<br/>tv_on = true"]
    STUCK["❌ ทีวีเปิดค้าง ปุ่มพัง<br/>ต้องหารีโมท"]

    A --> HAS_REMOTE
    HAS_REMOTE -- Yes --> REM_CHK
    REM_CHK -- Yes --> REM_OFF
    REM_CHK -- No --> REM_ON
    HAS_REMOTE -- No --> NO_REM_CHK
    NO_REM_CHK -- No --> NO_REM_ON
    NO_REM_CHK -- Yes --> STUCK
```

> [!IMPORTANT]
> Turning TV OFF stops the door escalation timer and HP drain. Keeping it on causes increasing door-shaking events leading to death at 60 seconds.

---

### 3. ผ้าห่มบนโซฟา (sofa_blanket)

Find the TV remote.

```mermaid
flowchart TD
    A["Interact: ผ้าห่มบนโซฟา"]
    CHK{{"blanket_checked?"}}
    FIND["✅ พบรีโมททีวี!<br/>blanket_checked = true<br/>add tv_remote"]
    DONE["ไม่มีอะไรซ่อนอยู่อีก"]

    A --> CHK
    CHK -- No --> FIND
    CHK -- Yes --> DONE
```

---

### 4. จานชามสกปรก (dishes)

Two-stage search: cockroach scare then mailbox key.

```mermaid
flowchart TD
    A["Interact: จานชามสกปรก"]
    CHK1{{"dishes_checked?"}}
    SCARE["🐸 แมลงสาบวิ่งออกมา!<br/>dishes_checked = true<br/>-0.2 HP"]
    CHK2{{"dishes_organized?"}}
    ORGANIZE["✅ จัดจานชาม พบกุญแจ!<br/>dishes_organized = true<br/>add key_mailbox"]
    DONE["จัดเรียงเรียบร้อยแล้ว"]

    A --> CHK1
    CHK1 -- No --> SCARE
    CHK1 -- Yes --> CHK2
    CHK2 -- No --> ORGANIZE
    CHK2 -- Yes --> DONE
```

---

### 5. ลิ้นชักชั้นวางทีวี (tv_drawer)

Find blue pills — choose to save or eat (eat = death).

```mermaid
flowchart TD
    A["Interact: ลิ้นชักชั้นวางทีวี"]
    CHK{{"drawer_open?"}}
    UI["🎮 UI Choice Panel<br/>พบยาเม็ดสีฟ้า"]
    DONE["ลิ้นชักเปิดอยู่<br/>ไม่มียาเหลือ"]

    SAVE["เก็บไว้ยามฉุกเฉิน<br/>drawer_open = true<br/>+ addLog"]
    EAT["💀 ทานยาทั้งหมดรวดเดียว<br/>Overdose หัวใจวายตาย!"]

    A --> CHK
    CHK -- No --> UI
    CHK -- Yes --> DONE
    UI --> SAVE & EAT
```

> [!TIP]
> Always choose "เก็บไว้ยามฉุกเฉิน". Eating all pills at once causes instant death.

---

### 6. เบาะนอนสุนัข (dog_bed)

Two-stage search: fence code clue then door knob.

```mermaid
flowchart TD
    A["Interact: เบาะนอนสุนัข"]
    CHK{{"dogbed_check_count?"}}
    FIND1["📝 พบสมุดเบอร์โทร: รหัสรั้ว #3 = 1<br/>count = 1<br/>+ addLog"]
    FIND2["✅ พบลูกบิดประตู!<br/>count = 2<br/>add door_knob"]
    DONE["ไม่มีอะไรซ่อนอยู่แล้ว"]

    A --> CHK
    CHK -- "0" --> FIND1
    CHK -- "1" --> FIND2
    CHK -- "2+" --> DONE
```

---

### 7. ชามอาหารสุนัข (dog_bowl)

Pick up dog food for the Front Garden puzzle.

```mermaid
flowchart TD
    A["Interact: ชามอาหารสุนัข"]
    CHK{{"has dog_food?"}}
    GET["✅ ตักอาหารสุนัข<br/>add dog_food"]
    DONE["(already has dog_food)"]

    A --> CHK
    CHK -- No --> GET
    CHK -- Yes --> DONE
```

---

### 8. ประตูโถงทางเดิน (door_hallway)

Fix the shaking door with door knob. Opening after broken = death.

```mermaid
flowchart TD
    A["Interact: ประตูโถงทางเดิน"]
    CHK_BROKEN{{"door_broken?"}}
    DEATH["💀 สิ่งชั่วร้ายอีกฝั่ง<br/>ช็อกตาย!"]
    CHK_FIXED{{"door_fixed?"}}
    LOCKED["❌ ประตูซ่อมและล็อคแล้ว<br/>ฝืดเกินกำลังเปิด"]
    HAS_KNOB{{"has door_knob?"}}
    FIX["✅ ซ่อมลูกบิดและล็อคจากด้านใน<br/>door_fixed = true<br/>remove door_knob<br/>(ประตูหยุดสั่น)"]
    NO_KNOB["❌ ลูกบิดหลุดหาย<br/>ล็อคไม่ได้ (มันกำลังสั่น!)"]

    A --> CHK_BROKEN
    CHK_BROKEN -- Yes --> DEATH
    CHK_BROKEN -- No --> CHK_FIXED
    CHK_FIXED -- Yes --> LOCKED
    CHK_FIXED -- No --> HAS_KNOB
    HAS_KNOB -- Yes --> FIX
    HAS_KNOB -- No --> NO_KNOB
```

> [!CAUTION]
> Once `door_broken` is true (TV timer >= 60s), interacting with this door is instant death. Fix it before then.

---

### 9. ประตูทางเชื่อมห้องทานข้าว (door_dining)

Room exit → `dining_room`. Toggle open/close.

```mermaid
flowchart TD
    A["Interact: ประตูทางเชื่อมห้องทานข้าว"]
    CHK{{"dining_door_closed?"}}
    OPEN["เปิดประตู<br/>dining_door_closed = false"]
    EXIT["🚪 กลับห้องทานข้าว<br/>saveCheckpoint<br/>loadRoom: dining_room"]

    A --> CHK
    CHK -- Yes --> OPEN
    CHK -- No --> EXIT
```

---

### 10. บานประตูห้องทานข้าว (door_dining_close)

Close/open the dining door — reveals fire extinguisher behind it.

```mermaid
flowchart TD
    A["Interact: บานประตูห้องทานข้าว"]
    CHK{{"dining_door_closed?"}}
    CLOSE["ปิดประตูห้องทานข้าว<br/>dining_door_closed = true<br/>(reveals extinguisher if not taken)"]
    OPEN_BACK["เปิดประตูอ้าตามเดิม<br/>dining_door_closed = false"]

    A --> CHK
    CHK -- No --> CLOSE
    CHK -- Yes --> OPEN_BACK
```

---

### 11. ถังดับเพลิง (fire_extinguisher_obj)

Pick up fire extinguisher (hidden behind dining door).

```mermaid
flowchart TD
    A["Interact: ถังดับเพลิง"]
    CHK{{"dining_door_closed AND<br/>!extinguisher_taken?"}}
    GET["✅ หยิบถังดับเพลิง<br/>extinguisher_taken = true<br/>add fire_extinguisher"]
    DONE["เก็บไปแล้ว"]

    A --> CHK
    CHK -- Yes --> GET
    CHK -- No --> DONE
```

> [!TIP]
> The fire extinguisher is only visible when the dining room door is closed. Close the door first, then pick it up.

---

## Timed Events (onSecondTimer)

### Door Escalation (TV On)

```mermaid
flowchart TD
    CHK_TV{{"tv_on?"}}
    CHK_FIXED{{"door_fixed?"}}
    DRAIN["hpDrainRate = 0.02"]
    SAFE_DRAIN["hpDrainRate = 0"]
    CHK_BROKEN{{"door_broken?"}}
    INC["tv_timer++"]
    CHK_10{{"timer == 10?"}}
    KNOCK1["ก๊อกๆ... เสียงเคาะประตู"]
    CHK_30{{"timer == 30?"}}
    KNOCK2["ก๊อกๆๆ... เสียงถี่ขึ้น!"]
    CHK_50{{"timer == 50?"}}
    BANG["ตึง!! กระแทกประตูรุนแรง!!"]
    CHK_60{{"timer >= 60?"}}
    DEATH["💀 สิ่งชั่วร้ายพังประตูเข้ามา<br/>door_broken = true"]
    TV_OFF["tv_timer = 0<br/>hpDrainRate = 0"]

    CHK_TV -- Yes --> CHK_FIXED
    CHK_FIXED -- Yes --> SAFE_DRAIN
    CHK_FIXED -- No --> DRAIN
    DRAIN --> CHK_BROKEN
    CHK_BROKEN -- Yes --> INC
    CHK_BROKEN -- No --> INC
    INC --> CHK_60
    CHK_60 -- Yes --> DEATH
    CHK_60 -- No --> CHK_50
    CHK_50 -- Yes --> BANG
    CHK_50 -- No --> CHK_30
    CHK_30 -- Yes --> KNOCK2
    CHK_30 -- No --> CHK_10
    CHK_10 -- Yes --> KNOCK1
    CHK_TV -- No --> TV_OFF
```

> [!WARNING]
> The door shakes in intervals: 10-15s, 30-35s, 50s+. At 60 seconds with TV on, the door breaks and the player dies. Turning TV off resets the timer to 0.

### Phone Ringing

```mermaid
flowchart TD
    CHK{{"phone_missed?"}}
    INC["phone_timer++"]
    CHK_RING{{"timer == 1 OR 10?"}}
    RING["กริ๊งงง! โทรศัพท์ดัง!"]
    CHK_20{{"timer == 20?"}}
    MISSED["สายหลุดไป<br/>phone_missed = true"]
    OK["(waiting)"]
    SAFE["(already answered/missed)"]

    CHK -- No --> INC --> CHK_RING
    CHK_RING -- Yes --> RING
    CHK_RING -- No --> CHK_20
    CHK_20 -- Yes --> MISSED
    CHK_20 -- No --> OK
    CHK -- Yes --> SAFE
```

---

## Critical Path (Optimal Solution)

```mermaid
flowchart LR
    S["🚪 Enter Living Room"]
    S1["1. โทรศัพท์บ้าน<br/>Answer phone (fast!)"]
    S2["2. ผ้าห่มบนโซฟา<br/>Find TV remote"]
    S3["3. ทีวี<br/>Turn off TV"]
    S4["4. เบาะนอนสุนัข (×2)<br/>Get fence code #3<br/>+ door_knob"]
    S5["5. ประตูโถงทางเดิน<br/>Fix door with knob"]
    S6["6. จานชามสกปรก (×2)<br/>Cockroach scare<br/>+ key_mailbox"]
    S7["7. ชามอาหารสุนัข<br/>Get dog_food"]
    S8["8. ลิ้นชักชั้นวางทีวี<br/>Save blue pills"]
    S9["9. บานประตู → ถังดับเพลิง<br/>Close door, get extinguisher"]

    S --> S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7 --> S8 --> S9
```

---

## Death Summary

| # | Source | Trigger | Death Message |
|---|--------|---------|---------------|
| 1 | onSecondTimer | tv_timer >= 60 (TV on) | สิ่งชั่วร้ายพังประตูเข้ามา |
| 2 | ประตูโถงทางเดิน | door_broken + interact | ช็อกตายจากสิ่งชั่วร้าย |
| 3 | ลิ้นชักชั้นวางทีวี | Choose "ทานตอนนี้" | Overdose หัวใจวายตาย |

---

## Damage Sources

| Source | HP Loss | Condition |
|--------|---------|-----------|
| จานชามสกปรก (first check) | -0.2 | Cockroach scare (first time) |
| TV on + door not fixed | +0.02/s drain | While TV is on and door isn't fixed |

---

## Item Inventory

### Required from Other Rooms

*None required to enter. Items found here are used in other rooms.*

### Obtainable in This Room

| Item | Source | Usage |
|------|--------|-------|
| `tv_remote` | ผ้าห่มบนโซฟา | ✅ Turn off TV (used in this room) |
| `door_knob` | เบาะนอนสุนัข (2nd) | ✅ Fix hallway door (used in this room) |
| `key_mailbox` | จานชามสกปรก (2nd) | ✅ Open mailbox at Fence Gate |
| `dog_food` | ชามอาหารสุนัข | ✅ Lure dog in Front Garden |
| `fire_extinguisher` | ถังดับเพลิง (behind door) | ✅ Break window in Laundry |
