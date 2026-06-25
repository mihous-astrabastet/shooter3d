// targets.js — spawn, update, kill targets

const targets = [];
const TARGET_COUNT = 8;
const TARGET_COLORS = [0xcc3333, 0xcc6633, 0x3366cc, 0x33cc66];

function spawnTarget() {
  const index = targets.length;
  const angle  = (index / TARGET_COUNT) * Math.PI * 2 + Math.random() * 0.6;
  const radius = 6 + Math.random() * 10;

  const group = new THREE.Group();
  group.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

  const color = TARGET_COLORS[index % TARGET_COLORS.length];
  const mat   = new THREE.MeshLambertMaterial({ color: 0x333344 });

  // Post
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8), mat);
  post.position.y = 0.75;
  group.add(post);

  // Body
  const bodyMat = new THREE.MeshLambertMaterial({ color });
  const body    = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 0.15), bodyMat);
  body.position.y = 1.6;
  group.add(body);

  // Head
  const headMat = new THREE.MeshLambertMaterial({ color });
  const head    = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), headMat);
  head.position.y = 2.25;
  group.add(head);

  // Spin ring
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.28, 0.32, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.25 })
  );
  ring.position.y = 2.25;
  ring.rotation.x = -Math.PI / 2;
  group.add(ring);

  scene.add(group);

  targets.push({
    group, body, head, ring,
    bodyMat, headMat,
    hp: 3, maxHp: 3,
    originalColor: color,
    speed: 0.008 + Math.random() * 0.006,
    angle,
    radius,
    bobOffset: Math.random() * Math.PI * 2,
    alive: true,
    hitTimer: 0
  });
}

function updateTargets(dt) {
  const time = Date.now() * 0.001;
  targets.forEach(t => {
    if (!t.alive) return;
    t.angle += t.speed;
    t.group.position.x = Math.cos(t.angle) * t.radius;
    t.group.position.z = Math.sin(t.angle) * t.radius;
    t.group.position.y = Math.sin(time * 1.2 + t.bobOffset) * 0.15;
    t.group.rotation.y = -t.angle + Math.PI;
    t.ring.rotation.z += 0.02;

    if (t.hitTimer > 0) {
      t.hitTimer -= dt;
      if (t.hitTimer <= 0) {
        t.bodyMat.color.setHex(t.originalColor);
        t.headMat.color.setHex(t.originalColor);
      }
    }
  });
}

function killTarget(tgt) {
  tgt.alive = false;
  scene.remove(tgt.group);
  const idx = targets.indexOf(tgt);
  targets.splice(idx, 1);
  setTimeout(spawnTarget, 1200);
}

for (let i = 0; i < TARGET_COUNT; i++) spawnTarget();
