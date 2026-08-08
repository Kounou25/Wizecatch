/**
 * Écriture d'archives ZIP, méthode « stored » (sans compression).
 *
 * Écrit à la main plutôt qu'avec une bibliothèque : le plugin ne contient que
 * deux petits fichiers texte, la compression n'apporterait rien, et le format
 * stored tient en une centaine de lignes bien comprises. Une dépendance de
 * plus pour ça ne se justifiait pas.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/** Date fixe : une archive identique pour une même entrée, donc cachable. */
const DOS_TIME = 0x6000; // 12:00:00
const DOS_DATE = 0x5a21; // 2025-01-01

export type ZipEntry = { name: string; content: string };

export function createZip(entries: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder();

  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const data = encoder.encode(entry.content);
    const crc = crc32(data);

    // --- En-tête local : 30 octets + nom + données ---
    const local = new Uint8Array(30 + nameBytes.length + data.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); // signature
    lv.setUint16(4, 20, true); // version minimale
    lv.setUint16(6, 0, true); // drapeaux
    lv.setUint16(8, 0, true); // méthode : stored
    lv.setUint16(10, DOS_TIME, true);
    lv.setUint16(12, DOS_DATE, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true); // taille compressée
    lv.setUint32(22, data.length, true); // taille réelle
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // champ « extra »
    local.set(nameBytes, 30);
    local.set(data, 30 + nameBytes.length);
    locals.push(local);

    // --- Entrée du catalogue central : 46 octets + nom ---
    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true); // version d'écriture
    cv.setUint16(6, 20, true); // version minimale
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, DOS_TIME, true);
    cv.setUint16(14, DOS_DATE, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); // extra
    cv.setUint16(32, 0, true); // commentaire
    cv.setUint16(34, 0, true); // disque de départ
    cv.setUint16(36, 0, true); // attributs internes
    cv.setUint32(38, 0, true); // attributs externes
    cv.setUint32(42, offset, true); // position de l'en-tête local
    central.set(nameBytes, 46);
    centrals.push(central);

    offset += local.length;
  }

  const centralSize = centrals.reduce((sum, c) => sum + c.length, 0);

  // --- Fin du catalogue central : 22 octets ---
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true); // numéro de disque
  ev.setUint16(6, 0, true); // disque du catalogue
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true); // commentaire

  const total =
    offset + centralSize + end.length;
  const zip = new Uint8Array(total);

  let cursor = 0;
  for (const part of [...locals, ...centrals, end]) {
    zip.set(part, cursor);
    cursor += part.length;
  }

  return zip;
}
