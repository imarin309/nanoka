import type { DiaryEntry, Memo } from "../types";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const pad = (n: number) => String(n).padStart(2, "0");

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDateKey(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return `${year}/${pad(month)}/${pad(day)}(${WEEKDAYS[date.getDay()]})`;
}

/** 空にしたカードは残さない（今日のカードは表示側で補う） */
export function upsertEntry(
  entries: DiaryEntry[],
  date: string,
  content: string,
): DiaryEntry[] {
  const others = entries.filter((e) => e.date !== date);
  return content === "" ? others : sortByNewest([...others, { date, content }]);
}

export function entriesWithToday(
  entries: DiaryEntry[],
  today: string,
): DiaryEntry[] {
  if (entries.some((e) => e.date === today)) return entries;
  return sortByNewest([...entries, { date: today, content: "" }]);
}

function sortByNewest(entries: DiaryEntry[]): DiaryEntry[] {
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export function memoBodyText(memo: Memo): string {
  if (memo.mode !== "diary") return memo.content;
  return (memo.entries ?? [])
    .map((e) => `${formatDateKey(e.date)}\n${e.content}`)
    .join("\n\n");
}
