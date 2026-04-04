// --- Timers and Hazards ---

// Continuous HP drain loop (10 ticks per second)
setInterval(() => {
  if (GameState.hp > 0 && GameState.hpDrainRate > 0) {
    GameState.hp -= (GameState.hpDrainRate / 10);
    if (GameState.hp < 0) GameState.hp = 0;
    renderHUD();
  }
}, 100);

// Global Second Timer Loop
setInterval(() => {
  if (GameState.hp <= 0) return;

  if (window.RoomData && GameState.currentRoom) {
      const room = window.RoomData[GameState.currentRoom];
      if (room && typeof room.onSecondTimer === 'function') {
          room.onSecondTimer();
      }
  }
}, 1000);
