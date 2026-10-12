const DIA_BLOW = [0, 4, 7, 12, 16, 19, 24, 28, 31, 36];
const DIA_DRAW = [2, 7, 11, 14, 17, 21, 23, 26, 29, 33];
const DIA_DRAW_BENDS = { 0:[1], 1:[1,2], 2:[1,2,3], 3:[1], 5:[1] };
const DIA_BLOW_BENDS = { 7:[1], 8:[1], 9:[1,2] };
const DIA_OB_HOLES = [0,3,4,5];
const DIA_OD_HOLES = [6,8,9];
const DIA_ROOT_MIDI = 60;

const diaTables = {};
export function diaBuildTable(harpKey){
  if(diaTables[harpKey]) return diaTables[harpKey];
  const t = {};
  const add = (m,e) => { (t[m] = t[m] || []).push(e); };
  for(let i=0; i<10; i++){
    const hole = i+1;
    const b = DIA_ROOT_MIDI + harpKey + DIA_BLOW[i];
    const d = DIA_ROOT_MIDI + harpKey + DIA_DRAW[i];
    add(b, { hole, kind:'blow' });
    add(d, { hole, kind:'draw' });
    if(DIA_DRAW_BENDS[i]) DIA_DRAW_BENDS[i].forEach(x => add(d-x, { hole, kind:'draw-bend', depth:x }));
    if(DIA_BLOW_BENDS[i]) DIA_BLOW_BENDS[i].forEach(x => add(b-x, { hole, kind:'blow-bend', depth:x }));
    if(DIA_OB_HOLES.includes(i)) add(d+1, { hole, kind:'overblow' });
    if(DIA_OD_HOLES.includes(i)) add(b+1, { hole, kind:'overdraw' });
  }
  return diaTables[harpKey] = t;
}

export function diaEncode(e){
  switch(e.kind){
    case 'blow': return ''+e.hole;
    case 'draw': return '-'+e.hole;
    case 'draw-bend': return '-'+e.hole+"'".repeat(e.depth);
    case 'blow-bend': return ''+e.hole+"'".repeat(e.depth);
    case 'overblow':  return e.hole+'o';
    case 'overdraw':  return '-'+e.hole+'o';
  }
  return '';
}

export function diaNoteToMidi(e, harpKey){
  const i = e.hole-1;
  const b = DIA_ROOT_MIDI + harpKey + DIA_BLOW[i];
  const d = DIA_ROOT_MIDI + harpKey + DIA_DRAW[i];
  switch(e.kind){
    case 'blow': return b; case 'draw': return d;
    case 'draw-bend': return d - e.depth;
    case 'blow-bend': return b - e.depth;
    case 'overblow':  return d + 1;
    case 'overdraw':  return b + 1;
  }
}

export function diaParseOne(s){
  const m = /^(-?)(10|\d)('+|o)?$/.exec(s);
  if(!m) return null;
  const draw = m[1] === '-';
  const hole = parseInt(m[2], 10);
  const suf = m[3] || '';
  const e = { hole };
  if(suf === 'o') e.kind = draw ? 'overdraw' : 'overblow';
  else if(suf){ e.kind = draw ? 'draw-bend' : 'blow-bend'; e.depth = suf.length; }
  else e.kind = draw ? 'draw' : 'blow';
  return e;
}

export function diaMidiToOptions(midi, harpKey){
  const t = diaBuildTable(harpKey);
  return (t[midi] || []).slice();
}