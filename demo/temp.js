const fs = require('fs');
const lines = fs.readFileSync('game.js', 'utf8').split(/\r?\n/);

const pt = (s, len) => {
  let start = lines.findIndex(l => l.includes(s));
  console.log('--- START ---');
  console.log(lines.slice(start, start + len).join('\n'));
  console.log('--- END ---');
};

pt('const drinks =', 5);
pt('updateRoomVisuals(roomId) {', 120);
pt('case \'table\':', 30);
