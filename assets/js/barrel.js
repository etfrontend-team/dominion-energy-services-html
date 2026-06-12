// ══ 3D OIL BARREL — Three.js (ES module dynamic import) ═════════════════

export default function initBarrel() {
  const canvas = document.getElementById('barrel-3d-canvas');
  if (!canvas) return;

  // Dynamic import — works in module context, no global needed
  import('https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.min.js')
    .then((T) => buildScene(canvas, T))
    .catch(() => {});
}

function buildScene(canvas, T) {
  const wrap = canvas.parentElement;
  const W = (wrap && wrap.offsetWidth) || 155;
  const H = (wrap && wrap.offsetHeight) || 195;

  // ── Renderer (transparent bg — hero image shows through) ──────────────
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ── Scene ──────────────────────────────────────────────────────────────
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(38, W / H, 0.1, 50);
  camera.position.set(0, 0.5, 5.8);
  camera.lookAt(0, 0, 0);

  // ── Lighting ───────────────────────────────────────────────────────────
  scene.add(new T.AmbientLight(0xc8d4f2, 0.7));

  const key = new T.DirectionalLight(0xffffff, 2.6);
  key.position.set(3, 6, 4);
  scene.add(key);

  const rim = new T.DirectionalLight(0x4466bb, 0.9);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  // Orbiting warm fill — metallic shimmer effect
  const fill = new T.PointLight(0xffbe6e, 1.5, 18);
  fill.position.set(2, -1.5, 3.5);
  scene.add(fill);

  // ── Barrel group ───────────────────────────────────────────────────────
  const barrel = new T.Group();

  // Body — dark navy metallic
  const bodyMat = new T.MeshStandardMaterial({
    color: 0x17213a,
    metalness: 0.76,
    roughness: 0.32,
  });
  barrel.add(new T.Mesh(new T.CylinderGeometry(1.0, 1.0, 3.0, 52, 1, false), bodyMat));

  // Top & bottom caps
  const capMat = new T.MeshStandardMaterial({
    color: 0x1d2a42,
    metalness: 0.82,
    roughness: 0.26,
  });
  [1.5, -1.5].forEach((y) => {
    const cap = new T.Mesh(new T.CircleGeometry(1.0, 52), capMat);
    cap.rotation.x = y > 0 ? -Math.PI / 2 : Math.PI / 2;
    cap.position.y = y;
    barrel.add(cap);
  });

  // Steel hoop bands
  const bandMat = new T.MeshStandardMaterial({
    color: 0x8ea3bc,
    metalness: 0.95,
    roughness: 0.14,
  });
  [-1.05, 0, 1.05].forEach((y) => {
    const band = new T.Mesh(new T.TorusGeometry(1.028, 0.048, 8, 52), bandMat);
    band.rotation.x = Math.PI / 2;
    band.position.y = y;
    barrel.add(band);
  });

  // Lid seam rings
  [-1.44, 1.44].forEach((y) => {
    const ring = new T.Mesh(new T.TorusGeometry(1.028, 0.036, 6, 52), bandMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    barrel.add(ring);
  });

  // Bung plug (fill port on top)
  const bungMat = new T.MeshStandardMaterial({
    color: 0x47566e, metalness: 0.97, roughness: 0.11,
  });
  const bung = new T.Mesh(new T.CylinderGeometry(0.11, 0.13, 0.12, 16), bungMat);
  bung.position.set(0.52, 1.53, 0);
  barrel.add(bung);

  const vent = new T.Mesh(new T.CylinderGeometry(0.07, 0.085, 0.1, 12), bungMat);
  vent.position.set(-0.52, 1.53, 0);
  barrel.add(vent);

  scene.add(barrel);

  // ── Oil droplets falling from bung area ───────────────────────────────
  const dropMat = new T.MeshStandardMaterial({
    color: 0x04090f,
    metalness: 0.42,
    roughness: 0.05,
    transparent: true,
    opacity: 0.9,
  });

  const drops = Array.from({ length: 9 }, () => {
    const r = 0.036 + Math.random() * 0.054;
    const mesh = new T.Mesh(new T.SphereGeometry(r, 10, 10), dropMat);
    const startY = 1.6 + Math.random() * 0.55;
    mesh.position.set(
      (Math.random() - 0.5) * 0.55,
      startY,
      (Math.random() - 0.5) * 0.55
    );
    mesh.userData = { vy: -(0.007 + Math.random() * 0.012), startY };
    scene.add(mesh);
    return mesh;
  });

  // ── Mouse tilt (tracks hero section cursor) ────────────────────────────
  let mx = 0, my = 0, trx = 0, try_ = 0;
  const hero = document.getElementById('home');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mx = (e.clientX - rect.left) / rect.width * 2 - 1;
      my = (e.clientY - rect.top) / rect.height * 2 - 1;
    });
    hero.addEventListener('mouseleave', () => { mx = 0; my = 0; });
  }

  // ── Render loop ────────────────────────────────────────────────────────
  let t = 0;
  const animate = () => {
    requestAnimationFrame(animate);
    t += 0.01;

    barrel.rotation.y += 0.006;
    trx += (my * 0.18 - trx) * 0.05;
    try_ += (mx * 0.12 - try_) * 0.05;
    barrel.rotation.x = trx;

    fill.position.x = Math.sin(t * 0.55) * 2.6;
    fill.position.z = Math.cos(t * 0.55) * 2.6;
    fill.intensity = 1.3 + Math.sin(t * 1.1) * 0.28;

    drops.forEach((d) => {
      d.position.y += d.userData.vy;
      if (d.position.y < -1.9) {
        d.position.y = d.userData.startY;
        d.position.x = (Math.random() - 0.5) * 0.55;
        d.position.z = (Math.random() - 0.5) * 0.55;
      }
    });

    renderer.render(scene, camera);
  };

  animate();
}
