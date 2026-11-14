import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Memo } from "../types";
import type { TextEdit } from "../lib/combo";
import { insertMove, insertNewline, removeLastMove } from "../lib/combo";
import type { Template } from "../lib/templates";
import { TEMPLATES, insertTemplate } from "../lib/templates";
import { ComboButton } from "./ComboButton";
import { ComboPalette } from "./ComboPalette";
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
  const [isComboOpen, setIsComboOpen] = useState(false);
  const pendingCaretRef = useRef<number | null>(null);
  const lastCaretRef = useRef<number | null>(null);

  useEffect(() => {
    lastCaretRef.current = null;
  }, [memo?.id]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [memo?.content]);

  // 本文を差し替えるとカーソルが末尾へ飛ぶので、描画の直後に戻す
  useLayoutEffect(() => {
    const el = contentRef.current;
    const caret = pendingCaretRef.current;
    if (!el || caret === null) return;
    pendingCaretRef.current = null;
    el.setSelectionRange(caret, caret);
  }, [memo?.content]);

  const editAtCaret = (edit: (content: string, caret: number) => TextEdit) => {
    const el = contentRef.current;
    if (!memo || !el) return;
    // Tab でパレットへ移ると本文のフォーカスが外れるので、外れる直前の位置を使う。
    // 一度も触っていない本文はカーソルが先頭にあるため、書き足しとして末尾に入れる
    const caret =
      document.activeElement === el
        ? el.selectionStart
        : Math.min(
            lastCaretRef.current ?? memo.content.length,
            memo.content.length,
          );
    const next = edit(memo.content, caret);
    lastCaretRef.current = next.caret;
    // 本文が変わらないと復元の effect が走らず、予約した位置が次の入力に持ち越される
    if (next.content === memo.content) {
      el.setSelectionRange(next.caret, next.caret);
      return;
    }
    pendingCaretRef.current = next.caret;
    onUpdate(memo.id, { content: next.content });
  };

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
    <div
      className="flex-1 flex flex-col px-6"
      // 開いたパレットの下に本文の末尾が隠れないようにする
      style={{ marginTop: "40px", paddingBottom: isComboOpen ? "300px" : 0 }}
    >
      {/* 本文 */}
      <textarea
        ref={contentRef}
        value={memo.content}
        onChange={(e) => onUpdate(memo.id, { content: e.target.value })}
        onBlur={(e) => {
          lastCaretRef.current = e.currentTarget.selectionStart;
        }}
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
      <ComboButton onClick={() => setIsComboOpen(true)} />

      {isComboOpen && (
        <ComboPalette
          onMove={(move) =>
            editAtCaret((content, caret) => insertMove(content, caret, move))
          }
          onUndo={() => editAtCaret(removeLastMove)}
          onNewline={() => editAtCaret(insertNewline)}
          onClose={() => setIsComboOpen(false)}
        />
      )}

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
