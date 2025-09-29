export function formatJoined(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const monthYear = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC", // 하이드레이션/타임존 차이 방지
  }).format(d);
  return `Joined ${monthYear}`; // ex) "Joined March 2023"
}
