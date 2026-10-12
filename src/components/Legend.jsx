export default function Legend({ state }){
  const anyChr = state.inMode === 'chromatic' || state.outMode === 'chromatic';
  const anyDia = state.inMode === 'diatonic'  || state.outMode === 'diatonic';
  const anyTre = state.inMode === 'tremolo'   || state.outMode === 'tremolo';

  return (
    <>
      {anyChr && (
        <section className="panel legend">
          <div className="grp"><span className="chip blow">4</span><span>blow</span></div>
          <div className="grp"><span className="chip draw">-4</span><span>draw</span></div>
          <div className="grp"><span className="chip slide">4*</span><span>slide in</span></div>
          <span className="sep" />
          <div className="grp"><span className="chip">C4</span><span>note name</span></div>
          <div className="grp"><span className="chip oor">[F#7]</span><span>off-harp</span></div>
        </section>
      )}
      {anyDia && (
        <section className="panel legend">
          <div className="grp"><span className="chip blow">4</span><span>blow</span></div>
          <div className="grp"><span className="chip draw">-4</span><span>draw</span></div>
          <span className="sep" />
          <div className="grp"><span className="chip bend">-3'</span><span>½ bend</span></div>
          <div className="grp"><span className="chip bend">-3''</span><span>whole</span></div>
          <div className="grp"><span className="chip over">6o</span><span>overblow</span></div>
          <div className="grp"><span className="chip over">-7o</span><span>overdraw</span></div>
          <span className="sep" />
          <div className="grp"><span className="chip oor">[C#5]</span><span>unreachable</span></div>
        </section>
      )}
      {anyTre && (
        <section className="panel legend">
          <div className="grp"><span className="chip blow">3</span><span>blow (odd)</span></div>
          <div className="grp"><span className="chip draw">-4</span><span>draw (even)</span></div>
          <span className="sep" />
          <div className="grp"><span className="chip">C4</span><span>note name</span></div>
          <div className="grp"><span className="chip oor">[F#5]</span><span>off-harp</span></div>
        </section>
      )}
    </>
  );
}