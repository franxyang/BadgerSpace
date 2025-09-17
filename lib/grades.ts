export type UWLetter = 'A' | 'AB' | 'B' | 'BC' | 'C' | 'D' | 'F';

// Convert a 1–5 rating to a 0–4 GPA-like scale (1→0, 5→4).
export function ratingToGPA(rating: number): number {
  if (!isFinite(rating)) return 0;
  const r = Math.max(1, Math.min(5, rating));
  return r - 1; // linear map to 0..4
}

// Map a 0–4 value to UW letter using provided thresholds.
export function gpaToUWLetter(gpa: number): UWLetter {
  const g = Math.max(0, Math.min(4, gpa));
  if (g >= 4.0) return 'A';
  if (g >= 3.5) return 'AB';
  if (g >= 3.0) return 'B';
  if (g >= 2.5) return 'BC';
  if (g >= 2.0) return 'C';
  if (g >= 1.0) return 'D';
  return 'F';
}

// Convenience: directly map 1–5 rating average to UW letter via GPA conversion.
export function ratingToUWLetter(avgRating: number): UWLetter {
  return gpaToUWLetter(ratingToGPA(avgRating));
}

export function average(nums: number[]): number {
  if (!nums?.length) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}
