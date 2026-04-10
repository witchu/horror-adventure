# Laundry — Player Flow

## Room Overview

The Laundry room is a hazardous room with heat, electrical, and mechanical dangers. The player must **turn on the ventilation fan, manage the iron and washing machine, find items in the laundry basket, climb the ironing board to reach the window, and break out** — all while managing heat drain and fire risks.

- **Entry:** Kitchen (ประตูห้องซักล้าง)
- **Exit:** Front Garden (หน้าต่างบานเกร็ด), Kitchen (กลับห้องครัว)

---

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `laundry_fan_on` | `false` | Ventilation fan running |
| `laundry_iron_up` | `false` | Iron stood upright |
| `laundry_iron_plugged` | `true` | Iron still plugged in |
| `laundry_washer_has_clothes` | `false` | Clothes loaded into washer |
| `laundry_washer_running` | `false` | Washing machine is running |
| `laundry_floor_wet` | `false` | Floor is wet from washer overflow |
| `laundry_basket_empty` | `false` | Laundry basket emptied |
| `laundry_wheel_taken` | `false` | Basket wheel removed |
| `laundry_on_board` | `false` | Player is on the ironing board |
| `laundry_window_broken` | `false` | Window broken with fire extinguisher |
| `laundry_washer_timer` | `0` | Washer overflow/foam timer |
| `laundry_iron_timer` | `0` | Iron fire timer |

---

## Room Entry (setupUI)

```mermaid
flowchart TD
    ENTRY["🚪 Enter from Kitchen"]
    UI["Create Washer UI"]

    ENTRY --> UI
```

---

## All Interactable Objects

```mermaid
flowchart TD
    START(("🧺 Laundry"))

    DRYER_M["เครื่องอบผ้า<br/>(dryer)"]
    IRON["เตารีด<br/>(iron)"]
    IRON_PLUG["ปลั๊กเตารีด<br/>(iron_plug)"]
    FAN["พัดลมระบายอากาศ<br/>(fan)"]
    BASKET["ตะกร้าผ้า<br/>(basket)"]
    WASHER["เครื่องซักผ้า<br/>(washer)"]
    DOOR_GARDEN["ประตูล็อค<br/>(door_garden)"]
    PET_FLAP["ช่องสัตว์เลี้ยง<br/>(pet_flap)"]
    BOARD["โต๊ะรีดผ้า<br/>(ironing_board)"]
    WINDOW["หน้าต่างบานเกร็ด<br/>(window)"]
    DOOR_KITCHEN["กลับห้องครัว<br/>(door_kitchen)"]

    START --> DRYER_M & IRON & IRON_PLUG & FAN & BASKET & WASHER & DOOR_GARDEN & PET_FLAP & BOARD & WINDOW & DOOR_KITCHEN
```

---

## Interactable Details

> [!IMPORTANT]
> **`beforeInteract` guard:** If the player is on the ironing board and interacts with anything OTHER than `window` or `ironing_board`, they fall off and take 0.2 HP damage. The interaction is consumed.

### 1. เครื่องอบผ้า (dryer)

Non-interactive hazard.

```mermaid
flowchart TD
    A["Interact: เครื่องอบผ้า"]
    MSG["เสียงดังอื้ออึง แผ่ความร้อน<br/>ปิดไม่ได้!"]

    A --> MSG
```

---

### 2. เตารีด (iron)

Stand the iron upright (prerequisite for unplugging).

```mermaid
flowchart TD
    A["Interact: เตารีด"]
    CHK_PLUG{{"iron_plugged?"}}
    UNPLUGGED["เตารีดถูกถอดปลั๊กแล้ว ปลอดภัย"]
    CHK_UP{{"iron_up?"}}
    STAND["ตั้งเตารีดขึ้น<br/>iron_up = true<br/>(ยังเสียบปลั๊กอยู่)"]
    DONE["เตารีดถูกตั้งขึ้นแล้ว"]

    A --> CHK_PLUG
    CHK_PLUG -- No --> UNPLUGGED
    CHK_PLUG -- Yes --> CHK_UP
    CHK_UP -- No --> STAND
    CHK_UP -- Yes --> DONE
```

---

### 3. ปลั๊กเตารีด (iron_plug)

Unplug the iron. Must stand iron up first. Wet floor = death.

```mermaid
flowchart TD
    A["Interact: ปลั๊กเตารีด"]
    CHK_PLUG{{"iron_plugged?"}}
    DONE["ปลั๊กถูกถอดออกแล้ว"]
    CHK_WET{{"floor_wet?"}}
    DEATH["💀 ไฟดูด! ถอดปลั๊กขณะพื้นเปียก!"]
    CHK_UP{{"iron_up?"}}
    BLOCK["❌ ควรตั้งเตารีดขึ้นก่อน"]
    UNPLUG["✅ ถอดปลั๊กสำเร็จ<br/>iron_plugged = false"]

    A --> CHK_PLUG
    CHK_PLUG -- No --> DONE
    CHK_PLUG -- Yes --> CHK_WET
    CHK_WET -- Yes --> DEATH
    CHK_WET -- No --> CHK_UP
    CHK_UP -- No --> BLOCK
    CHK_UP -- Yes --> UNPLUG
```

---

### 4. พัดลมระบายอากาศ (fan)

Turn on ventilation to reduce heat HP drain.

```mermaid
flowchart TD
    A["Interact: พัดลมระบายอากาศ"]
    CHK{{"fan_on?"}}
    ON["✅ เปิดพัดลมระบายอากาศ<br/>fan_on = true<br/>(ลดความร้อน)"]
    DONE["พัดลมเปิดอยู่แล้ว"]

    A --> CHK
    CHK -- No --> ON
    CHK -- Yes --> DONE
```

> [!IMPORTANT]
> Without the fan on, HP drains continuously at 0.02/s. Turn it on immediately.

---

### 5. ตะกร้าผ้า (basket)

Two-stage: get dirty clothes → get basket wheel.

```mermaid
flowchart TD
    A["Interact: ตะกร้าผ้า"]
    CHK_EMPTY{{"basket_empty?"}}
    GET_CLOTHES["✅ หยิบเสื้อผ้าสกปรก<br/>basket_empty = true<br/>add dirty_clothes<br/>+ addLog: ทำให้อากาศถ่ายเท"]
    CHK_WHEEL{{"wheel_taken?"}}
    GET_WHEEL["✅ ถอดอะไหล่ล้อตะกร้า<br/>wheel_taken = true<br/>add basket_wheel"]
    EMPTY["ตะกร้าว่างเปล่า"]

    A --> CHK_EMPTY
    CHK_EMPTY -- No --> GET_CLOTHES
    CHK_EMPTY -- Yes --> CHK_WHEEL
    CHK_WHEEL -- No --> GET_WHEEL
    CHK_WHEEL -- Yes --> EMPTY
```

---

### 6. เครื่องซักผ้า (washer)

Interactive washing machine UI — start/stop and load clothes.

```mermaid
flowchart TD
    A["Interact: เครื่องซักผ้า"]
    CHK_RUN{{"washer_running?"}}

    UI_RUN["🎮 Washer UI: กำลังทำงาน"]
    STOP["หยุดการทำงาน<br/>washer_running = false"]

    UI_OFF["🎮 Washer UI: ปิดอยู่"]
    START_W["เริ่มทำงาน<br/>washer_running = true"]
    LOAD["ใส่เสื้อผ้า"]

    CHK_CLOTHES{{"has dirty_clothes?"}}
    LOADED["✅ ใส่เสื้อผ้าสกปรก<br/>washer_has_clothes = true<br/>remove dirty_clothes"]
    NO_CLOTHES["❌ ไม่มีเสื้อผ้าให้ใส่"]

    A --> CHK_RUN
    CHK_RUN -- Yes --> UI_RUN --> STOP
    CHK_RUN -- No --> UI_OFF --> START_W & LOAD
    LOAD --> CHK_CLOTHES
    CHK_CLOTHES -- Yes --> LOADED
    CHK_CLOTHES -- No --> NO_CLOTHES
```

> [!WARNING]
> Starting the washer without clothes causes foam overflow. After 20 seconds, the floor becomes wet (dangerous for unplugging iron). At 60 seconds, foam overflow kills the player.

---

### 7. ประตูล็อค (door_garden)

Locked exit to garden. Cannot be opened.

```mermaid
flowchart TD
    A["Interact: ประตูล็อค"]
    LOCKED["❌ ประตูล็อคตายจากด้านใน"]

    A --> LOCKED
```

---

### 8. ช่องสัตว์เลี้ยงบนประตู (pet_flap)

Death trap — always lethal.

```mermaid
flowchart TD
    A["Interact: ช่องสัตว์เลี้ยง"]
    DEATH["💀 ร่างกายติดอยู่กลางช่อง<br/>ขาดอากาศตาย!"]

    A --> DEATH
```

> [!CAUTION]
> Always-lethal. Never try to crawl through the pet flap.

---

### 9. โต๊ะรีดผ้า (ironing_board)

Climb up/down. Hot iron deals heavy damage if still plugged in.

```mermaid
flowchart TD
    A["Interact: โต๊ะรีดผ้า"]
    CHK_ON{{"on_board?"}}
    DOWN["ลงจากโต๊ะรีดผ้า<br/>on_board = false"]
    CHK_PLUG{{"iron_plugged?"}}
    BURN["💥 สัมผัสเตารีดร้อนจัด!!<br/>-1.0 HP<br/>on_board = true"]
    CLIMB["✅ ปีนขึ้นโต๊ะรีดผ้า<br/>on_board = true<br/>(เอื้อมถึงหน้าต่าง)"]

    A --> CHK_ON
    CHK_ON -- Yes --> DOWN
    CHK_ON -- No --> CHK_PLUG
    CHK_PLUG -- Yes --> BURN
    CHK_PLUG -- No --> CLIMB
```

---

### 10. หน้าต่างบานเกร็ด (window)

Break window and escape. Requires being on ironing board + fire extinguisher.

```mermaid
flowchart TD
    A["Interact: หน้าต่างบานเกร็ด"]
    CHK_BOARD{{"on_board?"}}
    BLOCK["❌ หน้าต่างสูงเกินไป<br/>ต้องปีนขึ้นไป"]
    CHK_BROKEN{{"window_broken?"}}
    ESCAPE["🚪 ปีนออกทางหน้าต่าง<br/>-0.2 HP (กระจกบาด)<br/>saveCheckpoint<br/>loadRoom: front_garden"]
    HAS_EXT{{"has fire_extinguisher?"}}
    BREAK["✅ ทุบกระจกแตก!<br/>window_broken = true<br/>remove fire_extinguisher"]
    STUCK["❌ หน้าต่างฝืดสนิท<br/>ต้องหาของหนักมาทุบ"]

    A --> CHK_BOARD
    CHK_BOARD -- No --> BLOCK
    CHK_BOARD -- Yes --> CHK_BROKEN
    CHK_BROKEN -- Yes --> ESCAPE
    CHK_BROKEN -- No --> HAS_EXT
    HAS_EXT -- Yes --> BREAK
    HAS_EXT -- No --> STUCK
```

---

### 11. กลับห้องครัว (door_kitchen)

Room exit → `kitchen`. Blocked if on ironing board.

```mermaid
flowchart TD
    A["Interact: กลับห้องครัว"]
    CHK{{"on_board?"}}
    BLOCK["❌ ลงจากโต๊ะรีดผ้าก่อน"]
    EXIT["🚪 กลับห้องครัว<br/>saveCheckpoint<br/>loadRoom: kitchen"]

    A --> CHK
    CHK -- Yes --> BLOCK
    CHK -- No --> EXIT
```

---

## Timed Events (onSecondTimer)

### Heat Drain

```mermaid
flowchart TD
    CHK{{"fan_on?"}}
    DRAIN["hpDrainRate = 0.02"]
    SAFE["hpDrainRate = 0"]

    CHK -- No --> DRAIN
    CHK -- Yes --> SAFE
```

### Washer Foam Overflow

```mermaid
flowchart TD
    CHK{{"washer_running?"}}
    ADD_DRAIN["hpDrainRate += 0.02<br/>(panic from shaking)"]
    CHK_CLOTHES{{"washer_has_clothes?"}}
    INC["washer_timer++"]
    CHK_20{{"timer >= 20?"}}
    WET["floor_wet = true"]
    CHK_60{{"timer >= 60?"}}
    DEATH["💀 ฟองล้นเต็มพื้น<br/>ลื่นล้ม หัวใจวายตาย!"]
    OK["Foam building..."]
    SAFE["(washer off or has clothes)"]

    CHK -- Yes --> ADD_DRAIN --> CHK_CLOTHES
    CHK_CLOTHES -- No --> INC --> CHK_60
    CHK_60 -- Yes --> DEATH
    CHK_60 -- No --> CHK_20
    CHK_20 -- Yes --> WET
    CHK_20 -- No --> OK
    CHK_CLOTHES -- Yes --> SAFE
    CHK -- No --> SAFE
```

### Iron Fire

```mermaid
flowchart TD
    CHK{{"iron_plugged AND<br/>!iron_up?"}}
    INC["iron_timer++"]
    CHK_45{{"timer >= 45?"}}
    DEATH["💀 เตารีดร้อนจัดไฟไหม้<br/>ลามมาครอกตาย!"]
    OK["Iron heating..."]
    SAFE["(unplugged or upright)<br/>iron_timer = 0"]

    CHK -- Yes --> INC --> CHK_45
    CHK_45 -- Yes --> DEATH
    CHK_45 -- No --> OK
    CHK -- No --> SAFE
```

---

## Critical Path (Optimal Solution)

```mermaid
flowchart LR
    S["🚪 Enter Laundry"]
    S1["1. พัดลมระบายอากาศ<br/>Turn on fan"]
    S2["2. เตารีด<br/>Stand iron upright"]
    S3["3. ปลั๊กเตารีด<br/>Unplug iron"]
    S4["4. ตะกร้าผ้า (×2)<br/>Get dirty_clothes<br/>+ basket_wheel"]
    S5["5. เครื่องซักผ้า<br/>Load clothes + start"]
    S6["6. โต๊ะรีดผ้า<br/>Climb up"]
    S7["7. หน้าต่างบานเกร็ด<br/>Break with extinguisher"]
    S8["8. หน้าต่างบานเกร็ด<br/>Escape to garden"]

    S --> S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7 --> S8
```

> [!IMPORTANT]
> **Required item from other rooms:** `fire_extinguisher` — obtained from Living Room (behind dining door).
>
> `basket_wheel` is used in the Dining Room to move the pendulum clock. It can be collected on a return trip.

---

## Death Summary

| # | Source | Trigger | Death Message |
|---|--------|---------|---------------|
| 1 | ปลั๊กเตารีด | Unplug while floor wet | ไฟดูด กระแสไฟฟ้าวิ่งผ่านน้ำ |
| 2 | ช่องสัตว์เลี้ยง | Always on interact | ร่างกายติดกลางช่อง ขาดอากาศตาย |
| 3 | onSecondTimer | washer_timer >= 60 (no clothes) | ฟองล้นเต็มพื้น ลื่นล้ม หัวใจวายตาย |
| 4 | onSecondTimer | iron_timer >= 45 (face down + plugged) | เตารีดร้อนจัดไฟไหม้ลามตาย |

---

## Damage Sources

| Source | HP Loss | Condition |
|--------|---------|-----------|
| Heat (no fan) | +0.02/s drain | Fan not turned on |
| Washer panic (running) | +0.02/s drain | Washer machine running |
| โต๊ะรีดผ้า (iron plugged) | -1.0 | Climb with iron still plugged |
| หน้าต่างบานเกร็ด (escape) | -0.2 | Broken glass when escaping |
| Fall from ironing board | -0.2 | Interact with non-window/board while on board |

---

## Item Inventory

### Required from Other Rooms

| Item | Usage in This Room |
|------|---------------------|
| `fire_extinguisher` | Break window glass (from Living Room) |

### Obtainable in This Room

| Item | Source | Usage |
|------|--------|-------|
| `dirty_clothes` | ตะกร้าผ้า (1st) | Load into washing machine |
| `basket_wheel` | ตะกร้าผ้า (2nd) | ✅ Fix clock wheels in Dining Room |
