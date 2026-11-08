import { useEffect, useRef, useState } from "react";
import type { Memo, MemoPatch, TaskItem, TaskSection } from "../types";
import {
  addItem,
  addSection,
  pruneSection,
  removeEmptyItem,
  renameSection,
  updateItem,
} from "../lib/task";
import { generateId } from "../lib/id";

type Props = {
  memo: Memo;
  onUpdate: (id: string, patch: MemoPatch) => void;
};

// 押した瞬間に空の項目の blur で削除が走ると、ボタンが上へずれて click が成立しない。
// フォーカスを動かさず、追加した側の autoFocus で空の項目を外す
const keepFocus = (e: React.MouseEvent) => e.preventDefault();

const addButtonStyle = { color: "#c9a9a2" };

export function TaskEditor({ memo, onUpdate }: Props) {
  const sections = memo.sections ?? [];
  const [addedId, setAddedId] = useState<string | null>(null);

  const save = (next: TaskSection[]) => onUpdate(memo.id, { sections: next });
  const saveIfChanged = (next: TaskSection[]) => {
    if (next !== sections) save(next);
  };

  const handleAddSection = () => {
    const section: TaskSection = { id: generateId(), title: "", items: [] };
    save(addSection(sections, section));
    setAddedId(section.id);
  };

  const handleAddItem = (sectionId: string, afterId?: string) => {
    const item: TaskItem = { id: generateId(), text: "", done: false };
    save(addItem(sections, sectionId, item, afterId));
    setAddedId(item.id);
  };

  return (
    <div
      className="flex-1 flex flex-col gap-4 px-6 pb-48"
      style={{ marginTop: "40px" }}
    >
      {sections.map((section) => (
        <TaskSectionCard
          key={section.id}
          section={section}
          addedId={addedId}
          onRename={(title) => save(renameSection(sections, section.id, title))}
          onAddItem={(afterId) => handleAddItem(section.id, afterId)}
          onChangeItem={(itemId, patch) =>
            save(updateItem(sections, section.id, itemId, patch))
          }
          onLeaveItem={(itemId) =>
            saveIfChanged(removeEmptyItem(sections, section.id, itemId))
          }
          onLeave={() => saveIfChanged(pruneSection(sections, section.id))}
        />
      ))}
      <button
        onMouseDown={keepFocus}
        onClick={handleAddSection}
        className="self-center text-sm font-bold active:opacity-50"
        style={addButtonStyle}
      >
        ＋ 見出しを追加
      </button>
    </div>
  );
}

type SectionProps = {
  section: TaskSection;
  addedId: string | null;
  onRename: (title: string) => void;
  onAddItem: (afterId?: string) => void;
  onChangeItem: (
    itemId: string,
    patch: Partial<Pick<TaskItem, "text" | "done">>,
  ) => void;
  onLeaveItem: (itemId: string) => void;
  onLeave: () => void;
};

function TaskSectionCard({
  section,
  addedId,
  onRename,
  onAddItem,
  onChangeItem,
  onLeaveItem,
  onLeave,
}: SectionProps) {
  // 見出しから項目へ移っただけで空の見出しが消えないよう、カードの外へ出たときだけ扱う
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) onLeave();
  };

  return (
    <section
      onBlur={handleBlur}
      className="rounded-2xl px-5 py-4 flex flex-col gap-2"
      style={{ background: "#faf6f5" }}
    >
      <input
        value={section.title}
        onChange={(e) => onRename(e.target.value)}
        autoFocus={section.id === addedId}
        placeholder="見出し"
        aria-label="見出し"
        className="w-full bg-transparent border-none text-xs font-bold"
        style={{ color: "#80625b", fontFamily: "inherit" }}
      />
      {section.items.map((item) => (
        <TaskItemRow
          key={item.id}
          item={item}
          autoFocus={item.id === addedId}
          onChange={(patch) => onChangeItem(item.id, patch)}
          onEnter={() => onAddItem(item.id)}
          onLeave={() => onLeaveItem(item.id)}
        />
      ))}
      <button
        onMouseDown={keepFocus}
        onClick={() => onAddItem()}
        className="self-start text-lg leading-none active:opacity-50"
        style={addButtonStyle}
        aria-label={`${section.title || "見出し"}に項目を追加`}
      >
        ＋
      </button>
    </section>
  );
}

type ItemProps = {
  item: TaskItem;
  autoFocus: boolean;
  onChange: (patch: Partial<Pick<TaskItem, "text" | "done">>) => void;
  onEnter: () => void;
  onLeave: () => void;
};

function TaskItemRow({
  item,
  autoFocus,
  onChange,
  onEnter,
  onLeave,
}: ItemProps) {
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [item.text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 変換確定の Enter で項目が増えないよう、IME の入力中は見送る
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    if (item.text !== "") onEnter();
  };

  // カードの外へ出る場合は、見出しごとまとめて片付ける側に任せる。
  // 両方で保存すると、古い状態から作った後の保存が先の保存を上書きしてしまう
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const next = e.relatedTarget;
    const leftItem = !e.currentTarget.contains(next);
    const stayedInSection = e.currentTarget.closest("section")?.contains(next);
    if (leftItem && stayedInSection) onLeave();
  };

  return (
    <div onBlur={handleBlur} className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={item.done}
        onChange={(e) => onChange({ done: e.target.checked })}
        aria-label={`${item.text || "項目"}をできたにする`}
        className="shrink-0 w-4 h-4 accent-[#c9a9a2]"
        style={{ marginTop: "0.35em" }}
      />
      <textarea
        ref={textRef}
        value={item.text}
        onChange={(e) => onChange({ text: e.target.value })}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        rows={1}
        placeholder="ここに書こう..."
        aria-label="項目"
        className="flex-1 bg-transparent border-none leading-relaxed resize-none"
        style={{
          color: item.done ? "#aaa" : "#333",
          textDecoration: item.done ? "line-through" : "none",
          fontFamily: "inherit",
          fontSize: "15px",
        }}
      />
    </div>
  );
}
