import { useEffect, useRef } from "react";
import type { DiaryEntry, Memo, MemoPatch } from "../types";
import {
  entriesWithToday,
  formatDateKey,
  toDateKey,
  upsertEntry,
} from "../lib/diary";

type Props = {
  memo: Memo;
  onUpdate: (id: string, patch: MemoPatch) => void;
};

export function DiaryEditor({ memo, onUpdate }: Props) {
  const entries = memo.entries ?? [];
  const today = toDateKey(new Date());

  const handleChange = (date: string, content: string) => {
    onUpdate(memo.id, { entries: upsertEntry(entries, date, content) });
  };

  return (
    <div
      className="flex-1 flex flex-col gap-4 px-6 pb-48"
      style={{ marginTop: "40px" }}
    >
      {entriesWithToday(entries, today).map((entry) => (
        <DiaryCard
          key={entry.date}
          entry={entry}
          isToday={entry.date === today}
          onChange={(content) => handleChange(entry.date, content)}
        />
      ))}
    </div>
  );
}

type CardProps = {
  entry: DiaryEntry;
  isToday: boolean;
  onChange: (content: string) => void;
};

function DiaryCard({ entry, isToday, onChange }: CardProps) {
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const label = formatDateKey(entry.date);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [entry.content]);

  return (
    <section
      className="rounded-2xl px-5 py-4 flex flex-col gap-2"
      style={{ background: "#faf6f5" }}
    >
      <p className="text-xs font-bold" style={{ color: "#c9a9a2" }}>
        {label}
      </p>
      <textarea
        ref={contentRef}
        value={entry.content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isToday ? "今日のことを書こう..." : ""}
        aria-label={label}
        className="w-full bg-transparent border-none leading-relaxed"
        style={{
          color: "#333",
          fontFamily: "inherit",
          fontSize: "15px",
          minHeight: "4.5em",
        }}
      />
    </section>
  );
}
