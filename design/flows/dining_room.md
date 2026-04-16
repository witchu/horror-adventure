# Dining Room — Player Flow

## Room Overview

The Dining Room is a puzzle room with a light-switching mechanic and multiple hazards. The player must **fix the flickering light, drink tea to calm down, climb the table to reach the ceiling lamp for a key, read the newspaper for a fence code clue, and move a pendulum clock** — all while managing a coffee-induced panic timer.

- **Entry:** Kitchen (ทางไปห้องทานข้าว)
- **Exit:** Living Room (ประตูห้องนั่งเล่น), Kitchen (กลับห้องครัว)

---

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `dining_room_lightSwitchState` | `1` | Light state: 1=flickering, 0=off, 2=on |
| `dining_room_teaDrank` | `false` | Player drank mint tea (calming) |
| `dining_room_coffeeDrank` | `false` | Player drank coffee (panic trigger) |
| `dining_room_waterDrank` | `false` | Player drank water (neutralizes coffee) |
| `dining_room_newspaperRead` | `false` | Newspaper read for fence code |
| `dining_room_keyAcquired` | `false` | Storage key obtained from lamp |
| `dining_room_wheelsChecked` | `false` | Clock wheels inspected |
| `dining_room_clockMoved` | `false` | Clock moved out of doorway |
| `dining_room_drinksAppeared` | `false` | Drinks visible (set by Kitchen) |
| `dining_room_clockTimer` | `0` | Coffee panic countdown timer |

---

## Room Entry (setupUI)

```mermaid
flowchart TD
    ENTRY["🚪 Enter from Kitchen"]
    UI["Create Drink UI"]

    ENTRY --> UI
```

---

## All Interactable Objects

```mermaid
flowchart TD
    START(("🍽️ Dining Room"))

    SWITCH["สวิตช์ไฟ<br/>(switch)"]
    TABLE["โต๊ะทานข้าว<br/>(table)"]
    DRINKS["ชุดเครื่องดื่ม<br/>(drinks)"]
    NEWSPAPER["หนังสือพิมพ์<br/>(newspaper)"]
    LAMP["โคมไฟเพดาน<br/>(lamp)"]
    CLOCK["นาฬิกาลูกตุ้ม<br/>(clock)"]
    DOOR_LIVING["ประตูห้องนั่งเล่น<br/>(door_living)"]
    DOOR_KITCHEN["กลับห้องครัว<br/>(door_kitchen)"]

    START --> SWITCH & TABLE & DRINKS & NEWSPAPER & LAMP & CLOCK & DOOR_LIVING & DOOR_KITCHEN
```

---

## Interactable Details

### 1. สวิตช์ไฟ (switch)

Three-state light switch: flickering → off → on.

```mermaid
flowchart TD
    A["Interact: สวิตช์ไฟ"]
    CHK{{"lightSwitchState?"}}
    FLICKER["State 1 → 0<br/>ปิดไฟ ห้องมืด<br/>ไฟเลิกกะพริบ"]
    OFF["State 0 → 2<br/>เปิดไฟสว่างเต็มที่!"]
    ON["State 2 → 0<br/>ปิดไฟ ห้องกลับมามืด"]

    A --> CHK
    CHK -- "1 (flickering)" --> FLICKER
    CHK -- "0 (off)" --> OFF
    CHK -- "2 (on)" --> ON
```

---

### 2. โต๊ะทานข้าว (table)

Climb up/down the dining table. Requires tea drank first.

```mermaid
flowchart TD
    A["Interact: โต๊ะทานข้าว"]
    CHK_CLIMBED{{"tableClimbed?"}}
    DESCEND["ปีนลงจากโต๊ะ<br/>tableClimbed = false"]
    CHK_TEA{{"teaDrank?"}}
    DMG["💥 ยังมีอาการแพนิค<br/>ทรงตัวไม่อยู่ ตกลงมา!<br/>-0.25 HP"]
    CLIMB["✅ ปีนขึ้นโต๊ะสำเร็จ<br/>tableClimbed = true<br/>เอื้อมถึงโคมไฟได้"]

    A --> CHK_CLIMBED
    CHK_CLIMBED -- Yes --> DESCEND
    CHK_CLIMBED -- No --> CHK_TEA
    CHK_TEA -- No --> DMG
    CHK_TEA -- Yes --> CLIMB
```

---

### 3. ชุดเครื่องดื่ม (drinks)

Choose a drink. Hidden until `dining_room_drinksAppeared` is true (set by Kitchen cooking).

```mermaid
flowchart TD
    A["Interact: ชุดเครื่องดื่ม"]
    CHK_LIGHT{{"lightSwitchState == 2?"}}
    DARK["❌ ห้องมืดไป มองไม่เห็นแก้ว"]
    UI["🎮 Drink Choice UI"]

    TEA["ชามิ้นต์ (อุ่น)"]
    COFFEE["กาแฟดำ (ร้อนจัด)"]
    WATER["น้ำเปล่า (เย็น)"]

    TEA_OK["✅ ผ่อนคลาย อาการแพนิคทุเลา<br/>teaDrank = true<br/>(พร้อมปีนป่าย)"]
    COFFEE_BAD["☕ ใจเต้นแรง! Panic กำเริบ<br/>coffeeDrank = true<br/>(เริ่มจับเวลา 5 วินาที!)"]
    WATER_NEUTRAL["ดื่มน้ำชื่นใจ<br/>waterDrank = true"]
    WATER_SAVE["✅ น้ำเจือจางคาเฟอีน<br/>waterDrank = true<br/>หยุด panic countdown"]

    A --> CHK_LIGHT
    CHK_LIGHT -- No --> DARK
    CHK_LIGHT -- Yes --> UI
    UI --> TEA & COFFEE & WATER
    TEA --> TEA_OK
    COFFEE --> COFFEE_BAD
    WATER --> WATER_NEUTRAL
    WATER --> WATER_SAVE
```

> [!TIP]
> Drink tea first to prepare for climbing the table. If coffee is drunk by mistake, drink water within 5 seconds to avoid death.

> [!WARNING]
> Coffee starts a 5-second countdown. If water is not drunk in time, the player dies from panic-induced cardiac arrest.

---

### 4. หนังสือพิมพ์ (newspaper)

Read for fence code clue. Requires light on.

```mermaid
flowchart TD
    A["Interact: หนังสือพิมพ์"]
    CHK_LIGHT{{"lightSwitchState == 2?"}}
    DARK["❌ ไฟไม่สว่างพอจะอ่าน"]
    READ["📝 รอยเขียนหมึกแดง:<br/>ลำดับที่สอง คือ 2<br/>newspaperRead = true<br/>+ addLog: Fence Code 2: 2"]

    A --> CHK_LIGHT
    CHK_LIGHT -- No --> DARK
    CHK_LIGHT -- Yes --> READ
```

---

### 5. โคมไฟเพดาน (lamp)

Reach the ceiling lamp to find a key. Requires climbing table + light OFF.

```mermaid
flowchart TD
    A["Interact: โคมไฟเพดาน"]
    CHK_CLIMB{{"tableClimbed?"}}
    BLOCK["❌ โคมไฟอยู่สูงเกินไป<br/>ลองปีนโต๊ะ"]
    CHK_LIGHT{{"lightSwitchState != 0?"}}
    DEATH["💀 ไฟยังมีกระแสอยู่<br/>ลัดวงจรช็อตตาย!"]
    CHK_KEY{{"keyAcquired?"}}
    GET_KEY["✅ หยิบของที่วิบวับบนโคมไฟ<br/>keyAcquired = true<br/>add key_storage"]
    DONE["ไม่มีอะไรบนโคมไฟแล้ว"]

    A --> CHK_CLIMB
    CHK_CLIMB -- No --> BLOCK
    CHK_CLIMB -- Yes --> CHK_LIGHT
    CHK_LIGHT -- Yes --> DEATH
    CHK_LIGHT -- No --> CHK_KEY
    CHK_KEY -- No --> GET_KEY
    CHK_KEY -- Yes --> DONE
```

> [!IMPORTANT]
> The light must be OFF (state 0) when touching the lamp. If light is flickering (1) or on (2), the player is electrocuted.

---

### 6. นาฬิกาลูกตุ้ม (clock)

Move the pendulum clock to unblock the door to Living Room.

```mermaid
flowchart TD
    A["Interact: นาฬิกาลูกตุ้ม"]
    CHK_LIGHT{{"lightSwitchState == 2?"}}
    DARK["❌ มืดเกินไป ไม่อยากขยับ"]
    CHK_MOVED{{"clockMoved?"}}
    DONE["นาฬิกาถูกเลื่อนพ้นทางแล้ว"]
    CHK_WHEELS{{"wheelsChecked?"}}
    CHECK["ล้อเลื่อนพัง ต้องซ่อมก่อน<br/>wheelsChecked = true"]
    HAS_WHEEL{{"has basket_wheel?"}}
    MOVE["✅ ซ่อมล้อแล้วเลื่อนนาฬิกา<br/>clockMoved = true<br/>remove basket_wheel"]
    DEATH["💀 นาฬิกาล้มทับตาย!"]

    A --> CHK_LIGHT
    CHK_LIGHT -- No --> DARK
    CHK_LIGHT -- Yes --> CHK_MOVED
    CHK_MOVED -- Yes --> DONE
    CHK_MOVED -- No --> CHK_WHEELS
    CHK_WHEELS -- No --> CHECK
    CHK_WHEELS -- Yes --> HAS_WHEEL
    HAS_WHEEL -- Yes --> MOVE
    HAS_WHEEL -- No --> DEATH
```

> [!IMPORTANT]
> `basket_wheel` is obtained from the Laundry room (ตะกร้าผ้า, 2nd search).

---

### 7. ประตูห้องนั่งเล่น (door_living)

Room exit → `living_room`. Blocked by the pendulum clock.

```mermaid
flowchart TD
    A["Interact: ประตูห้องนั่งเล่น"]
    CHK{{"clockMoved?"}}
    BLOCK["❌ นาฬิกาลูกตุ้มบังประตู"]
    EXIT["🚪 เข้าห้องนั่งเล่น<br/>saveCheckpoint<br/>loadRoom: living_room"]

    A --> CHK
    CHK -- No --> BLOCK
    CHK -- Yes --> EXIT
```

---

### 8. กลับห้องครัว (door_kitchen)

Room exit → `kitchen`. Always accessible.

```mermaid
flowchart TD
    A["Interact: กลับห้องครัว"]
    EXIT["🚪 กลับสู่ห้องครัว<br/>saveCheckpoint<br/>loadRoom: kitchen"]

    A --> EXIT
```

---

## Timed Events (onSecondTimer)

### Coffee Panic Countdown

```mermaid
flowchart TD
    CHK{{"coffeeDrank AND<br/>!waterDrank?"}}
    INC["clockTimer++"]
    CHK_5{{"ticks >= 5?"}}
    DEATH["💀 Panic กำเริบ<br/>หัวใจวายตาย!"]
    LOG["ติ๊ก... (countdown)"]
    SAFE["(no coffee or water drank)"]

    CHK -- Yes --> INC --> CHK_5
    CHK_5 -- Yes --> DEATH
    CHK_5 -- No --> LOG
    CHK -- No --> SAFE
```

> [!CAUTION]
> After drinking coffee, the player has exactly 5 seconds to drink water. Each second announces "ติ๊ก..." in the action log.

---

## Critical Path (Optimal Solution)

```mermaid
flowchart LR
    S["🚪 Enter Dining Room"]
    S1["1. สวิตช์ไฟ (×2)<br/>flickering→off→on"]
    S2["2. ชุดเครื่องดื่ม<br/>Drink tea (ชามิ้นต์)"]
    S3["3. หนังสือพิมพ์<br/>Read fence code #2"]
    S4["4. โต๊ะทานข้าว<br/>Climb up"]
    S5["5. สวิตช์ไฟ<br/>Turn off (on→off)"]
    S6["6. โคมไฟเพดาน<br/>Get key_storage"]
    S7["7. สวิตช์ไฟ<br/>Turn on (off→on)"]
    S8["8. นาฬิกาลูกตุ้ม<br/>Move with basket_wheel"]
    S9["9. ประตูห้องนั่งเล่น<br/>→ living_room"]

    S --> S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7 --> S8 --> S9
```

> [!IMPORTANT]
> **Required items from other rooms:**
> - `basket_wheel` — from Laundry room (ตะกร้าผ้า)
> - Drinks only appear after cooking food in the Kitchen (`dining_room_drinksAppeared`)

---

## Death Summary

| # | Source | Trigger | Death Message |
|---|--------|---------|---------------|
| 1 | โคมไฟเพดาน | Light state != 0 while touching | ไฟลัดวงจรช็อตตาย |
| 2 | นาฬิกาลูกตุ้ม | Try to move without basket_wheel | นาฬิกาล้มทับตาย |
| 3 | onSecondTimer | Coffee panic >= 5 ticks | Panic หัวใจวายตาย |

---

## Damage Sources

| Source | HP Loss | Condition |
|--------|---------|-----------|
| โต๊ะทานข้าว (no tea) | -0.25 | Climb without drinking tea |

---

## Item Inventory

### Required from Other Rooms

| Item | Usage in This Room |
|------|---------------------|
| `basket_wheel` | Fix clock wheels to move it (from Laundry) |

### Obtainable in This Room

| Item | Source | Usage |
|------|--------|-------|
| `key_storage` | โคมไฟเพดาน (light off + climbed) | ✅ Unlock storage room in Hallway F1 |
