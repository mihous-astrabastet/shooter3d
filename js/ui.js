// ui.js — HUD оновлення

let score = 0;
const MAX_AMMO = 7;
let ammo    = MAX_AMMO;
let reserve = 21;

function updateScore(add) {
  score += add;
  document.getElementById('score-val').textContent = score;
}

function updateAmmoUI() {
  const dots = document.getElementById('ammo-dots');
  dots.innerHTML = '';
  for (let i = 0; i < MAX_AMMO; i++) {
    const d = document.createElement('div');
    d.className = 'ammo-dot' + (i >= ammo ? ' spent' : '');
    dots.appendChild(d);
  }
  document.getElementById('ammo-text').textContent = ammo + ' / ' + reserve;
}

let hitMarkerTimer = 0;
function showHitMarker(isHead) {
  const hm = document.getElementById('hitmarker');
  hm.style.opacity = '1';
  hm.querySelectorAll('line').forEach(l =>
    l.setAttribute('stroke', isHead ? '#ffcc00' : '#ff4444')
  );
  hitMarkerTimer = 0.18;
}

function tickHitMarker(dt) {
  if (hitMarkerTimer > 0) {
    hitMarkerTimer -= dt;
    if (hitMarkerTimer <= 0)
      document.getElementById('hitmarker').style.opacity = '0';
  }
}

function addKillFeed(text) {
  const kf = document.getElementById('killfeed');
  const el  = document.createElement('div');
  el.className = 'kf-entry';
  el.textContent = text;
  kf.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 0.4s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 400);
  }, 2200);
}

function muzzleFlash() {
  const fl = document.getElementById('flash');
  fl.style.opacity = '0.07';
  setTimeout(() => { fl.style.opacity = '0'; }, 50);
}

// Reload bar
let reloading    = false;
let reloadTimer  = 0;
const RELOAD_TIME = 1.8;

function startReload() {
  if (reloading || reserve <= 0 || ammo === MAX_AMMO) return;
  reloading    = true;
  reloadTimer  = 0;
  document.getElementById('reload-bar-wrap').style.display = 'flex';
}

function tickReload(dt) {
  if (!reloading) return;
  reloadTimer += dt;
  document.getElementById('reload-bar-fill').style.width =
    Math.min(reloadTimer / RELOAD_TIME * 100, 100) + '%';

  if (reloadTimer >= RELOAD_TIME) {
    const take = Math.min(MAX_AMMO - ammo, reserve);
    ammo    += take;
    reserve -= take;
    reloading = false;
    document.getElementById('reload-bar-wrap').style.display = 'none';
    updateAmmoUI();
  }
}

updateAmmoUI();
