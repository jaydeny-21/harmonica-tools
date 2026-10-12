export const CHR_BLOW = [0, 4, 7, 12];
export const CHR_DRAW = [2, 5, 9, 11];

export function chrStartOct(h){ return h === 16 ? 3 : 4; }

export function chrNoteToMidi(hole, draw, slide, holes){
  const g = Math.floor((hole-1)/4), p = (hole-1)%4;
  return (chrStartOct(holes)+g+1)*12 + (draw ? CHR_DRAW[p] : CHR_BLOW[p]) + (slide ? 1 : 0);
}

const chrTables = {};
export function chrBuildTable(holes){
  if(chrTables[holes]) return chrTables[holes];
  const t = {};
  for(let h=1; h<=holes; h++)
    for(let d=0; d<2; d++)
      for(let s=0; s<2; s++){
        const m = chrNoteToMidi(h, !!d, !!s, holes);
        (t[m] = t[m] || []).push({ hole:h, draw:!!d, slide:!!s });
      }
  return chrTables[holes] = t;
}

export function chrEncode(n){ return (n.draw ? '-' : '') + n.hole + (n.slide ? '*' : ''); }

export function chrMidiToOptions(midi, holes){
  const t = chrBuildTable(holes);
  return (t[midi] || []).slice();
}