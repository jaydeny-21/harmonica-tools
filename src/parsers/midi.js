export function parseMIDI(buf){
  const dv = new DataView(buf);
  let p = 0;
  const read4 = () => { const v = dv.getUint32(p); p += 4; return v; };
  const read2 = () => { const v = dv.getUint16(p); p += 2; return v; };
  const read1 = () => dv.getUint8(p++);
  const readVLQ = () => { let v = 0, b; do { b = read1(); v = (v<<7) | (b & 0x7f); } while(b & 0x80); return v; };

  if(read4() !== 0x4d546864) throw new Error('Not a MIDI file');
  p += 4;
  const format = read2(), ntracks = read2(), division = read2();
  const events = [];
  let runningStatus = 0;

  for(let t=0; t<ntracks; t++){
    if(read4() !== 0x4d54726b) throw new Error('Expected MTrk');
    const len = read4();
    const end = p + len;
    let tick = 0;
    const lyrics = {};
    while(p < end){
      tick += readVLQ();
      let status = dv.getUint8(p);
      if(status < 0x80){ status = runningStatus; } else { p++; runningStatus = status; }
      const hi = status & 0xf0;
      if(status === 0xff){
        const metaType = read1();
        const metaLen = readVLQ();
        if(metaType === 0x05 || metaType === 0x01){
          const bytes = new Uint8Array(buf, p, metaLen);
          lyrics[tick] = (lyrics[tick] || '') + new TextDecoder().decode(bytes);
        }
        p += metaLen;
      } else if(hi === 0x90){
        const key = read1(), vel = read1();
        if(vel > 0) events.push({ tick, midi:key, lyric:lyrics[tick] || '' });
      } else if(hi === 0x80){ p += 2; }
      else if(hi === 0xa0 || hi === 0xb0 || hi === 0xe0){ p += 2; }
      else if(hi === 0xc0 || hi === 0xd0){ p += 1; }
      else if(status === 0xf0 || status === 0xf7){ p += readVLQ(); }
      else { p += 1; }
    }
  }

  // Melody line = highest MIDI per tick.
  const perTick = {};
  events.forEach(e => {
    if(!perTick[e.tick] || perTick[e.tick].midi < e.midi) perTick[e.tick] = e;
  });
  const sorted = Object.values(perTick).sort((a,b) => a.tick - b.tick);
  return { notes: sorted.map(e => ({ midi:e.midi, lyric:e.lyric })), measures: 1 };
}