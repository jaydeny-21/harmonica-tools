import JSZip from 'jszip';
import { parseMusicXMLText } from './musicxml';

export async function parseMXL(buf){
  const zip = await JSZip.loadAsync(buf);
  // Prefer the file named in META-INF/container.xml; fall back to first .xml/.musicxml.
  let xmlPath = null;
  const container = zip.file('META-INF/container.xml');
  if(container){
    const txt = await container.async('text');
    const m = /full-path="([^"]+)"/.exec(txt);
    if(m) xmlPath = m[1];
  }
  if(!xmlPath){
    const first = Object.keys(zip.files).find(n => /\.(xml|musicxml)$/i.test(n) && !n.startsWith('META-INF/'));
    if(!first) throw new Error('No MusicXML inside .mxl');
    xmlPath = first;
  }
  const xml = await zip.file(xmlPath).async('text');
  return parseMusicXMLText(xml);
}