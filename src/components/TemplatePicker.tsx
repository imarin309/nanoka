import { useEffect } from "react";
import type { Template } from "../lib/templates";

type Props = {
  templates: Template[];
  onSelect: (template: Template) => void;
  onClose: () => void;
};

export function TemplatePicker({ templates, onSelect, onClose }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.25)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="テンプレを選ぶ"
        className="rounded-2xl px-7 py-6 flex flex-col gap-4"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          minWidth: "240px",
          maxWidth: "80vw",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-center" style={{ color: "#555" }}>
          テンプレを選ぶ
        </p>
        <div className="flex flex-col gap-2">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="px-5 py-3 rounded-2xl text-sm text-left active:opacity-50"
              style={{ background: "#faf6f5", color: "#555" }}
            >
              {template.name}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="self-center px-5 py-2 rounded-full text-sm active:opacity-50"
          style={{ background: "#f0f0f0", color: "#888" }}
        >
          とじる
        </button>
      </div>
    </div>
  );
}
