import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from './state/useStore';
import { renderOutputHTML } from './render/renderOutput';
import { totalShift } from './music/transpose';
import { sampleFor } from './data/samples';
import Header from './components/Header';
import Controls from './components/Controls';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import Legend from './components/Legend';
import Footer from './components/Footer';

export default function App(){
  const { state, patch, setInput, reset } = useStore();
  const [outHTML, setOutHTML] = useState('');
  const [status, setStatus] = useState({ msg:'', cls:'' });
  const lastEditedModeRef = useRef(null);

  // NEW: refs for the two scrollable elements
  const inRef  = useRef(null);
  const outRef = useRef(null);

  // Seed sample on first mount.
  useEffect(() => {
    if(!state.input) setInput(sampleFor(state.inMode));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shift = useMemo(
    () => totalShift(state.from, state.to, state.oct),
    [state.from, state.to, state.oct]
  );

  // Re-render output whenever input or anything that changes rendering changes.
  useEffect(() => {
    if(state.outLocked) return;
    setOutHTML(renderOutputHTML(state.input, shift, state));
  }, [state.input, shift, state.inMode, state.outMode, state.holes,
      state.from, state.to, state.showDegrees, state.inputDegrees, state.outLocked, state]);

   // NEW: mirror scroll between the two panels when scrollSync is on
  useEffect(() => {
    const inEl = inRef.current, outEl = outRef.current;
    if(!inEl || !outEl) return;
    let syncing = false;
    const pair = (src, dst) => () => {
      if(!state.scrollSync) return;
      if(syncing) return;
      syncing = true;
      dst.scrollTop  = src.scrollTop;
      dst.scrollLeft = src.scrollLeft;
      requestAnimationFrame(() => { syncing = false; });
    };
    const onIn  = pair(inEl, outEl);
    const onOut = pair(outEl, inEl);
    inEl.addEventListener('scroll', onIn,  { passive:true });
    outEl.addEventListener('scroll', onOut, { passive:true });
    return () => {
      inEl.removeEventListener('scroll', onIn);
      outEl.removeEventListener('scroll', onOut);
    };
  }, [state.scrollSync]);

  // Ctrl+Alt+ +/- zooms the input and output panels together, without
  // touching the rest of the page (Ctrl+Alt+0 resets). Uses e.code so both
  // the main row and numpad work, and leaves the browser's own Ctrl +/- alone.
  useEffect(() => {
    const onKey = (e) => {
      if(!e.ctrlKey || !e.altKey) return;
      const isPlus  = e.code === 'Equal'  || e.code === 'NumpadAdd';
      const isMinus = e.code === 'Minus'  || e.code === 'NumpadSubtract';
      const isReset = e.code === 'Digit0' || e.code === 'Numpad0';
      if(!isPlus && !isMinus && !isReset) return;
      e.preventDefault();
      if(isReset){ patch({ zoom: 1 }); return; }
      const step = isPlus ? 0.1 : -0.1;
      const next = Math.min(3, Math.max(0.5, +(state.zoom + step).toFixed(2)));
      patch({ zoom: next });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.zoom, patch]);

  // When input mode changes and the input is pristine, swap the sample.
  const changeInMode = (v) => {
    patch({ inMode:v });
    if(!lastEditedModeRef.current) setInput(sampleFor(v));
  };
  const changeOutMode = (v) => patch({ outMode:v });
  const onInputChange = (v) => { lastEditedModeRef.current = state.inMode; setInput(v); };

  return (
    <div className="wrap">
      <Header state={state} />
      <Controls
        state={state} patch={patch} reset={reset} shift={shift}
        setStatus={setStatus}
        onInputFromFile={(txt) => { lastEditedModeRef.current = state.inMode; setInput(txt); }}
      />
      <div className="io">
        <InputPanel
          state={state} patch={patch}
          onChange={onInputChange}
          onModeChange={changeInMode}
          status={status}
          textareaRef={inRef}  /* ← now the ref App passes */
        />
        <OutputPanel
          state={state} patch={patch}
          html={outHTML}
          onModeChange={changeOutMode}
          preRef={outRef}  /* ← now the ref App passes */
        />
      </div>
      <Legend state={state} />
      <Footer state={state} />
    </div>
  );
}