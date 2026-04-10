# Bathroom — Player Flow

## Room Overview

The Bathroom is a multi-step puzzle room. The player must **pick up soap, take the correct pill, manage the bathtub water temperature, bathe, dry off safely, and drain the tub to find a key** — while avoiding electrical and slip hazards.

- **Entry:** Bedroom (ประตูห้องน้ำ)
- **Exit:** Bedroom (กลับเข้าห้องนอน)

---

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `bathroom_soapPicked` | `false` | Player picked up the fallen soap bottle |
| `bathroom_pillTaken` | `false` | Player took the correct pill (stops flickering & panic) |
| `bathroom_dryerUnplugged` | `false` | Hair dryer unplugged |
| `bathroom_dryerStored` | `false` | Hair dryer put away |
| `bathroom_waterFilled` | `false` | Bathtub is full of water |
| `bathroom_bathed` | `false` | Player has bathed |
| `bathroom_dried` | `false` | Player dried off with towel |
| `bathroom_waterDrained` | `false` | Bathtub drained, key found |
| `bathroom_gotKey` | `false` | Player obtained the bedroom key |
| `bathroom_doorUnlocked` | `false` | Hallway door unlocked |
| `bathroom_timer` | `0` | Seconds elapsed (panic escalation) |
| `bathroom_soapTimer` | `0` | Seconds soap has been on floor |
| `bathroom_bathtubActive` | `false` | Faucet UI is in use |
| `bathroom_bathtubVolume` | `0` | Water volume percentage |
| `bathroom_bathtubHotAmt` | `0` | Hot water amount |
| `bathroom_bathtubColdAmt` | `0` | Cold water amount |
| `bathroom_bathtubMode` | `'close'` | Current faucet mode: `hot`, `cold`, `close` |

---

## Room Entry (setupUI)

```mermaid
flowchart TD
    ENTRY["🚪 Enter from Bedroom"]
    UI["Create Pill UI, Faucet UI,<br/>Bathtub Choice UI"]

    ENTRY --> UI
```

> [!NOTE]
> `setupUI` creates three overlay UIs: pill selection, faucet controls (with water gauge), and bathtub choice (bathe/drain).

---

## All Interactable Objects

```mermaid
flowchart TD
    START(("🚿 Bathroom"))

    SOAP["ขวดสบู่<br/>(soap)"]
    CABINET["ตู้ยา<br/>(cabinet)"]
    DRYER["ไดร์เป่าผม<br/>(dryer)"]
    BATHTUB["อ่างอาบน้ำ<br/>(bathtub)"]
    DOOR_BACK["กลับเข้าห้องนอน<br/>(door_back)"]

    START --> SOAP & CABINET & DRYER & BATHTUB & DOOR_BACK
```

---

## Interactable Details

### 1. ขวดสบู่ (soap)

Pick up the fallen soap to prevent slipping death later.

```mermaid
flowchart TD
    A["Interact: ขวดสบู่"]
    CHK{{"soapPicked?"}}
    PICK["จับขวดสบู่ตั้งขึ้น<br/>soapPicked = true<br/>(hide element)"]
    NOP["(already picked)"]

    A --> CHK
    CHK -- No --> PICK
    CHK -- Yes --> NOP
```

> [!WARNING]
> If soap is not picked up within 25 seconds, the soap spill covers the entire floor. Trying to exit (`door_back`) after this causes instant death from slipping.

---

### 2. ตู้ยา (cabinet)

Choose the correct pill. Presents UI with 6 pill choices.

```mermaid
flowchart TD
    A["Interact: ตู้ยา"]
    CHK{{"pillTaken?"}}
    DONE["กินยาไปแล้ว"]
    UI["🎮 UI Choice Panel<br/>6 pill options"]

    PILL1["กระปุก 1: เม็ดสีชมพูเข้ม"]
    PILL2["กระปุก 2: แคปซูลสีเหลืองสด"]
    PILL3["กระปุก 3: ยาน้ำสีฟ้า"]
    PILL4["กระปุก 4: แคปซูลสีดำ"]
    PILL5["กระปุก 5: เม็ดใหญ่สีส้ม"]
    PILL6["กระปุก 6: ยาน้ำสีน้ำตาลเข้ม"]

    OK["✅ ทานยาสีชมพูเข้ม<br/>pillTaken = true<br/>hpDrainRate = 0<br/>ไฟหยุดกะพริบ"]
    DMG["💥 ผลข้างเคียง มึนงง!<br/>-0.25 HP"]
    DEATH["💀 สารพิษทำลายร่างกาย<br/>ตายทันที"]

    A --> CHK
    CHK -- Yes --> DONE
    CHK -- No --> UI
    UI --> PILL1 & PILL2 & PILL3 & PILL4 & PILL5 & PILL6
    PILL1 --> OK
    PILL2 --> DMG
    PILL5 --> DMG
    PILL3 --> DEATH
    PILL4 --> DEATH
    PILL6 --> DEATH
```

> [!TIP]
> The alarm clock note says "ยาเม็ดสีชมพูเข้ม" — Pill 1 is the correct choice. Pills 3, 4, 6 are instantly lethal. Pills 2, 5 deal 0.25 HP damage.

---

### 3. ไดร์เป่าผม (dryer)

Unplug and store the hair dryer to prevent electrocution.

```mermaid
flowchart TD
    A["Interact: ไดร์เป่าผม"]
    CHK_WET{{"bathed AND !dried<br/>AND !unplugged?"}}
    DEATH["💀 ตัวเปียก จับไดร์ที่เสียบปลั๊ก<br/>ไฟดูดตาย!"]
    CHK_UNPLUG{{"dryerUnplugged?"}}
    UNPLUG["ถอดปลั๊กไดร์เป่าผม<br/>dryerUnplugged = true"]
    CHK_STORE{{"dryerStored?"}}
    STORE["เก็บไดร์เข้าที่<br/>dryerStored = true"]
    DONE["(เก็บไว้เรียบร้อยแล้ว)"]

    A --> CHK_WET
    CHK_WET -- Yes --> DEATH
    CHK_WET -- No --> CHK_UNPLUG
    CHK_UNPLUG -- No --> UNPLUG
    CHK_UNPLUG -- Yes --> CHK_STORE
    CHK_STORE -- No --> STORE
    CHK_STORE -- Yes --> DONE
```

> [!CAUTION]
> If the player bathes and touches the dryer while still wet and it's plugged in → instant death.

---

### 4. อ่างอาบน้ำ (bathtub)

Multi-phase interaction: fill water → bathe/drain → dry off → drain for key.

```mermaid
flowchart TD
    A["Interact: อ่างอาบน้ำ"]
    CHK_KEY{{"doorUnlocked?"}}
    DONE_KEY["ได้กุญแจแล้ว ไม่ต้องยุ่งกับอ่าง"]

    CHK_ACTIVE{{"bathtubActive?"}}
    CHK_FILLED{{"waterFilled?"}}
    START_FAUCET["🎮 Faucet UI เปิด<br/>bathtubActive = true<br/>mode = hot"]
    REOPEN_FAUCET["🎮 Faucet UI เปิดอีกครั้ง"]

    CHK_BATHED{{"bathed?"}}
    CHK_DRAINED1{{"waterDrained?"}}
    CHOICE_UI["🎮 Bathtub Choice UI<br/>ลงแช่น้ำ / ดึงจุกระบาย"]

    CHK_DRIED{{"dried?"}}
    HAS_TOWEL{{"has towel?"}}
    DRY["เช็ดตัวจนแห้ง<br/>dried = true<br/>remove towel"]
    NO_TOWEL["❌ ไม่มีผ้าเช็ดตัว<br/>ตัวยังเปียกชุ่ม"]

    CHK_DRAINED2{{"waterDrained?"}}
    CHOICE_UI2["🎮 Bathtub Choice UI"]
    GOT_KEY["ได้กุญแจแล้ว"]

    A --> CHK_KEY
    CHK_KEY -- Yes --> DONE_KEY
    CHK_KEY -- No --> CHK_ACTIVE
    CHK_ACTIVE -- No --> CHK_FILLED
    CHK_FILLED -- No --> START_FAUCET
    CHK_ACTIVE -- Yes --> REOPEN_FAUCET
    CHK_FILLED -- Yes --> CHK_BATHED
    CHK_BATHED -- No --> CHK_DRAINED1
    CHK_DRAINED1 -- No --> CHOICE_UI
    CHK_BATHED -- Yes --> CHK_DRIED
    CHK_DRIED -- No --> HAS_TOWEL
    HAS_TOWEL -- Yes --> DRY
    HAS_TOWEL -- No --> NO_TOWEL
    CHK_DRIED -- Yes --> CHK_DRAINED2
    CHK_DRAINED2 -- No --> CHOICE_UI2
    CHK_DRAINED2 -- Yes --> GOT_KEY
```

#### Bathtub Choice — Bathe or Drain

```mermaid
flowchart TD
    CHOICE["🎮 Bathtub Choice"]
    CHK_HOT{{"hotPct > 80%?"}}
    DEATH_HOT["💀 น้ำร้อนจัด ผิวพุพอง!"]
    CHK_COLD{{"coldPct > 80%?"}}
    DEATH_COLD["💀 น้ำเย็นจัด หัวใจวาย!"]

    BATHE["ลงแช่น้ำ<br/>bathed = true"]
    DRAIN["ดึงจุกระบายน้ำ<br/>waterDrained = true<br/>gotKey = true<br/>doorUnlocked = true<br/>add key"]

    CHOICE --> CHK_HOT
    CHK_HOT -- Yes --> DEATH_HOT
    CHK_HOT -- No --> CHK_COLD
    CHK_COLD -- Yes --> DEATH_COLD
    CHK_COLD -- No --> BATHE & DRAIN
```

> [!IMPORTANT]
> Water temperature must be balanced — neither too hot (>80%) nor too cold (>80%). The safe ratio is a mix of both.

---

### 5. กลับเข้าห้องนอน (door_back)

Room exit → `bedroom`. Soap hazard check.

```mermaid
flowchart TD
    A["Interact: กลับเข้าห้องนอน"]
    CHK_SOAP{{"!soapPicked AND<br/>soapTimer > 25?"}}
    DEATH["💀 เหยียบสบู่ลื่นล้ม<br/>หัวฟาดพื้นตาย!"]
    CHK_SOAP2{{"!soapPicked?"}}
    DMG["💥 ลื่นฟองสบู่เล็กน้อย<br/>-0.2 HP"]
    EXIT["🚪 กลับเข้าห้องนอน<br/>saveCheckpoint<br/>loadRoom: bedroom"]

    A --> CHK_SOAP
    CHK_SOAP -- Yes --> DEATH
    CHK_SOAP -- No --> CHK_SOAP2
    CHK_SOAP2 -- Yes --> DMG
    CHK_SOAP2 -- No --> EXIT
    DMG --> EXIT
```

---

## Timed Events (onSecondTimer)

### Bathtub Fill System

```mermaid
flowchart TD
    CHK{{"bathtubActive AND<br/>mode != close?"}}
    FILL["volume += 10<br/>hotAmt/coldAmt += 10<br/>(based on mode)"]
    CHK_OVER{{"volume > 100?"}}
    CHK_DRYER{{"dryerUnplugged?"}}
    DEATH1["💀 น้ำล้นท่วมพื้น<br/>ไดร์เสียบปลั๊ก ไฟช็อตตาย!"]
    DEATH2["💀 น้ำล้นท่วมพื้น<br/>ลื่นล้มหัวฟาดพื้นตาย!"]
    SKIP["No fill"]

    CHK -- Yes --> FILL --> CHK_OVER
    CHK -- No --> SKIP
    CHK_OVER -- Yes --> CHK_DRYER
    CHK_DRYER -- No --> DEATH1
    CHK_DRYER -- Yes --> DEATH2
    CHK_OVER -- No --> SKIP
```

### Panic Escalation (No Pill)

```mermaid
flowchart TD
    CHK{{"pillTaken?"}}
    INC["bathroom_timer++"]
    CHK_15{{"timer > 15?"}}
    PANIC["ไฟกะพริบทำให้หลอน!<br/>hpDrainRate = 0.02"]
    OK["No panic yet"]
    SAFE["Pill taken, no panic"]

    CHK -- No --> INC --> CHK_15
    CHK_15 -- Yes --> PANIC
    CHK_15 -- No --> OK
    CHK -- Yes --> SAFE
```

### Soap Spill Escalation

```mermaid
flowchart TD
    CHK{{"soapPicked?"}}
    INC["soapTimer++"]
    CHK_25{{"soapTimer > 25?"}}
    FULL["สบู่ไหลลามเต็มพื้น อันตรายมาก!"]
    CHK_10{{"soapTimer > 10?"}}
    SPREAD["ฟองสบู่เริ่มไหลลามกว้างขึ้น"]
    OK["ยังไม่ลาม"]
    SAFE["(soap picked up)"]

    CHK -- No --> INC --> CHK_25
    CHK_25 -- Yes --> FULL
    CHK_25 -- No --> CHK_10
    CHK_10 -- Yes --> SPREAD
    CHK_10 -- No --> OK
    CHK -- Yes --> SAFE
```

---

## Critical Path (Optimal Solution)

```mermaid
flowchart LR
    S["🚪 Enter Bathroom"]
    S1["1. ขวดสบู่<br/>Pick up soap"]
    S2["2. ตู้ยา<br/>Take pill 1<br/>(สีชมพูเข้ม)"]
    S3["3. เตารีด → ถอดปลั๊ก<br/>Stand up iron, then<br/>unplug + store"]
    S4["4. อ่างอาบน้ำ<br/>Fill with balanced<br/>hot/cold water"]
    S5["5. อ่างอาบน้ำ<br/>Bathe (ลงแช่น้ำ)"]
    S6["6. อ่างอาบน้ำ<br/>Dry off with towel"]
    S7["7. อ่างอาบน้ำ<br/>Drain → get key"]
    S8["8. กลับเข้าห้องนอน<br/>→ bedroom"]

    S --> S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7 --> S8
```

> [!IMPORTANT]
> **Required item from other rooms:** `towel` — must be obtained from the Bedroom wardrobe.

---

## Death Summary

| # | Source | Trigger | Death Message |
|---|--------|---------|---------------|
| 1 | ตู้ยา → pill 3, 4, 6 | Wrong pill choice | สารเคมีพิษทำลายร่างกาย ตายทันที |
| 2 | ไดร์เป่าผม | Bathed + wet + plugged in | ไฟดูดตาย |
| 3 | อ่างอาบน้ำ | hotPct > 80% | น้ำร้อนจัด ผิวพุพอง |
| 4 | อ่างอาบน้ำ | coldPct > 80% | หัวใจวายจากน้ำเย็นจัด |
| 5 | onSecondTimer | Water overflow + dryer plugged | น้ำล้นท่วม ไดร์เสียบปลั๊ก ไฟช็อตตาย |
| 6 | onSecondTimer | Water overflow + dryer unplugged | น้ำล้นท่วม ลื่นล้มหัวฟาดพื้นตาย |
| 7 | กลับห้องนอน | !soapPicked && soapTimer > 25 | เหยียบสบู่ลื่นล้ม หัวฟาดพื้นตาย |

---

## Damage Sources

| Source | HP Loss | Condition |
|--------|---------|-----------|
| ตู้ยา → pill 2, 5 | -0.25 | Wrong but non-lethal pill |
| กลับห้องนอน (early soap) | -0.2 | Soap not picked up (< 25s) |
| Panic (no pill) | +0.02/s drain | After 15s without taking pill |

---

## Item Inventory

### Required from Other Rooms

| Item | Usage in This Room |
|------|---------------------|
| `towel` | Dry off after bathing (consumed) |

### Obtainable in This Room

| Item | Source | Usage |
|------|--------|-------|
| `key` | อ่างอาบน้ำ (drain) | ✅ Unlock bedroom hallway door |
