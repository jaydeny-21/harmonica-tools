// Shift wraps modulo 12 so from→to always transposes UP; octave buttons stack on top.
export function totalShift(from, to, oct){
  return ((((to - from) % 12) + 12) % 12) + 12 * oct;
}