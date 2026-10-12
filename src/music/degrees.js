export const DEGREES = ['1','b2','2','b3','3','4','b5','5','b6','6','b7','7'];

export function pitchToDegree(midi, tonicPc, sourceTab, prevMidi){
  const pc = (((midi - tonicPc) % 12) + 12) % 12;
  const d = DEGREES[pc];
  if(prevMidi != null){
    const currBand = Math.floor((midi - tonicPc) / 12);
    const prevBand = Math.floor((prevMidi - tonicPc) / 12);
    if(currBand > prevBand) return '+' + d;
    if(currBand < prevBand) return '-' + d;
  }
  return d;
}

const DEGREE_SEMIS = {
  '1':0,'#1':1,'b2':1,'2':2,'#2':3,'b3':3,'3':4,'4':5,
  '#4':6,'b5':6,'5':7,'#5':8,'b6':8,'6':9,'#6':10,'b7':10,'7':11
};
const DEGREE_PATTERN = /^([+-])?([#b])?([1-7])$/;

export function parseDegreeToken(s){
  const m = DEGREE_PATTERN.exec(s);
  if(!m) return null;
  const key = (m[2]||'') + m[3];
  if(!DEGREE_SEMIS.hasOwnProperty(key)) return null;
  const shift = m[1] === '-' ? -1 : (m[1] === '+' ? 1 : 0);
  return { semis: DEGREE_SEMIS[key], octaveShift: shift };
}