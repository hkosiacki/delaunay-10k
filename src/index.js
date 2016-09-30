import express from 'express';
import compression from 'compression';

import generate from './generate.js';

const app = express();
app.set('view engine', 'ejs');
app.use(compression({ threshold: '512' }));
app.use(express.static('public'));

const clamp = (v, a, b) => Math.max(a, Math.min(parseInt(v, 10) || 0, b));

const validate = (query) => ({
  w: clamp(query.w, 240, 2560),
  h: clamp(query.h, 240, 2560),
  hue1: clamp(query.hue1, 0, 359),
  hue2: clamp(query.hue2, 0, 359),
  grid: clamp(query.grid, 25, 250),
  disp: clamp(query.disp, 0, 45)
});

app.get('/', (req, res) => res.render('index', { ...validate(req.query), preview: !!req.query.w }));

app.get('/preview', (req, res) => {
  res.type('image/jpeg').send(generate(validate(req.query)));
});

app.get('/download', (req, res) => {
  res.type('image/jpeg').send(generate(validate(req.query), true));
});

app.listen(3000);
