// scene.js — renderer, camera, lights, environment

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x0a0a14);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a14, 0.032);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 1.7, 0);
scene.add(camera);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lights
scene.add(new THREE.AmbientLight(0x1a1a2e, 1.8));

const dirLight = new THREE.DirectionalLight(0x4466aa, 0.8);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
scene.add(dirLight);

[
  { pos: [0, 3, 0],     color: 0x2244aa },
  { pos: [15, 3, 15],   color: 0xaa2244 },
  { pos: [-15, 3, -15], color: 0x22aa44 },
].forEach(({ pos, color }) => {
  const l = new THREE.PointLight(color, 1.0, 20);
  l.position.set(...pos);
  scene.add(l);
});

// Текстури підлоги
const texLoader = new THREE.TextureLoader();

function loadTex(path, repeat = 16) {
  const t = texLoader.load(path);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  return t;
}

const floorColorTex  = loadTex('textures/floor_color.jpg');
const floorNormalTex = loadTex('textures/floor_normal.jpg');
const floorRoughTex  = loadTex('textures/floor_rough.jpg');

const floorMat = new THREE.MeshStandardMaterial({
  map:          floorColorTex,
  normalMap:    floorNormalTex,
  roughnessMap: floorRoughTex,
  roughness:    1.0,
  metalness:    0.0,
});

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80, 1, 1),
  floorMat
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Arena posts
function makePost(x, z) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 4, 0.5),
    new THREE.MeshLambertMaterial({ color: 0x222233 })
  );
  m.position.set(x, 2, z);
  m.castShadow = true;
  scene.add(m);
}
for (let i = -4; i <= 4; i++) {
  makePost(i * 5, -22);
  makePost(i * 5,  22);
  makePost(-22, i * 5);
  makePost( 22, i * 5);
}

// Cover boxes
[
  [5, 5], [-5, 5], [5, -5], [-5, -5],
  [10, 0], [-10, 0], [0, 10], [0, -10],
  [8, -8], [-8, 8]
].forEach(([x, z]) => {
  const h = 0.8 + Math.random() * 0.8;
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, h * 2, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x1e2030, roughness: 0.8, metalness: 0.2 })
  );
  m.position.set(x, h, z);
  m.castShadow = true;
  m.receiveShadow = true;
  scene.add(m);
});