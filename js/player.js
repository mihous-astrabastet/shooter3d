// player.js — рух, прицілювання, зброя

// Gun — геометрична модель
const gunGroup = new THREE.Group();
gunGroup.position.set(0.22, -0.18, -0.38);
camera.add(gunGroup);

const gunMat    = new THREE.MeshLambertMaterial({ color: 0x222228 });
const accentMat = new THREE.MeshLambertMaterial({ color: 0x444455 });

const barrel  = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.45), accentMat);
barrel.position.set(0, 0, -0.2);
const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.3), gunMat);
const grip    = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.18, 0.1), gunMat);
grip.position.set(0, -0.14, 0.08);
grip.rotation.x = 0.2;

gunGroup.add(barrel, gunBody, grip);

// Input
const keys = {};
document.addEventListener('keydown', e => { keys[e.code] = true; });
document.addEventListener('keyup',   e => { keys[e.code] = false; });

// Mouse look
let yaw = 0, pitch = 0;
const SENS = 0.0022;

function requestLock() {
  renderer.domElement.requestPointerLock();
}

document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === renderer.domElement;
  if (!locked && window.gameRunning) {
    document.getElementById('aim-hint').textContent = 'Клікни на екран щоб продовжити';
    document.getElementById('aim-hint').style.display = 'block';
  }
});

renderer.domElement.addEventListener('click', () => {
  if (window.gameRunning && document.pointerLockElement !== renderer.domElement) {
    requestLock();
  }
});

document.addEventListener('mousemove', e => {
  if (!window.gameRunning) return;
  const dx = e.movementX || 0;
  const dy = e.movementY || 0;
  yaw   -= dx * SENS;
  pitch -= dy * SENS;
  pitch  = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, pitch));
});

// Gun animation
let gunRecoilZ = 0;
let gunRecoilX = 0;

function triggerRecoil() {
  gunRecoilZ = 0.06;
  gunRecoilX = 0.03;
}

function updatePlayer(dt) {
  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  const speed = keys['ShiftLeft'] || keys['ShiftRight'] ? 7 : 4;
  const dir = new THREE.Vector3();
  if (keys['KeyW'] || keys['ArrowUp'])    dir.z -= 1;
  if (keys['KeyS'] || keys['ArrowDown'])  dir.z += 1;
  if (keys['KeyA'] || keys['ArrowLeft'])  dir.x -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) dir.x += 1;
  dir.normalize().applyEuler(new THREE.Euler(0, yaw, 0));
  camera.position.addScaledVector(dir, speed * dt);

  camera.position.x = Math.max(-20, Math.min(20, camera.position.x));
  camera.position.z = Math.max(-20, Math.min(20, camera.position.z));
  camera.position.y = 1.7;

  const moving = dir.length() > 0.01;
  const bob = moving ? Math.sin(Date.now() * 0.008) * 0.012 : 0;
  gunGroup.position.y = -0.18 + bob;

  gunRecoilZ *= 0.78;
  gunRecoilX *= 0.78;
  gunGroup.position.z = -0.38 + gunRecoilZ;
  gunGroup.rotation.x = gunRecoilX;
}