import { useEffect, useState } from "react";
import type { Limb, MoveDraft, Strength } from "../lib/combo";
import {
  EMPTY_DRAFT,
  addDirections,
  buildMove,
  buildThrow,
  describeDraft,
} from "../lib/combo";

type Props = {
  onMove: (move: string) => void;
  onUndo: () => void;
  onNewline: () => void;
  onClose: () => void;
};

type Key =
  | { kind: "direction"; label: string }
  | { kind: "attack"; strength: Strength; limb: Limb }
  | {
      kind: "toggle";
      label: string;
      flag: "jump" | "od" | "charging" | "delay";
    }
  | { kind: "throw" }
  | { kind: "move"; label: string }
  | { kind: "action"; label: string; run: "clear" | "undo" | "newline" };

const direction = (label: string): Key => ({ kind: "direction", label });
const attack = (strength: Strength, limb: Limb): Key => ({
  kind: "attack",
  strength,
  limb,
});
const move = (label: string): Key => ({ kind: "move", label });

const ROWS: Key[][] = [
  [
    direction("7"),
    direction("8"),
    direction("9"),
    attack("弱", "P"),
    attack("中", "P"),
    attack("強", "P"),
  ],
  [
    direction("4"),
    direction("5"),
    direction("6"),
    attack("弱", "K"),
    attack("中", "K"),
    attack("強", "K"),
  ],
  [
    direction("1"),
    direction("2"),
    direction("3"),
    { kind: "toggle", label: "J", flag: "jump" },
    { kind: "toggle", label: "OD", flag: "od" },
    { kind: "toggle", label: "溜め", flag: "charging" },
  ],
  ["236", "214", "623", "41236", "63214", "22"].map(direction),
  [
    move("DR"),
    move("DI"),
    move("パリィ"),
    { kind: "throw" },
    { kind: "toggle", label: "ディレイ", flag: "delay" },
    move("CA"),
  ],
  [
    move("SA1"),
    move("SA2"),
    move("SA3"),
    { kind: "action", label: "方向取消", run: "clear" },
    { kind: "action", label: "1つ戻す", run: "undo" },
    { kind: "action", label: "改行", run: "newline" },
  ],
];

function labelOf(key: Key): string {
  switch (key.kind) {
    case "attack":
      return key.strength + key.limb;
    case "throw":
      return "投げ";
    default:
      return key.label;
  }
}

/** OS キーボードが出ていると、その高さだけ下が隠れる */
function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () =>
      setInset(
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop),
      );
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
}

export function ComboPalette({ onMove, onUndo, onNewline, onClose }: Props) {
  const [draft, setDraft] = useState<MoveDraft>(EMPTY_DRAFT);
  const keyboardInset = useKeyboardInset();

  const commit = (text: string) => {
    onMove(text);
    setDraft(EMPTY_DRAFT);
  };

  const press = (key: Key) => {
    switch (key.kind) {
      case "direction":
        setDraft(addDirections(draft, key.label));
        return;
      case "attack":
        commit(buildMove(draft, key.strength, key.limb));
        return;
      case "toggle":
        setDraft({ ...draft, [key.flag]: !draft[key.flag] });
        return;
      case "throw":
        commit(buildThrow(draft));
        return;
      case "move":
        commit(key.label);
        return;
      case "action":
        if (key.run === "clear") setDraft(EMPTY_DRAFT);
        if (key.run === "undo") onUndo();
        if (key.run === "newline") onNewline();
        return;
    }
  };

  const preview = describeDraft(draft);

  return (
    <div
      role="toolbar"
      aria-label="コンボ入力"
      className="fixed left-0 right-0 px-4 pt-2 pb-3 flex flex-col gap-1"
      style={{
        bottom: keyboardInset,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
        zIndex: 20,
      }}
      // 本文からフォーカスを外すと、カーソル位置もキーボードも失われる
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between h-7">
        <span className="text-xs" style={{ color: "#999" }}>
          入力中: <span style={{ color: "#555" }}>{preview || "なし"}</span>
        </span>
        <button
          onClick={onClose}
          className="text-xs px-3 py-1 active:opacity-50"
          style={{ color: "#999" }}
        >
          とじる
        </button>
      </div>
      {ROWS.map((row, i) => (
        <div key={i} className="grid grid-cols-6 gap-1">
          {row.map((key) => {
            const label = labelOf(key);
            const pressed = key.kind === "toggle" ? draft[key.flag] : undefined;
            return (
              <button
                key={label}
                onClick={() => press(key)}
                aria-pressed={pressed}
                className="h-9 rounded-lg text-xs active:opacity-50"
                style={{
                  background: pressed ? "#d4a9a0" : "#faf6f5",
                  color: pressed ? "#fff" : "#555",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
