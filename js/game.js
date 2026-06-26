// game.js — головний ігровий цикл, стрільба, старт

window.gameRunning = false;
const raycaster = new THREE.Raycaster();
const CENTER    = new THREE.Vector2(0, 0);

// Стрільба
function shoot() {
  if (!window.gameRunning || reloading) return;
  if (ammo <= 0) { startReload(); return; }

  ammo--;
  updateAmmoUI();
  muzzleFlash();
  triggerRecoil();
  playSound('shoot', 0.6);
  playSound('shoot', 0.6);

  raycaster.setFromCamera(CENTER, camera);

  const meshes = [];
  targets.forEach(t => { if (t.alive) meshes.push(t.head, t.body); });
  const hits = raycaster.intersectObjects(meshes);

  if (hits.length > 0) {
    const hit    = hits[0];
    const isHead = targets.some(t => t.head === hit.object);
    const dmg    = isHead ? 3 : 1;
    const tgt    = targets.find(t => t.head === hit.object || t.body === hit.object);

    if (tgt && tgt.alive) {
      tgt.hp -= dmg;
      tgt.hitTimer = 0.15;
      tgt.bodyMat.color.setHex(0xffffff);
      tgt.headMat.color.setHex(0xffffff);
      showHitMarker(isHead);
      playSound('hit', 0.5);

      // Партикли при влучанні
      const hitPos = new THREE.Vector3();
      hit.object.getWorldPosition(hitPos);
      spawnHitParticles(hitPos, tgt.originalColor);
      playSound('hit', 0.5);

      if (tgt.hp <= 0) {
        const pts = isHead ? tgt.type.headPoints : tgt.type.points;
        const label = tgt.type.label;
        updateScore(pts);
        addKillFeed(isHead ? `Хедшот [${label}]! +${pts}` : `+${pts} [${label}]`);
        killTarget(tgt);
      }
    }
  }

  if (ammo === 0 && reserve > 0) setTimeout(startReload, 200);
}

// Клік — постріл якщо гра йде
document.addEventListener('mousedown', e => {
  if (!window.gameRunning || e.button !== 0) return;
  shoot();
});

// R — перезарядка
document.addEventListener('keydown', e => {
  if (e.code === 'KeyR' && window.gameRunning && !reloading) startReload();
});

// Старт гри
function startGame() {
  window.gameRunning = true;
  score = 0;
  ammo = MAX_AMMO;
  reserve = 21;
  reloading = false;
  updateAmmoUI();
  document.getElementById('score-val').textContent = '0';
  document.getElementById('screen').style.display = 'none';
  document.getElementById('aim-hint').textContent = 'Клікни на екран щоб захопити мишу';
  document.getElementById('aim-hint').style.display = 'block';
  setTimeout(() => {
    document.getElementById('aim-hint').style.display = 'none';
  }, 3000);
  requestLock();
}

document.getElementById('start-btn').addEventListener('click', startGame);

// Пауза по Escape
document.addEventListener('keydown', e => {
  if (e.code === 'Escape' && window.gameRunning) {
    window.gameRunning = false;
    document.getElementById('screen').style.display = 'flex';
    document.querySelector('#screen h1').textContent = 'Пауза';
    document.getElementById('start-btn').textContent = 'Продовжити';
  }
});

// Головний цикл
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (window.gameRunning) {
    updatePlayer(dt);
    updateTargets(dt);
    tickReload(dt);
    tickHitMarker(dt);
  }

  renderer.render(scene, camera);
}

animate();