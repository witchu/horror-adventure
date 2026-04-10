# Hallway F2 — Player Flow

## Room Overview

The second-floor hallway is a short transitional hazard area. The player must **close the curtain to stop the chandelier swinging, sort the rug, and turn on the stairway light** — in strict order — before safely descending to Floor 1.

- **Entry:** Bedroom (ประตูออกโถง)
- **Exit:** Hallway F1 (บันไดลงไปชั้นล่าง), Bedroom (กลับห้องนอน)

---

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `hallway_f2_curtainClosed` | `false` | Curtain closed, chandelier stopped |
| `hallway_f2_rugSorted` | `false` | Rug straightened out |
| `hallway_f2_lightOn` | `false` | Stairway light turned on |
| `hallway_f2_chandelierSwinging` | `true` | Chandelier is currently swinging |
| `hallway_f2_chandelierTimer` | `0` | Seconds of chandelier swinging |

---

## Room Entry (setupUI)

> [!NOTE]
> `setupUI` is empty. Scene brightness is set to 0.3 (dark) until the light switch is turned on.

---

## All Interactable Objects

```mermaid
flowchart TD
    START(("🏠 Hallway F2"))

    CURTAIN["ผ้าม่านหน้าต่างบานใหญ่<br/>(curtain)"]
    RUG["พรมเช็ดเท้า<br/>(rug)"]
    SWITCH["สวิตช์ไฟขั้นบันได<br/>(light_switch)"]
    STAIRS["บันไดลงไปชั้นล่าง<br/>(stairs_down)"]
    DOOR_BED["กลับห้องนอน<br/>(door_bedroom)"]

    START --> CURTAIN & RUG & SWITCH & STAIRS & DOOR_BED
```

---

## Interactable Details

### 1. ผ้าม่านหน้าต่างบานใหญ่ (curtain)

Close curtain to stop chandelier and wind.

```mermaid
flowchart TD
    A["Interact: ผ้าม่าน"]
    CHK{{"curtainClosed?"}}
    CLOSE["✅ ปิดผ้าม่าน<br/>curtainClosed = true<br/>chandelierSwinging = false"]
    DONE["ผ้าม่านปิดสนิทแล้ว"]

    A --> CHK
    CHK -- No --> CLOSE
    CHK -- Yes --> DONE
```

---

### 2. พรมเช็ดเท้า (rug)

Straighten the rug. Must be done after chandelier stops.

```mermaid
flowchart TD
    A["Interact: พรมเช็ดเท้า"]
    CHK_SWING{{"chandelierSwinging?"}}
    DMG["💥 โคมไฟระย้าร่วงเฉี่ยว!<br/>-0.2 HP"]
    CHK_SORTED{{"rugSorted?"}}
    SORT["จัดพรมเรียบร้อย<br/>rugSorted = true"]
    DONE["พรมจัดเรียบร้อยดีแล้ว"]

    A --> CHK_SWING
    CHK_SWING -- Yes --> DMG
    CHK_SWING -- No --> CHK_SORTED
    CHK_SORTED -- No --> SORT
    CHK_SORTED -- Yes --> DONE
```

---

### 3. สวิตช์ไฟขั้นบันได (light_switch)

Turn on the stairway light. Requires chandelier stopped + rug sorted.

```mermaid
flowchart TD
    A["Interact: สวิตช์ไฟ"]
    CHK_SWING{{"chandelierSwinging?"}}
    DEATH["💀 โคมไฟระย้าหลุดร่วงลงมาทับตาย!"]
    CHK_RUG{{"rugSorted?"}}
    DMG["💥 สะดุดพรมที่พับอยู่ ล้มหัวฟาด!<br/>-0.2 HP"]
    CHK_ON{{"lightOn?"}}
    ON["✅ เปิดสวิตช์ไฟ<br/>lightOn = true<br/>มองเห็นทางลงบันได"]
    DONE["ไฟสว่างอยู่แล้ว"]

    A --> CHK_SWING
    CHK_SWING -- Yes --> DEATH
    CHK_SWING -- No --> CHK_RUG
    CHK_RUG -- No --> DMG
    CHK_RUG -- Yes --> CHK_ON
    CHK_ON -- No --> ON
    CHK_ON -- Yes --> DONE
```

---

### 4. บันไดลงไปชั้นล่าง (stairs_down)

Room exit → `hallway_f1`. All three prerequisites must be met.

```mermaid
flowchart TD
    A["Interact: บันไดลงไปชั้นล่าง"]
    CHK_SWING{{"chandelierSwinging?"}}
    DEATH1["💀 โคมไฟร่วงทับตาย!"]
    CHK_RUG{{"rugSorted?"}}
    DEATH2["💀 สะดุดพรม ตกบันไดคอหักตาย!"]
    CHK_LIGHT{{"lightOn?"}}
    DEATH3["💀 มืดเกินไป ลื่นตกบันได!"]
    EXIT["🚪 เดินลงบันไดมาชั้น 1<br/>saveCheckpoint<br/>loadRoom: hallway_f1"]

    A --> CHK_SWING
    CHK_SWING -- Yes --> DEATH1
    CHK_SWING -- No --> CHK_RUG
    CHK_RUG -- No --> DEATH2
    CHK_RUG -- Yes --> CHK_LIGHT
    CHK_LIGHT -- No --> DEATH3
    CHK_LIGHT -- Yes --> EXIT
```

> [!CAUTION]
> All three conditions (curtain closed, rug sorted, light on) must be satisfied. Failure at any step is instant death.

---

### 5. กลับห้องนอน (door_bedroom)

Room exit → `bedroom`. Always safe.

```mermaid
flowchart TD
    A["Interact: กลับห้องนอน"]
    EXIT["🚪 กลับห้องนอน<br/>saveCheckpoint<br/>loadRoom: bedroom"]

    A --> EXIT
```

---

## Timed Events (onSecondTimer)

### Chandelier Escalation

```mermaid
flowchart TD
    CHK{{"chandelierSwinging?"}}
    INC["chandelierTimer++"]
    CHK_45{{"timer > 45?"}}
    DEATH["💀 โคมไฟระย้าหลุดร่วงทับตาย!"]
    CHK_30{{"timer > 30?"}}
    WARN["โคมไฟ: แกว่งรุนแรง สายจะขาด!"]
    CHK_15{{"timer > 15?"}}
    CAUTION["โคมไฟ: แกว่งแรงขึ้น เสียงดังมาก"]
    OK["Normal swinging"]
    SAFE["Chandelier stopped"]

    CHK -- Yes --> INC --> CHK_45
    CHK_45 -- Yes --> DEATH
    CHK_45 -- No --> CHK_30
    CHK_30 -- Yes --> WARN
    CHK_30 -- No --> CHK_15
    CHK_15 -- Yes --> CAUTION
    CHK_15 -- No --> OK
    CHK -- No --> SAFE
```

> [!WARNING]
> At 45 seconds, the chandelier falls and kills the player. Close the curtain quickly!

---

## Critical Path (Optimal Solution)

```mermaid
flowchart LR
    S["🚪 Enter Hallway F2"]
    S1["1. ผ้าม่าน<br/>Close curtain"]
    S2["2. พรมเช็ดเท้า<br/>Sort rug"]
    S3["3. สวิตช์ไฟ<br/>Turn on light"]
    S4["4. บันไดลงไปชั้นล่าง<br/>→ hallway_f1"]

    S --> S1 --> S2 --> S3 --> S4
```

---

## Death Summary

| # | Source | Trigger | Death Message |
|---|--------|---------|---------------|
| 1 | สวิตช์ไฟ | chandelierSwinging | โคมไฟระย้าหลุดร่วงลงมาทับตาย |
| 2 | บันไดลงชั้นล่าง | chandelierSwinging | โคมไฟร่วงทับตาย |
| 3 | บันไดลงชั้นล่าง | !rugSorted | สะดุดพรม ตกบันไดคอหักตาย |
| 4 | บันไดลงชั้นล่าง | !lightOn | มืดเกินไป ลื่นตกบันไดหัวฟาดพื้นตาย |
| 5 | onSecondTimer | chandelierTimer > 45 | โคมไฟระย้าหลุดร่วงทับตาย |

---

## Damage Sources

| Source | HP Loss | Condition |
|--------|---------|-----------|
| พรมเช็ดเท้า | -0.2 | Interact while chandelier swinging |
| สวิตช์ไฟ | -0.2 | Interact before rug sorted |

---

## Item Inventory

### Required from Other Rooms

*None*

### Obtainable in This Room

*None*
