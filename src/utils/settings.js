const REVISION_DAYS_KEY = "dsa-revision-days";
const VALID_DAYS = [3, 7, 14];

export function getRevisionDays() {
  const stored = localStorage.getItem(REVISION_DAYS_KEY);
  const num = parseInt(stored, 10);
  return VALID_DAYS.includes(num) ? num : 7;
}

export function setRevisionDays(days) {
  if (VALID_DAYS.includes(days)) {
    localStorage.setItem(REVISION_DAYS_KEY, String(days));
  }
}

export { VALID_DAYS as REVISION_DAY_OPTIONS };
