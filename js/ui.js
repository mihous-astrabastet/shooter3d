// ui.js — HUD оновлення

let score = 0;
const MAX_AMMO = 7;
let ammo    = MAX_AMMO;
let reserve = 21;

// HP гравця
const MAX_HP = 100;
let playerHp = MAX_HP;

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

function updateHpUI() {
  const pct = Math.max(0, playerHp / MAX_HP * 100);
  document.getElementById('hp-fill').style.width = pct + '%';
  document.getElementById('hp-fill').style.background =
    pct > 50 ? '#44cc66' : pct > 25 ? '#ddaa00' : '#cc3333';
  document.getElementById('hp-text').textContent = Math.ceil(playerHp);
}

function takeDamage(dmg) {
  playerHp = Math.max(0, playerHp - dmg);
  updateHpUI();

  // Червоний спалах по краях
  const blood = document.getElementById('blood');
  blood.style.opacity = '1';
  setTimeout(() => { blood.style.opacity = '0'; }, 200);

  if (playerHp <= 0) endGame();
}

// Таймер
const GAME_DURATION = 5 * 60; // 5 хвилин в секундах
let timeLeft = GAME_DURATION;
let gameTimer = null;

function startTimer() {
  timeLeft = GAME_DURATION;
  updateTimerUI();
  gameTimer = setInterval(() => {
    if (!window.gameRunning) return;
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function stopTimer() {
  clearInterval(gameTimer);
  gameTimer = null;
}

function updateTimerUI() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const str = m + ':' + String(s).padStart(2, '0');
  document.getElementById('timer-val').textContent = str;
  document.getElementById('timer-val').style.color =
    timeLeft <= 30 ? '#cc3333' : 'inherit';
}

function endGame() {
  window.gameRunning = false;
  stopTimer();
  document.exitPointerLock();

  const screen = document.getElementById('screen');
  document.querySelector('#screen h1').textContent = playerHp <= 0 ? 'Ти загинув' : 'Час вийшов!';
  document.querySelector('#screen p').innerHTML =
    `Фінальний рахунок: <strong>${score}</strong><br>` +
    `HP що залишилось: ${Math.ceil(playerHp)}`;
  document.getElementById('start-btn').textContent = 'Грати знову';
  screen.style.display = 'flex';
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

// Звуки
const sounds = {};
function loadSound(name, src) {
  const audio = new Audio(src);
  audio.preload = 'auto';
  sounds[name] = audio;
}
loadSound('shoot',  'sounds/shoot.wav');
loadSound('reload', 'sounds/reload.wav');
loadSound('hit',    'sounds/hit.wav');

document.addEventListener('click', () => {
  Object.values(sounds).forEach(s => {
    s.play().catch(() => {});
    s.pause();
    s.currentTime = 0;
  });
}, { once: true });

function playSound(name, volume = 1.0) {
  const s = sounds[name];
  if (!s) return;
  const a = new Audio(s.src);
  a.volume = volume;
  a.play().catch(() => {});
}

// Reload bar
let reloading   = false;
let reloadTimer = 0;
const RELOAD_TIME = 1.8;

function startReload() {
  if (reloading || reserve <= 0 || ammo === MAX_AMMO) return;
  reloading   = true;
  reloadTimer = 0;
  document.getElementById('reload-bar-wrap').style.display = 'flex';
  playSound('reload', 0.7);
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
updateHpUI();