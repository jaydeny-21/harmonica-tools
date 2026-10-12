export const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

const PC = {
  'C':0,'C#':1,'DB':1,'D':2,'D#':3,'EB':3,'E':4,'FB':4,'E#':5,
  'F':5,'F#':6,'GB':6,'G':7,'G#':8,'AB':8,'A':9,'A#':10,'BB':10,
  'B':11,'H':11,'CB':11,'B#':12,'F##':7,'G##':9,'C##':2,'D##':4,'A##':11,
  'DBB':0,'EBB':2,'GBB':5,'ABB':7,'BBB':9
};

export function parseNoteName(s){
  if(/^(_|R|rest|REST)$/.test(s)) return { rest:true };
  const m = /^([A-Ga-gH])(#{1,2}|b{1,2}|B{1,2})?(-?\d+)?$/.exec(s);
  if(!m) return null;
  const acc = (m[2]||'').replace(/B/g,'b');
  const key = m[1].toUpperCase() + acc.toUpperCase();
  if(PC[key] === undefined) return null;
  const pc = PC[key];
  if(m[3] !== undefined){
    const oct = parseInt(m[3], 10);
    return { midi:(oct+1)*12 + pc, pc, hasOctave:true };
  }
  return { pc, hasOctave:false };
}

export function inferOctave(pc, prevMidi){
  if(prevMidi == null) return 4;
  let best = null, bd = Infinity;
  for(let o=0; o<=8; o++){
    const m = (o+1)*12 + pc;
    const d = Math.abs(m - prevMidi);
    if(d < bd){ bd = d; best = m; }
  }
  return Math.floor(best/12) - 1;
}

export function midiName(m){ return NOTE_NAMES[((m%12)+12)%12] + (Math.floor(m/12) - 1); }