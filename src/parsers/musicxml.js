const STEP = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };

export function parseMusicXMLText(xml){
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if(doc.querySelector('parsererror')) throw new Error('Invalid XML');
  const notes = [];
  const measures = doc.querySelectorAll('measure');
  if(measures.length === 0){
    doc.querySelectorAll('note').forEach(n => pushNote(n, notes));
    return { notes, measures:1 };
  }
  measures.forEach(mBlk => {
    mBlk.querySelectorAll('note').forEach(n => pushNote(n, notes));
    notes.push({ barline:true });
  });
  return { notes, measures: measures.length };
}

function pushNote(n, notes){
  if(n.querySelector(':scope > chord')) return;
  if(n.querySelector(':scope > rest')){ notes.push({ rest:true }); return; }
  const pitch = n.querySelector(':scope > pitch');
  if(!pitch) return;
  const step = pitch.querySelector('step')?.textContent;
  const octave = parseInt(pitch.querySelector('octave')?.textContent, 10);
  const alter = parseInt(pitch.querySelector('alter')?.textContent || '0', 10);
  if(STEP[step] === undefined || isNaN(octave)) return;
  const midi = (octave + 1) * 12 + STEP[step] + alter;
  const lyric = n.querySelector(':scope > lyric > text')?.textContent || '';
  const syllabic = n.querySelector(':scope > lyric > syllabic')?.textContent || 'single';
  const suffix = (syllabic === 'begin' || syllabic === 'middle') ? '-' : '';
  notes.push({ midi, lyric: lyric + suffix });
}

export function notesToText(parsed){
  const lines = [];
  let line = [];
  parsed.notes.forEach(n => {
    if(n.barline){
      if(line.length){ lines.push(line.join(' ')); line = []; }
      return;
    }
    if(n.rest){ line.push('_'); return; }
    const name = midiToName(n.midi);
    line.push(n.lyric ? `${name}[${n.lyric}]` : name);
  });
  if(line.length) lines.push(line.join(' '));
  return lines.join('\n');
}

const NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const midiToName = (m) => NAMES[((m%12)+12)%12] + (Math.floor(m/12) - 1);