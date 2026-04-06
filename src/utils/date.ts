/**
 * Utility for handling Indonesian date strings and common date operations.
 */

export const BLN_ID: Record<string, number> = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11,
};

export const BLN_ID_REV: string[] = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export const HARI_ID: string[] = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
];

/**
 * Parses Indonesian date string (e.g., "Senin, 1 Januari 2024") into a Date object.
 */
export const parseTglID = (s: string): Date | null => {
  if (!s) return null;
  
  // Remove "Senin, " or "Selasa, " prefix
  const b = s.replace(/^[A-Za-z]+,?\s+/, "").trim().toLowerCase();
  
  // Format: "1 Januari 2024"
  const m = /(\d{1,2})\s+([a-z]+)\s+(\d{4})/.exec(b);
  if (m && BLN_ID[m[2]] !== undefined) {
    return new Date(+m[3], BLN_ID[m[2]], +m[1]);
  }
  
  return null;
};

/**
 * Formats a Date object into Indonesian date string.
 */
export const formatTglID = (d: Date, withDay = true): string => {
  const tgl = d.getDate();
  const bln = BLN_ID_REV[d.getMonth()];
  const thn = d.getFullYear();
  const day = HARI_ID[d.getDay()];
  
  return `${withDay ? day + ", " : ""}${tgl} ${bln} ${thn}`;
};

/**
 * Generates today's Indonesian date string.
 */
export const getTodayID = (): string => formatTglID(new Date());

/**
 * Calculates age from a date string (YYYY-MM-DD).
 */
export const calculateAge = (dateStr: string): number | null => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) {
    age--;
  }
  return age;
};
