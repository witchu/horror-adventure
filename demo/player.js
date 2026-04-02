// --- Player Functions ---

function takeDamage(reason, amount = 0.25) {
  GameState.hp -= amount;
  showDialogue(`ได้รับบาดเจ็บ: ${reason} (-${amount} HP)`);
  renderHUD();
}

function die(reason) {
  if (els.deathReason) els.deathReason.innerText = reason;
  if (els.deathScreen) els.deathScreen.classList.remove('hidden');
}
