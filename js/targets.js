// targets.js — spawn, update, kill targets, particles, death animation, damage

const targets = [];
const TARGET_COUNT = 8;

const TARGET_TYPES = {
  normal: {
    color: 0xcc3333,
    hp: 3, speed: 0.008, scale: 1.0,
    points: 100, headPoints: 150, label: 'звичайна',
    damage: 8, attackRange: 8, attackCooldown: 2.0
  },
  fast: {
    color: 0xddaa00,
    hp: 1, speed: 0.022, scale: 0.7,
    points: 200, headPoints: 350, label: 'швидка',
    damage: 5, attackRange: 7, attackCooldown: 1.2
  },
  heavy: {
    color: 0x4444cc,
    hp: 8, speed: 0.004, scale: 1.5,
    points: 300, headPoints: 500, label: 'броньована',
    damage: 20, attackRange: 10, attackCooldown: 3.0
  },
  tiny: {
    color: 0x22cc66,
    hp: 1, speed: 0.018, scale: 0.45,
    points: 400, headPoints: 600, label: 'мала',
    damage: 3, attackRange: 6, attackCooldown: 0.8
  }
};

const TYPE_POOL = [
  'normal','normal','normal','normal',
  'fast','fast',
  'heavy',
  'tiny'
];

function randomType() {
  return TYPE_POOL[Math.floor(Math.random() * TYPE_POOL.length)];
}

const dyingTargets = [];
const particles = [];

function spawnParticles(position, color, count = 12) {
  for (let i = 0; i < count; i++) {
    const size = 0.04 + Math.random() * 0.06;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.MeshLambertMaterial({ color })
    );
    mesh.position.copy(position);
    scene.add(mesh);

    const speed = 0.04 + Math.random() * 0.08;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.random() * Math.PI;
    particles.push({
      mesh,
      vx: Math.sin(phi) * Math.cos(theta) * speed,
      vy: 0.05 + Math.random() * 0.08,
      vz: Math.sin(phi) * Math.sin(theta) * speed,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.02
    });
  }
}

function spawnDeathParticles(position, color, scale) {
  spawnParticles(position, color, Math.floor(24 * scale));
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.mesh.position.x += p.vx;
    p.mesh.position.y += p.vy;
    p.mesh.position.z += p.vz;
    p.vy -= 0.004;
    p.life -= p.decay;
    p.mesh.material.opacity = p.life;
    p.mesh.material.transparent = true;
    p.mesh.rotation.x += 0.1;
    p.mesh.rotation.z += 0.1;
    if (p.life <= 0) {
      scene.remove(p.mesh);
      particles.splice(i, 1);
    }
  }
}

function updateDyingTargets(dt) {
  for (let i = dyingTargets.length - 1; i >= 0; i--) {
    const d = dyingTargets[i];
    d.timer += dt;
    const progress = d.timer / d.duration;
    d.group.rotation.z = d.fallDir * (Math.PI / 2) * Math.min(progress * 1.5, 1.0);
    d.group.position.y = d.startY - progress * 0.8 * d.scale;

    if (progress > 0.6) {
      const fade = 1.0 - (progress - 0.6) / 0.4;
      d.group.traverse(obj => {
        if (obj.material) {
          obj.material.transparent = true;
          obj.material.opacity = fade;
        }
      });
    }

    if (d.timer >= d.duration) {
      scene.remove(d.group);
      dyingTargets.splice(i, 1);
      setTimeout(spawnTarget, 400);
    }
  }
}

function spawnTarget() {
  const index = targets.length;
  const typeName = randomType();
  const type = TARGET_TYPES[typeName];

  const angle  = (index / TARGET_COUNT) * Math.PI * 2 + Math.random() * 0.6;
  const radius = 6 + Math.random() * 10;
  const s = type.scale;

  const group = new THREE.Group();
  group.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  group.scale.setScalar(s);

  const postMat = new THREE.MeshLambertMaterial({ color: 0x333344 });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8), postMat);
  post.position.y = 0.75;
  group.add(post);

  const bodyMat = new THREE.MeshLambertMaterial({ color: type.color });
  const body    = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 0.15), bodyMat);
  body.position.y = 1.6;
  group.add(body);

  const headMat = new THREE.MeshLambertMaterial({ color: type.color });
  const head    = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), headMat);
  head.position.y = 2.25;
  group.add(head);

  let hpBar = null;
  if (typeName === 'heavy') {
    const bgGeo = new THREE.PlaneGeometry(0.8, 0.1);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    bg.position.y = 2.75;
    group.add(bg);

    const fillGeo = new THREE.PlaneGeometry(0.78, 0.08);
    const fillMat = new THREE.MeshBasicMaterial({ color: 0x44aaff, side: THREE.DoubleSide });
    hpBar = new THREE.Mesh(fillGeo, fillMat);
    hpBar.position.y = 2.75;
    hpBar.position.z = 0.01;
    group.add(hpBar);
  }

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.28, 0.32, 24),
    new THREE.MeshBasicMaterial({ color: type.color, side: THREE.DoubleSide, transparent: true, opacity: 0.4 })
  );
  ring.position.y = 2.25;
  ring.rotation.x = -Math.PI / 2;
  group.add(ring);

  scene.add(group);

  targets.push({
    group, body, head, ring, hpBar,
    bodyMat, headMat,
    typeName, type,
    hp: type.hp, maxHp: type.hp,
    originalColor: type.color,
    speed: type.speed + Math.random() * 0.003,
    angle, radius,
    bobOffset: Math.random() * Math.PI * 2,
    alive: true,
    hitTimer: 0,
    attackTimer: Math.random() * 2.0
  });
}

function updateTargets(dt) {
  const time = Date.now() * 0.001;
  const playerPos = camera.position;

  targets.forEach(t => {
    if (!t.alive) return;
    t.angle += t.speed;
    t.group.position.x = Math.cos(t.angle) * t.radius;
    t.group.position.z = Math.sin(t.angle) * t.radius;
    t.group.position.y = Math.sin(time * 1.2 + t.bobOffset) * 0.15;
    t.group.rotation.y = -t.angle + Math.PI;
    t.ring.rotation.z += 0.02;

    // Атака гравця якщо близько
    const dx = t.group.position.x - playerPos.x;
    const dz = t.group.position.z - playerPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < t.type.attackRange) {
      t.attackTimer -= dt;
      // Підсвічуємо мішень червоним коли атакує
      t.ring.material.opacity = 0.8;
      if (t.attackTimer <= 0) {
        takeDamage(t.type.damage);
        t.attackTimer = t.type.attackCooldown;
        addKillFeed(`Атака [${t.type.label}]! -${t.type.damage} HP`);
      }
    } else {
      t.ring.material.opacity = 0.4;
      if (t.attackTimer < t.type.attackCooldown) {
        t.attackTimer = Math.min(t.attackTimer + dt, t.type.attackCooldown);
      }
    }

    if (t.hpBar) {
      const pct = t.hp / t.maxHp;
      t.hpBar.scale.x = pct;
      t.hpBar.position.x = (pct - 1) * 0.39;
      t.hpBar.material.color.setHex(pct > 0.5 ? 0x44aaff : 0xff6644);
    }

    if (t.hitTimer > 0) {
      t.hitTimer -= dt;
      if (t.hitTimer <= 0) {
        t.bodyMat.color.setHex(t.originalColor);
        t.headMat.color.setHex(t.originalColor);
      }
    }
  });

  updateDyingTargets(dt);
  updateParticles(dt);
}

function killTarget(tgt) {
  const bodyPos = new THREE.Vector3();
  tgt.body.getWorldPosition(bodyPos);
  const headPos = new THREE.Vector3();
  tgt.head.getWorldPosition(headPos);
  spawnDeathParticles(bodyPos, tgt.originalColor, tgt.type.scale);
  spawnDeathParticles(headPos, tgt.originalColor, tgt.type.scale);

  tgt.alive = false;
  const idx = targets.indexOf(tgt);
  targets.splice(idx, 1);

  dyingTargets.push({
    group: tgt.group,
    timer: 0,
    duration: 0.6,
    fallDir: Math.random() > 0.5 ? 1 : -1,
    startY: tgt.group.position.y,
    scale: tgt.type.scale
  });
}

function spawnHitParticles(worldPosition, color) {
  spawnParticles(worldPosition, color, 10);
}

for (let i = 0; i < TARGET_COUNT; i++) spawnTarget();