// --- Room Rendering and Logic ---

function loadRoom(roomId) {
  GameState.currentRoom = roomId;
  if (els.scene) els.scene.className = `room-${roomId}`;
  if (els.interactiveLayer) {
    els.interactiveLayer.innerHTML = ''; // clear objects
    els.interactiveLayer.style.display = 'block';
  }
  if (els.scene) els.scene.style.backgroundImage = '';

  // ซ่อน flashlightMask เสมอเมื่อเปลี่ยนห้อง — updateRoomVisuals จะแสดงอีกครั้งเฉพาะในห้องเก็บของเท่านั้น
  if (els.flashlightMask) els.flashlightMask.classList.add('hidden');

  // Hide all room-specific overlays and special widgets globally on room transition
  document.querySelectorAll('.ui-overlay, #battery-bar-container').forEach(el => el.classList.add('hidden'));

  // Reset consistent damage across room changes
  GameState.hpDrainRate = 0;

  // Add dark overlay if light is flickering
  if (els.scene) {
    els.scene.classList.remove('flickering');
    els.scene.classList.remove('flicker-dining');
    els.scene.style.filter = 'brightness(1)';
  }

  if (roomId === 'bathroom' && !GameState.flags['bathroom_pillTaken']) {
    if (els.scene) els.scene.classList.add('flickering');
  }

  const room = (window.RoomData && window.RoomData[roomId]) ? window.RoomData[roomId] : null;
  if (room && room.objects) {
    room.objects.forEach(obj => {
      const el = document.createElement('div');
      el.className = `interactive-object ${obj.classes || ''}`;
      el.id = `obj-${obj.id}`;
      el.innerText = obj.name;
      el.style.left = `${obj.bounds.left}%`;
      el.style.top = `${obj.bounds.top}%`;
      el.style.width = `${obj.bounds.width}%`;
      el.style.height = `${obj.bounds.height}%`;

      el.addEventListener('click', () => handleInteraction(roomId, obj.id, el));
      if (els.interactiveLayer) els.interactiveLayer.appendChild(el);
    });
  }

  if (room && room.decorations) {
    room.decorations.forEach(deco => {
      const el = document.createElement('div');
      el.className = `non-interactive-object ${deco.classes || ''}`;
      el.id = `deco-${deco.id}`;
      el.innerText = deco.name;
      el.style.left = `${deco.bounds.left}%`;
      el.style.top = `${deco.bounds.top}%`;
      el.style.width = `${deco.bounds.width}%`;
      el.style.height = `${deco.bounds.height}%`;

      if (deco.onInteract) el.addEventListener('click', () => handleInteraction(roomId, deco.id, el));

      if (els.interactiveLayer) els.interactiveLayer.appendChild(el);
    });
  }

  updateRoomVisuals();
  renderHUD();
}

function updateRoomVisuals() {
  const room = window.RoomData && window.RoomData[GameState.currentRoom];
  if (room && typeof room.updateVisuals === 'function') {
    room.updateVisuals();
  }
}

function handleInteraction(room, objId, element) {
  const roomData = window.RoomData && window.RoomData[room];
  if (!roomData) return;

  let obj = roomData.objects.find(o => o.id === objId);
  if (!obj && roomData.decorations) {
    obj = roomData.decorations.find(d => d.id === objId);
  }

  if (obj && obj.onInteract) {
    obj.onInteract(element);
  }
}
