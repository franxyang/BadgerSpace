export function shouldRedactReviews(userReviewCount: number | null | undefined): boolean {
  return !userReviewCount || userReviewCount < 1;
}

export function redactText(text: string, redact: boolean): string {
  if (!redact) return text;
  return '';
}

