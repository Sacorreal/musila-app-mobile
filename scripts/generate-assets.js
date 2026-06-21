/**
 * Generador de assets para Musila — usa pngjs (sin dependencias nativas)
 * Ejecutar: node scripts/generate-assets.js
 */
const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'assets', 'images');

// ─── Colores de marca ────────────────────────────────────────────────────────
const C = {
  bg:          [8, 11, 18, 255],        // #080B12
  bgLight:     [14, 20, 34, 255],       // #0E1420
  primary:     [32, 138, 239, 255],     // #208AEF
  primaryDark: [2, 116, 223, 255],      // #0274DF
  accent:      [60, 159, 254, 255],     // #3C9FFE
  white:       [255, 255, 255, 255],
  transparent: [0, 0, 0, 0],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t; }

function lerpColor(c1, c2, t) {
  return c1.map((v, i) => Math.round(lerp(v, c2[i], t)));
}

/** Mezcla src sobre dst con alpha compositing */
function blend(dst, src) {
  const sa = src[3] / 255;
  const da = dst[3] / 255;
  const oa = sa + da * (1 - sa);
  if (oa === 0) return [0, 0, 0, 0];
  return [
    Math.round((src[0] * sa + dst[0] * da * (1 - sa)) / oa),
    Math.round((src[1] * sa + dst[1] * da * (1 - sa)) / oa),
    Math.round((src[2] * sa + dst[2] * da * (1 - sa)) / oa),
    Math.round(oa * 255),
  ];
}

function setPixel(data, w, x, y, color) {
  if (x < 0 || y < 0 || x >= w || y >= Math.floor(data.length / 4 / w)) return;
  const idx = (y * w + x) * 4;
  const dst = [data[idx], data[idx+1], data[idx+2], data[idx+3]];
  const out = blend(dst, color);
  data[idx]   = out[0];
  data[idx+1] = out[1];
  data[idx+2] = out[2];
  data[idx+3] = out[3];
}

/** Dibuja un círculo relleno con color sólido o degradado radial */
function fillCircle(data, w, cx, cy, r, colorFn) {
  const x0 = Math.floor(cx - r - 1);
  const x1 = Math.ceil(cx + r + 1);
  const y0 = Math.floor(cy - r - 1);
  const y1 = Math.ceil(cy + r + 1);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > r + 0.5) continue;
      // anti-aliasing
      const alpha = dist < r - 0.5 ? 1 : (r + 0.5 - dist);
      const t = dist / r;
      const color = colorFn(t, dx, dy);
      setPixel(data, w, x, y, [...color.slice(0,3), Math.round(color[3] * alpha)]);
    }
  }
}

/** Rectángulo relleno */
function fillRect(data, w, x0, y0, x1, y1, color) {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++)
      setPixel(data, w, x, y, color);
}

/** Rectángulo redondeado relleno */
function fillRoundRect(data, w, x0, y0, rw, rh, radius, colorFn) {
  const x1 = x0 + rw - 1, y1 = y0 + rh - 1;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      // Verificar si está dentro del rectángulo redondeado
      const nearX = Math.max(x0 + radius, Math.min(x1 - radius, x));
      const nearY = Math.max(y0 + radius, Math.min(y1 - radius, y));
      const dx = x - nearX, dy = y - nearY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > radius + 0.5) continue;
      const alpha = dist < radius - 0.5 ? 1 : (radius + 0.5 - dist);
      const tx = (x - x0) / rw, ty = (y - y0) / rh;
      const color = colorFn(tx, ty);
      setPixel(data, w, x, y, [...color.slice(0,3), Math.round(color[3] * alpha)]);
    }
  }
}

function createPNG(width, height, drawFn) {
  const png = new PNG({ width, height, filterType: -1 });
  // Inicializar transparente
  png.data.fill(0);
  drawFn(png.data, width, height);
  return png;
}

function savePNG(png, filePath) {
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(filePath, buffer);
  console.log('✓', path.relative(path.join(__dirname, '..'), filePath), `(${png.width}×${png.height})`);
}

// ─── Diseño del ícono Musila ──────────────────────────────────────────────────
// El ícono es una "nota musical" estilizada:
//   • Fondo: gradiente diagonal oscuro (#080B12 → #0E1420)
//   • Círculo central con gradiente azul (#0274DF → #3C9FFE)
//   • Símbolo: forma de corchea / nota musical en blanco

function drawBackground(data, w, h) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const t = (x / w + y / h) / 2;
      const color = lerpColor(C.bg, C.bgLight, t * 0.6);
      color[3] = 255;
      setPixel(data, w, x, y, color);
    }
  }
}

/** Gradiente radial azul del ícono principal */
function iconGradient(t) {
  const clamped = Math.min(1, t);
  const color = lerpColor(C.accent, C.primaryDark, clamped * clamped);
  color[3] = 255;
  return color;
}

/** Dibuja una nota musical simplificada:
 *  - Elipse (cabeza de nota) abajo a la derecha
 *  - Tallo vertical hacia arriba
 *  - Corchete horizontal (flag) en la parte superior
 */
function drawMusicNote(data, w, cx, cy, scale, color) {
  const s = scale;

  // ── Cabeza de nota (elipse inclinada → aproximada con círculo achatado) ──
  const headRx = s * 0.22;
  const headRy = s * 0.16;
  const headCx = cx + s * 0.10;
  const headCy = cy + s * 0.30;
  // Dibujar elipse con antialiasing
  for (let y = Math.floor(headCy - headRy - 2); y <= Math.ceil(headCy + headRy + 2); y++) {
    for (let x = Math.floor(headCx - headRx - 2); x <= Math.ceil(headCx + headRx + 2); x++) {
      const dx = (x - headCx) / headRx;
      const dy = (y - headCy) / headRy;
      // Rotar -20 grados para inclinar la cabeza
      const angle = -0.35; // radianes
      const rdx = dx * Math.cos(angle) - dy * Math.sin(angle);
      const rdy = dx * Math.sin(angle) + dy * Math.cos(angle);
      const d = Math.sqrt(rdx * rdx + rdy * rdy);
      if (d > 1.5) continue;
      const alpha = d < 0.9 ? 1 : (1.5 - d) / 0.6;
      setPixel(data, w, x, y, [...color.slice(0,3), Math.round(color[3] * alpha)]);
    }
  }

  // ── Tallo vertical ──
  const stemX = Math.round(headCx + headRx * 0.7);
  const stemTop = Math.round(headCy - s * 0.70);
  const stemBot = Math.round(headCy);
  const stemW = Math.max(2, Math.round(s * 0.055));
  fillRect(data, w, stemX, stemTop, stemX + stemW - 1, stemBot, color);

  // ── Flag (corchete) — arco cuadratico hacia la derecha ──
  const flagStartX = stemX + Math.floor(stemW / 2);
  const flagStartY = stemTop;
  // Simulamos con 3 segmentos de línea que forman una curva en S
  const segments = [
    { dx: s * 0.20, dy: s * 0.10 },
    { dx: s * 0.25, dy: s * 0.18 },
    { dx: s * 0.15, dy: s * 0.28 },
  ];
  let px = flagStartX, py = flagStartY;
  for (const seg of segments) {
    const ex = Math.round(px + seg.dx);
    const ey = Math.round(py + seg.dy);
    drawThickLine(data, w, Math.round(px), Math.round(py), ex, ey, Math.max(2, Math.round(stemW * 0.9)), color);
    px = ex; py = ey;
  }
}

function drawThickLine(data, w, x0, y0, x1, y1, thickness, color) {
  const dx = x1 - x0, dy = y1 - y0;
  const len = Math.sqrt(dx*dx + dy*dy);
  if (len === 0) return;
  const steps = Math.ceil(len * 2);
  const half = thickness / 2;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const bx = x0 + dx * t;
    const by = y0 + dy * t;
    // Pincel circular
    for (let oy = -half - 1; oy <= half + 1; oy++) {
      for (let ox = -half - 1; ox <= half + 1; ox++) {
        const d = Math.sqrt(ox*ox + oy*oy);
        if (d > half + 0.5) continue;
        const alpha = d < half - 0.5 ? 1 : (half + 0.5 - d);
        const px = Math.round(bx + ox);
        const py = Math.round(by + oy);
        const idx = (py * w + px) * 4;
        if (px < 0 || py < 0 || px >= w || py >= Math.floor(data.length / 4 / w)) continue;
        const dst = [data[idx], data[idx+1], data[idx+2], data[idx+3]];
        const src = [...color.slice(0,3), Math.round(color[3] * alpha)];
        const out = blend(dst, src);
        data[idx] = out[0]; data[idx+1] = out[1]; data[idx+2] = out[2]; data[idx+3] = out[3];
      }
    }
  }
}

// ─── Ícono principal 1024×1024 ───────────────────────────────────────────────
function generateIcon(size) {
  return createPNG(size, size, (data, w, h) => {
    // 1. Fondo oscuro
    drawBackground(data, w, h);

    // 2. Círculo azul degradado central
    const cx = w / 2, cy = h / 2;
    const r = w * 0.42;
    fillCircle(data, w, cx, cy, r, (t) => {
      // t=0 centro → accent, t=1 borde → primaryDark
      return iconGradient(t);
    });

    // 3. Halo/glow alrededor del círculo
    const glowR = r * 1.05;
    fillCircle(data, w, cx, cy, glowR, (t) => {
      if (t < 0.95) return [0,0,0,0];
      const a = Math.round((1 - (t - 0.95) / 0.10) * 60);
      return [...C.accent.slice(0,3), a];
    });

    // 4. Nota musical en blanco centrada
    const noteScale = w * 0.40;
    drawMusicNote(data, w, cx - noteScale * 0.10, cy - noteScale * 0.05, noteScale, C.white);
  });
}

// ─── Splash icon 256×256 (fondo transparente, solo símbolo blanco) ───────────
function generateSplashIcon(size) {
  return createPNG(size, size, (data, w, h) => {
    const cx = w / 2, cy = h / 2;

    // Círculo azul semi-transparente de fondo
    fillCircle(data, w, cx, cy, w * 0.45, (t) => {
      const color = lerpColor(C.accent, C.primaryDark, t * t);
      color[3] = 255;
      return color;
    });

    // Nota musical blanca centrada
    const noteScale = w * 0.42;
    drawMusicNote(data, w, cx - noteScale * 0.10, cy - noteScale * 0.05, noteScale, C.white);
  });
}

// ─── Favicon 64×64 ───────────────────────────────────────────────────────────
function generateFavicon(size) {
  return createPNG(size, size, (data, w, h) => {
    drawBackground(data, w, h);
    const cx = w / 2, cy = h / 2;
    fillCircle(data, w, cx, cy, w * 0.44, (t) => iconGradient(t));
    drawMusicNote(data, w, cx - w * 0.04, cy - h * 0.02, w * 0.42, C.white);
  });
}

// ─── Android adaptive icon ───────────────────────────────────────────────────
// foreground: nota musical sobre fondo transparente (108dp, safe zone 72dp)
function generateAndroidForeground(size) {
  return createPNG(size, size, (data, w, h) => {
    const cx = w / 2, cy = h / 2;
    // Zona segura = 66% del tamaño → nota dentro
    const noteScale = w * 0.38;
    fillCircle(data, w, cx, cy, w * 0.30, (t) => {
      const color = lerpColor(C.accent, C.primaryDark, t * t);
      color[3] = 255;
      return color;
    });
    drawMusicNote(data, w, cx - noteScale * 0.10, cy - noteScale * 0.05, noteScale, C.white);
  });
}

// background: gradiente azul sólido
function generateAndroidBackground(size) {
  return createPNG(size, size, (data, w, h) => {
    const cx = w / 2, cy = h / 2;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - cx, dy = y - cy;
        const t = Math.sqrt(dx*dx + dy*dy) / (w * 0.707);
        const color = lerpColor(C.primary, C.primaryDark, Math.min(1, t));
        color[3] = 255;
        setPixel(data, w, x, y, color);
      }
    }
  });
}

// monochrome: forma en blanco sobre negro
function generateAndroidMonochrome(size) {
  return createPNG(size, size, (data, w, h) => {
    // Fondo negro
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0; data[i+1] = 0; data[i+2] = 0; data[i+3] = 255;
    }
    const cx = w / 2, cy = h / 2;
    const noteScale = w * 0.40;
    drawMusicNote(data, w, cx - noteScale * 0.10, cy - noteScale * 0.05, noteScale, C.white);
  });
}

// ─── Generar todos los assets ─────────────────────────────────────────────────
console.log('\n🎵 Generando assets de Musila...\n');

savePNG(generateIcon(1024),              path.join(OUT, 'icon.png'));
savePNG(generateSplashIcon(256),         path.join(OUT, 'splash-icon.png'));
savePNG(generateFavicon(64),             path.join(OUT, 'favicon.png'));
savePNG(generateAndroidForeground(432),  path.join(OUT, 'android-icon-foreground.png'));
savePNG(generateAndroidBackground(432),  path.join(OUT, 'android-icon-background.png'));
savePNG(generateAndroidMonochrome(432),  path.join(OUT, 'android-icon-monochrome.png'));

console.log('\n✅ Assets generados en assets/images/\n');
