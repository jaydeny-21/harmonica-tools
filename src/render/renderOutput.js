import { encodeOpt } from '../harps';
import { midiName } from '../music/notes';
import { pitchToDegree } from '../music/degrees';
import { pickChoices } from './pickChoices';
import { isLyricLine, splitLyric, expandGlued, resolvePitch } from './tokenize';

const esc = (s) => String(s).replace(/[&<>"']/g, c => (
  { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]
));

function paint(text, cls){
  if(text === '') return '';
  let t = esc(text);
  if(cls === 'out-primary' || cls === 'out-alt'){
    t = t.replace(/\[[^\]]+\]/g, m => '<span class="out-oor">'+m+'</span>');
  }
  return '<span class="'+cls+'">'+t+'</span>';
}

function encPick(pick, outMode){ return pick ? encodeOpt(pick, outMode) : ''; }

function encPrimaryOrFallback(item, outMode){
  if(item.primary) return encPick(item.primary, outMode);
  if(item.midi != null) return '['+midiName(item.midi)+']';
  return '?';
}

export function renderOutputHTML(text, shift, state){
  const { inMode, outMode, holes, from: harpKey, to: tonicPc, showDegrees, inputDegrees } = state;
  const lines = text.split('\n');
  const out = [];
  const ctx = { prevMidi:null, prevHole:null, prevOutMidi:null };

  lines.forEach(line => {
    if(!line || !line.trim()){ out.push(''); return; }

    // Case 1: inline [lyric] brackets.
    if(/\[[^\]]*\]/.test(line)){
      const toks = (line.match(/[^\s\[]*(?:\[[^\]]*\])?|\[[^\]]*\]/g) || [])
        .filter(t => !!t && !/^\[[^\]]*\]$/.test(t));
      if(toks.length === 0) return;
      const groups = [[]];
      toks.forEach(t => {
        const sp = splitLyric(t);
        const cur = groups[groups.length-1];
        const isBareRest = sp.main === '_' && !sp.lyric;
        if(isBareRest){
          if(cur.length === 0) return;
          const last = cur[cur.length-1];
          if(last.main === '_' && !last.lyric) return;
          cur.push(sp); groups.push([]); return;
        }
        cur.push(sp);
        if(sp.lyric && /[.,;!?]$/.test(sp.lyric)) groups.push([]);
      });
      groups.forEach(g => {
        if(g.length === 0) return;
        renderLyricBlock(g, shift, ctx, state).forEach(l => out.push(l));
      });
      return;
    }

    // Case 2: lyric-only line.
    if(isLyricLine(line)){ out.push(paint(line, 'out-lyric')); return; }

    // Case 3: pure note/tab line.
    renderPlainLine(line.split(/(\s+)/), shift, ctx, state).forEach(l => out.push(l));
  });

  return out.join('\n');
}

function renderLyricBlock(group, shift, ctx, state){
  const { inMode, outMode, holes, from: harpKey, to: tonicPc, showDegrees, inputDegrees } = state;
  const items = group.map(sp => {
    const r = resolvePitch(sp.main, inMode, harpKey, holes, ctx, inputDegrees);
    if(r && r.midi != null) ctx.prevMidi = r.midi;
    return { main: sp.main, lyric: sp.lyric, pitch: r };
  });
  const pitchArr = items.map(it => it.pitch && it.pitch.midi != null ? it.pitch.midi + shift : null);
  const pick = pickChoices(pitchArr, outMode, harpKey, holes, ctx.prevHole);
  ctx.prevHole = pick.lastHole;

  let prevOutMidi = ctx.prevOutMidi;
  const cells = items.map((it, i) => {
    const chosen = pick.choices[i];
    if(it.pitch && it.pitch.rest){
      return { pri:'·', alt:'', lyr: it.lyric, priClass:'out-rest', altClass:'out-rest' };
    }
    if(it.pitch && it.pitch.midi != null){
      let pri, alt;
      if(showDegrees){
        pri = pitchToDegree(pitchArr[i], tonicPc, it.main, prevOutMidi);
        alt = '';
      } else {
        pri = encPrimaryOrFallback({ primary:chosen.primary, midi:pitchArr[i] }, outMode);
        alt = chosen.alt ? encPick(chosen.alt, outMode) : '';
      }
      prevOutMidi = pitchArr[i];
      return { pri, alt, lyr: it.lyric, priClass:'out-primary', altClass:'out-alt' };
    }
    return { pri: it.main, alt:'', lyr: it.lyric, priClass:'out-lyric', altClass:'out-lyric' };
  });
  ctx.prevOutMidi = prevOutMidi;

  // Width-match each column across the 3 rows.
  const widths = cells.map(c => Math.max((c.pri||'').length, (c.alt||'').length, (c.lyr||'').length, 1));
  const hasAlt = cells.some(c => (c.alt||'').trim() !== '');
  const pad = (s, w) => s + ' '.repeat(Math.max(0, w - s.length));
  const row = (key, cls) => cells.map((c, i) =>
    paint(pad(c[key] || '', widths[i]), cls || c[key+'Class'])).join(' ').replace(/\s+$/, '');

  const lines = [];
  if(hasAlt) lines.push(row('alt'));
  lines.push(row('pri'));
  lines.push(row('lyr', 'out-lyric'));
  return lines;
}

function renderPlainLine(toks, shift, ctx, state){
  const { inMode, outMode, holes, from: harpKey, to: tonicPc, showDegrees, inputDegrees } = state;
  const items = toks.map(tok => {
    if(!tok.trim()) return { isWs:true, text:tok };
    const r = resolvePitch(tok, inMode, harpKey, holes, ctx, inputDegrees);
    if((!r || r.midi == null) && /\d/.test(tok)){
      const glued = expandGlued(tok, inMode);
      if(glued){
        const pieces = glued.map(g => {
          const rr = resolvePitch(g, inMode, harpKey, holes, ctx, inputDegrees);
          if(rr && rr.midi != null) ctx.prevMidi = rr.midi;
          return { main:g, pitch:rr };
        });
        return { glued: pieces, original: tok };
      }
    }
    if(r && r.midi != null) ctx.prevMidi = r.midi;
    return { main: tok, pitch: r };
  });

  const flatPitches = [], flatMap = [];
  items.forEach((it, i) => {
    if(it.isWs) return;
    if(it.glued){
      it.glued.forEach((g, j) => {
        flatPitches.push(g.pitch && g.pitch.midi != null ? g.pitch.midi + shift : null);
        flatMap.push({ i, j });
      });
    } else {
      flatPitches.push(it.pitch && it.pitch.midi != null ? it.pitch.midi + shift : null);
      flatMap.push({ i });
    }
  });
  const pick = pickChoices(flatPitches, outMode, harpKey, holes, ctx.prevHole);
  ctx.prevHole = pick.lastHole;
  flatMap.forEach((fm, k) => {
    const it = items[fm.i]; if(!it) return;
    if(fm.j != null){ (it.pickPieces = it.pickPieces || [])[fm.j] = pick.choices[k]; }
    else { it.pick = pick.choices[k]; }
  });

  const priTexts = [], altTexts = [], classes = [];
  let prevOutMidi = ctx.prevOutMidi;

  items.forEach(it => {
    if(it.isWs){ priTexts.push(it.text); altTexts.push(it.text); classes.push(null); return; }
    if(it.glued){
      const priPieces = it.glued.map((g, j) => {
        const c = it.pickPieces && it.pickPieces[j];
        if(!c) return g.main;
        if(g.pitch && g.pitch.rest) return '·';
        if(showDegrees && g.pitch && g.pitch.midi != null){
          const s = pitchToDegree(g.pitch.midi + shift, tonicPc, g.main, prevOutMidi);
          prevOutMidi = g.pitch.midi + shift; return s;
        }
        if(g.pitch && g.pitch.midi != null) prevOutMidi = g.pitch.midi + shift;
        if(c.primary) return encPick(c.primary, outMode);
        return '['+midiName(g.pitch.midi + shift)+']';
      });
      const priStr = priPieces.join('');
      const altStr = it.glued.map((g, j) => {
        const c = it.pickPieces && it.pickPieces[j];
        if(!showDegrees && c && c.alt) return encPick(c.alt, outMode);
        return ' '.repeat((priPieces[j] || '').length);
      }).join('');
      priTexts.push(priStr); altTexts.push(altStr); classes.push('primary');
      return;
    }
    const c = it.pick;
    if(it.pitch && it.pitch.rest){ priTexts.push('·'); altTexts.push(' '); classes.push('rest'); return; }
    if(!c){ priTexts.push(it.main || ''); altTexts.push(' '.repeat((it.main||'').length)); classes.push('lyric'); return; }

    let pri, alt;
    const fi = flatMap.findIndex(fm => fm.i === items.indexOf(it) && fm.j == null);
    const p = fi >= 0 ? flatPitches[fi] : null;
    if(showDegrees){
      pri = p != null ? pitchToDegree(p, tonicPc, it.main, prevOutMidi) : (it.main || '');
      if(p != null) prevOutMidi = p;
      alt = '';
    } else {
      if(p != null) prevOutMidi = p;
      pri = c.primary ? encPick(c.primary, outMode) : '['+midiName(p)+']';
      alt = c.alt ? encPick(c.alt, outMode) : '';
    }
    priTexts.push(pri); altTexts.push(alt || ' '.repeat(pri.length)); classes.push('primary');
  });
  ctx.prevOutMidi = prevOutMidi;

  // Dedupe consecutive identical alt lines.
  let lastAlt = '';
  const altClean = altTexts.map((a, i) => {
    if(classes[i] == null) return a;
    if(!a || !a.trim()){ lastAlt = ''; return a; }
    if(a === lastAlt) return ' '.repeat(a.length);
    lastAlt = a; return a;
  });

  const widths = priTexts.map((p, i) => Math.max(p.length, altClean[i].length));
  const hasAlt = altClean.some((a, i) => a.trim() !== '' && classes[i] === 'primary');
  const priLine = priTexts.map((p, i) => {
    const s = p + ' '.repeat(widths[i] - p.length);
    const cls = classes[i] === 'rest' ? 'out-rest' : classes[i] === 'lyric' ? 'out-lyric' : 'out-primary';
    return classes[i] == null ? esc(s) : paint(s, cls);
  }).join('').replace(/\s+$/, '');

  const out = [];
  if(hasAlt){
    const altLine = altClean.map((a, i) => {
      const s = a + ' '.repeat(widths[i] - a.length);
      return classes[i] == null ? esc(s) : paint(s, 'out-alt');
    }).join('').replace(/\s+$/, '');
    out.push(altLine);
  }
  out.push(priLine);
  return out;
}