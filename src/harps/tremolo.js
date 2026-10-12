// Standard Asian tremolo (KONGSHENG). Semitones above C3, odd holes blow,
// even holes draw. Hole 1 = G3 (degree 5), not C.
const TRE_SEMIS = [7,14,12,17,16,21,19,23,24,26,28,29,31,33,36,35,40,38,43,41,48,45,52,47];
const TRE_BASE_MIDI = 48;

export const treReedIsDraw = (hole) => (hole % 2) === 0;

export function treNoteToMidi(hole, harpKey, holes){
  if(hole < 1 || hole > holes || hole > TRE_SEMIS.length) return null;
  return TRE_BASE_MIDI + harpKey + TRE_SEMIS[hole-1];
}

const treTables = {};
export function treBuildTable(holes, harpKey){
  const k = holes + ':' + harpKey;
  if(treTables[k]) return treTables[k];
  const t = {};
  for(let h=1; h<=holes; h++){
    const m = treNoteToMidi(h, harpKey, holes);
    if(m == null) continue;
    (t[m] = t[m] || []).push({ hole:h, draw:treReedIsDraw(h) });
  }
  return treTables[k] = t;
}

// Draw-only holes get a leading "-"; blow-only stay bare.
export function treEncode(n){ return (n.draw ? '-' : '') + n.hole; }

export function treMidiToOptions(midi, holes, harpKey){
  const t = treBuildTable(holes, harpKey);
  return (t[midi] || []).slice();
}