import { useEffect, useRef } from "react";
import type { Memo } from "../types";

type Props = {
  memo: Memo | null;
  onUpdate: (
    id: string,
    patch: Partial<Pick<Memo, "title" | "content">>,
  ) => void;
  onNew: () => void;
};

export function MemoEditor({ memo, onUpdate, onNew }: Props) {
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [memo?.content]);

  if (!memo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <p className="text-base" style={{ color: "#aaa" }}>
          メモがまだありません
        </p>
        <button
          onClick={onNew}
          className="px-8 py-3 rounded-full text-white font-bold text-sm active:opacity-70"
          style={{ background: "#d4a9a0" }}
        >
          ＋ 最初のメモを作る
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-6" style={{ marginTop: "40px" }}>
      {/* 本文 */}
      <textarea
        ref={contentRef}
        value={memo.content}
        onChange={(e) => onUpdate(memo.id, { content: e.target.value })}
        placeholder="ここにメモを書こう..."
        className="w-full bg-transparent border-none leading-relaxed"
        style={{
          color: "#333",
          fontFamily: "inherit",
          fontSize: "15px",
          minHeight: "60vh",
        }}
      />
    </div>
  );
}
