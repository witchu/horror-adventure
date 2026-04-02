class InventoryManager {
  constructor() {
    this.items = [];
    this.checkpoints = { 
      bedroom: [], 
      bathroom: [], 
      hallway_f2: [], 
      hallway_f1: [], 
      kitchen: [], 
      dining_room: [], 
      storage: [] 
    };
  }

  add(id, name) {
    if (this.items.length >= 6) {
      if (typeof showDialogue === 'function') showDialogue("กระเป๋าเต็ม!");
      return false;
    }
    this.items.push({ id, name });
    this.render();
    if (typeof showDialogue === 'function') showDialogue(`ได้รับไอเทม: ${name}`);
    return true;
  }

  has(id) {
    return this.items.some(item => item.id === id);
  }

  remove(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.render();
  }

  render() {
    els.inventorySlots.forEach((slot, index) => {
      if (this.items[index]) {
        slot.innerText = this.items[index].name;
        slot.classList.add('filled');
      } else {
        slot.innerText = '';
        slot.classList.remove('filled');
      }
    });
  }

  saveCheckpoint(roomId) {
    if (this.checkpoints[roomId] !== undefined) {
      this.checkpoints[roomId] = JSON.parse(JSON.stringify(this.items));
    }
  }

  loadCheckpoint(roomId) {
    if (this.checkpoints[roomId] !== undefined) {
      this.items = JSON.parse(JSON.stringify(this.checkpoints[roomId]));
      this.render();
    }
  }
}

// Global instance
const inventory = new InventoryManager();

// Wrapper functions to maintain compatibility with existing codebase
function addItem(id, name) {
  inventory.add(id, name);
}

function hasItem(id) {
  return inventory.has(id);
}

function removeItem(id) {
  inventory.remove(id);
}

function renderInventory() {
  inventory.render();
}
