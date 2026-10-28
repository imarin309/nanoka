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

// sort は安定なので、同じ日付どうしは配列の並びが保たれる。追加は先頭に入れることで、同じ日なら後から足したカードが上に来る
function sortByNewest(entries: DiaryEntry[]): DiaryEntry[] {
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export function addEntry(
  entries: DiaryEntry[],
  entry: DiaryEntry,
): DiaryEntry[] {
  return sortByNewest([entry, ...entries]);
}

export function updateEntry(
  entries: DiaryEntry[],
  id: string,
  patch: Partial<Pick<DiaryEntry, "date" | "content">>,
): DiaryEntry[] {
  return sortByNewest(
    entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
  );
}

/** 消すものがなければ同じ配列を返すので、呼び出し側は参照比較で保存の要否を判断できる */
export function removeEmptyEntry(
  entries: DiaryEntry[],
  id: string,
): DiaryEntry[] {
  const target = entries.find((e) => e.id === id);
  if (!target || target.content !== "") return entries;
  return entries.filter((e) => e.id !== id);
}

export function memoBodyText(memo: Memo): string {
  if (memo.mode !== "diary") return memo.content;
  return (memo.entries ?? [])
    .map((e) => `${formatDateKey(e.date)}\n${e.content}`)
    .join("\n\n");
}
