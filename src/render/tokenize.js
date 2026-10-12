import { parseNoteName, inferOctave } from '../music/notes';
import { parseDegreeToken } from '../music/degrees';
import { tabTokenToPitch } from '../harps';

export function isNoteLike(t){
  if(!t) return false;
  if(/^[a-gA-G](#|b)?[1-8]?$/.test(t)) return true;
  if(/^-?\d+\*?$/.test(t) && /\d/.test(t)) return true;
  if(/^-?\d+('+|o)?(-?\d+('+|o)?)*$/.test(t)) return true;
  if(/^[+-]?[#b]?[1-7]$/.test(t)) return true;
  if(/^\[.+\]$/.test(t)) return true;
  if(/^[_·]$/.test(t)) return true;
  if(/^(R|rest|REST)$/.test(t)) return true;
  return false;
}

export function isLyricLine(line){
  const toks = line.trim().split(/\s+/);
  if(toks.length === 0) return false;
  for(const t of toks){
    const clean = t.replace(/^[.,;:!?()"'`]+|[.,;:!?()"'`]+$/g, '');
    if(!clean) continue;
    if(!isNoteLike(clean)) return true;
  }
  return false;
}

export function splitLyric(tok){
  const m = /^(.*?)\[([^\]]*)\]$/.exec(tok);
  if(m) return { main:m[1], lyric:m[2] };
  return { main:tok, lyric:'' };
}

export function expandGlued(tok, inMode){
  let re;
  if(inMode === 'chromatic'){
    if(!/^[-\d*]+$/.test(tok)) return null;
    re = /-?\d\*?/g;
  } else if(inMode === 'tremolo'){
    if(!/^-?\d+(-?\d+)*$/.test(tok)) return null;
    re = /-?\d/g;
  } else {
    if(!/^-?\d+('+|o)?(-?\d+('+|o)?)*$/.test(tok)) return null;
    re = /-?\d('+|o)?/g;
  }
  const m = tok.match(re);
  return m && m.length > 1 ? m : null;
}

export function resolvePitch(main, inMode, harpKey, holes, ctx, inputDegrees){
  if(!main) return null;
  if(main === '_' || main === 'R' || main === 'rest' || main === 'REST') return { rest:true };

  if(inputDegrees){
    const parsed = parseDegreeToken(main);
    if(parsed){
      let oct;
      if(ctx.prevMidi == null){ oct = 4; }
      else {
        let best = null, bd = Infinity;
        for(let o=0; o<=8; o++){
          const m = (o+1)*12 + harpKey + parsed.semis;
          const d = Math.abs(m - ctx.prevMidi);
          if(d < bd){ bd = d; best = m; }
        }
        oct = Math.floor(best/12) - 1;
      }
      oct += parsed.octaveShift;
      return { midi:(oct+1)*12 + harpKey + parsed.semis };
    }
  }

  if(/^[A-Ga-gH]/.test(main)){
    const n = parseNoteName(main);
    if(!n) return null;
    if(n.hasOctave) return { midi:n.midi };
    const oct = inferOctave(n.pc, ctx.prevMidi);
    return { midi:(oct+1)*12 + n.pc };
  }

  if(/\d/.test(main)){
    const p = tabTokenToPitch(main, inMode, harpKey, holes);
    if(p !== null) return { midi:p };
  }
  return null;
}