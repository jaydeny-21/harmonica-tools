// src/components/OutputPanel.jsx
import { useEffect } from 'react';
import InfoHint from './InfoHint';

export default function OutputPanel({ state, patch, html, onModeChange, preRef }){
  // Imperatively sync innerHTML — bypasses React's diffing so contenteditable
  // caret state doesn't get wiped on every keystroke in the input.
  useEffect(() => {
    if(!preRef.current) return;
    if(state.outLocked) return;
    preRef.current.innerHTML = html;
  }, [html, state.outLocked, preRef]);

  const onPaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="panel io-panel">
      <div className="io-head">
        <div className="head-left">
          <span className="t">Output</span>
          <select
            className="mode-select"
            value={state.outMode}
            onChange={e => onModeChange(e.target.value)}
          >
            <option value="chromatic">Chromatic</option>
            <option value="diatonic">Diatonic</option>
            <option value="tremolo">Tremolo</option>
          </select>
          <InfoHint align="left">
            <strong>Output panel</strong>
            <ul>
              <li><b>SCALE</b> — show results as scale degrees instead of harmonica tabs.</li>
              <li><b>LIVE / LOCKED</b> — <b>LIVE</b> re-renders as the input changes; <b>LOCKED</b> freezes the output so your manual edits survive.</li>
              <li><b>Zoom</b> — <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>+</kbd>/<kbd>−</kbd> resize the text, <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>0</kbd> to reset. (Doesn't change page zoom.)</li>
            </ul>
          </InfoHint>
        </div>
        <div style={{display:'flex', gap:6, alignItems:'center'}}>
          {state.zoom !== 1 && (
            <span
              className="zoom-badge"
              title="Panel zoom — Ctrl+Alt+ +/- to change, Ctrl+Alt+0 to reset"
            >
              {Math.round(state.zoom * 100)}%
            </span>
          )}
          <button
            className="copy"
            aria-pressed={state.showDegrees}
            onClick={() => patch({ showDegrees: !state.showDegrees })}
            title="Show notes as scale degrees instead of harmonica tabs"
          >
            SCALE
          </button>
          <button
            className="copy"
            aria-pressed={state.outLocked}
            onClick={() => patch({ outLocked: !state.outLocked })}
            title={state.outLocked ? 'Click to re-sync with input' : 'Lock the output so your edits survive input changes'}
          >
            {state.outLocked ? 'LOCKED' : 'LIVE'}
          </button>
        </div>
      </div>
      <pre
        ref={preRef}
        id="out"
        className="out-render"
        style={{ fontSize: `${(14 * state.zoom).toFixed(2)}px` }}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onPaste={onPaste}
      />
    </div>
  );
}