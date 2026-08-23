// ── Interaction locks ─────────────────────────────────────────────
document.body.style.overflow = 'hidden';
window.onbeforeunload = null;
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('copy',        e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key))
    e.preventDefault();
});
document.addEventListener('wheel', e => {
  const target = e.target.closest('.research-container');
  if (!target) e.preventDefault();
}, { passive: false });
document.documentElement.style.overflow = 'hidden';
(function () {
  let prevent = false;
  document.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    prevent = (window.pageYOffset || document.body.scrollTop) === 0;
  });
  document.addEventListener('touchmove', e => {
    if (prevent) { prevent = false; e.preventDefault(); }
  });
})();

// ── p5.js — COMBINED animation ───────────────────────────────────

const NUM      = 100;
const BASE_RNG = 3;

const TRAILS = [
  { x: [], y: [], sf: 0.12, hue:   0 },
  { x: [], y: [], sf: 0.05, hue:  55 },
  { x: [], y: [], sf: 0.09, hue: 175 },
  { x: [], y: [], sf: 0.04, hue: 220 },
  { x: [], y: [], sf: 0.11, hue: 110 },
  { x: [], y: [], sf: 0.07, hue: 280 },
];

const AMBIENT = [
  { x: [], y: [], sf: 0.03, hue:  20 },
  { x: [], y: [], sf: 0.08, hue: 140 },
  { x: [], y: [], sf: 0.13, hue: 200 },
  { x: [], y: [], sf: 0.06, hue: 320 },
  { x: [], y: [], sf: 0.10, hue:  80 },
  { x: [], y: [], sf: 0.04, hue: 350 },
];

const FF_N     = 140;
const ff       = [];

const CONN_DIST = 130;
const nodes     = [];

const STARS     = [];
const NEBULAS   = [];
const NOVA      = [];
const ASTEROIDS = [];
let gravCx = 0, gravCy = 0;

function maxNodes() {
  if (windowWidth <= 480)  return 25;
  if (windowWidth <= 900)  return 45;
  return 80;
}

let isDarkMode = true;
let themeMode = 'dark';
let explosion  = false;
let exStr      = 8;
let pmx = 0, pmy = 0;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  frameRate(60);
  const ALL = [...TRAILS, ...AMBIENT];
  ALL.forEach((t, k) => {
    t.ang = (TWO_PI * k) / ALL.length;
    t.ns  = k * 127;
    t.x   = Array(NUM).fill(width  / 2 + cos(t.ang) * 80);
    t.y   = Array(NUM).fill(height / 2 + sin(t.ang) * 80);
  });
  for (let i = 0; i < 130; i++)
    STARS.push({ x: random(width), y: random(height), r: random(0.4, 1.8), phase: random(TWO_PI) });
  for (let i = 0; i < 5; i++)
    NEBULAS.push({ x: random(width), y: random(height),
                   w: random(220, 480), h: random(100, 260),
                   hue: random(360), vx: random(-0.08, 0.08), vy: random(-0.05, 0.05) });
  for (let i = 0; i < FF_N; i++)
    ff.push({ x: random(width), y: random(height), spd: random(1.2, 2.5) });
  const initN = min(55, maxNodes());
  for (let i = 0; i < initN; i++)
    nodes.push({ x: random(width), y: random(height),
                 vx: random(-0.35, 0.35), vy: random(-0.35, 0.35),
                 r: random(1.5, 3), glow: 0,
                 rep: random(28, 72), wx: random(1000), wy: random(2000),
                 z: 0, vz: 0 });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  [...TRAILS, ...AMBIENT].forEach(t => {
    t.x = Array(NUM).fill(width  / 2 + cos(t.ang) * 80);
    t.y = Array(NUM).fill(height / 2 + sin(t.ang) * 80);
  });
  ff.length = 0;
  for (let i = 0; i < FF_N; i++)
    ff.push({ x: random(width), y: random(height), spd: random(1.2, 2.5) });
  nodes.length = 0;
  for (let i = 0; i < 55; i++)
    nodes.push({ x: random(width), y: random(height),
                 vx: random(-0.35, 0.35), vy: random(-0.35, 0.35),
                 r: random(1.5, 3), glow: 0,
                 rep: random(28, 72), wx: random(1000), wy: random(2000),
                 z: 0, vz: 0 });
  ASTEROIDS.length = 0;
  STARS.length = 0;
  for (let i = 0; i < 130; i++)
    STARS.push({ x: random(width), y: random(height), r: random(0.4, 1.8), phase: random(TWO_PI) });
  NEBULAS.length = 0;
  for (let i = 0; i < 5; i++)
    NEBULAS.push({ x: random(width), y: random(height),
                   w: random(220, 480), h: random(100, 260),
                   hue: random(360), vx: random(-0.08, 0.08), vy: random(-0.05, 0.05) });
}

function draw() {
  const vx  = mouseX - pmx, vy = mouseY - pmy;
  const spd = sqrt(vx * vx + vy * vy);
  pmx = mouseX; pmy = mouseY;
  const rng = map(spd, 0, 28, BASE_RNG, BASE_RNG * 2.8, true);

  background(themeMode === 'light' ? 203 : (themeMode === 'super-dark' ? 5 : 45));

  if (gravCx === 0) { gravCx = mouseX || width * 0.5; gravCy = mouseY || height * 0.5; }
  gravCx = lerp(gravCx, mouseX, 0.08);
  gravCy = lerp(gravCy, mouseY, 0.08);

  const hueShift = map(mouseY, 0, height, 0, 270) + map(mouseX, 0, width, 0, 90) + frameCount * 0.06;

  colorMode(HSB, 360, 100, 100, 255);

  noStroke();
  for (const s of STARS) {
    const a = map(sin(frameCount * 0.04 + s.phase), -1, 1,
                  isDarkMode ? 25 : 15, isDarkMode ? 180 : 130);
    fill((hueShift + 40) % 360, 25, 100, a);
    circle(s.x, s.y, s.r * 2);
  }

  if (frameCount % 180 === 0 && ASTEROIDS.length < 10 && random() < 0.90) {
    const r = random(140, 320), ecc = random(0.02, 0.42), inc = random(TWO_PI);
    const ph = random(TWO_PI), sa = r, sb = sa * (1 - ecc);
    const sz = random(2.5, 5.5), pts = floor(random(5, 9));
    const verts = Array.from({length: pts}, () => random(0.5, 1.0));
    const edge = floor(random(4));
    let sx, sy;
    if (edge === 0) { sx = random(width * 0.1, width * 0.9); sy = -40; }
    else if (edge === 1) { sx = width + 40; sy = random(height * 0.1, height * 0.9); }
    else if (edge === 2) { sx = random(width * 0.1, width * 0.9); sy = height + 40; }
    else { sx = -40; sy = random(height * 0.1, height * 0.9); }
    const lonely = random() < 0.35;
    const orbitSpeedMult = random(0.6, 1.6);
    const orbitDirection = random() < 0.5 ? 1 : -1; // 50% clockwise, 50% counter-clockwise
    const rotSpd = random(0.008, 0.018) * orbitDirection; // Spin matches orbit direction
    ASTEROIDS.push({
      x: sx, y: sy, sa, sb, inc, phase: ph, rot: random(TWO_PI), rotSpd: rotSpd,
      size: sz, curSize: sz, alpha: random(110, 170), fiery: false, pts, verts, trail: [],
      mode: 'orbital', vx: 0, vy: 0, life: floor(random(1200, 2400)), activated: false,
      lonely: lonely, explosionDelay: floor(random(140, 460)), restTime: 0,
      orbitSpeedMult: orbitSpeedMult, fireColor: floor(random(7)), orbitDirection: orbitDirection
    });
  }

  for (let k = ASTEROIDS.length - 1; k >= 0; k--) {
    const a = ASTEROIDS[k];
    a.rot += a.rotSpd;
    a.life--;
    if (a.life <= 0) {
      // Transform asteroid into background star instead of removing
      STARS.push({
        x: a.x, y: a.y,
        r: random(0.5, 1.5),
        phase: random(TWO_PI)
      });
      ASTEROIDS.splice(k, 1);
      continue;
    }

    if (a.mode === 'orbital') {
      // Asteroids orbit around mouse position
      const centerX = gravCx;
      const centerY = gravCy;

      if (a.activated) {
        // When clicked, attract to mouse
        a.sa = lerp(a.sa, 12, 0.058);
        a.sb = a.sa * 0.35;
        a.fiery = true;

        const md = dist(gravCx, gravCy, a.x, a.y);
        if (a.sa < 18 && md < 90) {
          a.mode = 'free';
          const dx = a.x - gravCx, dy = a.y - gravCy;
          const d = sqrt(dx*dx + dy*dy) + 1;
          a.vx = (dx / d) * random(9.5, 13.5);
          a.vy = (dy / d) * random(9.5, 13.5);
        }
      }

      a.phase += (0.52 / pow(max(a.sa, 25), 0.72)) * a.orbitSpeedMult * (a.orbitDirection || 1);
      const lx = a.sa * cos(a.phase), ly = a.sb * sin(a.phase);
      const ox = centerX + lx * cos(a.inc) - ly * sin(a.inc);
      const oy = centerY + lx * sin(a.inc) + ly * cos(a.inc);

      if (!a.activated) {
        if (!a.lonely) {
          a.x = lerp(a.x, ox, 0.04);
          a.y = lerp(a.y, oy, 0.04);
        }
      } else {
        // Activated: move toward mouse
        const mdx = gravCx - a.x, mdy = gravCy - a.y;
        const md = sqrt(mdx*mdx + mdy*mdy);
        if (md > 1) {
          a.vx += (mdx / md) * 0.14;
          a.vy += (mdy / md) * 0.14;
        }
        a.vx *= 0.95;
        a.vy *= 0.95;
        a.x += a.vx;
        a.y += a.vy;

        if (md < 140) a.fiery = true;
        if (a.fiery && md < 90) {
          a.mode = 'free';
          const dx = a.x - gravCx, dy = a.y - gravCy;
          const d = sqrt(dx*dx + dy*dy) + 1;
          a.vx = (dx / d) * random(9.5, 13.5);
          a.vy = (dy / d) * random(9.5, 13.5);
        }
      }
    } else {
      const mdx = gravCx - a.x, mdy = gravCy - a.y;
      const md = sqrt(mdx*mdx + mdy*mdy);

      if (!a.fiery) {
        if (md < 380) {
          a.vx += mdx * 0.00006;
          a.vy += mdy * 0.00006;
        }
        a.vx *= 0.996;
        a.vy *= 0.996;
      } else {
        if (md < 350) {
          a.vx += mdx * 0.00018;
          a.vy += mdy * 0.00018;
        }
        a.vx *= 0.94;
        a.vy *= 0.94;
      }

      a.x += a.vx;
      a.y += a.vy;

      if (a.fiery && spd < 0.5 && a.restTime === 0) {
        a.restTime = floor(random(180, 380));
      }

      if (a.fiery && a.restTime > 0) {
        a.restTime--;
        if (a.restTime <= 0) {
          a.fiery = false;
          a.mode = 'orbital';
          a.activated = false;
          a.lonely = false;
          a.sa = random(140, 280);
          a.sb = a.sa * (1 - random(0.02, 0.42));
        }
      }

      if (a.x < -200 || a.x > width + 200 || a.y < -200 || a.y > height + 200) {
        ASTEROIDS.splice(k, 1);
        continue;
      }

      if (a.fiery) {
        if (!a.dustCount) a.dustCount = 0;

        if (a.dustCount < 40 && frameCount % 10 === 0 && random() < 0.50) {
          const dustAng = random(TWO_PI);
          const dustDist = random(a.curSize * 0.4, a.curSize * 1.5);
          ff.push({
            x: a.x + cos(dustAng) * dustDist, y: a.y + sin(dustAng) * dustDist,
            vx: cos(dustAng) * random(0.5, 1.5), vy: sin(dustAng) * random(0.5, 1.5),
            spd: random(0.35, 0.75), isCosmicDust: true, lifespan: floor(random(380, 580)),
            fireColor: a.fireColor
          });
          a.dustCount++;
        }

        a.curSize = lerp(a.curSize, a.curSize * 0.88, 0.022);

        if (a.dustCount >= 40 && a.curSize < 0.6) {
          nodes.push({
            x: a.x, y: a.y, vx: 0, vy: 0, z: 0, vz: 0,
            r: random(1.6, 2.5), glow: 0.4,
            rep: random(28, 72), wx: random(1000), wy: random(2000)
          });
          ASTEROIDS.splice(k, 1);
          continue;
        }
      }
    }

    const md = dist(gravCx, gravCy, a.x, a.y);
    a.curSize = lerp(a.curSize, a.size * map(md, 0, 160, 2.0, 1.0, true), 0.07);

    a.trail.push({x: a.x, y: a.y});
    if (a.trail.length > 28) a.trail.shift();
  }

  if (!mouseIsPressed && frameCount % 22 === 0 && ff.length < 180) {
    ff.push({
      x: random(width * 0.2, width * 0.8), y: random(height * 0.2, height * 0.8),
      spd: random(0.5, 1.0), orbitDist: random(80, 200)
    });
  }

  {
    const ns = 0.0035, nt = frameCount * 0.004;
    strokeWeight(1.3); noFill();
    for (let i = ff.length - 1; i >= 0; i--) {
      const p = ff[i];
      let nx, ny;
      if (p.isCosmicDust) {
        p.lifespan--;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.998;
        p.vy *= 0.998;
        nx = p.x;
        ny = p.y;

        if (nx < -50 || nx > width + 50 || ny < -50 || ny > height + 50) {
          ff.splice(i, 1);
          continue;
        }

        if (p.lifespan <= 0) {
          let nearestDist = 500, nearestNode = null;
          for (const existingNode of nodes) {
            const d = dist(nx, ny, existingNode.x, existingNode.y);
            if (d < nearestDist) {
              nearestDist = d;
              nearestNode = existingNode;
            }
          }

          let vx = 0, vy = 0;
          if (nearestNode && nearestDist < 400) {
            const dx = nearestNode.x - nx, dy = nearestNode.y - ny;
            const d = sqrt(dx*dx + dy*dy) + 1;
            vx = (dx / d) * 0.8;
            vy = (dy / d) * 0.8;
          }

          nodes.push({
            x: nx, y: ny, vx: vx, vy: vy, z: 0, vz: 0,
            r: random(1.5, 2.8), glow: 0.6,
            rep: random(28, 72), wx: random(1000), wy: random(2000),
            solitude: 0, maxSolitude: floor(random(800, 1400))
          });
          ff.splice(i, 1);
          continue;
        }

        if (p.orbitR > 360) { ff.splice(i, 1); continue; }

        const fadeF = p.lifespan < 80 ? p.lifespan / 80 : 1;
        noStroke();

        // Use asteroid color if available, otherwise default
        let r, g, b;
        if (p.fireColor !== undefined) {
          const fireColors = [
            [230, 110, 35],
            [230, 60, 40],
            [220, 50, 100],
            [200, 80, 150],
            [100, 150, 220],
            [150, 200, 100],
            [220, 180, 80]
          ];
          const baseColor = fireColors[p.fireColor % 7];
          r = baseColor[0];
          g = baseColor[1];
          b = baseColor[2];
        } else if (isDarkMode) {
          r = 24; g = 78; b = 92;
        } else {
          r = 255; g = 50; b = 150;
        }

        colorMode(RGB, 255);
        fill(r, g, b, 200 * fadeF);
        circle(nx, ny, 1.2);
        fill(r, g, b, 140 * fadeF);
        circle(nx, ny, 2.8);
        colorMode(HSB, 360, 100, 100, 255);
        p.x = nx;
        p.y = ny;
      } else {
        const angle = noise(p.x * ns, p.y * ns, nt) * TWO_PI * 2;
        nx = p.x + cos(angle) * p.spd;
        ny = p.y + sin(angle) * p.spd;

        stroke((hueShift + 30) % 360, 60, isDarkMode ? 90 : 60, isDarkMode ? 80 : 85);
        line(p.x, p.y, nx, ny);
        p.x = nx;
        p.y = ny;
      }
    }
  }

  {
    const cHue = (hueShift + 120) % 360;
    for (const n of nodes) {
      const md = dist(mouseX, mouseY, n.x, n.y);
      if (md < 200) { n.vx += (mouseX - n.x) * 0.0005; n.vy += (mouseY - n.y) * 0.0005; }
    }
    if (mouseIsPressed) {
      const ax = 0.018, ay = 0.022, az = 0.014;
      for (const n of nodes) {
        if (dist(mouseX, mouseY, n.x, n.y) > 200) continue;
        const dx = n.x - mouseX, dy = n.y - mouseY, dz = n.z;
        const y1 =  dy * cos(ax) - dz * sin(ax);
        const z1 =  dy * sin(ax) + dz * cos(ax);
        const x2 =  dx * cos(ay) + z1 * sin(ay);
        const z2 = -dx * sin(ay) + z1 * cos(ay);
        const x3 =  x2 * cos(az) - y1 * sin(az);
        const y3 =  x2 * sin(az) + y1 * cos(az);
        n.x = mouseX + x3;
        n.y = mouseY + y3;
        n.z = z2;
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const d   = sqrt(dx * dx + dy * dy);
        const REP = (nodes[i].rep + nodes[j].rep) * 0.5;
        if (d < REP && d > 0) {
          const f = (REP - d) / REP * 0.3;
          nodes[i].vx -= dx / d * f;  nodes[i].vy -= dy / d * f;
          nodes[j].vx += dx / d * f;  nodes[j].vy += dy / d * f;
        }
      }
    }
    for (let n_idx = nodes.length - 1; n_idx >= 0; n_idx--) {
      const n = nodes[n_idx];
      n.vx += (noise(n.wx, frameCount * 0.004) * 2 - 1) * 0.045;
      n.vy += (noise(n.wy, frameCount * 0.004) * 2 - 1) * 0.045;
      n.vx *= 0.97; n.vy *= 0.97;
      n.vz = n.vz * 0.92;
      n.z  = constrain(n.z + n.vz, -280, 280);
      const spd = sqrt(n.vx * n.vx + n.vy * n.vy);
      if (spd > 3) { n.vx = n.vx / spd * 3; n.vy = n.vy / spd * 3; }
      n.x += n.vx;  n.y += n.vy;
      if (n.x < 0 || n.x > width)  n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;

      if (n.maxSolitude !== undefined) {
        n.solitude++;
        if (n.solitude > n.maxSolitude) {
          nodes.splice(n_idx, 1);
        }
      }
    }
    const FORMED = CONN_DIST * 0.4;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
        if (d >= CONN_DIST) continue;
        if (nodes[i].glow > 0 || nodes[j].glow > 0) continue;
        if (d < FORMED) {
          strokeWeight(1.4);
          stroke(cHue, 75, isDarkMode ? 100 : 75,
                 map(d, 0, FORMED, isDarkMode ? 240 : 190, isDarkMode ? 140 : 110));
        } else {
          strokeWeight(0.5);
          stroke(cHue, 50, isDarkMode ? 80 : 55,
                 map(d, FORMED, CONN_DIST, isDarkMode ? 70 : 50, 0));
        }
        line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
      }
    }
    strokeWeight(0.7);
    for (const n of nodes) {
      const d = dist(mouseX, mouseY, n.x, n.y);
      if (d < CONN_DIST * 1.5) {
        stroke(cHue, 65, isDarkMode ? 92 : 65,
               map(d, 0, CONN_DIST * 1.5, isDarkMode ? 130 : 95, 0));
        line(mouseX, mouseY, n.x, n.y);
      }
    }
    noStroke();
    for (const n of nodes) {
      const zs = max(0.2, 600 / (600 + n.z));
      if (n.glow > 0) {
        n.glow = max(0, n.glow - 0.04);
        fill(cHue, 25, 100, n.glow * 255);
        circle(n.x, n.y, n.r * 2 * (1 + n.glow * 1.5) * zs);
        fill(cHue, 40, 100, n.glow * 70);
        circle(n.x, n.y, n.r * 7 * n.glow * zs);
      } else {
        let a = map(dist(mouseX, mouseY, n.x, n.y), 0, 260,
                    isDarkMode ? 200 : 155, isDarkMode ? 65 : 40, true);
        if (n.maxSolitude !== undefined) {
          const fadeRatio = 1 - (n.solitude / n.maxSolitude);
          a = a * max(0, fadeRatio);
        }
        fill(cHue, 55, isDarkMode ? 90 : 62, a);
        circle(n.x, n.y, n.r * 2 * zs);
      }
    }
  }

  strokeWeight(1); noFill();

  const ORBIT_R = mouseIsPressed
    ? 45 + sin(frameCount * 0.09) * 18
    : 6  + sin(frameCount * 0.022) * 5;
  const rot = mouseIsPressed
    ? frameCount * 0.055
    : frameCount * 0.005;

  for (const t of TRAILS) {
    for (let i = 1; i < NUM; i++) { t.x[i-1] = t.x[i]; t.y[i-1] = t.y[i]; }
    const tx = mouseX + cos(t.ang + rot) * ORBIT_R;
    const ty = mouseY + sin(t.ang + rot) * ORBIT_R;
    t.x[NUM-1] += (noise(t.ns,      frameCount * 0.01) * 2 - 1) * rng + (tx - t.x[NUM-1]) * t.sf;
    t.y[NUM-1] += (noise(t.ns + 50, frameCount * 0.01) * 2 - 1) * rng + (ty - t.y[NUM-1]) * t.sf;
    t.x[NUM-1]  = constrain(t.x[NUM-1], 0, width);
    t.y[NUM-1]  = constrain(t.y[NUM-1], 0, height);
  }

  for (const a of AMBIENT) {
    for (let i = 1; i < NUM; i++) { a.x[i-1] = a.x[i]; a.y[i-1] = a.y[i]; }
    const tx = mouseX + cos(a.ang + rot) * ORBIT_R;
    const ty = mouseY + sin(a.ang + rot) * ORBIT_R;
    a.x[NUM-1] += (noise(a.ns,      frameCount * 0.01) * 2 - 1) * rng + (tx - a.x[NUM-1]) * a.sf;
    a.y[NUM-1] += (noise(a.ns + 50, frameCount * 0.01) * 2 - 1) * rng + (ty - a.y[NUM-1]) * a.sf;
    a.x[NUM-1]  = constrain(a.x[NUM-1], 0, width);
    a.y[NUM-1]  = constrain(a.y[NUM-1], 0, height);
  }

  colorMode(HSB, 360, 100, 100, 255);
  const sat = isDarkMode ? 68 : 85;
  const bri = isDarkMode ? 96 : 75;

  for (const t of TRAILS) {
    for (let i = 1; i < NUM; i++) {
      const tt = i / NUM;
      strokeWeight(lerp(1.5, 0.3, tt));
      stroke((t.hue + hueShift) % 360, sat, bri, tt * 7);
      line(t.x[i-1], t.y[i-1], t.x[i], t.y[i]);
    }
    strokeWeight(1);
    for (let i = 1; i < NUM; i++) {
      const tt = i / NUM;
      stroke((t.hue + hueShift) % 360, sat - 14, bri, tt * 38);
      line(t.x[i-1], t.y[i-1], t.x[i], t.y[i]);
    }
  }

  for (const a of AMBIENT) {
    for (let i = 1; i < NUM; i++) {
      const tt = i / NUM;
      strokeWeight(lerp(2.5, 0.4, tt));
      stroke((a.hue + hueShift) % 360, sat, bri, tt * 16);
      line(a.x[i-1], a.y[i-1], a.x[i], a.y[i]);
    }
    strokeWeight(1);
    for (let i = 1; i < NUM; i++) {
      const tt = i / NUM;
      stroke((a.hue + hueShift) % 360, sat - 14, bri, tt * 38);
      line(a.x[i-1], a.y[i-1], a.x[i], a.y[i]);
    }
  }

  colorMode(RGB, 255);

  const ALL = [...TRAILS, ...AMBIENT];

  strokeWeight(5);
  for (let i = 1; i < NUM; i++) {
    const val   = (i / NUM) * 200 + 32;
    const alpha = min((i + 4) * 0.22, 12);
    stroke(isDarkMode ? val       : val * 0.55,
           isDarkMode ? 22        : 20,
           isDarkMode ? 187       : 140,
           alpha);
    for (const t of ALL) line(t.x[i-1], t.y[i-1], t.x[i], t.y[i]);
  }

  strokeWeight(1);
  for (let i = 1; i < NUM; i++) {
    const val = (i / NUM) * 100 + 3;
    stroke(isDarkMode ? val + 110 : val, 30);
    for (const t of ALL) line(t.x[i-1], t.y[i-1], t.x[i], t.y[i]);
  }

  for (let j = 1; j < NUM; j++) {
    const val   = (j / NUM) * 200 + 32;
    const alpha = min(2 * (j + 4), 65);
    stroke(isDarkMode ? val       : val * 0.55,
           isDarkMode ? 22        : 20,
           isDarkMode ? 187       : 140,
           isDarkMode ? alpha     : alpha * 0.55);
    for (const t of ALL) line(t.x[j-1], t.y[j-1], t.x[j], t.y[j]);
  }

  for (const a of ASTEROIDS) {
    const fadeF = a.life < 90 ? a.life / 90 : 1;
    const al    = a.alpha * fadeF;

    if (a.mode === 'orbital') {
      noFill();
      strokeWeight(0.5);
      stroke(a.fiery ? 200 : 185, a.fiery ? 80 : 178, a.fiery ? 30 : 168,
             al * (isDarkMode ? 0.14 : 0.09));
      push();
        translate(gravCx, gravCy);
        rotate(a.inc);
        ellipse(0, 0, a.sa * 2, a.sb * 2);
      pop();
    }

    noStroke();
    if (a.mode === 'orbital') {
      for (let t = 0; t < a.trail.length; t++) {
        const tt = t / a.trail.length;
        if (a.fiery) {
          fill(210, 78, 28, al * tt * 0.38);
        } else {
          if (isDarkMode) {
            fill(165, 158, 148, al * tt * 0.24);
          } else {
            fill(0, 0, 0, al * tt * 0.28);
          }
        }
        circle(a.trail[t].x, a.trail[t].y, a.curSize * tt * 0.6);
      }
    }

    if (a.mode === 'orbital' || a.mode === 'free') {
      push();
        translate(a.x, a.y);
        rotate(a.rot);
        if (a.fiery) {
          const fireColors = [
            [230, 110, 35],
            [230, 60, 40],
            [220, 50, 100],
            [200, 80, 150],
            [100, 150, 220],
            [150, 200, 100],
            [220, 180, 80]
          ];
          const baseColor = fireColors[a.fireColor % 7];
          const burnProgress = 1 - (a.curSize / a.size);
          const whiteBlend = burnProgress * 0.6;
          const glowR = baseColor[0] * (1 - whiteBlend) + 255 * whiteBlend;
          const glowG = baseColor[1] * (1 - whiteBlend) + 255 * whiteBlend;
          const glowB = baseColor[2] * (1 - whiteBlend) + 255 * whiteBlend;
          const bodyR = (baseColor[0] - 35) * (1 - whiteBlend) + 255 * whiteBlend;
          const bodyG = (baseColor[1] - 48) * (1 - whiteBlend) + 255 * whiteBlend;
          const bodyB = (baseColor[2] - 17) * (1 - whiteBlend) + 255 * whiteBlend;
          fill(glowR, glowG, glowB, al * 0.25);
          beginShape();
          for (let v = 0; v < a.pts; v++) {
            const ang = TWO_PI * v / a.pts;
            vertex(cos(ang)*a.curSize*a.verts[v]*1.85, sin(ang)*a.curSize*a.verts[v]*1.85);
          }
          endShape(CLOSE);
          fill(bodyR, bodyG, bodyB, al);
        } else {
          if (isDarkMode) {
            fill(155, 150, 140, al);
          } else {
            fill(0, 0, 0, al);
          }
        }
        beginShape();
        for (let v = 0; v < a.pts; v++) {
          const ang = TWO_PI * v / a.pts;
          vertex(cos(ang)*a.curSize*a.verts[v], sin(ang)*a.curSize*a.verts[v]);
        }
        endShape(CLOSE);
      pop();
    }
  }

  if (explosion) explodeLines();
}

function explodeLines() {
  for (const t of TRAILS) {
    for (let i = 0; i < NUM; i++) {
      const a = atan2(t.y[i] - mouseY, t.x[i] - mouseX);
      t.x[i] += cos(a) * exStr;
      t.y[i] += sin(a) * exStr;
    }
  }
  for (const a of AMBIENT) {
    for (let i = 0; i < NUM; i++) {
      const ang = atan2(a.y[i] - mouseY, a.x[i] - mouseX);
      a.x[i] += cos(ang) * exStr * 0.55;
      a.y[i] += sin(ang) * exStr * 0.55;
    }
  }
  if (frameCount % 10 === 0) exStr *= 0.88;
  if (exStr < 0.1) { explosion = false; exStr = 8; }
}

function mousePressed() {
  if (nodes.length < maxNodes()) {
    nodes.push({
      x: random(width), y: random(height),
      vx: random(-0.3, 0.3), vy: random(-0.3, 0.3),
      r: random(2, 3.5), glow: 1.0,
      rep: random(28, 72), wx: random(1000), wy: random(2000),
      z: 0, vz: 0
    });
  }

  explosion = true; exStr = 8;

  for (const n of nodes) {
    if (dist(mouseX, mouseY, n.x, n.y) < 320) n.vz += random(-7, 7);
  }

  if (ASTEROIDS.length < 20) {
    const numAsteroids = floor(random(1, 3));
    for (let n = 0; n < numAsteroids; n++) {
      const r = random(140, 280), ecc = random(0.02, 0.42), inc = random(TWO_PI);
      const ph = random(TWO_PI), sa = r, sb = sa * (1 - ecc);
      const sz = random(2.5, 5.5), pts = floor(random(5, 9));
      const orbitSpeedMult = random(0.6, 1.6);
      const verts = Array.from({length: pts}, () => random(0.5, 1.0));

      const ax = random(width * 0.1, width * 0.9);
      const ay = random(height * 0.1, height * 0.9);

      const orbitDirection = random() < 0.5 ? 1 : -1;
      const rotSpd = random(0.008, 0.018) * orbitDirection;
      ASTEROIDS.push({
        x: ax, y: ay, sa, sb, inc, phase: ph,
        rot: random(TWO_PI), rotSpd: rotSpd,
        size: sz, curSize: sz, alpha: random(110, 170),
        fiery: false, pts, verts, trail: [],
        mode: 'orbital', vx: 0, vy: 0,
        life: floor(random(1200, 2400)),
        activated: false, lonely: random() < 0.35,
        explosionDelay: floor(random(140, 460)),
        restTime: 0, fireColor: floor(random(7)),
        orbitSpeedMult: orbitSpeedMult, orbitDirection: orbitDirection
      });
    }
  }

  const hasBurning = ASTEROIDS.some(a => a.fiery);

  for (let k = ASTEROIDS.length - 1; k >= 0; k--) {
    const a = ASTEROIDS[k];
    if (a.mode !== 'orbital') continue;
    const d = dist(mouseX, mouseY, a.x, a.y);
    if (d < 240) {
      a.lonely = false;

      if (hasBurning) {
        nodes.push({
          x: a.x, y: a.y, vx: 0, vy: 0, z: 0, vz: 0,
          r: random(1.8, 3.2), glow: 0.6,
          rep: random(28, 72), wx: random(1000), wy: random(2000)
        });
        ASTEROIDS.splice(k, 1);
      } else {
        if (random() < 0.45) {
          nodes.push({
            x: a.x, y: a.y, vx: 0, vy: 0, z: 0, vz: 0,
            r: random(1.8, 3.2), glow: 0.8,
            rep: random(28, 72), wx: random(1000), wy: random(2000)
          });
          ASTEROIDS.splice(k, 1);
        } else {
          a.activated = true;
        }
      }
    }
  }
}

function updateGalaxyColors() {
  const stops = document.querySelectorAll('#nebulaGradient stop');
  const stops2 = document.querySelectorAll('#nebulaGradient2 stop');
  const ellipse1 = document.querySelector('ellipse:nth-of-type(1)');
  const ellipse2 = document.querySelector('ellipse:nth-of-type(2)');

  if (themeMode === 'super-dark') {
    stops[0].setAttribute('style', 'stop-color:#ff44ff;stop-opacity:1');
    stops[1].setAttribute('style', 'stop-color:#ff00ff;stop-opacity:0.9');
    stops[2].setAttribute('style', 'stop-color:#0099ff;stop-opacity:0.7');
    stops[3].setAttribute('style', 'stop-color:#0055ff;stop-opacity:0');

    stops2[0].setAttribute('style', 'stop-color:#ff33ff;stop-opacity:0.5');
    stops2[1].setAttribute('style', 'stop-color:#0077ff;stop-opacity:0');

    if (ellipse1) ellipse1.setAttribute('stroke', '#ff33ff');
    if (ellipse2) ellipse2.setAttribute('stroke', '#0088ff');
  } else if (themeMode === 'light') {
    stops[0].setAttribute('style', 'stop-color:#ff99cc;stop-opacity:0.8');
    stops[1].setAttribute('style', 'stop-color:#dd88ff;stop-opacity:0.6');
    stops[2].setAttribute('style', 'stop-color:#88aaff;stop-opacity:0.4');
    stops[3].setAttribute('style', 'stop-color:#5588ff;stop-opacity:0');

    stops2[0].setAttribute('style', 'stop-color:#ffaacc;stop-opacity:0.3');
    stops2[1].setAttribute('style', 'stop-color:#88aaff;stop-opacity:0');

    if (ellipse1) ellipse1.setAttribute('stroke', '#cc88ff');
    if (ellipse2) ellipse2.setAttribute('stroke', '#88aaff');
  } else {
    stops[0].setAttribute('style', 'stop-color:#ff99ff;stop-opacity:1');
    stops[1].setAttribute('style', 'stop-color:#dd55ff;stop-opacity:0.85');
    stops[2].setAttribute('style', 'stop-color:#5588ff;stop-opacity:0.6');
    stops[3].setAttribute('style', 'stop-color:#1155ff;stop-opacity:0');

    stops2[0].setAttribute('style', 'stop-color:#ff77ff;stop-opacity:0.4');
    stops2[1].setAttribute('style', 'stop-color:#3366ff;stop-opacity:0');

    if (ellipse1) ellipse1.setAttribute('stroke', '#dd77ff');
    if (ellipse2) ellipse2.setAttribute('stroke', '#6699ff');
  }
}

document.getElementById('planet-toggle-top').addEventListener('click', function () {
  if (themeMode === 'dark') {
    themeMode = 'light';
    isDarkMode = false;
    document.body.classList.add('light-theme');
  } else if (themeMode === 'light') {
    themeMode = 'super-dark';
    isDarkMode = true;
    document.body.classList.remove('light-theme');
  } else {
    themeMode = 'dark';
    isDarkMode = true;
    document.body.classList.remove('light-theme');
  }
  updateGalaxyColors();
});

updateGalaxyColors();

let currentLanguage = 'en';

function setLanguage(lang) {
  currentLanguage = lang;

  document.querySelectorAll('[data-pt], [data-en], [data-de], [data-fr], [data-ja], [data-tr]').forEach(el => {
    const attr = `data-${lang}`;
    if (el.hasAttribute(attr)) {
      el.textContent = el.getAttribute(attr);
    }
  });

  document.querySelectorAll('.lang-flag').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    }
  });

  localStorage.setItem('preferredLanguage', lang);
}

// Language system disabled - using English only
