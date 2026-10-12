export default function InputPanel({ state, patch, onChange, onModeChange, status, textareaRef }){
  return (
    <div className="panel io-panel">
      <div className="io-head">
        <div className="head-left">
          <span className="t">Input</span>
          <select
            className="mode-select"
            value={state.inMode}
            onChange={e => onModeChange(e.target.value)}
          >
            <option value="chromatic">Chromatic</option>
            <option value="diatonic">Diatonic</option>
            <option value="tremolo">Tremolo</option>
          </select>
        </div>
        <div style={{display:'flex', gap:6}}>
          <button
            className="copy"
            aria-pressed={state.inputDegrees}
            onClick={() => patch({ inputDegrees: !state.inputDegrees })}
            title="Interpret numbers as scale degrees relative to the From key"
          >
            SCALE
          </button>
          <button
            className="copy"
            aria-pressed={state.scrollSync}
            onClick={() => patch({ scrollSync: !state.scrollSync })}
            title={state.scrollSync
              ? 'Mirror scroll between input and output — click to let them scroll independently'
              : 'Panels scroll independently — click to re-sync'}
          >
            {state.scrollSync ? 'SYNC' : 'FREE'}
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        spellCheck="false"
        wrap="off"
        value={state.input}
        onChange={e => onChange(e.target.value)}
        placeholder="Paste tab (4 -3 5*), type notes (C4 D4 F#5), pair notes with syllables (C4[Hey] D4[Ju-]), or upload a sheet…"
      />
      {status.msg && <div className={`file-status ${status.cls}`}>{status.msg}</div>}
    </div>
  );
}