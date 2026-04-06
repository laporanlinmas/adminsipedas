/**
 * Utility for parsing text reports (WhatsApp format) into structured data.
 */

export interface PARSED_WA {
  lokasi: string;
  hari: string;
  tanggal: string;
  personil: string;
  uraian: string;
  identitas: string;
  danru: string;
  namaDanru: string;
  keterangan: string;
}

/**
 * Parses a standard SI-PEDAS WhatsApp report string.
 * Format usually includes keywords like:
 * LOKASI: ...
 * HARI: ...
 * TANGGAL: ...
 * PERSONIL: ...
 * IDENTITAS: ...
 * URAIAN: ...
 * DANRU: ...
 */
export const parseWAReport = (teks: string): PARSED_WA => {
  const res: PARSED_WA = {
    lokasi: "",
    hari: "",
    tanggal: "",
    personil: "",
    uraian: "",
    identitas: "",
    danru: "",
    namaDanru: "",
    keterangan: "",
  };

  if (!teks) return res;

  const lines = teks.split("\n").map(l => l.trim()).filter(Boolean);
  
  const extractField = (regex: RegExp) => {
    for (const l of lines) {
      const match = l.match(regex);
      if (match) return match[1].trim();
    }
    return "";
  };

  res.lokasi = extractField(/^LOKASI\s*:\s*(.*)/i);
  res.hari = extractField(/^HARI\s*:\s*(.*)/i);
  res.tanggal = extractField(/^TANGGAL\s*:\s*(.*)/i);
  res.personil = extractField(/^PERSONIL\s*:\s*(.*)/i);
  res.identitas = extractField(/^IDENTITAS\s*:\s*(.*)/i) || "NIHIL";
  res.danru = extractField(/^DANRU\s*:\s*(.*)/i);
  res.namaDanru = extractField(/^NAMA\s*DANRU\s*:\s*(.*)/i);

  // Handling multi-line URAIAN
  let inUraian = false;
  const uraianLines: string[] = [];
  for (const l of lines) {
    if (/^URAIAN\s*:\s*/i.test(l)) {
      inUraian = true;
      uraianLines.push(l.replace(/^URAIAN\s*:\s*/i, "").trim());
    } else if (inUraian) {
      // Stop if another field starts (Keyword: Value)
      if (/^[A-Z\s]+\s*:\s*/i.test(l) && !/^\d+\./.test(l)) {
        inUraian = false;
      } else {
        uraianLines.push(l);
      }
    }
  }
  res.uraian = uraianLines.filter(Boolean).join("\n");
  res.keterangan = res.uraian;

  // Normalization for DANRU
  if (!res.danru) {
    if (res.namaDanru) {
      if (res.namaDanru.toLowerCase().includes("danru 1")) res.danru = "DANRU 1";
      else if (res.namaDanru.toLowerCase().includes("danru 2")) res.danru = "DANRU 2";
      else if (res.namaDanru.toLowerCase().includes("satgas")) res.danru = "SATGAS";
    }
  }

  return res;
};
