import { encodeOpt, midiToOptions, techPenalty } from '../harps';

export function pickChoices(pitches, outMode, harpKey, holes, seedPrevHole){
  const allOpts = pitches.map(m => m == null ? [] : midiToOptions(m, outMode, holes, harpKey));
  const results = [];
  let prevHole = seedPrevHole == null ? null : seedPrevHole;

  for(let i=0; i<pitches.length; i++){
    const opts = allOpts[i];
    if(!opts || opts.length === 0){
      results.push({ primary:null, alt:null, midi:pitches[i] });
      continue;
    }
    const nextOpts = i < pitches.length - 1 ? allOpts[i+1] : null;
    const scored = opts.map(opt => {
      const toPrev = prevHole == null ? 0 : Math.abs(opt.hole - prevHole);
      let toNext = 0;
      if(nextOpts && nextOpts.length){
        let mn = Infinity;
        nextOpts.forEach(no => { const d = Math.abs(opt.hole - no.hole); if(d < mn) mn = d; });
        toNext = mn === Infinity ? 0 : mn;
      }
      return { opt, score: toPrev*toPrev + toNext*toNext + techPenalty(opt, outMode) };
    });
    scored.sort((a,b) => a.score - b.score);
    const primary = scored[0].opt;
    const priCode = encodeOpt(primary, outMode);
    let alt = null;
    for(let j=1; j<scored.length; j++){
      if(encodeOpt(scored[j].opt, outMode) !== priCode){ alt = scored[j].opt; break; }
    }
    results.push({ primary, alt, midi:pitches[i] });
    prevHole = primary.hole;
  }
  return { choices: results, lastHole: prevHole };
}