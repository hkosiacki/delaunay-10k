(function() {
  const image = document.getElementById('image');
  const cv = document.getElementById('canvas');
  const form = document.getElementById('f');
  const { floor, round, sqrt } = Math;

  function clamp(v, a, b) {
    return Math.max(a, Math.min(parseInt(v, 10) || 0, b));
  }

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

  function generate() {
    let w = clamp(document.getElementById('w').value, 240, 2560);
    let h = clamp(document.getElementById('h').value, 240, 2560);
    let hue1 = clamp(document.getElementById('hue1').value, 0, 359);
    let hue2 = clamp(document.getElementById('hue2').value, 0, 359);
    let grid = clamp(document.getElementById('grid').value, 25, 250);
    let disp = clamp(document.getElementById('disp').value, 0, 45);

    const seed = w + h + hue1 + hue2 + grid + disp;
    const rand = window.SCRandom(seed);

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
        nx = x + r * Math.sin(a);
        ny = y + r * Math.cos(a);

        verts.push({ ...lerp(c1, c2, t(nx, ny)), pos: [nx, ny] });
      }
    }

    const tris = window.Delaunay.triangulate(verts, 'pos');
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext('2d');

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
  }

  image && (image.style.display = 'none');
  cv.style.display = 'block';
  document.getElementById('get-pv').disabled = true;
  document.getElementById('save').style.display = 'block';
  (form.onchange = generate)();
})();
