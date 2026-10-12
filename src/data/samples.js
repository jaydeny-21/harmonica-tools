export const CHR_SAMPLE = "4 -3 -3 4 -5 3\nHey Jude don't make it bad\n3 -3 -3* -6 -6 6 5 -5 4-3*-3";
export const DIA_SAMPLE = "4 -4 5 -5 6 -6\nOh when the saints go marching in\n4 -4 5 -5 6 -6\n\n-2 -3' -3 4 -4 5 -5 6\n(major scale, 2nd position / cross harp on a C harp)";
export const TRE_SAMPLE = "9 -6 -6 9 -10 7\nHey Jude don't make it bad\n7 -6 -6 -12 -12 11 9 -10 9 -6 -6";

export const sampleFor = (mode) =>
  mode === 'tremolo' ? TRE_SAMPLE : mode === 'diatonic' ? DIA_SAMPLE : CHR_SAMPLE;