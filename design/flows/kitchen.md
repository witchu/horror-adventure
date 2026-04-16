# Kitchen — Player Flow

## Room Overview

The Kitchen is a hazard-dense puzzle room. The player must **shut off the sink, kettle, and cabinet, turn off the gas stove with a 4-step directional sequence, season food correctly, and unlock the laundry room** — all while managing escalating timed dangers.

- **Entry:** Hallway F1 (ทางเข้าไปยังห้องครัว)
- **Exit:** Dining Room (ทางไปห้องทานข้าว), Laundry (ประตูห้องซักล้าง), Hallway F1 (กลับโถงทางเดิน)

---

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `kitchen_sinkOff` | `false` | Sink faucet turned off |
| `kitchen_kettleOff` | `false` | Kettle removed from stove |
| `kitchen_cabinetClosed` | `false` | Wall cabinet closed |
| `kitchen_gasNotesFound` | `false` | Found gas valve sequence note |
| `kitchen_gasStep` | `0` | (unused in code) |
| `kitchen_gasOff` | `false` | Gas stove turned off |
| `kitchen_tastedFirst` | `false` | First taste of food |
| `kitchen_ingredientsAdded` | `false` | Ingredients added to food |
| `kitchen_poisonedFood` | `false` | Poison ingredient was selected |
| `kitchen_tastedSecond` | `false` | Second taste confirmed safe |
| `kitchen_drawerRightOpened` | `false` | (unused) |
| `kitchen_cabinetOpenLevel` | `0` | Visual escalation level |
| `kitchen_waterTimer` | `0` | Sink water overflow timer |
| `kitchen_kettleTimer` | `0` | Kettle explosion timer |
| `kitchen_cabinetTimer` | `0` | Cabinet opening timer |
| `kitchen_gasTimer` | `0` | Gas smoke timer |
| `kitchen_laundry_unlocked` | `false` | Laundry door unlocked with hammer |

---

## Room Entry (setupUI)

```mermaid
flowchart TD
    ENTRY["🚪 Enter Kitchen"]
    UI["Create Ingredient UI +<br/>Stove Valve UI"]

    ENTRY --> UI
```

---

## All Interactable Objects

```mermaid
flowchart TD
    START(("🍳 Kitchen"))

    SINK["ก๊อกน้ำอ่างล้างจาน<br/>(sink)"]
    KETTLE["กาต้มน้ำ<br/>(kettle)"]
    CABINET["ตู้เก็บจานแขวนผนัง<br/>(cabinet)"]
    DRAWER_L["ลิ้นชักซ้าย<br/>(drawer_left)"]
    DRAWER_R["ลิ้นชักขวา<br/>(drawer_right)"]
    STOVE["เตาแก๊ส<br/>(stove)"]
    FOOD["อาหารบนเตา<br/>(food)"]
    FRIDGE["กระดานโน๊ตบนตู้เย็น<br/>(fridge_note)"]
    DOOR_LAUNDRY["ประตูห้องซักล้าง<br/>(door_laundry)"]
    DOOR_DINING["ทางไปห้องทานข้าว<br/>(door_dining)"]
    DOOR_HALLWAY["กลับโถงทางเดิน<br/>(door_hallway)"]

    START --> SINK & KETTLE & CABINET & DRAWER_L & DRAWER_R & STOVE & FOOD & FRIDGE & DOOR_LAUNDRY & DOOR_DINING & DOOR_HALLWAY
```

---

## Interactable Details

### 1. ก๊อกน้ำอ่างล้างจาน (sink)

Turn off the running faucet.

```mermaid
flowchart TD
    A["Interact: ก๊อกน้ำ"]
    CHK{{"sinkOff?"}}
    OFF["✅ ปิดก๊อกน้ำ<br/>sinkOff = true"]
    DONE["ก๊อกน้ำปิดดีแล้ว"]

    A --> CHK
    CHK -- No --> OFF
    CHK -- Yes --> DONE
```

---

### 2. กาต้มน้ำ (kettle)

Remove the boiling kettle from the stove.

```mermaid
flowchart TD
    A["Interact: กาต้มน้ำ"]
    CHK{{"kettleOff?"}}
    OFF["✅ ปิดและยกกาต้มน้ำออก<br/>kettleOff = true"]
    DONE["กาต้มน้ำถูกยกออกแล้ว"]

    A --> CHK
    CHK -- No --> OFF
    CHK -- Yes --> DONE
```

---

### 3. ตู้เก็บจานแขวนผนัง (cabinet)

Close the wall-mounted dish cabinet.

```mermaid
flowchart TD
    A["Interact: ตู้เก็บจาน"]
    CHK{{"cabinetClosed?"}}
    CLOSE["✅ ดันบานตู้กลับเข้าที่<br/>cabinetClosed = true"]
    DONE["ตู้เก็บจานปิดสนิทแล้ว"]

    A --> CHK
    CHK -- No --> CLOSE
    CHK -- Yes --> DONE
```

---

### 4. ลิ้นชักซ้าย (drawer_left)

Find the gas valve sequence hint.

```mermaid
flowchart TD
    A["Interact: ลิ้นชักซ้าย"]
    CHK{{"gasNotesFound?"}}
    FIND["✅ พบสมุดโน๊ตวิธีปิดเตาแก๊ส<br/>gasNotesFound = true<br/>+ addLog: ขวา→ซ้าย→ซ้าย→ขวา"]
    DONE["อ่านแล้ว"]

    A --> CHK
    CHK -- No --> FIND
    CHK -- Yes --> DONE
```

---

### 5. ลิ้นชักขวา (drawer_right)

Trap — always deals damage.

```mermaid
flowchart TD
    A["Interact: ลิ้นชักขวา"]
    DMG["💥 ของมีคมบาดมือ!<br/>-0.25 HP"]

    A --> DMG
```

> [!CAUTION]
> This drawer always damages the player. There is nothing useful inside.

---

### 6. เตาแก๊ส (stove)

Turn off gas with a 4-step directional sequence puzzle (R-L-L-R).

```mermaid
flowchart TD
    A["Interact: เตาแก๊ส"]
    CHK{{"gasOff?"}}
    DONE["วาล์วแก๊สถูกปิดสนิทแล้ว"]
    UI["🎮 Stove Valve UI<br/>Input 4 directions: L/R"]
    CHK_SEQ{{"sequence == R,L,L,R?"}}
    CORRECT["✅ เตาแก๊สถูกปิด<br/>gasOff = true"]
    WRONG["💥 หมุนผิดจังหวะ ไฟพุ่งใส่!<br/>-0.25 HP<br/>(sequence reset)"]

    A --> CHK
    CHK -- Yes --> DONE
    CHK -- No --> UI --> CHK_SEQ
    CHK_SEQ -- Yes --> CORRECT
    CHK_SEQ -- No --> WRONG
```

---

### 7. อาหารบนเตา (food)

Taste and season the food. Leads to multi-step cooking puzzle.

```mermaid
flowchart TD
    A["Interact: อาหารบนเตา"]
    CHK_GAS{{"gasOff?"}}
    DMG_HOT["💥 ร้อนเดือดลวกปาก!<br/>-0.2 HP"]
    CHK_FIRST{{"tastedFirst?"}}
    TASTE1["ชิม... ซุปจืดชืดมาก<br/>tastedFirst = true"]
    CHK_ING{{"ingredientsAdded?"}}
    ING_UI["🎮 Ingredient Choice UI<br/>6 ingredient options"]
    CHK_TASTE2{{"tastedSecond?"}}
    CHK_POISON{{"poisonedFood?"}}
    DEATH["💀 พิษเคมีทำลายร่างกาย!"]
    OK["✅ รสชาติดีปลอดภัย<br/>tastedSecond = true<br/>dining_room_drinksAppeared = true"]
    DONE["อาหารรสชาติกำลังดี"]

    A --> CHK_GAS
    CHK_GAS -- No --> DMG_HOT
    CHK_GAS -- Yes --> CHK_FIRST
    CHK_FIRST -- No --> TASTE1
    CHK_FIRST -- Yes --> CHK_ING
    CHK_ING -- No --> ING_UI
    CHK_ING -- Yes --> CHK_TASTE2
    CHK_TASTE2 -- No --> CHK_POISON
    CHK_POISON -- Yes --> DEATH
    CHK_POISON -- No --> OK
    CHK_TASTE2 -- Yes --> DONE
```

#### Ingredient Selection

```mermaid
flowchart TD
    UI["🎮 Select Ingredient"]
    I1["กระปุก 1: น้ำตาลอ่อน หอมหวาน"]
    I2["กระปุก 2: เกล็ดขาวขุ่น ไม่มีกลิ่น"]
    I3["กระปุก 3: ผงดำ กลิ่นเคมี"]
    I4["กระปุก 4: เกล็ดขาวใส ไม่มีกลิ่น"]
    I5["กระปุก 5: ผงน้ำตาลเข้ม กลิ่นฉุน"]
    I6["กระปุก 6: ผงแดง กลิ่นเผ็ดร้อน"]

    SAFE["ingredientsAdded = true"]
    POISON["ingredientsAdded = true<br/>poisonedFood = true"]

    UI --> I1 & I2 & I3 & I4 & I5 & I6
    I1 & I2 & I4 & I5 & I6 --> SAFE
    I3 --> POISON
```

> [!TIP]
> Ingredient 3 (black powder, chemical smell) is poison. All other choices are safe. After adding ingredients, taste again to confirm safety.

---

### 8. กระดานโน๊ตบนตู้เย็น (fridge_note)

Hint object — clue about eating and checking things.

```mermaid
flowchart TD
    A["Interact: กระดานโน๊ต"]
    HINT["📝 ทานอาหารด้วยนะ...<br/>+ addLog"]

    A --> HINT
```

---

### 9. ประตูห้องซักล้าง (door_laundry)

Room exit → `laundry`. Requires `hammer`.

```mermaid
flowchart TD
    A["Interact: ประตูห้องซักล้าง"]
    CHK{{"kitchen_laundry_unlocked?"}}
    EXIT["🚪 เข้าห้องซักล้าง<br/>saveCheckpoint<br/>loadRoom: laundry"]
    HAS{{"has hammer?"}}
    BREAK["✅ ใช้ค้อนทุบลูกบิดเปิด!<br/>kitchen_laundry_unlocked = true<br/>remove hammer<br/>saveCheckpoint<br/>loadRoom: laundry"]
    LOCKED["❌ ประตูล็อคสนิท<br/>ลูกบิดขึ้นสนิม ต้องหาค้อน"]

    A --> CHK
    CHK -- Yes --> EXIT
    CHK -- No --> HAS
    HAS -- Yes --> BREAK
    HAS -- No --> LOCKED
```

> [!IMPORTANT]
> `hammer` is obtained from the Storage room.

---

### 10. ทางไปห้องทานข้าว (door_dining)

Room exit → `dining_room`. Always accessible.

```mermaid
flowchart TD
    A["Interact: ทางไปห้องทานข้าว"]
    EXIT["🚪 เข้าห้องทานข้าว<br/>saveCheckpoint<br/>loadRoom: dining_room"]

    A --> EXIT
```

---

### 11. กลับโถงทางเดิน (door_hallway)

Room exit → `hallway_f1`. Always accessible.

```mermaid
flowchart TD
    A["Interact: กลับโถงทางเดิน"]
    EXIT["🚪 กลับโถงทางเดินชั้น 1<br/>saveCheckpoint<br/>loadRoom: hallway_f1"]

    A --> EXIT
```

---

## Timed Events (onSecondTimer)

### Sink Water Overflow

```mermaid
flowchart TD
    CHK{{"sinkOff?"}}
    INC["waterTimer++"]
    CHK_15{{"timer > 15?"}}
    FLOOD["น้ำท่วมพื้นห้องครัว!"]
    OK["No flood yet"]
    SAFE["(sink off)"]

    CHK -- No --> INC --> CHK_15
    CHK_15 -- Yes --> FLOOD
    CHK_15 -- No --> OK
    CHK -- Yes --> SAFE
```

### Kettle Explosion

```mermaid
flowchart TD
    CHK{{"kettleOff?"}}
    INC["kettleTimer++"]
    CHK_40{{"timer > 40?"}}
    DEATH["💀 กาต้มน้ำระเบิด!"]
    CHK_20{{"timer > 20?"}}
    WARN["กาต้มน้ำ: เสียงหวีดร้องดังมาก!"]
    OK["Normal"]
    SAFE["(kettle off)"]

    CHK -- No --> INC --> CHK_40
    CHK_40 -- Yes --> DEATH
    CHK_40 -- No --> CHK_20
    CHK_20 -- Yes --> WARN
    CHK_20 -- No --> OK
    CHK -- Yes --> SAFE
```

### Gas Smoke Drain

```mermaid
flowchart TD
    CHK{{"gasOff?"}}
    INC["gasTimer++"]
    CHK_15{{"timer > 15?"}}
    PANIC["สูดดมควันไหม้!<br/>hpDrainRate = 0.02"]
    OK["No gas effect yet"]
    SAFE["(gas off)<br/>stop drain if 0.02"]

    CHK -- No --> INC --> CHK_15
    CHK_15 -- Yes --> PANIC
    CHK_15 -- No --> OK
    CHK -- Yes --> SAFE
```

---

## Critical Path (Optimal Solution)

```mermaid
flowchart LR
    S["🚪 Enter Kitchen"]
    S1["1. ก๊อกน้ำ<br/>Turn off sink"]
    S2["2. กาต้มน้ำ<br/>Remove kettle"]
    S3["3. ตู้เก็บจาน<br/>Close cabinet"]
    S4["4. ลิ้นชักซ้าย<br/>Find gas valve note"]
    S5["5. เตาแก๊ส<br/>Input R-L-L-R"]
    S6["6. อาหารบนเตา<br/>1st taste → add<br/>non-poison ingredient<br/>→ 2nd taste confirm"]
    S7["7. ทางไปห้องทานข้าว<br/>→ dining_room"]

    S --> S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7
```

> [!IMPORTANT]
> Return here later with `hammer` (from Storage) to unlock the Laundry room.

---

## Death Summary

| # | Source | Trigger | Death Message |
|---|--------|---------|---------------|
| 1 | onSecondTimer | kettleTimer > 40 | กาต้มน้ำระเบิดใส่อย่างรุนแรง |
| 2 | อาหารบนเตา | poisonedFood + 2nd taste | พิษเคมีทำลายร่างกายนำไปสู่ความตาย |

---

## Damage Sources

| Source | HP Loss | Condition |
|--------|---------|-----------|
| อาหารบนเตา (gas on) | -0.2 | Taste while gas still on |
| ลิ้นชักขวา | -0.25 | Always on interact |
| เตาแก๊ส (wrong sequence) | -0.25 | Incorrect valve sequence |
| Gas smoke | +0.02/s drain | After 15s without turning off gas |

---

## Item Inventory

### Required from Other Rooms

| Item | Usage in This Room |
|------|---------------------|
| `hammer` | Break open laundry room door (obtained from Storage) |

### Obtainable in This Room

*No items obtainable in this room directly.*

> [!NOTE]
> The cooking puzzle triggers `dining_room_drinksAppeared = true`, which makes drinks visible in the Dining Room.
