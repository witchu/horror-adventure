# Road — Player Flow

## Room Overview

The Road is the game's final area. The player must **cross the road safely using the traffic light cycle, interact with an NPC, and reach the woman on the other side** — with different outcomes determining the game's ending. The traffic light cycles every 30 seconds.

- **Entry:** Fence Gate (ประตูรั้วออกสู่ถนน)
- **Exit:** Game End (multiple endings)

---

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `road_traffic_timer` | `0` | Traffic light cycle timer (0-29) |
| `road_man_interacted` | `false` | (unused in code) |
| `road_attacked_man` | `false` | Player attacked the smoking man |
| `road_attacked_woman` | `false` | Player attacked the woman |
| `road_crossed` | `false` | Player has crossed to the other side |

---

## Room Entry (setupUI)

```mermaid
flowchart TD
    ENTRY["🚪 Enter from Fence Gate"]
    UI["Create Road Choice UI"]

    ENTRY --> UI
```

---

## All Interactable Objects

```mermaid
flowchart TD
    START(("🛣️ Road"))

    TRAFFIC["ไฟจราจร<br/>(traffic_light)"]
    MAN["ชายสูบบุหรี่<br/>(man)"]
    CROSSWALK["ข้ามทางม้าลาย<br/>(crosswalk)"]
    OUTSIDE["ข้ามนอกทางม้าลาย<br/>(road_outside)"]
    WOMAN["ผู้หญิงในเงามืด<br/>(woman)"]

    START --> TRAFFIC & MAN & CROSSWALK & OUTSIDE & WOMAN
```

> [!NOTE]
> After crossing (`road_crossed = true`): `man` and `road_outside` are hidden, `woman` becomes visible. Crossing back reverses this.

---

## Interactable Details

### 1. ไฟจราจร (traffic_light)

Check the current traffic light color.

```mermaid
flowchart TD
    A["Interact: ไฟจราจร"]
    COLOR["แสดงสีปัจจุบัน<br/>(เขียว/เหลือง/แดง)<br/>+ addLog: รอจังหวะไฟแดงค่อยข้าม"]

    A --> COLOR
```

#### Traffic Light Cycle

| Timer Range | Color | Thai |
|-------------|-------|------|
| 0–14 | 🟢 Green | เขียว |
| 15–19 | 🟡 Yellow | เหลือง |
| 20–29 | 🔴 Red | แดง |

---

### 2. ชายสูบบุหรี่ (man)

NPC encounter. Visible only before crossing.

```mermaid
flowchart TD
    A["Interact: ชายสูบบุหรี่"]
    CHK{{"attacked_man?"}}
    DEAD["ชายคนนี้นอนจมกองเลือด..."]
    UI["🎮 UI Choice Panel"]

    GREET["ทักทายอย่างสนิท"]
    CURSE["ต่อว่าอย่างหยาบคาย"]

    GREET_OK["เขาพยักหน้าตอบรับเย็นชา"]
    CHK_KNIFE{{"has fish_knife?"}}
    ATTACK["ใช้มีดแทงเขา!<br/>attacked_man = true<br/>hpDrainRate += 0.02"]
    DEATH["💀 เขาโกรธจัดทำร้ายคุณตาย!"]

    A --> CHK
    CHK -- Yes --> DEAD
    CHK -- No --> UI
    UI --> GREET & CURSE
    GREET --> GREET_OK
    CURSE --> CHK_KNIFE
    CHK_KNIFE -- Yes --> ATTACK
    CHK_KNIFE -- No --> DEATH
```

> [!WARNING]
> Cursing the man without a fish knife = instant death. Having the knife lets you attack him, which affects the ending.

---

### 3. ข้ามทางม้าลาย (crosswalk)

Cross the road at the crosswalk. Traffic light determines safety.

#### Crossing Forward (not yet crossed)

```mermaid
flowchart TD
    A["Interact: ข้ามทางม้าลาย<br/>(forward)"]
    COLOR{{"traffic light color?"}}
    GREEN["💀 ไฟเขียว รถพุ่งมาชนตาย!"]
    YELLOW["💥 ไฟเหลือง! รถเบรกทัน<br/>-0.5 HP<br/>road_crossed = true"]
    RED["✅ ไฟแดง ข้ามปลอดภัย<br/>road_crossed = true"]

    A --> COLOR
    COLOR -- Green --> GREEN
    COLOR -- Yellow --> YELLOW
    COLOR -- Red --> RED
```

#### Crossing Back (already crossed)

```mermaid
flowchart TD
    A["Interact: ข้ามทางม้าลาย<br/>(back)"]
    COLOR{{"traffic light color?"}}
    GREEN["💀 ไฟเขียว รถพุ่งมาชนตาย!"]
    YELLOW["💥 ไฟเหลือง! รีบวิ่งข้ามกลับ<br/>-0.5 HP<br/>road_crossed = false"]
    RED["✅ ไฟแดง ข้ามกลับปลอดภัย<br/>road_crossed = false"]

    A --> COLOR
    COLOR -- Green --> GREEN
    COLOR -- Yellow --> YELLOW
    COLOR -- Red --> RED
```

> [!IMPORTANT]
> Always wait for the RED light (timer 20-29) before crossing. Green light is instant death. Yellow is survivable but costly.

---

### 4. ข้ามนอกทางม้าลาย (road_outside)

Cross outside the crosswalk. Visible only before crossing.

```mermaid
flowchart TD
    A["Interact: ข้ามนอกทางม้าลาย"]
    COLOR{{"traffic light color?"}}
    MOVING["💀 รถพุ่งมาชนกระเด็นตาย!"]
    RED["🏆 ข้ามถนนนอกทางม้าลายสำเร็จ<br/>จบเกม"]

    A --> COLOR
    COLOR -- "Green/Yellow" --> MOVING
    COLOR -- Red --> RED
```

---

### 5. ผู้หญิงในเงามืด (woman)

Final NPC encounter. Visible only after crossing.

```mermaid
flowchart TD
    A["Interact: ผู้หญิงในเงามืด"]
    CHK{{"road_crossed?"}}
    FAR["เธออยู่ไกลเกินไป ต้องข้ามถนนก่อน"]
    UI["🎮 UI Choice Panel"]

    GREET["ทักทาย"]
    PASS["เดินผ่านไปเฉยๆ"]
    ATTACK["ทำร้าย"]

    WIN1["🏆 เธอยิ้มตอบรับ<br/>เดินจากไปสู่อิสรภาพ จบเกม"]
    WIN2["🏆 เลี่ยงไม่สนใจ<br/>เดินผ่านไปเงียบๆ จบเกม"]

    CHK_KNIFE{{"has fish_knife?"}}
    WIN3["🏆 ใช้มีดทำร้ายเธอ<br/>เดินจากไปในความมืด จบเกม<br/>attacked_woman = true"]
    SCREAM["เธอร้องกรี๊ด!<br/>-0.5 HP<br/>🏆 วิ่งหนีไป จบเกม"]

    A --> CHK
    CHK -- No --> FAR
    CHK -- Yes --> UI
    UI --> GREET & PASS & ATTACK
    GREET --> WIN1
    PASS --> WIN2
    ATTACK --> CHK_KNIFE
    CHK_KNIFE -- Yes --> WIN3
    CHK_KNIFE -- No --> SCREAM
```

---

## Timed Events (onSecondTimer)

### Traffic Light Cycle

```mermaid
flowchart TD
    INC["traffic_timer++"]
    CHK{{"timer >= 30?"}}
    RESET["traffic_timer = 0"]
    UPDATE["Update traffic light visual"]
    CONT["Continue cycle"]

    INC --> CHK
    CHK -- Yes --> RESET --> UPDATE
    CHK -- No --> UPDATE
```

---

## Critical Path (Optimal Solution)

```mermaid
flowchart LR
    S["🚪 Enter Road"]
    S1["1. ไฟจราจร<br/>Check light color"]
    S2["2. ⏱ Wait for RED<br/>(timer 20-29)"]
    S3["3. ข้ามทางม้าลาย<br/>Cross safely"]
    S4["4. ผู้หญิงในเงามืด<br/>Greet or walk past"]
    S5["🏆 GAME END"]

    S --> S1 --> S2 --> S3 --> S4 --> S5
```

> [!IMPORTANT]
> **Game Endings are determined by flags:**
> - `fence_house_door_opened` — killed entity in house
> - `road_attacked_man` — attacked the smoking man
> - `road_attacked_woman` — attacked the woman

---

## Game Endings

| # | Ending Name | Condition | Description |
|---|-------------|-----------|-------------|
| 1 | หลุดพ้นจากความรู้สึก | House kill, no road attacks | Liberated — killed only the house entity |
| 2 | ศัตรูอยู่รอบตัว | Any road attack | Frenzied — attacked people on the road |
| 3 | ออกจากบ้านอย่างปลอดภัย | No kills | Safe — escaped peacefully |

---

## Death Summary

| # | Source | Trigger | Death Message |
|---|--------|---------|---------------|
| 1 | ข้ามทางม้าลาย | Green light | รถพุ่งมาชนตาย |
| 2 | ข้ามทางม้าลาย (back) | Green light | รถพุ่งมาชนตาย |
| 3 | ข้ามนอกทางม้าลาย | Green/Yellow light | รถพุ่งมาชนกระเด็นตาย |
| 4 | ชายสูบบุหรี่ → ต่อว่า | No fish_knife | เขาทำร้ายคุณตาย |

---

## Damage Sources

| Source | HP Loss | Condition |
|--------|---------|-----------|
| ข้ามทางม้าลาย (yellow) | -0.5 | Cross during yellow light |
| ข้ามทางม้าลายกลับ (yellow) | -0.5 | Cross back during yellow light |
| ชายสูบบุหรี่ → ทำร้าย | +0.02/s drain | Attacked with knife (panic) |
| ผู้หญิง → ทำร้าย (no knife) | -0.5 | Scream scare damage |

---

## Item Inventory

### Required from Other Rooms

| Item | Usage in This Room |
|------|---------------------|
| `fish_knife` | Attack man/woman (affects ending), survive man confrontation |

### Obtainable in This Room

*No items obtainable. This is the final room.*
