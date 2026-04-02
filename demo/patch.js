const fs = require('fs');

try {
  let code = fs.readFileSync('game.js', 'utf8');

  // 1. Drinks array
  code = code.replace(
    "{ id: 'tea', name: 'ชาร้อน' }",
    "{ id: 'tea', name: 'ชามิ้นต์' }"
  );

  // 2. Bathroom overwrite bug.
  // Using Regex to safely replace across \r\n
  code = code.replace(
    /        \} else if \(!flags\.dryerStored\) \{\s+flags\.dryerStored = true;\s+case 'table':[\s\S]+?break;ัยจากไฟดูด!"\);\s+\} else \{\s+showDialogue\("ขึ้นจากอ่างแล้วแต่คุณไม่มีผ้าเช็ดตัว/,
    '        } else if (!flags.dryerStored) {\n            flags.dryerStored = true;\n            showDialogue("เก็บไดร์เป่าผมให้พ้นทาง ปลอดภัยจากไฟดูด!");\n            updateRoomVisuals(\'bathroom\');\n        }\n        break;\n\n      case \'bathtub\':\n          if (!flags.bathed) {\n             flags.bathed = true;\n             if (flags.gotTowel) {\n                 flags.dried = true;\n                 showDialogue("ลงไปค้นหาของในอ่างจนตัวเปียก แต่คุณเช็ดตัวแห้งทันที ปลอดภัยจากไฟดูด!");\n             } else {\n                 showDialogue("ขึ้นจากอ่างแล้วแต่คุณไม่มีผ้าเช็ดตัว'
  );

  // 3. Clock logic in dining room
  code = code.replace(
    /         if \(!flags\.wheelsChecked\) \{\s+showDialogue\("ลองผลักดู\.\.\. นาฬิกาน้ำหนักมากและแทบไม่ขยับเลย เหมือนจะต้องไปปลดล็อคล้อด้านล่างก่อน"\);\s+flags\.wheelsChecked = true;\s+\} else \{\s+showDialogue\("ล้อของนาฬิกาลูกตุ้มพัง ต้องหาชุดอุปกรณ์ซ่อมล้อจากห้องอื่นมาซ่อมก่อนถึงจะขยับได้"\);\s+\}/,
    '         if (!flags.clockRepaired) {\n             die("คุณดึงดันจะขยับนาฬิกาลูกตุ้มที่ล้อพัง น้ำหนักที่มากเกินไปทำให้มันล้มทับตัวคุณ ขาดอากาศหายใจและตายอย่างสยดสยอง!");\n             return;\n         }\n         showDialogue("นาฬิกาลูกตุ้มถูกซ่อมล้อแล้ว คุณดันมันหลบไปหลบทางประตูบ้านได้อย่างง่ายดาย");\n         flags.clockMoved = true;\n         updateRoomVisuals(\'dining_room\');'
  );

  // 4. Newspaper logic
  code = code.replace(
    /         flags\.newspaperRead = true;\s+showDialogue\("พาดหัวข่าว: 'ค้นพบพลังบำบัดของชาร้อน\.\.\. ช่วยระงับอาการแพนิคได้ในทันที!'"\);\s+addLog\("ชาร้อนช่วยระงับอาการ Panic ได้"\);/,
    '         flags.newspaperRead = true;\n         showDialogue("บนหน้ากระดาษหนังสือพิมพ์ มีรอยเขียนด้วยหมึกสีแดง... ลำดับที่สอง คือ 3");\n         addLog("Fence Code 2: 3");'
  );

  // 5. Table logic
  code = code.replace(
    /      case 'table':\s+if \(flags\.lightSwitchState !== 0\) \{\s+showDialogue\(".*?โต๊ะรับประทานอาหาร.*?มองเห็นชัดเจนอยู่แล้ว"\);\s+return;\s+\}/,
    '      case \'table\':'
  );

  fs.writeFileSync('game.js', code);
  console.log("Success patching game.js");
} catch (e) {
  console.error(e);
}
