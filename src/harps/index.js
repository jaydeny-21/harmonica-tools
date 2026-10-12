import { chrEncode, chrMidiToOptions, chrNoteToMidi } from './chromatic';
import { diaEncode, diaMidiToOptions, diaNoteToMidi, diaParseOne } from './diatonic';
import { treEncode, treMidiToOptions, treNoteToMidi } from './tremolo';

export function encodeOpt(opt, outMode){
  if(outMode === 'chromatic') return chrEncode(opt);
  if(outMode === 'tremolo')   return treEncode(opt);
  return diaEncode(opt);
}

export function midiToOptions(midi, outMode, holes, harpKey){
  if(outMode === 'chromatic') return chrMidiToOptions(midi, holes);
  if(outMode === 'tremolo')   return treMidiToOptions(midi, holes, harpKey);
  return diaMidiToOptions(midi, harpKey);
}

export function techPenalty(opt, outMode){
  if(outMode === 'chromatic') return opt.slide ? 30 : 0;
  if(outMode === 'tremolo')   return 0;
  switch(opt.kind){
    case 'blow': case 'draw': return 0;
    case 'draw-bend': case 'blow-bend': return 15 + (opt.depth || 1) * 3;
    case 'overblow': case 'overdraw':   return 60;
  }
  return 0;
}

// MIDI pitch of an input tab token (uses inMode's parser).
export function tabTokenToPitch(tok, inMode, harpKey, holes){
  if(inMode === 'chromatic'){
    const m = /^(-?)(\d+)(\*?)$/.exec(tok);
    if(!m) return null;
    const h = parseInt(m[2], 10);
    if(!h || h < 1 || h > holes) return null;
    return chrNoteToMidi(h, m[1]==='-', m[3]==='*', holes);
  }
  if(inMode === 'tremolo'){
    const m = /^-?(\d+)$/.exec(tok);
    if(!m) return null;
    const h = parseInt(m[1], 10);
    if(!h || h < 1 || h > holes) return null;
    return treNoteToMidi(h, harpKey, holes);
  }
  const e = diaParseOne(tok);
  if(!e || e.hole < 1 || e.hole > 10) return null;
  return diaNoteToMidi(e, harpKey);
}