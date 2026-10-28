import { useEffect, useRef, useState } from "react";
import type { DiaryEntry, Memo, MemoPatch } from "../types";
import {
  addEntry,
  formatDateKey,
  removeEmptyEntry,
  toDateKey,
  updateEntry,
} from "../lib/diary";
import { generateId } from "../lib/id";

type Props = {
  memo: Memo;
  onUpdate: (id: string, patch: MemoPatch) => void;
};

export function DiaryEditor({ memo, onUpdate }: Props) {
  const entries = memo.entries ?? [];
  const [addedId, setAddedId] = useState<string | null>(null);

  const save = (next: DiaryEntry[]) => onUpdate(memo.id, { entries: next });

  const handleAdd = () => {
    const entry: DiaryEntry = {
      id: generateId(),
      date: toDateKey(new Date()),
      content: "",
    };
    save(addEntry(entries, entry));
    setAddedId(entry.id);
  };

  const handleLeave = (id: string) => {
    const next = removeEmptyEntry(entries, id);
    if (next !== entries) save(next);
  };

  return (
    <div
      className="flex-1 flex flex-col gap-4 px-6 pb-48"
      style={{ marginTop: "40px" }}
    >
      {entries.map((entry) => (
        <DiaryCard
          key={entry.id}
          entry={entry}
          autoFocus={entry.id === addedId}
          onChangeContent={(content) =>
            save(updateEntry(entries, entry.id, { content }))
          }
          onChangeDate={(date) =>
            save(updateEntry(entries, entry.id, { date }))
          }
          onLeave={() => handleLeave(entry.id)}
        />
      ))}
      {/* 押した瞬間に空カードの blur で削除が走ると、ボタンが上へずれて click が成立しない。
          フォーカスを動かさず、追加したカードの autoFocus で空カードを外す */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleAdd}
        className="self-center w-12 h-12 rounded-full flex items-center justify-center text-2xl active:opacity-60 transition-opacity"
        style={{
          background: "#fff",
          color: "#c9a9a2",
          boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
        }}
        aria-label="カードを追加"
      >
        ＋
      </button>
    </div>
  );
}

type CardProps = {
  entry: DiaryEntry;
  autoFocus: boolean;
  onChangeContent: (content: string) => void;
  onChangeDate: (date: string) => void;
  onLeave: () => void;
};

function DiaryCard({
  entry,
  autoFocus,
  onChangeContent,
  onChangeDate,
  onLeave,
}: CardProps) {
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const label = formatDateKey(entry.date);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [entry.content]);

  // 本文から日付へ移っただけで空のカードが消えないよう、カードの外へ出たときだけ扱う
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) onLeave();
  };

  return (
    <section
      onBlur={handleBlur}
      className="rounded-2xl px-5 py-4 flex flex-col gap-2"
      style={{ background: "#faf6f5" }}
    >
      {/* showPicker() は古い iOS Safari で開かないため、透明な日付入力を重ねてタップを直接受ける */}
      <label
        className="relative self-start rounded text-xs font-bold focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#80625b]"
        style={{ color: "#80625b" }}
      >
        {label}
        <input
          type="date"
          value={entry.date}
          onChange={(e) => e.target.value && onChangeDate(e.target.value)}
          aria-label={`${label}の日付を変える`}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </label>
      <textarea
        ref={contentRef}
        value={entry.content}
        onChange={(e) => onChangeContent(e.target.value)}
        autoFocus={autoFocus}
        placeholder="ここに書こう..."
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
