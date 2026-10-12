import { useReducer, useCallback } from 'react';

export const initialState = {
  inMode: 'chromatic',
  outMode: 'chromatic',
  holes: 12,
  from: 0,
  to: 2,
  oct: 0,
  outLocked: false,
  showDegrees: false,
  inputDegrees: false,
  input: '',
  scrollSync: true,
};

function reducer(state, action){
  switch(action.type){
    case 'patch':    return { ...state, ...action.payload };
    case 'setInput': return { ...state, input: action.payload };
    case 'reset':    return { ...state, from:0, to:0, oct:0 };
    default: return state;
  }
}

export function useStore(){
  const [state, dispatch] = useReducer(reducer, initialState);
  const patch = useCallback((payload) => dispatch({ type:'patch', payload }), []);
  const setInput = useCallback((v) => dispatch({ type:'setInput', payload:v }), []);
  const reset = useCallback(() => dispatch({ type:'reset' }), []);
  return { state, patch, setInput, reset };
}