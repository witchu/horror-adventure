const RoomData = {
  bedroom: {
    objects: [
      { id: 'bed', name: 'เตียงนอน', bounds: { left: 10, top: 60, width: 40, height: 30 },
        onInteract: (element) => {
          const flags = RoomFlags.bedroom;
          if (!flags.stoodUp) {
            flags.stoodUp = true;
            showDialogue("คุณลุกขึ้นนั่งบนเตียงอย่างงัวเงีย...");
          } else {
            showDialogue("คุณลงจากเตียงแล้ว ไม่ควรกลับไปนอนอีก");
          }
        }
      },
      { id: 'alarm', name: 'นาฬิกาปลุก', bounds: { left: 55, top: 55, width: 10, height: 10 },
        onInteract: (element) => {
          const flags = RoomFlags.bedroom;
          if (!flags.stoodUp) {
            takeDamage("เอื้อมหยิบนาฬิการ่วงใส่หน้า เพราะยังงัวเงีย");
          } else if (!flags.alarmOff) {
            flags.alarmOff = true;
            addLog("อย่าลืมทานยาเม็ดสีชมพูเข้มนะ (จากโน้ตใต้นาฬิกา)");
            showDialogue("ปิดนาฬิกาปลุกแล้ว... พบโน้ตเตือนใจ: 'อย่าลืมทานยาเม็ดสีชมพูเข้มนะ'");
          } else {
            showDialogue("นาฬิกาหยุดร้องแล้ว");
          }
        }
      },
      { id: 'window', name: 'หน้าต่าง', bounds: { left: 40, top: 20, width: 20, height: 30 }, classes: 'swinging',
        onInteract: (element) => {
          const flags = RoomFlags.bedroom;
          if (!flags.stoodUp) {
            showDialogue("ยังไม่ได้ลุกจากเตียงเลย");
            return;
          }
          if (!flags.alarmOff) {
            takeDamage("เดินสะดุดขอบเตียง เพราะยังไม่ได้ปิดนาฬิกาให้ตื่นดี");
            return;
          }
          if (!flags.windowClosed) {
            if (flags.windowClosingState) {
              flags.windowClosed = true;
              showDialogue("คุณดึงหน้าต่างปิดได้จังหวะพอดี พัดลมหมุนเบาลงแล้วและตู้เสื้อผ้าเริ่มนิ่งขึ้น");
              updateRoomVisuals('bedroom');
            } else {
              die("ดึงผิดจังหวะ! บานหน้าต่างอ้าออก พัดคุณตกลงไปข้างล่าง...");
            }
          } else {
            showDialogue("หน้าต่างปิดสนิทแล้ว");
          }
        }
      },
      { id: 'wardrobe', name: 'ตู้เสื้อผ้า', bounds: { left: 70, top: 15, width: 20, height: 60 }, classes: 'heavy-shake',
        onInteract: (element) => {
          const flags = RoomFlags.bedroom;
          if (!flags.stoodUp) {
             takeDamage("รีบร้อนลุกไปที่ตู้เสื้อผ้าจนกลิ้งตกเตียง");
             return;
          }
          if (!flags.alarmOff) {
             takeDamage("เดินสะดุดขอบเตียง เพราะยังไม่ได้ปิดนาฬิกาให้ตื่นดี");
             return;
          }
          if (!flags.windowClosed) {
            takeDamage("ตู้เสื้อผ้าสั่นแรงหนีบมือ!");
            return;
          } else if (!flags.wardrobeClosed) {
            flags.wardrobeClosed = true;
            showDialogue("คุณปิดประตูตู้เสื้อผ้าจนสนิท... มี 'ผ้าเช็ดตัว' แขวนอยู่ที่ประตู คุณจึงหยิบมา");
            addItem('towel', 'ผ้าเช็ดตัว');
            flags.gotTowel = true;
            flags.doorUnlocked = true;
            updateRoomVisuals('bedroom');
          } else {
            showDialogue("ตู้เสื้อผ้าปิดสนิทดีแล้ว");
          }
        }
      },
      { id: 'fan', name: 'พัดลมเพดาน (ลอดผ่าน)', bounds: { left: 30, top: 0, width: 40, height: 15 },
        onInteract: (element) => {
          const flags = RoomFlags.bedroom;
          if (!flags.stoodUp) {
             showDialogue("ยังนอนอยู่บนเตียง รอดพ้นจากพัดลมไปได้");
             return;
          }
          if (!flags.windowClosed) {
             die("คุณเดินเข้าไปใกล้พัดลมที่กำลังส่ายแรง ใบพัดหลุดกระเด็นใส่คุณตายคาที่...");
          } else {
             showDialogue("พัดลมหมุนเบาลงแล้ว คุณเดินลอดผ่านไปได้อย่างปลอดภัยเพื่อทำธุระต่อ");
          }
        }
      },
      { id: 'door_bathroom', name: 'ประตูห้องน้ำ', bounds: { left: 5, top: 10, width: 15, height: 35 },
        onInteract: (element) => {
          const flags = RoomFlags.bedroom;
          if (!flags.stoodUp) {
             takeDamage("รีบร้อนลุกไปที่ประตูจนกลิ้งตกเตียง");
             return;
          }
          if (!flags.gotTowel) {
             showDialogue("ประตูล็อคอยู่... ต้องหาทางเตรียมตัวให้พร้อมก่อน (ได้ผ้าเช็ดตัวแล้วประตูจะแง้มเอง)");
          } else {
             showDialogue("คุณลงมือผลักประตูเดินเข้าสู่ห้องน้ำ");
             timeInBathroom = 0;
             inventory.saveCheckpoint('bathroom');
             loadRoom('bathroom');
          }
        }
      },
      { id: 'door_hallway', name: 'ประตูออกโถง', bounds: { left: 85, top: 20, width: 15, height: 40 },
        onInteract: (element) => {
          const flags = RoomFlags.bedroom;
          if (!flags.stoodUp) return;
          if (!hasItem('key')) {
             showDialogue("ประตูล็อคแน่นหนา ต้องหากุญแจมาไขเปิดเท่านั้น");
          } else {
             removeItem('key');
             showDialogue("คุณไขกุญแจและผลักประตูเปิดออกไปสู่โถงทางเดินชั้น 2...");
             inventory.saveCheckpoint('hallway_f2');
             loadRoom('hallway_f2');
          }
        }
      }
    ],
    decorations: []
  },
  bathroom: {
    objects: [
      { id: 'soap', name: 'ขวดสบู่', bounds: { left: 20, top: 80, width: 10, height: 10 },
        onInteract: (element) => {
          const flags = RoomFlags.bathroom;
          if (!flags.soapPicked) {
            flags.soapPicked = true;
            showDialogue("คุณจับขวดสบู่ที่หกตั้งขึ้นมา ป้องกันการลื่นล้ม");
            element.style.display = 'none';
          }
        }
      },
      { id: 'cabinet', name: 'ตู้ยา', bounds: { left: 45, top: 15, width: 15, height: 20 },
        onInteract: (element) => {
          const flags = RoomFlags.bathroom;
          if (!flags.pillTaken) {
              openPillUI();
          } else {
              showDialogue("คุณกินยาไปแล้ว ไม่มียาอื่นที่ต้องกินอีก");
          }
        }
      },
      { id: 'dryer', name: 'ไดร์เป่าผม (เสียบปลั๊ก)', bounds: { left: 60, top: 80, width: 15, height: 10 },
        onInteract: (element) => {
          const flags = RoomFlags.bathroom;
          if (flags.bathed && !flags.dried && !flags.dryerUnplugged) {
             die("ตัวเปียกๆ เอื้อมไปจับไดร์เป่าผมที่เสียบปลั๊กไฟอยู่ ไฟดูดตายสนิท!");
             return;
          }
          if (!flags.dryerUnplugged) {
              flags.dryerUnplugged = true;
              showDialogue("คุณถอดปลั๊กไดร์เป่าผมเรียบร้อยแล้ว");
              updateRoomVisuals('bathroom');
          } else if (!flags.dryerStored) {
              flags.dryerStored = true;
              showDialogue("เก็บไดร์เป่าผมเข้าที่เรียบร้อย ปลอดภัยหายห่วง");
              updateRoomVisuals('bathroom');
          }
        }
      },
      { id: 'bathtub', name: 'อ่างอาบน้ำ', bounds: { left: 65, top: 40, width: 30, height: 40 },
        onInteract: (element) => {
          const flags = RoomFlags.bathroom;
          if (!flags.doorUnlocked) {
            if (!bathtubState.active && !flags.waterFilled) {
               bathtubState.active = true;
               bathtubState.mode = 'hot';
               openFaucetUI();
            } else if (bathtubState.active && !flags.waterFilled) {
               openFaucetUI();
            } else if (flags.waterFilled && !flags.bathed && !flags.waterDrained) {
               openBathtubChoiceUI();
            } else if (flags.bathed && !flags.dried) {
               if (hasItem('towel')) {
                   flags.dried = true;
                   removeItem('towel');
                   showDialogue("คุณใช้ผ้าเช็ดตัวเช็ดตัวจนแห้งสนิท (ของถูกใช้ไปแล้ว) ปลอดภัยจากไฟดูด!");
               } else {
                   showDialogue("ขึ้นจากอ่างแล้วแต่คุณไม่มีผ้าเช็ดตัว ตัวยังเปียกชุ่ม... ระวังอุปกรณ์ไฟฟ้าให้ดี!");
               }
            } else if (flags.bathed && flags.dried && !flags.waterDrained) {
               openBathtubChoiceUI();
            } else if (flags.waterDrained && flags.gotKey) {
               showDialogue("คุณได้กุญแจจากการระบายน้ำไปเรียบร้อยแล้ว");
            }
          } else {
              showDialogue("ได้กุญแจแล้ว... ไม่ต้องยุ่งกับอ่างอีก");
          }
        }
      },
      { id: 'door_back', name: 'กลับเข้าห้องนอน', bounds: { left: 5, top: 15, width: 15, height: 60 },
        onInteract: (element) => {
          const flags = RoomFlags.bathroom;
          if (!flags.soapPicked && roomTimers.bathroomSoap > 25) {
            die("คุณเหยียบสบู่ที่ไหลลามจนเต็มพื้น ลื่นล้มหัวฟาดพื้นตายคาที่...");
            return;
          } else if (!flags.soapPicked) {
            takeDamage("ลื่นฟองสบู่เล็กน้อย โชคดีที่ยังไหลออกมาไม่เยอะ");
          }
          showDialogue("คุณเดินย้อนกลับเข้ามาในห้องนอน");
          inventory.saveCheckpoint('bedroom');
          loadRoom('bedroom');
        }
      }
    ],
    decorations: [
      { id: 'soap-spill', name: 'ฟองสบู่บนพื้น (กองเล็ก)', bounds: { left: 20, top: 90, width: 20, height: 10 },
        onInteract: (element) => {}
      }
    ]
  },
  hallway_f2: {
    objects: [
      { id: 'curtain', name: 'ผ้าม่านหน้าต่างบานใหญ่', bounds: { left: 20, top: 20, width: 30, height: 50 },
        onInteract: (element) => {
          const flags = RoomFlags.hallway_f2;
          if (!flags.curtainClosed) {
            flags.curtainClosed = true;
            showDialogue("คุณปิดผ้าม่านบานใหญ่... โคมไฟระย้าหยุดแกว่ง โถงทางเดินเริ่มมืดลง");
            updateRoomVisuals('hallway_f2');
          } else {
            showDialogue("ผ้าม่านปิดสนิทแล้ว");
          }
        }
      },
      { id: 'rug', name: 'พรมเช็ดเท้า', bounds: { left: 30, top: 80, width: 40, height: 15 },
        onInteract: (element) => {
          const flags = RoomFlags.hallway_f2;
          if (!flags.chandelierSwinging && !flags.rugSorted) {
            flags.rugSorted = true;
            showDialogue("คุณจัดพรมเช็ดเท้าให้เรียบร้อยเพื่อไม่ให้สะดุดเวลาเดิน");
            updateRoomVisuals('hallway_f2');
          } else if (flags.chandelierSwinging) {
             takeDamage("ขณะเอื้อมไปจัดพรม โคมไฟระย้าที่แกว่งอยู่ร่วงลงมาเฉี่ยวคุณอย่างหวุดหวิด!");
          } else {
             showDialogue("พรมจัดเรียบร้อยดีแล้ว");
          }
        }
      },
      { id: 'light_switch', name: 'สวิตช์ไฟขั้นบันได', bounds: { left: 80, top: 30, width: 10, height: 20 },
        onInteract: (element) => {
          const flags = RoomFlags.hallway_f2;
          if (flags.chandelierSwinging) {
              die("ยังไม่ทันได้กดสวิตช์ โคมไฟระย้าก็หลุดร่วงลงมาทับคุณตายทันที!");
              return;
          }
          if (!flags.rugSorted) {
              takeDamage("ขณะเอื้อมกดปุ่ม คุณสะดุดพรมที่พับอยู่ล้มหัวฟาด!");
              return;
          }
          if (!flags.lightOn) {
              flags.lightOn = true;
              showDialogue("คุณกดเปิดสวิตช์ไฟ ไฟทางเดินบันไดสว่างขึ้น มองเห็นเส้นทางลงไปชั้น 1 ชัดเจน");
              updateRoomVisuals('hallway_f2');
          } else {
              showDialogue("ไฟสว่างอยู่แล้ว");
          }
        }
      },
      { id: 'stairs_down', name: 'บันไดลงไปชั้นล่าง', bounds: { left: 40, top: 40, width: 20, height: 40 },
        onInteract: (element) => {
          const flags = RoomFlags.hallway_f2;
          if (flags.chandelierSwinging) {
              die("ยังไม่ทันก้าวลงบันได โคมไฟระย้าก็หลุดร่วงลงมาทับคุณตายทันที!");
              return;
          }
          if (!flags.rugSorted) {
              die("คุณสะดุดพรมที่ยับยู่ยี่ หัวคะมำตกบันไดคอหักตาย!");
              return;
          }
          if (!flags.lightOn) {
              die("ทางลงบันไดมืดเกินไป คุณก้าวพลาดลื่นตกบันไดหัวฟาดพื้นตาย!");
              return;
          }
          showDialogue("คุณเดินลงบันไดมายังโถงทางเดินชั้น 1");
          inventory.saveCheckpoint('hallway_f1');
          loadRoom('hallway_f1');
        }
      }
    ],
    decorations: [
      { id: 'chandelier', name: 'โคมไฟระย้า', bounds: { left: 30, top: -10, width: 40, height: 30 }, classes: 'chandelier-swing swinging',
        onInteract: (element) => {}
      }
    ]
  },
  hallway_f1: {
    objects: [
      { id: 'backpack', name: 'กระเป๋าสะพาย', bounds: { left: 25, top: 70, width: 15, height: 15 },
        onInteract: (element) => {
          const flags = RoomFlags.hallway_f1;
          if (!flags.backpackSearched1) {
              flags.backpackSearched1 = true;
              showDialogue("ค้นครั้งแรกพบบอดี้พาสพนักงาน... คุณจดเบาะแสรั้วลำดับที่ 1 ลงสมุดบันทึก");
              addLog("เบาะแสรั้วลำดับที่ 1 จากบัตรพนักงาน");
          } else if (!flags.backpackSearched2) {
              flags.backpackSearched2 = true;
              showDialogue("ค้นต่อ... เจอสมาร์ทโฟน! (แบต 100%) ใช้เปิดไฟฉายได้ถ้าจำเป็น");
              addItem('smartphone', 'สมาร์ทโฟน');
              GameState.smartphoneBattery = 100;
          } else {
              showDialogue("ไม่มีอะไรในกระเป๋าแล้ว");
          }
        }
      },
      { id: 'door_living', name: 'ประตูห้องนั่งเล่น', bounds: { left: 80, top: 10, width: 15, height: 50 },
        onInteract: (element) => {
          showDialogue("ประตูล็อค หรือ ทางนี้ยังไปไม่ได้");
        }
      },
      { id: 'door_storage', name: 'ประตูห้องเก็บของ', bounds: { left: 60, top: 10, width: 15, height: 50 },
        onInteract: (element) => {
          const flags = RoomFlags.hallway_f1;
          if (flags.storageUnlocked) {
              showDialogue("ประตูห้องเก็บของถูกปลดล็อคแล้ว คุณเดินเข้าไปในความมืดที่รออยู่...");
              inventory.saveCheckpoint('storage');
              loadRoom('storage');
          } else if (hasItem('key_storage')) {
              removeItem('key_storage');
              flags.storageUnlocked = true;
              showDialogue("คุณใช้กุญแจห้องเก็บของไขเปิดประตู และเดินเข้าไปในความมืดที่รออยู่...");
              inventory.saveCheckpoint('storage');
              loadRoom('storage');
          } else {
              showDialogue("ประตูล็อค หรือ ทางนี้ยังไปไม่ได้ (ต้องการกุญแจห้องเก็บของ)");
          }
        }
      },
      { id: 'door_kitchen', name: 'ทางเข้าไปยังห้องครัว', bounds: { left: 0, top: 20, width: 15, height: 70 },
        onInteract: (element) => {
          showDialogue("ประตูเปิดออกสู่ห้องครัว...");
          inventory.saveCheckpoint('kitchen');
          loadRoom('kitchen');
        }
      },
      { id: 'stairs_up', name: 'บันไดขึ้นชั้น 2', bounds: { left: 40, top: 60, width: 40, height: 40 },
        onInteract: (element) => {
          showDialogue("คุณเดินขึ้นบันไดกลับไปยังชั้น 2");
          loadRoom('hallway_f2');
        }
      }
    ],
    decorations: []
  },
  kitchen: {
    objects: [
      { id: 'sink', name: 'ก๊อกน้ำอ่างล้างจาน', bounds: { left: 10, top: 40, width: 20, height: 30 },
        onInteract: (element) => {
          const flags = RoomFlags.kitchen;
          if (!flags.sinkOff) {
              flags.sinkOff = true;
              showDialogue("คุณรีบปิดก๊อกน้ำ น้ำหยุดไหลลงพื้นแล้ว (ลื่นลดลง)");
              updateRoomVisuals('kitchen');
          } else {
              showDialogue("ก๊อกน้ำปิดดีแล้ว");
          }
        }
      },
      { id: 'kettle', name: 'กาต้มน้ำ', bounds: { left: 35, top: 35, width: 15, height: 20 }, classes: 'light-shake',
        onInteract: (element) => {
          const flags = RoomFlags.kitchen;
          if (!flags.kettleOff) {
              flags.kettleOff = true;
              showDialogue("คุณปิดและยกกาต้มน้ำออกจากเตา เสียงหวีดร้องเงียบลงแล้ว");
              updateRoomVisuals('kitchen');
          } else {
              showDialogue("กาต้มน้ำถูกยกออกแล้ว");
          }
        }
      },
      { id: 'cabinet', name: 'ตู้เก็บจานแขวนผนัง', bounds: { left: 10, top: 10, width: 30, height: 20 },
        onInteract: (element) => {
          const flags = RoomFlags.kitchen;
          if (!flags.cabinetClosed) {
              flags.cabinetClosed = true;
              showDialogue("คุณดันบานตู้กลับเข้าที่จนล็อคสนิท ไม่มีจานชามตกลงมาแล้ว");
              updateRoomVisuals('kitchen');
          } else {
              showDialogue("ตู้เก็บจานปิดสนิทแล้ว");
          }
        }
      },
      { id: 'drawer_left', name: 'ลิ้นชักซ้าย', bounds: { left: 10, top: 75, width: 15, height: 20 },
        onInteract: (element) => {
          const flags = RoomFlags.kitchen;
          if (!flags.gasNotesFound) {
              flags.gasNotesFound = true;
              showDialogue("เปิดลิ้นชักออก พบสมุดโน๊ตเขียนวิธีปิดเตาแก๊ส คุณจดไว้ในบันทึก");
              addLog("ลำดับหมุนวาล์วเตาแก๊ส: ขวา -> ซ้าย -> ซ้าย -> ขวา");
          } else {
              showDialogue("ในนี้มีแค่สมุดโน๊ตที่คุณอ่านแล้ว");
          }
        }
      },
      { id: 'drawer_right', name: 'ลิ้นชักขวา', bounds: { left: 30, top: 75, width: 15, height: 20 },
        onInteract: (element) => {
          takeDamage("เปิดลิ้นชักออกอย่างรวดเร็ว โดนของมีคมด้านในบาดมือ!", 0.25);
        }
      },
      { id: 'stove', name: 'เตาแก๊ส', bounds: { left: 55, top: 45, width: 20, height: 20 },
        onInteract: (element) => {
          const flags = RoomFlags.kitchen;
          if (!flags.gasOff) {
              openStoveUI();
          } else {
              showDialogue("วาล์วแก๊สถูกปิดสนิทแล้ว");
          }
        }
      },
      { id: 'food', name: 'อาหารบนเตา', bounds: { left: 60, top: 35, width: 10, height: 10 },
        onInteract: (element) => {
          const flags = RoomFlags.kitchen;
          if (!flags.gasOff) {
              takeDamage("จะไปชิมอาหารที่กำลังไฟลุกได้ยังไง! ร้อนเดือดลวกปาก!");
              return;
          }
          if (!flags.tastedFirst) {
              flags.tastedFirst = true;
              showDialogue("คุณใช้ช้อนตักชิม... 'เป็นซุปที่จืดชืดมาก'");
          } else if (!flags.ingredientsAdded && flags.tastedFirst) {
              openKitchenUI();
          } else if (flags.ingredientsAdded && !flags.tastedSecond) {
              if (flags.poisonedFood) {
                  die("พิษเคมีทำลายระบบร่างกายอย่างรุนแรง นำไปสู่ความตาย");
              } else {
                  flags.tastedSecond = true;
                  RoomFlags.dining_room.drinksAppeared = true;
                  showDialogue("อาหารรสชาติดีและปลอดภัย... คุณรู้สึกว่ารอดจากพิษแล้ว");
              }
          } else if (flags.ingredientsAdded && flags.tastedSecond) {
              showDialogue("อาหารรสชาติกำลังดีแล้ว นำไปทานได้เลย");
          }
        }
      },
      { id: 'fridge_note', name: 'กระดานโน๊ตบนตู้เย็น', bounds: { left: 85, top: 40, width: 10, height: 30 },
        onInteract: (element) => {
          showDialogue("กระดานโน๊ตเขียนว่า: 'ทานอาหารด้วยนะ ฉันอุ่นเตรียมไว้ให้แล้ว...แต่รสชาติอาจไม่ถูกใจคุณเท่าไหร่ และอย่าลืมตรวจสอบทุกอย่างให้เรียบร้อยก่อนออกไปด้วยล่ะ'");
          addLog("พ่อบ้าน/แม่บ้านโน๊ตไว้: ทานอาหารด้วยนะ ฉันอุ่นเตรียมไว้ให้แล้ว...");
        }
      },
      { id: 'door_laundry', name: 'ประตูห้องซักล้าง', bounds: { left: 80, top: 70, width: 15, height: 25 },
        onInteract: (element) => {
          if (hasItem('hammer')) {
              showDialogue("คุณใช้ค้อนพังประตูห้องซักล้างจนพังทลายลงมา! ทางหนีถูกเปิดออกแล้ว...");
              els.winScreen.classList.remove('hidden'); // CLEARED END DEMO
          } else {
              showDialogue("ประตูล็อคสนิท ลูกบิดขึ้นสนิม... ต้องหาค้อนหรืออะไรบางอย่างมาพังมัน");
          }
        }
      },
      { id: 'door_dining', name: 'ทางไปห้องทานข้าว', bounds: { left: 0, top: 20, width: 10, height: 60 },
        onInteract: (element) => {
          showDialogue("คุณเดินเปิดประตูเข้าไปยังห้องทานข้าว...");
          inventory.saveCheckpoint('dining_room');
          loadRoom('dining_room');
        }
      },
      { id: 'door_hallway', name: 'กลับโถงทางเดิน', bounds: { left: 40, top: 85, width: 20, height: 10 },
        onInteract: (element) => {
          showDialogue("กลับออกไปโถงทางเดินชั้น 1");
          inventory.saveCheckpoint('hallway_f1');
          loadRoom('hallway_f1');
        }
      }
    ],
    decorations: [
      { id: 'water_spill', name: 'น้ำท่วมพื้น', bounds: { left: 0, top: 80, width: 40, height: 20 }, classes: 'hidden',
        onInteract: (element) => {}
      },
      { id: 'smoke', name: 'ควันไหม้', bounds: { left: 50, top: 10, width: 30, height: 30 }, classes: 'smoke-effect',
        onInteract: (element) => {}
      }
    ]
  },
  dining_room: {
    objects: [
      { id: 'switch', name: 'สวิตช์ไฟ', bounds: { left: 10, top: 40, width: 5, height: 10 },
        onInteract: (element) => {
           const flags = RoomFlags.dining_room;
           if (flags.lightSwitchState === 1) { // Flickering -> Off
               flags.lightSwitchState = 0;
               showDialogue("คุณกดสวิตช์ปิดไฟ... ห้องมืดลงอย่างน่าสะพรึง แต่ไฟเลิกกะพริบ");
               updateRoomVisuals('dining_room');
           } else if (flags.lightSwitchState === 0) { // Off -> On
               flags.lightSwitchState = 2;
               showDialogue("คุณกดสวิตช์อีกครั้ง... ไฟสว่างเต็มที่แล้ว! เห็นชุดเครื่องดื่มและหนังสือพิมพ์ชัดเจน");
               updateRoomVisuals('dining_room');
           } else { // On -> Off
               flags.lightSwitchState = 0;
               showDialogue("คุณกดสวิตช์ปิดไฟ... ห้องกลับมามืดสนิทอีกครั้ง");
               updateRoomVisuals('dining_room');
           }
        }
      },
      { id: 'table', name: 'โต๊ะทานข้าว', bounds: { left: 20, top: 60, width: 60, height: 30 },
        onInteract: (element) => {
           const flags = RoomFlags.dining_room;
           if (flags.tableClimbed) {
               flags.tableClimbed = false;
               showDialogue("คุณปีนลงมาจากโต๊ะทานข้าวอย่างระมัดระวัง");
               return;
           }
           if (!flags.teaDrank) {
               takeDamage("คุณปีนขึ้นไปบนโต๊ะทั้งที่ยังมีอาการแพนิค... ทรงตัวไม่อยู่และตกลงมาบาดเจ็บ!", 0.25);
               return;
           }
           flags.tableClimbed = true;
           showDialogue("คุณปีนขึ้นไปบนโต๊ะทานข้าวอย่างมั่นคง สามารถเอื้อมถึงโคมไฟเพดานได้แล้ว (กดที่โต๊ะอีกครั้งเพื่อลง)");
        }
      },
      { id: 'drinks', name: 'ชุดเครื่องดื่ม', bounds: { left: 25, top: 45, width: 25, height: 15 }, classes: 'hidden',
        onInteract: (element) => {
           openDiningUI();
        }
      },
      { id: 'newspaper', name: 'หนังสือพิมพ์', bounds: { left: 55, top: 45, width: 15, height: 15 },
        onInteract: (element) => {
           const flags = RoomFlags.dining_room;
           if (flags.lightSwitchState !== 2) {
               showDialogue("ไฟไม่สว่างพอจะอ่านหนังสือพิมพ์");
               return;
           }
           flags.newspaperRead = true;
           showDialogue("บนหน้ากระดาษหนังสือพิมพ์ มีรอยเขียนด้วยหมึกสีแดง... ลำดับที่สอง คือ 2");
           addLog("Fence Code 2: 2");
        }
      },
      { id: 'lamp', name: 'โคมไฟเพดาน', bounds: { left: 35, top: 0, width: 30, height: 30 },
        onInteract: (element) => {
           const flags = RoomFlags.dining_room;
           if (!flags.tableClimbed) {
               showDialogue("โคมไฟอยู่สูงเกินไป คุณเอื้อมไม่ถึง (ลองปีนโต๊ะดูสิ)");
               return;
           }
           if (flags.lightSwitchState !== 0) {
               die("คุณพยายามเอื้อมจับโคมไฟขณะที่ไฟยังมีกระแสไฟฟ้าวิ่งอยู่... ไฟลัดวงจรช็อตคุณอย่างรุนแรงจนสิ้นใจตายคาที่ และไม่ได้กุญแจ!");
               return;
           }
           if (!flags.keyAcquired) {
               flags.keyAcquired = true;
               addItem('key_storage', 'กุญแจห้องเก็บของ');
               showDialogue("ในความมืด คุณหยิบของที่สะท้อนแสงวิบวับบนขอบโคมไฟ... มันคือ กุญแจห้องเก็บของ!");
               updateRoomVisuals('dining_room'); // Hide the sparkle
           } else {
               showDialogue("ไม่มีอะไรอยู่บนโคมไฟแล้ว");
           }
        }
      },
      { id: 'clock', name: 'นาฬิกาลูกตุ้ม', bounds: { left: 80, top: 20, width: 15, height: 60 },
        onInteract: (element) => {
           const flags = RoomFlags.dining_room;
           if (flags.lightSwitchState !== 2) {
               showDialogue("มืดเกินไป หรือไฟกะพริบจนลายตา ไม่อยากขยับของใหญ่");
               return;
           }
           if (flags.clockMoved) {
               showDialogue("นาฬิกาลูกตุ้มถูกเลื่อนพ้นทางประตูแล้ว");
               return;
           }
           if (!flags.wheelsChecked) {
               showDialogue("ลองตรวจสอบดู... พบว่าล้อเลื่อนด้านล่างพัง ต้องการชุดอุปกรณ์ซ่อมล้อมาซ่อมก่อนถึงจะขยับได้");
               flags.wheelsChecked = true;
           } else {
               if (hasItem('wheel_repair_kit')) {
                   flags.clockMoved = true;
                   removeItem('wheel_repair_kit');
                   showDialogue("คุณใช้ชุดอุปกรณ์ซ่อมล้อจนเสร็จ และเลื่อนนาฬิกาลูกตุ้มออกจากทางประตูได้สำเร็จ!");
                   updateRoomVisuals('dining_room');
               } else {
                   die("พยายามเลื่อนนาฬิกาลูกตุ้มที่ยังไม่ได้ซ่อมล้อ... ล้อที่พังทำให้นาฬิกาเอียงและล้มทับตัวคุณตายคาที่!");
               }
           }
        }
      },
      { id: 'door_living', name: 'ประตูห้องนั่งเล่น', bounds: { left: 90, top: 20, width: 10, height: 60 },
        onInteract: (element) => {
           const flags = RoomFlags.dining_room;
           if (!flags.clockMoved) {
               showDialogue("นาฬิกาลูกตุ้มบังประตูห้องนั่งเล่นอยู่ คุณเข้าไม่ได้");
           } else {
               showDialogue("ประตูเปิดสู่ห้องนั่งเล่น...");
           }
        }
      },
      { id: 'door_kitchen', name: 'กลับห้องครัว', bounds: { left: 0, top: 70, width: 15, height: 30 },
        onInteract: (element) => {
           showDialogue("กลับสู่ห้องครัว");
           inventory.saveCheckpoint('dining_room');
           loadRoom('kitchen');
        }
      }
    ],
    decorations: []
  },
  storage: {
    objects: [
      { id: 'door_main', name: 'ประตูบานพับ (ทางเข้า)', bounds: { left: 5, top: 10, width: 20, height: 80 },
        onInteract: (element) => {
           const flags = RoomFlags.storage;
           if (flags.doorClosed) {
               showDialogue("ประตูพับปิดสนิทแล้ว คุณออกไม่ได้แล้ว!");
           } else if (flags.doorWedged) {
               showDialogue("คุณใช้ไม้ขัดค้ำประตูไว้แล้ว เดินกลับออกไปโถงทางเดิน...");
               inventory.saveCheckpoint('hallway_f1');
               loadRoom('hallway_f1');
           } else if (flags.doorTimerStarted && !flags.doorWedged && !flags.doorClosed) {
               if (hasItem('wood_stick')) {
                   flags.doorWedged = true;
                   removeItem('wood_stick');
                   showDialogue("คุณเอาไม้ขัดประตูมาค้ำยันบานพับไว้ ประตูจะไม่พับปิดลงมาอีกแล้ว!");
                   updateRoomVisuals('storage');
               } else {
                   showDialogue("ประตูบานพับนี้มันค่อยๆ พับจะปิดลงมา! ต้องหา 'ไม้ขัดประตู' มาค้ำยัน หรือรีบออกไปก่อนที่ประตูจะปิดสนิท");
                   inventory.saveCheckpoint('hallway_f1');
                   loadRoom('hallway_f1');
               }
           } else {
               showDialogue("คุณเดินกลับออกไปโถงทางเดิน...");
               inventory.saveCheckpoint('hallway_f1');
               loadRoom('hallway_f1');
           }
        }
      },
      { id: 'switch', name: 'สวิตช์ไฟ (ช็อต)', bounds: { left: 30, top: 40, width: 10, height: 10 }, classes: 'flickering',
        onInteract: (element) => {
           die("คุณพยายามกดสวิตช์ใฟที่พัง กระแสไฟฟ้าลัดวงจรช็อตคุณอย่างรุนแรงจนสิ้นใจ!");
        }
      },
      { id: 'door_small', name: 'ประตูขนาดเล็กฝั่งพื้น', bounds: { left: 70, top: 80, width: 20, height: 15 },
        onInteract: (element) => {
           const flags = RoomFlags.storage;
           if (!flags.flashLightOn) {
               showDialogue("มืดเกินไป มองไม่เห็นประตูเล็กที่พื้นชัดเจน เปิดไฟแฟชก่อน");
               return;
           }
           if (flags.doorSmallOpenedCount === 0) {
               flags.doorSmallOpenedCount = 1;
               showDialogue("คุณส่องแฟชไปที่ประตูเล็กฝั่งพื้นบริเวณมุมห้อง... พบว่ามี 'ไม้ขัดประตู' โดยขัดล็อคไว้ทางด้านนี้ (กดอีกครั้งเพื่อดึงออกมา)");
           } else if (flags.doorSmallOpenedCount === 1 && !flags.woodStickAcquired) {
               flags.doorSmallOpenedCount = 2;
               flags.woodStickAcquired = true;
               addItem('wood_stick', 'ไม้ขัดประตู');
               showDialogue("คุณดึงไม้ขัดออกจากประตูเล็ก... ได้รับ 'ไม้ขัดประตู' เก็บเข้ากระเป๋า (ใช้ค้ำยันประตูบานพับทางเข้าได้!)");
           } else {
               die("คุณพยายามเปิดประตูขนาดเล็กฝั่งพื้นอีกครั้ง... บางอย่างจากด้านล่างกระชากดึงตัวคุณตกลงไปในความมืด ประตูพับปิดลงทันที!");
           }
        }
      },
      { id: 'box_open', name: 'ลังกระดาษไม่มีฝาปิด', bounds: { left: 40, top: 70, width: 20, height: 20 },
        onInteract: (element) => {
           const flags = RoomFlags.storage;
           if (!flags.flashLightOn) {
               showDialogue("ห้องมืดเกินไป คุณมองไม่เห็นว่ามีอะไรอยู่ในลัง");
               return;
           }
           if (flags.boxSearchView === 0) {
               flags.boxSearchView = 1;
               showDialogue("ค้นลังกระดาษครั้งแรก เจอ 'กระดาษโน้ต' เขียนคำเตือนว่า 'สิ่งที่ถูกซ่อนไว้ในส่วนลึก ไม่ควรเปิดเผยมันออกมา'");
               addLog("กระดาษโน้ต: สิ่งที่ถูกซ่อนไว้ในส่วนลึก ไม่ควรเปิดเผยมันออกมา");
           } else if (flags.boxSearchView === 1) {
               flags.boxSearchView = 2;
               flags.foundKey = true;
               addItem('key_toolbox', 'กุญแจกล่องอุปกรณ์');
               showDialogue("ค้นลังกระดาษครั้งที่สอง คุณเจอ 'กุญแจกล่องอุปกรณ์ช่าง'");
           } else if (flags.boxSearchView === 2) {
               flags.boxSearchView = 3;
               flags.foundPowerbank = true;
               addItem('powerbank', 'พาวเวอร์แบงค์เก่า');
               showDialogue("ค้นลังกระดาษครั้งที่สาม คุณเจอ 'พาวเวอร์แบงค์เก่า' (เก็บเข้ากระเป๋า สามารถกดชาร์จได้ที่เมนูไฟฉาย)");
           } else {
               showDialogue("ลังเปิดโล่ง ไม่มีอะไรให้ค้นอีกแล้ว");
           }
        }
      },
      { id: 'box_closed', name: 'ลังกระดาษมีฝาปิด', bounds: { left: 80, top: 60, width: 15, height: 20 },
        onInteract: (element) => {
           const flags = RoomFlags.storage;
           if (!flags.boxOpened) {
               flags.boxOpened = true;
               showDialogue("เปิดฝาลังออก... ดันมีหนูตัวใหญ่กระโดดสวนขึ้นมาเฉี่ยวแขนคุณ!");
               takeDamage("โดนหนูกัดหรือข่วนด้วยความตกใจ", 0.5);
           } else {
               showDialogue("ลังกระดาษมีฝาปิด มีแต่เศษฝุ่นและกลิ่นสาบหนู");
           }
        }
      },
      { id: 'toolbox', name: 'กล่องอุปกรณ์ช่าง', bounds: { left: 45, top: 55, width: 15, height: 15 },
        onInteract: (element) => {
           const flags = RoomFlags.storage;
           if (!flags.flashLightOn) {
               showDialogue("มืดเกินไป คุณคลำหากุญแจล็อคไม่เจอ เปิดไฟฉายก่อน");
               return;
           }
           if (!flags.gotHammer) {
               if (hasItem('key_toolbox')) {
                   flags.gotHammer = true;
                   removeItem('key_toolbox');
                   showDialogue("คุณใช้กุญแจไขแม่กุญแจออกสำเร็จ! หยิบ 'ค้อน' ออกมาได้แล้ว (ตอนนี้คุณพังประตูใดก็ได้ที่แข็งๆ ได้แล้ว)");
                   addItem('hammer', 'ค้อน');
               } else {
                   showDialogue("กล่องถูกล็อคด้วยแม่กุญแจแน่นหนา ต้องหากุญแจมาไข");
               }
           } else {
               showDialogue("กล่องอุปกรณ์ว่างเปล่า คุณเอาค้อนมาแล้ว");
           }
        }
      }
    ],
    decorations: []
  }
};
