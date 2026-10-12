import { parseMusicXMLText, notesToText } from '../parsers/musicxml';
import { parseMIDI } from '../parsers/midi';
import { parseMXL } from '../parsers/mxl';

const KEYS = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const CHR_HOLES = [10, 12, 16];
const TRE_HOLES = [21, 24];

export default function Controls({ state, patch, reset, shift, setStatus, onInputFromFile }){
  const anyChr = state.inMode === 'chromatic' || state.outMode === 'chromatic';
  const anyDia = state.inMode === 'diatonic'  || state.outMode === 'diatonic';
  const anyTre = state.inMode === 'tremolo'   || state.outMode === 'tremolo';

  const clickHole = (h) => {
    const valid = (anyChr && CHR_HOLES.includes(h)) || (anyTre && TRE_HOLES.includes(h));
    if(valid) patch({ holes:h });
  };

  const onFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    const ext = (f.name.toLowerCase().match(/\.[^.]+$/) || [''])[0];
    const notSupported = { '.pdf':'PDF','.doc':'Word','.docx':'Word','.png':'image','.jpg':'image','.jpeg':'image','.gif':'image' };
    if(notSupported[ext]){
      setStatus({ msg:`✗ ${notSupported[ext]} files need OMR — convert with MuseScore first.`, cls:'err' });
      e.target.value = ''; return;
    }
    try{
      let parsed;
      if(ext === '.xml' || ext === '.musicxml'){
        parsed = parseMusicXMLText(await f.text());
      } else if(ext === '.mxl'){
        parsed = await parseMXL(await f.arrayBuffer());
      } else if(ext === '.mid' || ext === '.midi'){
        parsed = parseMIDI(await f.arrayBuffer());
      } else {
        setStatus({ msg:`✗ Unknown file type ${ext}`, cls:'err' }); return;
      }
      if(parsed.notes.length === 0) throw new Error('No notes found');
      onInputFromFile(notesToText(parsed));
      const noteCount = parsed.notes.filter(n => !n.rest && !n.barline).length;
      setStatus({ msg:`✓ Loaded ${f.name} — ${noteCount} notes`, cls:'ok' });
    } catch(err){
      setStatus({ msg:`✗ ${err.message}`, cls:'err' });
    }
  };

  return (
    <section className="panel controls">
      <div className="ctl-grid">
        {(anyChr || anyTre) && (
          <div className="field">
            <span className="label">{anyChr && anyTre ? 'Harp holes' : anyTre ? 'Tremolo holes' : 'Chromatic holes'}</span>
            <div className="seg">
              {CHR_HOLES.map(h =>
                <button key={h} hidden={!anyChr} aria-pressed={state.holes === h} onClick={() => clickHole(h)}>{h}</button>
              )}
              {TRE_HOLES.map(h =>
                <button key={h} hidden={!anyTre} aria-pressed={state.holes === h} onClick={() => clickHole(h)}>{h}</button>
              )}
            </div>
          </div>
        )}

        {anyDia && (
          <div className="field">
            <span className="label">Diatonic harp</span>
            <div className="harp-static">10-hole Richter</div>
          </div>
        )}

        <div className="field">
          <span className="label">Transpose key</span>
          <div className="keys">
            <label style={{display:'flex',flexDirection:'column',gap:4}}>
              <span className="sublabel">{state.inMode === 'diatonic' ? 'INPUT HARP' : 'FROM'}</span>
              <select value={state.from} onChange={e => patch({ from:parseInt(e.target.value,10) })}>
                {KEYS.map((k,i) => <option key={k} value={i}>{k}</option>)}
              </select>
            </label>
            <span className="arrow">→</span>
            <label style={{display:'flex',flexDirection:'column',gap:4}}>
              <span className="sublabel">{state.outMode === 'diatonic' ? 'OUTPUT HARP' : 'TO'}</span>
              <select value={state.to} onChange={e => patch({ to:parseInt(e.target.value,10) })}>
                {KEYS.map((k,i) => <option key={k} value={i}>{k}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="field">
          <span className="label">Octave</span>
          <div className="stepper">
            <button onClick={() => patch({ oct: state.oct - 1 })}>8vb ▼</button>
            <button onClick={() => patch({ oct: state.oct + 1 })}>8va ▲</button>
          </div>
        </div>

        <div className="field">
          <span className="label">Sheet file</span>
          <label className="file-btn">
            <input type="file" hidden accept=".xml,.musicxml,.mxl,.mid,.midi" onChange={onFile} />
            ▲ UPLOAD
          </label>
        </div>

        <div className="readout">
          <span className="big">{(shift >= 0 ? '+' : '') + shift}</span>
          <span className="sub">{Math.abs(shift) === 1 ? 'semitone' : 'semitones'}</span>
          <br/>
          <button className="link-btn" onClick={reset}>reset</button>
        </div>
      </div>
    </section>
  );
}