/* Fishing Rig Codex: rig builder, renderer, instructions, bait cards */
(function () {
'use strict';

/* ---------- data ---------- */
var HOOK_ORDER = ['6', '4', '2', '1', '1/0', '2/0', '3/0', '4/0'];
var HOOK_SF = { '6': .52, '4': .6, '2': .7, '1': .8, '1/0': .9, '2/0': 1, '3/0': 1.1, '4/0': 1.2 };
var PATTERNS = {
  aberdeen: { name: 'Aberdeen (fine wire, long shank)', short: 'Aberdeen', shank: 44, gape: 15, wire: 1.7 },
  viking:   { name: 'Viking / O\'Shaughnessy (forged, strong)', short: 'Viking', shank: 33, gape: 18, wire: 2.6 }
};
var BAITS = {
  lug:      { name: 'Black lugworm', min: '2', max: '3/0', elastic: 'loose', card: 'b-lug' },
  blow:     { name: 'Blow lugworm', min: '6', max: '1/0', elastic: 'loose', card: 'b-lug' },
  rag:      { name: 'Ragworm', min: '6', max: '2/0', elastic: 'none', card: 'b-rag' },
  squid:    { name: 'Squid strip', min: '1', max: '4/0', elastic: 'none', card: 'b-tip' },
  lugsquid: { name: 'Lug + squid tip', min: '4', max: '2/0', elastic: 'loose', card: 'b-tip' },
  cocktail: { name: 'Lug & squid cocktail', min: '1/0', max: '4/0', elastic: 'firm', card: 'b-cocktail' },
  peeler:   { name: 'Peeler crab', min: '1', max: '4/0', elastic: 'tight', card: 'b-crab' },
  mackerel: { name: 'Mackerel / bluey strip', min: '1/0', max: '4/0', elastic: 'firm', card: 'b-tip' }
};
var RIGS = {
  flapper: { name: 'Flapper (paternoster)', hooks: [2, 3], build: true },
  clipped: { name: 'Clipped-down', hooks: [1, 2], build: false },
  pennell: { name: 'Pennell (clipped, big bait)', hooks: [1], build: false },
  pulley:  { name: 'Pulley rig', hooks: [1], build: false },
  ledger:  { name: 'Running ledger', hooks: [1], build: false }
};
var PRESETS = {
  sunday:  { label: 'My Shoebury setup', rig: 'flapper', n: 2, build: 'crimp', hooks: ['1', '1/0'], pattern: 'aberdeen', bait: 'lugsquid', snood: 30, body: 60, snoodLb: 25, lead: 5, leadType: 'grip', beads: 'red' },
  whiting: { label: 'Whiting', rig: 'flapper', n: 2, build: 'crimp', hooks: ['1', '1'], pattern: 'aberdeen', bait: 'lugsquid', snood: 30, body: 60, snoodLb: 25, lead: 5, leadType: 'grip', beads: 'red' },
  codling: { label: 'Codling', rig: 'pennell', n: 1, build: 'crimp', hooks: ['3/0'], pattern: 'viking', bait: 'cocktail', snood: 45, body: 80, snoodLb: 50, lead: 6, leadType: 'grip', beads: 'red' },
  flounder:{ label: 'Flounder', rig: 'flapper', n: 2, build: 'crimp', hooks: ['2', '2'], pattern: 'aberdeen', bait: 'rag', snood: 35, body: 60, snoodLb: 20, lead: 4, leadType: 'plain', beads: 'lumi' },
  dab:     { label: 'Dabs', rig: 'flapper', n: 3, build: 'crimp', hooks: ['2', '2', '2'], pattern: 'aberdeen', bait: 'lug', snood: 20, body: 60, snoodLb: 20, lead: 5, leadType: 'grip', beads: 'red' },
  thorn:   { label: 'Thornback ray', rig: 'clipped', n: 1, build: 'crimp', hooks: ['3/0'], pattern: 'viking', bait: 'mackerel', snood: 40, body: 80, snoodLb: 40, lead: 6, leadType: 'grip', beads: 'none' },
  hound:   { label: 'Smoothhound', rig: 'pulley', n: 1, build: 'crimp', hooks: ['2/0'], pattern: 'viking', bait: 'peeler', snood: 50, body: 80, snoodLb: 50, lead: 5, leadType: 'grip', beads: 'none' },
  bass:    { label: 'Bass (close in)', rig: 'ledger', n: 1, build: 'crimp', hooks: ['2/0'], pattern: 'viking', bait: 'rag', snood: 90, body: 60, snoodLb: 25, lead: 3, leadType: 'plain', beads: 'none' },
  sole:    { label: 'Sole', rig: 'flapper', n: 3, build: 'knot', hooks: ['4', '4', '4'], pattern: 'aberdeen', bait: 'rag', snood: 25, body: 50, snoodLb: 15, lead: 4, leadType: 'plain', beads: 'lumi' }
};

var S = clone(PRESETS.sunday); S.preset = 'sunday'; S.view = 'cast';

function clone(o) { return JSON.parse(JSON.stringify(o)); }
function hi(a) { return HOOK_ORDER.indexOf(a); }
function $(id) { return document.getElementById(id); }
function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
function r1(n) { return Math.round(n * 10) / 10; }

/* ---------- drawing primitives ---------- */
var COL = { line: '#d9e7ef', main: '#7f9aab', snood: '#58d0d4', metal: '#bfc5ca', metalD: '#7d858c', crimp: '#6d7379', lead: '#8a9199', leadD: '#666d74', clip: '#f39a3a', lug: '#6b3c21', lugT: '#45250f', blow: '#a9674b', blowT: '#87503a', rag: '#b4453b', ragL: '#e28b7c', squid: '#f1e7d2', crab: '#e2884f', crabS: '#5f7a2c', mack: '#cfd7dd', mackB: '#2f6371', elastic: '#ffffff', label: '#cfe0ea', leader: '#4d6b80' };

function line(x1, y1, x2, y2, c, w, dash) {
  return '<line x1="' + r1(x1) + '" y1="' + r1(y1) + '" x2="' + r1(x2) + '" y2="' + r1(y2) + '" stroke="' + c + '" stroke-width="' + (w || 1.5) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + ' stroke-linecap="round"/>';
}
function path(d, c, w, fill, extra) {
  return '<path d="' + d + '" stroke="' + (c || 'none') + '" stroke-width="' + (w || 1.5) + '" fill="' + (fill || 'none') + '" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '/>';
}
function crimp(x, y) {
  return '<rect x="' + (x - 4.5) + '" y="' + (y - 3.2) + '" width="9" height="6.4" rx="1.3" fill="' + COL.crimp + '"/><rect x="' + (x - 4.5) + '" y="' + (y - 3.2) + '" width="9" height="1.8" rx=".8" fill="#a3aab0"/>';
}
function bead(x, y, kind) {
  var c = kind === 'lumi' ? '#d4f26a' : '#d8452f';
  return '<circle cx="' + x + '" cy="' + y + '" r="4.4" fill="' + c + '"/><circle cx="' + (x - 1.5) + '" cy="' + (y - 1.5) + '" r="1.3" fill="#fff" opacity=".75"/>';
}
function rollSwivel(x, y, side) {
  var ex = side === 'right' ? x + 9 : x - 9;
  return line(x, y, ex, y, COL.metal, 1.4) +
    '<rect x="' + (x - 4) + '" y="' + (y - 7) + '" width="8" height="14" rx="3.2" fill="' + COL.metal + '" stroke="' + COL.metalD + '" stroke-width=".8"/>' +
    '<line x1="' + (x - 4) + '" y1="' + y + '" x2="' + (x + 4) + '" y2="' + y + '" stroke="' + COL.metalD + '" stroke-width=".8"/>' +
    '<circle cx="' + ex + '" cy="' + y + '" r="3" fill="none" stroke="' + COL.metal + '" stroke-width="1.6"/>';
}
function topSwivel(x, y) {
  return '<circle cx="' + x + '" cy="' + (y - 12) + '" r="4" fill="none" stroke="' + COL.metal + '" stroke-width="1.7"/>' +
    '<rect x="' + (x - 4.5) + '" y="' + (y - 7.5) + '" width="9" height="15" rx="3.5" fill="' + COL.metal + '" stroke="' + COL.metalD + '" stroke-width=".8"/>' +
    '<line x1="' + (x - 4.5) + '" y1="' + y + '" x2="' + (x + 4.5) + '" y2="' + y + '" stroke="' + COL.metalD + '" stroke-width=".8"/>' +
    '<circle cx="' + x + '" cy="' + (y + 12) + '" r="4" fill="none" stroke="' + COL.metal + '" stroke-width="1.7"/>';
}
function leadLink(x, y) {
  return path('M' + x + ' ' + y + ' L' + x + ' ' + (y + 5) + ' M' + (x - 4) + ' ' + (y + 6) + ' h8 v10 a4 4 0 0 1 -8 0 z', COL.metal, 1.6) +
    path('M' + (x - 4) + ' ' + (y + 12) + ' l8 -4', COL.metal, 1.2);
}
function leadWeight(x, y, oz, type) {
  var h = 22 + oz * 3.2, w = h * .3, s = '';
  if (type === 'grip') {
    [-1, 1].forEach(function (d) {
      s += path('M' + (x + d * w * .45) + ' ' + (y + h * .82) + ' q' + (d * w * .5) + ' ' + (h * .2) + ' ' + (d * w * 1.3) + ' ' + (h * .3) + ' l' + (d * 2) + ' -4', '#c7ccd1', 1.4);
      s += path('M' + (x + d * w * .2) + ' ' + (y + h * .9) + ' q' + (d * w * .2) + ' ' + (h * .2) + ' ' + (d * w * .6) + ' ' + (h * .33) + ' l' + (d * 2) + ' -4', '#c7ccd1', 1.4);
    });
  }
  s += path('M' + x + ' ' + y + ' C' + (x + w * 1.2) + ' ' + (y + h * .35) + ' ' + (x + w * 1.1) + ' ' + (y + h) + ' ' + x + ' ' + (y + h) + ' C' + (x - w * 1.1) + ' ' + (y + h) + ' ' + (x - w * 1.2) + ' ' + (y + h * .35) + ' ' + x + ' ' + y + ' Z', 'none', 0, COL.lead);
  s += path('M' + (x - w * .45) + ' ' + (y + h * .4) + ' Q' + (x - w * .55) + ' ' + (y + h * .75) + ' ' + (x - w * .2) + ' ' + (y + h * .9), '#b5bbc1', 1.6);
  s += '<circle cx="' + x + '" cy="' + (y + 2) + '" r="2" fill="none" stroke="' + COL.metal + '" stroke-width="1.3"/>';
  return { svg: s, bottom: y + h + (type === 'grip' ? h * .33 : 0) };
}
function baitClip(x, y) {
  return '<rect x="' + (x - 2.5) + '" y="' + (y - 9) + '" width="5" height="11" rx="1.5" fill="' + COL.clip + '"/>' +
    path('M' + (x - 2) + ' ' + (y - 7) + ' h-8 q-4 0 -4 4 v6', COL.clip, 2.2);
}

/* hook: (x,y) = centre of eye; hangs down, bend at bottom, point rises on the left */
function hook(x, y, size, pat, k) {
  var P = PATTERNS[pat], sf = HOOK_SF[size], s = sf * (k || 1);
  var e = 3.2 * s, L = P.shank * s, r = P.gape * s / 2, pt = L * .5, w = P.wire * Math.max(sf, .7) * (k || 1);
  var px = x - 2 * r, py = y + L - pt;
  var svg = '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r1(e) + '" fill="none" stroke="' + COL.metal + '" stroke-width="' + r1(w * .8) + '"/>' +
    path('M' + r1(x) + ' ' + r1(y + e) + ' L' + r1(x) + ' ' + r1(y + L) + ' A' + r1(r) + ' ' + r1(r) + ' 0 0 1 ' + r1(px) + ' ' + r1(y + L) + ' L' + r1(px) + ' ' + r1(py), COL.metal, r1(w)) +
    path('M' + r1(px) + ' ' + r1(py + pt * .42) + ' l' + r1(3.4 * s) + ' ' + r1(5.4 * s), COL.metal, r1(w * .8)) +
    path('M' + r1(x + w * .35) + ' ' + r1(y + e + 2) + ' L' + r1(x + w * .35) + ' ' + r1(y + L * .9), '#ffffff', r1(Math.max(.6, w * .25)), 'none', ' opacity=".45"');
  return { svg: svg, x: x, y: y, top: y + e, shankBot: y + L, bottom: y + L + r, px: px, py: py, r: r, s: s, sf: sf, L: L, k: k || 1 };
}

function elasticWraps(x, top, bot, w, gap) {
  var s = '';
  for (var yy = bot - 2; yy > top + 2; yy -= gap) s += line(x - w / 2 - 1, yy, x + w / 2 + 1, yy - w * .7, COL.elastic, Math.min(1.8, Math.max(1, w * .1)));
  return s;
}
function worm(x, top, bot, w, body, tail) {
  var s = '<rect x="' + r1(x - w / 2) + '" y="' + r1(top) + '" width="' + r1(w) + '" height="' + r1(bot - top) + '" rx="' + r1(w / 2) + '" fill="' + body + '"/>';
  s += '<rect x="' + r1(x - w / 2) + '" y="' + r1(top) + '" width="' + r1(w) + '" height="' + r1((bot - top) * .26) + '" rx="' + r1(w / 2) + '" fill="' + tail + '"/>';
  for (var yy = top + w * .9; yy < bot - w * .5; yy += Math.max(3, w * .45)) s += line(x - w / 2 + .8, yy, x + w / 2 - .8, yy, 'rgba(0,0,0,.22)', .8);
  s += line(x - w * .18, top + w * .6, x - w * .18, bot - w * .6, 'rgba(255,255,255,.14)', Math.max(.8, w * .14));
  return s;
}
function strip(px, py, len, wid, fill, band) {
  var d = 'M' + r1(px - wid * .4) + ' ' + r1(py) + ' Q' + r1(px - wid) + ' ' + r1(py + len * .5) + ' ' + r1(px - wid * .1) + ' ' + r1(py + len) + ' Q' + r1(px + wid * .5) + ' ' + r1(py + len * .5) + ' ' + r1(px + wid * .45) + ' ' + r1(py) + ' Z';
  var s = '<g class="wig" style="transform-origin:' + r1(px) + 'px ' + r1(py) + 'px">' + path(d, 'none', 0, fill);
  if (band) s += path('M' + r1(px + wid * .3) + ' ' + r1(py + 2) + ' Q' + r1(px + wid * .35) + ' ' + r1(py + len * .5) + ' ' + r1(px - wid * .05) + ' ' + r1(py + len * .95), band, Math.max(1.2, wid * .35));
  else for (var i = 1; i < 4; i++) s += '<circle cx="' + r1(px - wid * .15) + '" cy="' + r1(py + len * i / 4.5) + '" r="' + r1(Math.max(.5, wid * .07)) + '" fill="#b98aa3"/>';
  return s + '</g>';
}

/* bait on a hook */
function bait(type, h, opts) {
  opts = opts || {};
  var x = h.x, k = h.k, w = (5 + 6 * h.sf) * k, s = '';
  var extra = Math.max(0, (h.sf - .62)) * 75 * k;       /* bigger hooks carry more worm up the snood */
  var top = h.top - extra, bot = h.shankBot + h.r * .35;
  var stage = opts.stage == null ? 99 : opts.stage;
  if (type === 'lug' || type === 'blow') {
    s += worm(x, top, bot, w, type === 'lug' ? COL.lug : COL.blow, type === 'lug' ? COL.lugT : COL.blowT);
    if (stage > 0) s += elasticWraps(x, top, bot, w, 8.5 * k * h.sf + 3);
  } else if (type === 'rag') {
    var t2 = h.top + h.L * .2, rw = w * .72;
    s += '<rect x="' + r1(x - rw / 2) + '" y="' + r1(t2) + '" width="' + r1(rw) + '" height="' + r1(h.shankBot - t2) + '" rx="' + r1(rw / 2) + '" fill="' + COL.rag + '"/>';
    for (var yy = t2 + 3; yy < h.shankBot; yy += 3.2 * k) { s += line(x - rw / 2, yy, x - rw / 2 - 2.2 * k, yy + 1, COL.ragL, .9 * k); s += line(x + rw / 2, yy, x + rw / 2 + 2.2 * k, yy + 1, COL.ragL, .9 * k); }
    var tx = x - h.r * .4, ty = h.bottom - h.r * .2;
    s += '<g class="wig" style="transform-origin:' + r1(tx) + 'px ' + r1(ty) + 'px">' + path('M' + r1(x) + ' ' + r1(h.shankBot - 1) + ' Q' + r1(x - h.r * .2) + ' ' + r1(h.bottom + h.r * .6) + ' ' + r1(tx - h.r * 1.4) + ' ' + r1(h.bottom + h.r * 1.6) + ' T' + r1(tx - h.r * 3.4) + ' ' + r1(h.bottom + h.r * 3.4), COL.rag, r1(rw * .85)) + '</g>';
  } else if (type === 'squid') {
    s += strip(h.px, h.py + 2, 30 * h.s, 7 * h.s, COL.squid);
  } else if (type === 'mackerel') {
    s += strip(h.px, h.py + 2, 44 * h.s, 11 * h.s, COL.mack, COL.mackB);
  } else if (type === 'lugsquid') {
    var tp = h.sf < .85 ? h.top + h.L * .35 : top;
    s += worm(x, tp, bot, w, COL.lug, COL.lugT);
    s += elasticWraps(x, tp, bot, w, 9 * k * h.sf + 3);
    s += strip(h.px, h.py + 2, 28 * h.s, 6 * h.s, COL.squid);
  } else if (type === 'cocktail') {
    var t3 = top - 22 * k * h.sf;
    s += worm(x, t3, bot, w * 1.05, COL.lug, COL.lugT);
    if (stage > 0) {
      var a = t3 + (bot - t3) * .2, b = bot - (bot - t3) * .1;
      s += '<rect x="' + r1(x - w * .72) + '" y="' + r1(a) + '" width="' + r1(w * 1.44) + '" height="' + r1(b - a) + '" rx="' + r1(w * .5) + '" fill="' + COL.squid + '" opacity=".93"/>';
    }
    if (stage > 1) s += elasticWraps(x, t3, bot, w * 1.44, 4.5 * k * h.sf + 2);
  } else if (type === 'peeler') {
    var pt = h.top + h.L * .12, pw = w * 1.45;
    s += '<rect x="' + r1(x - pw / 2) + '" y="' + r1(pt) + '" width="' + r1(pw) + '" height="' + r1(bot - pt) + '" rx="' + r1(pw * .45) + '" fill="' + COL.crab + '"/>';
    s += '<circle cx="' + r1(x - pw * .15) + '" cy="' + r1(pt + (bot - pt) * .35) + '" r="' + r1(pw * .1) + '" fill="#c2643a"/><circle cx="' + r1(x + pw * .18) + '" cy="' + r1(pt + (bot - pt) * .6) + '" r="' + r1(pw * .08) + '" fill="#c2643a"/>';
    for (var j = 0; j < 3; j++) s += line(x + pw / 2, pt + 5 * k + j * 6 * k, x + pw / 2 + 5 * k, pt + 2 * k + j * 6 * k, '#d07a48', 1.6 * k);
    s += elasticWraps(x, pt, bot, pw, 3.4 * k * h.sf + 1.5);
  }
  return s;
}

/* ---------- label placement ---------- */
function placeLabels(labels, xText, minGap, yMin) {
  labels.sort(function (a, b) { return a.y - b.y; });
  var last = yMin || -1e9;
  labels.forEach(function (l) { l.ly = Math.max(l.y, last + minGap); last = l.ly; });
  return labels.map(function (l) {
    return path('M' + r1(l.x) + ' ' + r1(l.y) + ' L' + (xText - 22) + ' ' + r1(l.y) + ' L' + (xText - 5) + ' ' + r1(l.ly), COL.leader, .8, 'none', ' stroke-dasharray="2 2"') +
      '<text x="' + xText + '" y="' + r1(l.ly + 4) + '" font-size="11.5" fill="' + (l.c || COL.label) + '">' + esc(l.t) + '</text>';
  }).join('');
}

/* ---------- rig geometry ---------- */
var K = 3.4;          /* px per cm */
var BX = 170;         /* rig body x */
var LX = 236;         /* label x */

function stationStack(y, build, beads) {
  var s = '';
  if (build === 'knot') {
    s += path('M' + BX + ' ' + (y - 6) + ' C' + (BX - 14) + ' ' + (y - 6) + ' ' + (BX - 14) + ' ' + (y + 6) + ' ' + BX + ' ' + (y + 6), COL.line, 1.8);
    s += '<circle cx="' + BX + '" cy="' + y + '" r="2.6" fill="' + COL.line + '"/>';
    return { svg: s, eye: [BX - 11, y] };
  }
  if (beads !== 'none') { s += crimp(BX, y - 17) + bead(BX, y - 10.5, beads) + rollSwivel(BX, y, 'left') + bead(BX, y + 10.5, beads) + crimp(BX, y + 17); }
  else { s += crimp(BX, y - 11) + rollSwivel(BX, y, 'left') + crimp(BX, y + 11); }
  return { svg: s, eye: [BX - 9, y] };
}

function buildRig(st) {
  var g = { svg: '', labels: [], warns: [], stations: [], clips: [], h: 0, bodyCm: 0 };
  var n = st.n, rig = st.rig, view = st.view;
  var add = function (s) { g.svg += s; };
  var lab = function (x, y, t, c) { g.labels.push({ x: x, y: y, t: t, c: c }); };
  var y0 = 52;

  if (rig === 'ledger') {
    var Kl = 2.3, by = 120;
    add(line(BX, 0, BX, by - 10, COL.main, 1.6, '5 4'));
    lab(BX + 3, 40, 'Main line / shock leader');
    add('<rect x="' + (BX - 3) + '" y="' + (by - 12) + '" width="6" height="24" rx="3" fill="#2f3b44" stroke="#7f8b93" stroke-width=".8"/>');
    add(path('M' + (BX + 3) + ' ' + (by - 6) + ' L' + (BX + 18) + ' ' + (by + 4), '#7f8b93', 1.6));
    var lw = leadWeight(BX + 20, by + 4, st.lead, st.leadType); add(lw.svg);
    lab(BX + 4, by - 8, 'Sliding lead boom');
    lab(BX + 30, by + 30, st.lead + 'oz ' + (st.leadType === 'grip' ? 'grip lead' : 'plain lead'));
    add(line(BX, by + 12, BX, by + 34, COL.main, 1.6));
    add(bead(BX, by + 26, 'red').replace('#d8452f', '#3e86c9'));
    lab(BX + 5, by + 26, '6mm bead');
    add(topSwivel(BX, by + 46));
    lab(BX + 5, by + 46, 'Size 4 swivel');
    var ty = by + 58, len = st.snood * Kl;
    var hx = BX - 70, hy = ty + len;
    add(path('M' + BX + ' ' + ty + ' C' + BX + ' ' + (ty + len * .4) + ' ' + hx + ' ' + (ty + len * .5) + ' ' + hx + ' ' + hy, COL.snood, 1.5));
    lab(BX - 30, ty + len * .45, 'Trace ' + st.snood + 'cm, ' + st.snoodLb + 'lb');
    var hk = hook(hx, hy, st.hooks[0], st.pattern); add(hk.svg); add(bait(st.bait, hk));
    lab(hx + 4, hy + hk.L * .5, 'Size ' + st.hooks[0] + ' ' + PATTERNS[st.pattern].short);
    var sb = hy + hk.L + 40;
    add(line(10, sb, 360, sb, '#33536a', 2));
    g.h = Math.max(sb + 18, lw.bottom + 20);
    g.bodyCm = 0;
    if (st.snood < 50) g.warns.push(['warn', 'A running ledger trace is usually 60–100cm, so the fish can move off with the bait before it feels the lead.']);
    return finish(g, st);
  }

  if (rig === 'pulley') {
    var py0 = 70;
    add(line(BX, 0, BX, py0 - 16, COL.main, 1.6, '5 4'));
    lab(BX + 3, 30, 'Main line / shock leader');
    add(topSwivel(BX, py0)); lab(BX + 6, py0, 'Pulley swivel / bead');
    var leadLeg = 95 * K * .9, hookLeg = 40 * K;
    var lx = BX + 22, lyEnd = py0 + 12 + leadLeg;
    add(line(BX + 2, py0 + 14, lx, lyEnd, COL.line, 2));
    var clipY = lyEnd - 36;
    var hx2 = BX - 40, sy = py0 + 12 + hookLeg;
    add(line(BX - 2, py0 + 14, hx2, sy - 12, COL.line, 2));
    add(bead(BX - 3, py0 + 22, 'red').replace('#d8452f', '#3e86c9'));
    lab(BX + 2, py0 + 24, '6mm bead');
    add(topSwivel(hx2, sy)); lab(hx2 + 6, sy, 'End swivel (size 4)');
    var sn = st.snood * K;
    if (view === 'cast') {
      var cx = lx - (lx - BX) * (36 / leadLeg) + 0, cy = clipY;
      add(baitClip(cx + 1, cy));
      add(path('M' + hx2 + ' ' + (sy + 12) + ' Q' + (hx2 + 10) + ' ' + (cy - 40) + ' ' + (cx - 10) + ' ' + (cy - 30), COL.snood, 1.5));
      var hk2 = hook(cx - 10, cy - 30, st.hooks[0], st.pattern); add(hk2.svg); add(bait(st.bait, hk2));
      lab(cx - 2, cy - 4, 'Bait clip (cast)', COL.clip);
      lab(cx - 6, cy - 30 + hk2.L * .4, 'Size ' + st.hooks[0] + ' ' + PATTERNS[st.pattern].short);
      if (st.snood + 40 < 75) g.warns.push(['warn', 'Snood looks too short to reach the bait clip. On a pulley rig the snood plus the hook leg should reach just above the lead.']);
    } else {
      var hy2 = sy + 12 + sn;
      add(line(hx2, sy + 12, hx2 - 20, hy2, COL.snood, 1.5));
      var hk3 = hook(hx2 - 20, hy2, st.hooks[0], st.pattern); add(hk3.svg); add(bait(st.bait, hk3));
      lab(hx2 - 14, sy + 12 + sn * .5, 'Snood ' + st.snood + 'cm, ' + st.snoodLb + 'lb');
      lab(hx2 - 16, hy2 + hk3.L * .4, 'Size ' + st.hooks[0] + ' ' + PATTERNS[st.pattern].short);
      add(baitClip(lx - 6, clipY));
    }
    lab(BX + 12, py0 + 12 + leadLeg * .45, 'Rig body ' + st.body + 'lb, 150cm');
    add(leadLink(lx, lyEnd)); var lw2 = leadWeight(lx, lyEnd + 22, st.lead, st.leadType); add(lw2.svg);
    lab(lx + 6, lyEnd + 8, 'Lead link');
    lab(lx + 12, lyEnd + 40, st.lead + 'oz ' + (st.leadType === 'grip' ? 'grip lead' : 'plain lead'));
    g.h = lw2.bottom + 24; g.bodyCm = 150;
    return finish(g, st);
  }

  /* vertical rigs: flapper / clipped / pennell */
  var stCm, bodyCm;
  if (rig === 'flapper') { stCm = n === 3 ? [20, 55, 90] : [25, 70]; bodyCm = n === 3 ? 130 : 115; }
  else if (rig === 'clipped') { stCm = n === 2 ? [10, 55] : [20]; bodyCm = 110; }
  else { stCm = [20]; bodyCm = 105; }
  g.bodyCm = bodyCm; g.stations = stCm;
  var yLead = y0 + bodyCm * K;
  add(line(BX, 0, BX, y0 - 24, COL.main, 1.6, '5 4'));
  lab(BX + 3, 14, 'Main line / shock leader');
  add(topSwivel(BX, y0 - 10)); lab(BX + 6, y0 - 10, 'Size 4 rolling swivel');
  add(line(BX, y0 + 2, BX, yLead, COL.line, 2));
  lab(BX + 2, y0 + 30, 'Rig body ' + st.body + 'lb mono');
  var build = rig === 'flapper' ? st.build : 'crimp';

  stCm.forEach(function (cm, i) {
    var y = y0 + cm * K, stk = stationStack(y, build, st.beads);
    add(stk.svg);
    var size = st.hooks[i] || st.hooks[0];
    var snPx = st.snood * K;
    if (i === 0) {
      if (build === 'knot') lab(BX + 2, y, 'Dropper loop at ' + cm + 'cm');
      else {
        if (st.beads !== 'none') { lab(BX + 5, y - 17, 'Crimp'); lab(BX + 5, y - 10.5, 'Bead'); lab(BX + 5, y, 'Size 10 rolling swivel'); lab(BX + 5, y + 10.5, 'Bead'); lab(BX + 5, y + 17, 'Crimp'); }
        else { lab(BX + 5, y - 11, 'Crimp'); lab(BX + 5, y, 'Size 10 rolling swivel'); lab(BX + 5, y + 11, 'Crimp'); }
      }
    } else lab(BX + 5, y, (build === 'knot' ? 'Dropper loop' : 'Station ' + (i + 1)) + ' at ' + cm + 'cm');

    var released = (rig !== 'flapper' && view === 'fish');
    if (rig === 'flapper' || released) {
      var hx = BX - 44, ex = stk.eye[0], ey = stk.eye[1];
      var hyH = ey + Math.max(10, snPx - 26);
      add(path('M' + ex + ' ' + ey + ' L' + (hx + 6) + ' ' + (ey + 6) + ' Q' + hx + ' ' + (ey + 8) + ' ' + hx + ' ' + (ey + 16) + ' L' + hx + ' ' + hyH, COL.snood, 1.5));
      if (rig === 'pennell') {
        var hb = hook(hx, hyH, size, st.pattern), ht = hook(hx, hyH - 7 * K, size, st.pattern);
        add(ht.svg); add(hb.svg);
        add(bait(st.bait, { x: hx, top: ht.top, shankBot: hb.shankBot, r: hb.r, sf: hb.sf, s: hb.s, k: 1, L: hb.shankBot - ht.top, px: hb.px, py: hb.py, bottom: hb.bottom }));
        lab(hx + 6, hyH + hb.L * .5, '2 × size ' + size + ' ' + PATTERNS[st.pattern].short);
      } else {
        var hk = hook(hx, hyH, size, st.pattern); add(hk.svg); add(bait(st.bait, hk));
        lab(hx + 6, hyH + hk.L * .55, 'Size ' + size + ' ' + PATTERNS[st.pattern].short);
        g.stations[i] = { cm: cm, bottomCm: (hk.bottom - y0) / K };
      }
      if (i === 0) lab(hx + 2, ey + snPx * .45, 'Snood ' + st.snood + 'cm, ' + st.snoodLb + 'lb');
    } else {
      /* clipped for the cast: snood runs down beside the body, hook bend in the clip */
      var sx = BX - 13, ey2 = stk.eye[1];
      var eyeY = ey2 + snPx;
      add(path('M' + stk.eye[0] + ' ' + ey2 + ' Q' + sx + ' ' + (ey2 + 4) + ' ' + sx + ' ' + (ey2 + 14) + ' L' + sx + ' ' + eyeY, COL.snood, 1.5));
      var hb2, top2;
      if (rig === 'pennell') {
        hb2 = hook(sx, eyeY, size, st.pattern); var ht2 = hook(sx, eyeY - 7 * K, size, st.pattern);
        add(ht2.svg); add(hb2.svg);
        add(bait(st.bait, { x: sx, top: ht2.top, shankBot: hb2.shankBot, r: hb2.r, sf: hb2.sf, s: hb2.s, k: 1, L: hb2.shankBot - ht2.top, px: hb2.px, py: hb2.py, bottom: hb2.bottom }));
        lab(sx + 6, eyeY - 7 * K, 'Top hook (locked)');
        lab(sx + 6, eyeY + hb2.L * .5, '2 × size ' + size + ' ' + PATTERNS[st.pattern].short);
      } else {
        hb2 = hook(sx, eyeY, size, st.pattern); add(hb2.svg); add(bait(st.bait, hb2));
        lab(sx + 6, eyeY + hb2.L * .4, 'Size ' + size + ' ' + PATTERNS[st.pattern].short);
      }
      var clipY2 = hb2.bottom + 2;
      add(crimp(BX, clipY2 + 9)); add(baitClip(BX, clipY2));
      var clipCm = Math.round((clipY2 - y0) / K);
      g.clips.push(clipCm);
      lab(BX + 4, clipY2 - 3, 'Bait clip + crimp at ' + clipCm + 'cm', COL.clip);
      if (i === 0) lab(sx - 2, ey2 + snPx * .5, 'Snood ' + st.snood + 'cm, ' + st.snoodLb + 'lb');
      if (clipY2 > yLead - 8) g.warns.push(['bad', 'Snood ' + (i + 1) + ' is too long for this rig body: the hook reaches past the lead. Shorten the snood or lengthen the body.']);
      if (stCm[i + 1] && clipCm >= stCm[i + 1] - 3) g.warns.push(['bad', 'The top hook\'s clip lands on the second station. Shorten the snood to about ' + (stCm[i + 1] - stCm[i] - 12) + 'cm.']);
    }
  });

  add(leadLink(BX, yLead)); lab(BX + 5, yLead + 8, 'Lead link');
  var lw3 = leadWeight(BX, yLead + 22, st.lead, st.leadType); add(lw3.svg);
  lab(BX + 10, yLead + 40, st.lead + 'oz ' + (st.leadType === 'grip' ? 'grip lead' : 'plain lead'));
  g.h = lw3.bottom + 24;

  if (rig === 'flapper') {
    for (var i = 0; i < stCm.length - 1; i++) {
      var s0 = g.stations[i], gap = stCm[i + 1] - stCm[i];
      if (s0 && s0.bottomCm > stCm[i + 1] - 4) g.warns.push(['bad', 'Snood ' + (i + 1) + ' plus hook reaches the next station (' + gap + 'cm gap). It will tangle, so shorten the snoods to under ' + (gap - 8) + 'cm.']);
    }
    var lastSt = g.stations[stCm.length - 1];
    if (lastSt && lastSt.bottomCm > bodyCm - 2) g.warns.push(['warn', 'The bottom hook hangs past the lead link. That\'s fine on the seabed, but it can wrap around the lead on the cast.']);
  }
  return finish(g, st);
}

function finish(g, st) {
  var labels = placeLabels(g.labels, LX, 14.5, 0);
  var h = Math.max(g.h, g.labels.length ? g.labels[g.labels.length - 1].ly + 16 : 0);
  /* bait / hook compatibility */
  var b = BAITS[st.bait];
  st.hooks.slice(0, st.n).forEach(function (hs, i) {
    if (hi(hs) < hi(b.min)) g.warns.push(['warn', 'Hook ' + (i + 1) + ' (size ' + hs + ') is small for ' + b.name.toLowerCase() + '. Try size ' + b.min + ' or bigger, or use a smaller bait.']);
    if (hi(hs) > hi(b.max)) g.warns.push(['warn', 'Hook ' + (i + 1) + ' (size ' + hs + ') is big for ' + b.name.toLowerCase() + '. Small fish will strip it without getting hooked; ' + b.max + ' or smaller suits it.']);
  });
  if (st.snoodLb >= st.body) g.warns.push(['warn', 'The snood is as strong as the rig body. Keep snoods weaker so a snag breaks the snood, not the whole rig.']);
  if (st.pattern === 'aberdeen' && hi(st.hooks[0]) >= hi('3/0') && st.rig !== 'flapper') g.warns.push(['warn', 'Fine-wire Aberdeens can open out on big fish at 3/0+. Viking-style forged hooks are stronger.']);
  if (st.rig === 'flapper' && st.lead < 4 && st.leadType === 'plain') g.warns.push(['warn', 'A light plain lead will roll around in Essex tides. Use 4–5oz, or a grip lead on bigger tides.']);
  g.full = '<svg viewBox="0 0 380 ' + Math.ceil(h) + '" role="img" aria-label="Rig diagram">' + g.svg + labels + '</svg>';
  return g;
}

/* ---------- shopping list ---------- */
function shopping(st, g) {
  var it = [], P = PATTERNS[st.pattern], n = st.n;
  var crimpSpec = st.body >= 80 ? '1.4mm crimps (to suit 80lb)' : '1.2mm crimps (to suit 50–60lb)';
  var hookCounts = {};
  var nh = st.rig === 'pennell' ? 2 : n;
  for (var i = 0; i < nh; i++) { var hs = st.hooks[i] || st.hooks[0]; hookCounts[hs] = (hookCounts[hs] || 0) + 1; }
  if (st.rig !== 'ledger') it.push(['Rig body line', st.body + 'lb clear mono or rig body line', ((g.bodyCm + 20) / 100).toFixed(2) + 'm']);
  it.push([st.rig === 'ledger' ? 'Trace line' : 'Snood line', st.snoodLb + 'lb mono or fluorocarbon', (st.rig === 'ledger' || st.rig === 'pulley' || st.rig === 'pennell' ? 1 : n) + ' × ' + (st.snood + 12) + 'cm']);
  Object.keys(hookCounts).forEach(function (hs) { it.push(['Hooks', P.short + ' size ' + hs, hookCounts[hs] + ' (buy a pack of 10)']); });
  if (st.rig === 'ledger') {
    it.push(['Sliding lead boom', 'Zip slider or tube boom', '1']);
    it.push(['Bead', '6mm hard bead', '1']);
    it.push(['Swivel', 'Size 4 rolling swivel', '1']);
  } else if (st.rig === 'pulley') {
    it.push(['Pulley swivel', 'Size 4 rolling swivel or a pulley bead', '1']);
    it.push(['Swivel', 'Size 4 rolling swivel (end of body)', '1']);
    it.push(['Bead', '6mm hard bead', '1']);
    it.push(['Bait clip', 'Bait clip + 1 crimp', '1']);
    it.push(['Lead link', 'Genie or Gemini lead link', '1']);
  } else {
    it.push(['Top swivel', 'Size 4 rolling swivel', '1']);
    var stations = g.stations.length;
    var knot = st.rig === 'flapper' && st.build === 'knot';
    if (!knot) {
      it.push(['Swivels', 'Size 10 rolling swivels', String(stations)]);
      var nc = stations * 2 + (st.rig === 'flapper' ? 0 : stations);
      it.push(['Crimps', crimpSpec, String(nc) + ' (+ spares)']);
      if (st.beads !== 'none') it.push(['Beads', '4–5mm ' + (st.beads === 'lumi' ? 'luminous' : 'red') + ' rig beads', String(stations * 2)]);
    }
    if (st.rig !== 'flapper') it.push(['Bait clips', 'Standard bait clips', String(stations)]);
    if (st.rig === 'pennell') it.push(['Silicone tube', '2mm silicone tube, a 5mm piece to lock the top hook', '1']);
    it.push(['Lead link', 'Genie or Gemini lead link', '1']);
  }
  it.push(['Lead', st.lead + 'oz ' + (st.leadType === 'grip' ? 'grip (wired) lead' : 'plain bomb'), '1 per rod']);
  var bq = { lug: '15–20 worms per session', blow: '20 worms per session', rag: '1 portion (about 20 worms)', squid: '1 pack frozen calamari', lugsquid: '15 black lug + 1 pack squid', cocktail: '20 black lug + 1 pack squid', peeler: '6–10 crabs', mackerel: '1 pack frozen mackerel' }[st.bait];
  it.push(['Bait', BAITS[st.bait].name, bq]);
  if (BAITS[st.bait].elastic !== 'none') it.push(['Bait elastic', 'Fine elastic cotton', '1 spool']);
  if (!(st.rig === 'flapper' && st.build === 'knot') && st.rig !== 'ledger') it.push(['Tool', 'Crimping pliers', '1']);
  it.push(['Tool', 'Line clippers or scissors, rig winder or wallet', '—']);
  return it;
}

/* ---------- tying instructions ---------- */
var KN = {
  grinner: '<a class="k" href="#k-grinner">5-turn grinner</a>',
  snood: '<a class="k" href="#k-snood">snood knot</a>',
  dropper: '<a class="k" href="#k-dropper">dropper loop</a>',
  surgeon: '<a class="k" href="#k-surgeon">surgeon\'s loop</a>',
  crimp: '<a class="k" href="#k-crimp">crimp</a>',
  loop: '<a class="k" href="#k-loop">loop-to-loop</a>'
};
function hookList(st, count) {
  var a = [];
  for (var i = 0; i < count; i++) a.push('hook ' + (i + 1) + ': size ' + (st.hooks[i] || st.hooks[0]));
  return a.join(', ');
}
function steps(st, g) {
  var s = [], P = PATTERNS[st.pattern].short, n = st.n;
  var stack = st.beads !== 'none' ? 'crimp, bead, rolling swivel, bead, crimp' : 'crimp, rolling swivel, crimp';
  var bodyLen = g.bodyCm + 20;
  if (st.rig === 'flapper' && st.build === 'crimp') {
    s.push('<b>Cut the rig body.</b> ' + bodyLen + 'cm of ' + st.body + 'lb mono. The extra 20cm is for knots.');
    s.push('<b>Tie the top swivel</b> (size 4 rolling) to one end with a ' + KN.grinner + '. Wet it, pull it down hard and trim the tag to 3mm.');
    s.push('<b>Thread on ' + n + ' stations,</b> each one in this order: ' + stack + '. Thread all of them before you tie the bottom end.');
    s.push('<b>Tie the lead link</b> to the other end with a ' + KN.grinner + '. The rig should measure about ' + g.bodyCm + 'cm from swivel to link.');
    s.push('<b>Position the stations</b> at ' + g.stations.map(function (x) { return (x.cm || x) + 'cm'; }).join(' and ') + ' below the top swivel. Butt the crimps up against the beads but leave 2–3mm of play, so the swivel spins freely.');
    s.push('<b><a class="k" href="#k-crimp">Crimp</a> each one:</b> one firm squeeze in the middle of the crimp with crimping pliers. Tug the station: it should not slide. Never crush a crimp flat, as that nicks the line.');
    s.push('<b>Make ' + n + ' snoods.</b> Cut ' + n + ' × ' + (st.snood + 12) + 'cm of ' + st.snoodLb + 'lb line. Tie the hooks on with a ' + KN.snood + ' (' + hookList(st, n) + ', ' + P + ' pattern).');
    s.push('<b>Tie each snood</b> to the free eye of its rolling swivel with a ' + KN.grinner + ', so the finished snood is ' + st.snood + 'cm long. The top station takes hook 1.');
    s.push('<b>Check it:</b> hang the rig up. No hook should reach the station below it. Then wind it onto a rig winder.');
  } else if (st.rig === 'flapper') {
    s.push('<b>Cut the rig body.</b> ' + (bodyLen + 20) + 'cm of ' + st.body + 'lb mono. Dropper loops use about 10cm each.');
    s.push('<b>Tie the top swivel</b> (size 4 rolling) to one end with a ' + KN.grinner + '.');
    s.push('<b>Tie ' + n + ' dropper loops</b> at ' + g.stations.map(function (x) { return (x.cm || x) + 'cm'; }).join(', ') + ' below the swivel. Each one is a ' + KN.dropper + ', pulled down to a small, stiff loop 2–3cm long.');
    s.push('<b>Tie the lead link</b> to the bottom with a ' + KN.grinner + '.');
    s.push('<b>Make ' + n + ' snoods:</b> ' + (st.snood + 15) + 'cm of ' + st.snoodLb + 'lb each, with a ' + KN.snood + ' to the hook (' + hookList(st, n) + ') and a ' + KN.surgeon + ' at the other end, giving a finished length of ' + st.snood + 'cm.');
    s.push('<b>Attach them ' + KN.loop + ':</b> push the snood loop through the dropper loop, pass the hook back through the snood loop, then pull it snug.');
    s.push('<b>Check</b> that no hook can reach the next loop down. Wind the rig onto a winder.');
  } else if (st.rig === 'clipped' || st.rig === 'pennell') {
    var order = [];
    g.stations.forEach(function (cm, i) { order.push({ cm: cm, t: 'station ' + (i + 1) + ' (' + stack + ')' }); });
    g.clips.forEach(function (cm, i) { order.push({ cm: cm, t: 'bait clip ' + (i + 1) + ' with a crimp below it (clip arm pointing up)' }); });
    order.sort(function (a, b) { return a.cm - b.cm; });
    s.push('<b>Cut the rig body.</b> ' + bodyLen + 'cm of ' + st.body + 'lb mono.');
    s.push('<b>Tie the top swivel</b> to one end with a ' + KN.grinner + '.');
    s.push('<b>Thread on, top to bottom:</b> ' + order.map(function (o) { return o.t; }).join('; then ') + '.');
    s.push('<b>Tie the lead link</b> to the bottom with a ' + KN.grinner + '.');
    if (st.rig === 'pennell') {
      s.push('<b>Make the Pennell snood.</b> Cut ' + (st.snood + 15) + 'cm of ' + st.snoodLb + 'lb. Thread the <i>top</i> hook (size ' + st.hooks[0] + ') onto it through the eye, then slide on a 5mm piece of silicone tube. Tie the bottom hook to the end with a ' + KN.snood + '.');
      s.push('<b>Set the gap:</b> slide the top hook to sit 6–8cm above the bottom hook, which is the length of your bait. Push the silicone tube over its eye to lock it, or take two extra turns of snood through the eye.');
    } else {
      s.push('<b>Make the snood' + (n > 1 ? 's' : '') + ':</b> ' + (n > 1 ? n + ' × ' : '') + (st.snood + 12) + 'cm of ' + st.snoodLb + 'lb, with ' + hookList(st, n) + ' tied with a ' + KN.snood + '.');
    }
    s.push('<b>Tie the snood' + (n > 1 ? 's' : '') + ' to the station swivel' + (n > 1 ? 's' : '') + '</b> with a ' + KN.grinner + ' (finished length ' + st.snood + 'cm).');
    s.push('<b>Set the clip' + (g.clips.length > 1 ? 's' : '') + ':</b> pull each snood straight down beside the body. Slide its bait clip to where the hook bend lands (about ' + g.clips.join('cm and ') + 'cm), then ' + KN.crimp + ' just below it. The baited hook should sit tight against the body with no slack snood.');
    s.push('<b>To cast,</b> hook the <i>bend</i> of each hook over its clip, with the point facing in. When the lead hits the water, the baits are released.');
  } else if (st.rig === 'pulley') {
    s.push('<b>Cut the rig body.</b> 170cm of ' + st.body + 'lb mono.');
    s.push('<b>Tie the lead link</b> to one end with a ' + KN.grinner + '.');
    s.push('<b>Thread on, in order:</b> a crimp, a bait clip (arm pointing toward the far end), the pulley swivel (or pulley bead), then a 6mm bead.');
    s.push('<b>Tie a size 4 swivel</b> to the other end with a ' + KN.grinner + '.');
    s.push('<b>Snood:</b> ' + (st.snood + 12) + 'cm of ' + st.snoodLb + 'lb, with a size ' + st.hooks[0] + ' ' + P + ' tied on with a ' + KN.snood + '. Tie the other end to the end swivel with a ' + KN.grinner + ' (finished length ' + st.snood + 'cm).');
    s.push('<b>Set the bait clip:</b> pull the pulley swivel toward the hook end, then draw the hook down to the lead side. Slide the clip to where the hook bend sits about 15–20cm above the lead, and crimp it.');
    s.push('<b>Tie your shock leader</b> to the pulley swivel. On the cast the hook is clipped down. On the seabed, a fish pulling draws the lead up toward the pulley, which sets the hook and lifts the lead over snags.');
  } else {
    s.push('<b>Thread a sliding lead boom</b> onto your shock leader or main line, then a 6mm bead.');
    s.push('<b>Tie a size 4 swivel</b> to the end with a ' + KN.grinner + '. The bead protects the knot from the boom.');
    s.push('<b>Trace:</b> cut ' + (st.snood + 12) + 'cm of ' + st.snoodLb + 'lb line. Tie a size ' + st.hooks[0] + ' ' + P + ' hook on with a ' + KN.snood + ', and tie the other end to the swivel with a ' + KN.grinner + ' (finished length ' + st.snood + 'cm).');
    s.push('<b>Clip a ' + st.lead + 'oz ' + (st.leadType === 'grip' ? 'grip' : 'plain') + ' lead</b> onto the boom.');
    s.push('<b>Fish it with a light drag</b> or the baitrunner on. Let a fish run a couple of seconds before you lift into it.');
  }
  var b = BAITS[st.bait];
  s.push('<b>Bait it:</b> ' + b.name.toLowerCase() + '. See <a class="k" href="#' + b.card + '">how to present it</a>.' + (b.elastic === 'loose' ? ' Bind with loose spirals of elastic: hold the bait, don\'t squeeze it.' : b.elastic === 'tight' ? ' Bind tightly with elastic.' : b.elastic === 'firm' ? ' Bind firmly with elastic.' : ' No elastic needed.'));
  return s;
}
function cap(t) { return t; }

/* ---------- UI ---------- */
function opt(v, t, sel) { return '<option value="' + v + '"' + (sel ? ' selected' : '') + '>' + t + '</option>'; }
function buildControls() {
  var c = '', R = RIGS[S.rig];
  c += '<div class="field wide"><label for="f-rig">Rig</label><select id="f-rig">' + Object.keys(RIGS).map(function (k) { return opt(k, RIGS[k].name, k === S.rig); }).join('') + '</select></div>';
  if (R.hooks.length > 1) c += '<div class="field"><label for="f-n">Hooks</label><select id="f-n">' + R.hooks.map(function (n) { return opt(n, n + ' hooks', n === S.n); }).join('') + '</select></div>';
  if (R.build) c += '<div class="field"><label for="f-build">Build</label><select id="f-build">' + opt('crimp', 'Crimps & beads', S.build === 'crimp') + opt('knot', 'Knotted droppers', S.build === 'knot') + '</select></div>';
  var nh = S.rig === 'pennell' ? 1 : S.n;
  c += '<div class="field wide"><label>Hook size' + (nh > 1 ? ' (top to bottom)' : (S.rig === 'pennell' ? ' (both hooks)' : '')) + '</label><div class="hookrow">';
  for (var i = 0; i < nh; i++) c += '<select data-hook="' + i + '" aria-label="Hook ' + (i + 1) + ' size">' + HOOK_ORDER.map(function (h) { return opt(h, 'Size ' + h, h === (S.hooks[i] || S.hooks[0])); }).join('') + '</select>';
  c += '</div></div>';
  c += '<div class="field"><label for="f-pat">Hook pattern</label><select id="f-pat">' + Object.keys(PATTERNS).map(function (k) { return opt(k, PATTERNS[k].short, k === S.pattern); }).join('') + '</select></div>';
  c += '<div class="field"><label for="f-bait">Bait</label><select id="f-bait">' + Object.keys(BAITS).map(function (k) { return opt(k, BAITS[k].name, k === S.bait); }).join('') + '</select></div>';
  var lo = S.rig === 'ledger' ? 40 : 15, hiV = S.rig === 'ledger' ? 120 : 60;
  if (S.snood < lo) S.snood = lo; if (S.snood > hiV) S.snood = hiV;
  c += '<div class="field wide"><label for="f-snood">' + (S.rig === 'ledger' ? 'Trace' : 'Snood') + ' length: <span class="rangeval" id="v-snood">' + S.snood + 'cm</span></label><input id="f-snood" type="range" min="' + lo + '" max="' + hiV + '" step="5" value="' + S.snood + '"></div>';
  if (S.rig !== 'ledger') c += '<div class="field"><label for="f-body">Rig body</label><select id="f-body">' + [50, 60, 80, 100].map(function (v) { return opt(v, v + 'lb', v === S.body); }).join('') + '</select></div>';
  c += '<div class="field"><label for="f-slb">' + (S.rig === 'ledger' ? 'Trace' : 'Snood') + ' line</label><select id="f-slb">' + [12, 15, 20, 25, 30, 40, 50, 60].map(function (v) { return opt(v, v + 'lb', v === S.snoodLb); }).join('') + '</select></div>';
  c += '<div class="field"><label for="f-lead">Lead</label><select id="f-lead">' + [2, 3, 4, 5, 6, 7].map(function (v) { return opt(v, v + 'oz', v === S.lead); }).join('') + '</select></div>';
  c += '<div class="field"><label for="f-lt">Lead type</label><select id="f-lt">' + opt('plain', 'Plain bomb', S.leadType === 'plain') + opt('grip', 'Grip (wired)', S.leadType === 'grip') + '</select></div>';
  if (S.rig !== 'ledger' && S.rig !== 'pulley' && !(S.rig === 'flapper' && S.build === 'knot')) c += '<div class="field"><label for="f-beads">Beads</label><select id="f-beads">' + opt('red', 'Red', S.beads === 'red') + opt('lumi', 'Luminous', S.beads === 'lumi') + opt('none', 'None', S.beads === 'none') + '</select></div>';
  c += '<div class="summary" id="summary"></div>';
  $('controls').innerHTML = c;
  bind();
}
function bind() {
  var on = function (id, fn) { var el = $(id); if (el) el.addEventListener('input', function () { fn(el.value); S.preset = null; renderAll(); }); };
  on('f-rig', function (v) { S.rig = v; var R = RIGS[v]; if (R.hooks.indexOf(S.n) < 0) S.n = R.hooks[0]; buildControls(); });
  on('f-n', function (v) { S.n = +v; while (S.hooks.length < S.n) S.hooks.push(S.hooks[S.hooks.length - 1]); buildControls(); });
  on('f-build', function (v) { S.build = v; buildControls(); });
  on('f-pat', function (v) { S.pattern = v; });
  on('f-bait', function (v) { S.bait = v; });
  on('f-snood', function (v) { S.snood = +v; $('v-snood').textContent = v + 'cm'; });
  on('f-body', function (v) { S.body = +v; });
  on('f-slb', function (v) { S.snoodLb = +v; });
  on('f-lead', function (v) { S.lead = +v; });
  on('f-lt', function (v) { S.leadType = v; });
  on('f-beads', function (v) { S.beads = v; });
  document.querySelectorAll('[data-hook]').forEach(function (el) {
    el.addEventListener('input', function () { S.hooks[+el.dataset.hook] = el.value; if (S.rig === 'pennell') S.hooks[1] = el.value; S.preset = null; renderAll(); });
  });
}
function renderPresets() {
  $('presets').innerHTML = Object.keys(PRESETS).map(function (k) { return '<button class="chip' + (S.preset === k ? ' on' : '') + '" data-p="' + k + '">' + PRESETS[k].label + '</button>'; }).join('');
  $('presets').querySelectorAll('.chip').forEach(function (b) {
    b.onclick = function () { var v = S.view; S = clone(PRESETS[b.dataset.p]); S.preset = b.dataset.p; S.view = v; buildControls(); renderAll(); };
  });
}
function renderAll() {
  var st = S, g = buildRig(st);
  $('rigfig').innerHTML = g.full;
  var vt = $('viewtoggle');
  if (st.rig === 'flapper' || st.rig === 'ledger') vt.style.display = 'none';
  else {
    vt.style.display = 'flex';
    vt.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === st.view); });
  }
  var w = g.warns.length ? g.warns : [['ok', 'Everything lines up: snoods clear each other, and the hooks suit the bait.']];
  $('warns').innerHTML = w.map(function (x) { return '<div class="warn ' + x[0] + '">' + x[1] + '</div>'; }).join('');
  $('shop').innerHTML = '<tr><th>Item</th><th>Qty</th></tr>' + shopping(st, g).map(function (r) { return '<tr><td><b>' + r[0] + '</b><br><span style="color:var(--muted)">' + r[1] + '</span></td><td class="q">' + r[2] + '</td></tr>'; }).join('');
  $('steps').innerHTML = steps(st, g).map(function (x) { return '<li>' + x + '</li>'; }).join('');
  var nh = st.rig === 'pennell' ? 2 : st.n;
  var hooksTxt = st.rig === 'pennell' ? '2 × size ' + st.hooks[0] : st.hooks.slice(0, st.n).map(function (h) { return h; }).join(' / ');
  $('summary').innerHTML = '<b>' + RIGS[st.rig].name + '</b>, ' + nh + ' hook' + (nh > 1 ? 's' : '') + ' (' + hooksTxt + ' ' + PATTERNS[st.pattern].short + '), ' + BAITS[st.bait].name.toLowerCase() + ', ' + st.snood + 'cm ' + st.snoodLb + 'lb ' + (st.rig === 'ledger' ? 'trace' : 'snoods') + ', ' + st.lead + 'oz ' + st.leadType + ' lead.';
  renderPresets();
}

/* ---------- bait presentation cards ---------- */
function stageSVG(inner, h) { return '<svg viewBox="0 0 300 ' + (h || 330) + '">' + inner + '</svg>'; }
var BK = 2.6;
function bigHook(size, pat) { return hook(175, 140, size || '1/0', pat || 'aberdeen', BK); }
function snoodTop(h) { return line(h.x, 0, h.x, h.y - 8, COL.snood, 2.2); }
function note(x, y, t, c) { return '<text x="' + x + '" y="' + y + '" font-size="13" fill="' + (c || COL.label) + '">' + esc(t) + '</text>'; }
function ring(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="#f0b35a" stroke-width="2.2" stroke-dasharray="4 3"/>'; }

var CARDS = {
  'b-lug': {
    title: 'Black lug, without the mush', tags: ['Size 1–3/0', 'Whiting', 'Cod'],
    steps: [
      ['<b>Prep at home.</b> Gut each black lug: pinch the tail end and squeeze the guts out toward the head. Wrap the worms in dry newspaper and leave them in the fridge overnight. They firm right up.', function () { var h = bigHook(); return snoodTop(h) + h.svg + '<g class="fade">' + worm(70, 60, 250, 20, COL.lug, COL.lugT) + note(28, 280, 'Gutted, dry, firm') + '</g>'; }],
      ['<b>Go in through the head end.</b> Push the point into the head and run it down the <i>inside</i> of the worm. Don\'t stitch in and out of the side, because every hole is a place where it tears.', function () { var h = bigHook(); return snoodTop(h) + h.svg + '<g class="fade">' + worm(h.px, h.py - 70, h.py + 8, 20, COL.lug, COL.lugT) + ring(h.px, h.py + 6, 16) + '</g>'; }],
      ['<b>Slide it up in one smooth push</b>, round the bend, along the shank and over the eye. Keep it straight, not concertinaed.', function () { var h = bigHook(); return snoodTop(h) + h.svg + '<g class="fade">' + worm(h.x, h.top - 30, h.shankBot + 8, 20, COL.lug, COL.lugT) + '</g>'; }],
      ['<b>Big bait?</b> Push the first worm up onto the snood, then thread a second one the same way. Use half a worm on a size 1, one on a 1/0, and 2–3 on a 3/0 for cod.', function () { var h = bigHook(); return snoodTop(h) + h.svg + '<g class="fade">' + worm(h.x, h.top - 120, h.top - 20, 20, COL.lug, COL.lugT) + worm(h.x, h.top - 18, h.shankBot + 8, 20, COL.lug, COL.lugT) + '</g>'; }],
      ['<b>Loose spirals of elastic.</b> Pull the elastic off the spool with no stretch and lay 4–6 open turns from the bend up to the top of the bait. It should rest on the worm, not sink in.', function () { var h = bigHook(); return snoodTop(h) + h.svg + worm(h.x, h.top - 120, h.top - 20, 20, COL.lug, COL.lugT) + worm(h.x, h.top - 18, h.shankBot + 8, 20, COL.lug, COL.lugT) + '<g class="fade">' + elasticWraps(h.x, h.top - 120, h.shankBot + 8, 20, 26) + '</g>'; }],
      ['<b>Lock off on the snood</b> with 3 firm turns <i>above</i> the bait, then snap the elastic. All the tension goes on the line, not the worm. Check the point and barb are clear.', function () { var h = bigHook(); return snoodTop(h) + h.svg + worm(h.x, h.top - 120, h.top - 20, 20, COL.lug, COL.lugT) + worm(h.x, h.top - 18, h.shankBot + 8, 20, COL.lug, COL.lugT) + elasticWraps(h.x, h.top - 120, h.shankBot + 8, 20, 26) + '<g class="fade">' + line(h.x - 6, h.top - 128, h.x + 6, h.top - 134, '#fff', 2.4) + line(h.x - 6, h.top - 133, h.x + 6, h.top - 139, '#fff', 2.4) + line(h.x - 6, h.top - 138, h.x + 6, h.top - 144, '#fff', 2.4) + note(h.x + 16, h.top - 132, 'lock off here') + ring(h.px, h.py + 10, 18) + note(h.px - 62, h.py + 48, 'point clear') + '</g>'; }]
    ]
  },
  'b-tip': {
    title: 'Half lug + squid tip', tags: ['Size 1–1/0', 'Whiting', 'Dabs', 'Beats bait strippers'],
    steps: [
      ['<b>Half a black lug</b> (about 5cm) is plenty for whiting on a size 1. A big bait just feeds small fish and crabs.', function () { var h = bigHook('1'); return snoodTop(h) + h.svg + '<g class="fade">' + worm(70, 120, 210, 18, COL.lug, COL.lugT) + '</g>'; }],
      ['<b>Thread it</b> head end first and slide it up so it just covers the shank.', function () { var h = bigHook('1'); return snoodTop(h) + h.svg + '<g class="fade">' + worm(h.x, h.top + 18, h.shankBot + 6, 18, COL.lug, COL.lugT) + '</g>'; }],
      ['<b>Add a thin squid strip,</b> 3–4cm long and 5mm wide. Hook it <i>once</i> through the narrow end so it flutters from the point.', function () { var h = bigHook('1'); return snoodTop(h) + h.svg + worm(h.x, h.top + 18, h.shankBot + 6, 18, COL.lug, COL.lugT) + '<g class="fade">' + strip(h.px, h.py + 4, 80, 18, COL.squid) + '</g>'; }],
      ['<b>2–3 loose turns</b> of elastic over the lug. If crabs or nibblers strip the worm, the tough squid is still there fishing and scenting.', function () { var h = bigHook('1'); return snoodTop(h) + h.svg + worm(h.x, h.top + 18, h.shankBot + 6, 18, COL.lug, COL.lugT) + strip(h.px, h.py + 4, 80, 18, COL.squid) + '<g class="fade">' + elasticWraps(h.x, h.top + 18, h.shankBot + 6, 18, 24) + '</g>'; }]
    ]
  },
  'b-cocktail': {
    title: 'Lug & squid cod cocktail', tags: ['2/0–4/0', 'Cod', 'Long casts'],
    steps: [
      ['<b>Thread 2–3 gutted black lug</b> up the hook and onto the snood until the shank and 6–8cm of snood are full.', function () { var h = bigHook('3/0', 'viking'); return snoodTop(h) + h.svg + '<g class="fade">' + worm(h.x, h.top - 110, h.shankBot + 8, 24, COL.lug, COL.lugT) + '</g>'; }],
      ['<b>Wrap a squid sheet round the middle</b> like a sleeve. Cut a squid tube open flat. It holds the soft worms together and adds scent and a white flash.', function () { var h = bigHook('3/0', 'viking'); return snoodTop(h) + h.svg + worm(h.x, h.top - 110, h.shankBot + 8, 24, COL.lug, COL.lugT) + '<g class="fade"><rect x="' + (h.x - 18) + '" y="' + (h.top - 80) + '" width="36" height="' + (h.shankBot - h.top + 74) + '" rx="12" fill="' + COL.squid + '" opacity=".94"/></g>'; }],
      ['<b>Bind firmly.</b> The squid takes the pressure, so you can wrap tighter here without crushing the lug.', function () { var h = bigHook('3/0', 'viking'); return snoodTop(h) + h.svg + worm(h.x, h.top - 110, h.shankBot + 8, 24, COL.lug, COL.lugT) + '<rect x="' + (h.x - 18) + '" y="' + (h.top - 80) + '" width="36" height="' + (h.shankBot - h.top + 74) + '" rx="12" fill="' + COL.squid + '" opacity=".94"/><g class="fade">' + elasticWraps(h.x, h.top - 110, h.shankBot + 6, 36, 11) + '</g>'; }],
      ['<b>Finish on the snood</b> and check the point is clear. You want a neat, streamlined sausage. It casts best on a Pennell or clipped-down rig.', function () { var h = bigHook('3/0', 'viking'); return snoodTop(h) + h.svg + worm(h.x, h.top - 110, h.shankBot + 8, 24, COL.lug, COL.lugT) + '<rect x="' + (h.x - 18) + '" y="' + (h.top - 80) + '" width="36" height="' + (h.shankBot - h.top + 74) + '" rx="12" fill="' + COL.squid + '" opacity=".94"/>' + elasticWraps(h.x, h.top - 110, h.shankBot + 6, 36, 11) + '<g class="fade">' + ring(h.px, h.py + 14, 20) + note(h.px - 70, h.py + 56, 'point clear') + '</g>'; }]
    ]
  },
  'b-rag': {
    title: 'Ragworm', tags: ['Size 2–1/0', 'Flounder', 'Bass', 'Sole'],
    steps: [
      ['<b>Pick lively worms.</b> Use a whole small rag for flounder, or a section of king rag for bass.', function () { var h = bigHook('1'); return snoodTop(h) + h.svg + '<g class="fade">' + path('M40 140 Q70 120 80 170 T110 230', COL.rag, 10) + '</g>'; }],
      ['<b>Hook it through the head</b> and thread just 2–3cm up the shank. Rag is tough, so it rarely needs elastic.', function () { var h = bigHook('1'); return snoodTop(h) + h.svg + '<g class="fade">' + bait('rag', h) + '</g>'; }],
      ['<b>Leave the tail free to wriggle.</b> The movement is what attracts fish. For flounder, try 2 or 3 small rag bunched on one hook.', function () { var h = bigHook('1'); return snoodTop(h) + h.svg + bait('rag', h) + '<g class="fade">' + note(40, 320, 'tail free, don\'t bind') + '</g>'; }]
    ]
  },
  'b-crab': {
    title: 'Peeler crab', tags: ['1/0–3/0', 'Smoothhound', 'Bass', 'Codling Sep–Oct'],
    steps: [
      ['<b>Use a true peeler:</b> a crab about to shed, whose shell cracks off easily. Kill it quickly first.', function () { var h = bigHook('2/0', 'viking'); return snoodTop(h) + h.svg + '<g class="fade">' + crabSVG(80, 200, true) + '</g>'; }],
      ['<b>Peel the whole shell off</b>: back, belly and legs. The soft, smelly crab underneath is what fish want.', function () { var h = bigHook('2/0', 'viking'); return snoodTop(h) + h.svg + '<g class="fade">' + crabSVG(80, 200, false) + '<ellipse cx="80" cy="110" rx="30" ry="20" fill="' + COL.crabS + '" opacity=".55"/>' + note(52, 80, 'shell off') + '</g>'; }],
      ['<b>Halve or quarter it.</b> Push the hook in through a leg socket and bring the point out through the body.', function () { var h = bigHook('2/0', 'viking'); return snoodTop(h) + h.svg + '<g class="fade">' + bait('peeler', h).replace(/<line[^>]*stroke="#ffffff"[^>]*\/>/g, '') + '</g>'; }],
      ['<b>Bind it tightly</b> with plenty of elastic. Unlike lug, crab needs it. Tuck the legs in too, as they\'re full of scent.', function () { var h = bigHook('2/0', 'viking'); return snoodTop(h) + h.svg + '<g class="fade">' + bait('peeler', h) + '</g>'; }]
    ]
  }
};
function crabSVG(x, y, shell) {
  var s = '';
  for (var i = -1; i <= 1; i++) { s += path('M' + (x - 30) + ' ' + (y + i * 10) + ' l-16 ' + (i * 8 - 4) + ' l-6 10', shell ? '#4f6a22' : '#d07a48', 3); s += path('M' + (x + 30) + ' ' + (y + i * 10) + ' l16 ' + (i * 8 - 4) + ' l6 10', shell ? '#4f6a22' : '#d07a48', 3); }
  s += '<ellipse cx="' + x + '" cy="' + y + '" rx="36" ry="24" fill="' + (shell ? COL.crabS : COL.crab) + '"/>';
  if (shell) s += '<ellipse cx="' + (x - 10) + '" cy="' + (y - 8) + '" rx="12" ry="5" fill="#7d9a3c"/>';
  return s;
}
function renderCards() {
  var html = '';
  Object.keys(CARDS).forEach(function (id) {
    var c = CARDS[id];
    html += '<section class="card stepper" id="' + id + '"><h3>' + c.title + '</h3><div class="tags">' + c.tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div><div class="stage"></div><div class="cap"></div><div class="ctl"><button class="prev">Back</button><button class="pri next">Next</button><div class="dots"></div></div></section>';
  });
  $('baitcards').innerHTML = html;
  Object.keys(CARDS).forEach(function (id) {
    var c = CARDS[id], el = $(id), s = 0, n = c.steps.length;
    var dots = el.querySelector('.dots'); for (var i = 0; i < n; i++) dots.appendChild(document.createElement('i'));
    function r() {
      el.querySelector('.stage').innerHTML = stageSVG(c.steps[s][1]());
      el.querySelector('.cap').innerHTML = '<span class="n">Step ' + (s + 1) + ' of ' + n + '</span>' + c.steps[s][0];
      dots.querySelectorAll('i').forEach(function (d, k) { d.className = k === s ? 'on' : ''; });
      el.querySelector('.prev').disabled = s === 0;
      el.querySelector('.next').textContent = s === n - 1 ? 'Start again' : 'Next';
    }
    el.querySelector('.next').onclick = function () { s = (s + 1) % n; r(); };
    el.querySelector('.prev').onclick = function () { if (s > 0) { s--; r(); } };
    r();
  });
}

/* ---------- init ---------- */
document.addEventListener('DOMContentLoaded', function () {
  $('viewtoggle').querySelectorAll('button').forEach(function (b) { b.onclick = function () { S.view = b.dataset.v; renderAll(); }; });
  buildControls(); renderAll(); renderCards();
});
window.__codex = { S: function () { return S; }, set: function (o) { Object.assign(S, o); buildControls(); renderAll(); } };
})();
