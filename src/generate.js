import rng from 'sc-random';
import delaunay from 'delaunay-fast';
import pureimage from 'pureimage';
import jpeg from 'jpeg-js';

const { floor, round, sqrt, sin, cos } = Math;

function pad(str) {
  return str.length < 2 ? '0' + str : str;
}

function hex(r, g, b) {
  return '#' + [r, g, b].map((v) => pad(floor(v).toString(16))).join('');
}

function lerp(v0, v1, t) {
  return {
    r: (1 - t) * v0.r + t * v1.r,
    g: (1 - t) * v0.g + t * v1.g,
    b: (1 - t) * v0.b + t * v1.b
  };
}

function color(h, s, v) {
  let r, g, b;
  const i = floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  // eslint-disable-next-line default-case
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  r = floor(r * 255);
  g = floor(g * 255);
  b = floor(b * 255);

  return { r, g, b };
}

function generate(params, fullSize = false) {
  console.time('generate');
  let { w, h, hue1, hue2, grid, disp } = params;
  const seed = w + h + hue1 + hue2 + grid + disp;
  const rand = rng(seed);

  if (!fullSize) {
    const ratio = Math.max(w, h) / 320;
    if (ratio > 1) {
      w = round(w / ratio);
      h = round(h / ratio);
      grid = round(grid / ratio);
    }
  }

  const dx = w / round(w / grid);
  const dy = h / round(h / grid);
  const spread = grid * disp / 100;
  const c1 = color(hue1 / 360, 0.4, 0.6);
  const c2 = color(hue2 / 360, 0.6, 0.4);
  const t = (x, y) => {
    const d1 = sqrt(x * x + y * y);
    const d2 = sqrt((w - x) * (w - x) + (h - y) * (h - y));

    return d1 / (d1 + d2);
  };

  const verts = [];
  let a, r, nx, ny;
  for (let y = -dy / 2; y < h + dy; y += dy) {
    for (let x = -dx / 2; x < w + dx; x += dx) {
      a = rand.random() * 2 * Math.PI;
      r = (0.6 + rand.random() / 2.5) * spread;
      nx = x + r * sin(a);
      ny = y + r * cos(a);

      verts.push({ ...lerp(c1, c2, t(nx, ny)), pos: [nx, ny] });
    }
  }

  const tris = delaunay.triangulate(verts, 'pos');
  const canvas = pureimage.make(w, h);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#555555';
  ctx.fillRect(0, 0, w, h);
  for (let i = tris.length; i;) {
    let c = { r: 0, g: 0, b: 0 };
    ctx.beginPath();

    --i; c.r += verts[tris[i]].r; c.g += verts[tris[i]].g; c.b += verts[tris[i]].b;
    ctx.moveTo(verts[tris[i]].pos[0], verts[tris[i]].pos[1]);
    --i; c.r += verts[tris[i]].r; c.g += verts[tris[i]].g; c.b += verts[tris[i]].b;
    ctx.lineTo(verts[tris[i]].pos[0], verts[tris[i]].pos[1]);
    --i; c.r += verts[tris[i]].r; c.g += verts[tris[i]].g; c.b += verts[tris[i]].b;
    ctx.lineTo(verts[tris[i]].pos[0], verts[tris[i]].pos[1]);

    ctx.closePath();

    c.r /= 3; c.g /= 3; c.b /= 3;
    ctx.strokeStyle = ctx.fillStyle = hex(c.r, c.g, c.b);
    ctx.stroke();
    ctx.fill();
  }

  let image;
  let q = 55;
  do {
    image = jpeg.encode({ data: canvas._buffer, width: w, height: h }, fullSize ? 90 : q).data;
    q -= 10;
  } while (!fullSize && q > 0 && image.length > 4 * 1024);
  console.timeEnd('generate');
  return image;
}

export default generate;
