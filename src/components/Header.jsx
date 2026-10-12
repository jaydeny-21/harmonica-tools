export default function Header({ state }){
  const same = state.inMode === state.outMode;
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  let eyebrow, lede;
  if(same){
    if(state.inMode === 'chromatic'){
      eyebrow = 'Chromatic Harmonica · Solo Tuning';
      lede = <>Paste a chromatic tab, type note names, or upload a music sheet. <b>Numbers get transposed</b>; lyrics pass through. Built for a <b>C chromatic</b>.</>;
    } else if(state.inMode === 'tremolo'){
      eyebrow = 'Tremolo Harmonica · Solo Tuning';
      lede = <>Paste a tremolo tab, type note names, or upload a music sheet. 21- or 24-hole, no slide — the full C scale sits across the harp.</>;
    } else {
      eyebrow = 'Diatonic Harmonica · Richter Tuning';
      lede = <>Paste a diatonic tab, type note names, or upload a music sheet. Notes outside the harp's scale come out as <b style={{color:'var(--bend)'}}>bends</b> or <b style={{color:'var(--over)'}}>overblows</b>.</>;
    }
  } else {
    eyebrow = `${cap(state.inMode)} ↔ ${cap(state.outMode)} · Notation Converter`;
    lede = <>Input is <b>{state.inMode}</b>, output is <b>{state.outMode}</b>. Tabs are converted between notations by pitch, re-anchored to the target's middle octave. Transposition and lyrics still apply.</>;
  }
  return (
    <header>
      <div className="eyebrow">{eyebrow}</div>
      <h1>Slide Shift</h1>
      <p className="lede">{lede}</p>
    </header>
  );
}