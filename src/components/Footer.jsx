export default function Footer({ state }){
  const anyChr = state.inMode === 'chromatic' || state.outMode === 'chromatic';
  const anyDia = state.inMode === 'diatonic'  || state.outMode === 'diatonic';
  const anyTre = state.inMode === 'tremolo'   || state.outMode === 'tremolo';

  return (
    <>
      {anyChr && (
        <p className="foot">
          Notes map by pitch on a solo-tuned chromatic in C. The tool prefers a note reachable without the slide. Key change transposes <b>up</b> to the target; use the octave buttons to drop a register.
        </p>
      )}
      {anyDia && (
        <p className="foot">
          Standard <b>Richter tuning</b>, 10-hole. Notes outside the harp's scale come out as <b style={{color:'var(--bend)'}}>bends</b> or <b style={{color:'var(--over)'}}>overblows</b>.
        </p>
      )}
      {anyTre && (
        <p className="foot">
          Standard Asian <b>tremolo</b>, 21- or 24-hole. Odd holes blow, even holes draw. Hole 1 is <b>G below middle C</b>, not C — the layout is Richter-rooted.
        </p>
      )}
      {state.inputDegrees && (
        <p className="foot">
          <b>Input SCALE is on.</b> Digits are scale degrees in the From key. Prefix <code>-</code> → one octave below the inferred octave; <code>+</code> → one above.
        </p>
      )}
    </>
  );
}