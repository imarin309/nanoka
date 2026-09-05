import { useEffect, useRef, useState } from "react";
import type { Memo } from "../types";
import type { Template } from "../lib/templates";
import { TEMPLATES, insertTemplate } from "../lib/templates";
import { TemplateButton } from "./TemplateButton";
import { TemplatePicker } from "./TemplatePicker";

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
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [memo?.content]);

  const applyTemplate = (template: Template) => {
    if (!memo) return;
    onUpdate(memo.id, { content: insertTemplate(memo.content, template) });
    setIsPickerOpen(false);
  };

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

      <TemplateButton onClick={() => setIsPickerOpen(true)} />

      {isPickerOpen && (
        <TemplatePicker
          templates={TEMPLATES}
          onSelect={applyTemplate}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </div>
  );
}
