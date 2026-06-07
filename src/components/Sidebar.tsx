import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Memo } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";
import { ExportButton } from "./ExportButton";

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_").trim() || "メモ";
}

function exportAsText(memo: Memo) {
  const text = [memo.title, "", memo.content].join("\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFilename(memo.title)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function PrintOverlay({ memo, onClose }: { memo: Memo; onClose: () => void }) {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `@media print{body>*:not(#nanoka-print){display:none!important}#nanoka-print-bar{display:none!important}}`;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return createPortal(
    <div
      id="nanoka-print"
      style={{
        position: "fixed",
        inset: 0,
        background: "white",
        zIndex: 9999,
        overflowY: "auto",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        color: "#333",
        lineHeight: 1.7,
      }}
    >
      <div
        id="nanoka-print-bar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 20px",
          borderBottom: "1px solid #eee",
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            color: "#999",
            lineHeight: 1,
            flexShrink: 0,
          }}
          aria-label="閉じる"
        >
          ×
        </button>
        <p style={{ fontSize: 13, color: "#888" }}>
          共有ボタン → 印刷 でPDF保存できます
        </p>
      </div>
      <div style={{ padding: "32px 24px" }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 20,
            paddingBottom: 12,
            borderBottom: "1px solid #eee",
          }}
        >
          {memo.title || "メモ"}
        </h1>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            fontFamily: "inherit",
            fontSize: 15,
          }}
        >
          {memo.content}
        </pre>
      </div>
    </div>,
    document.body,
  );
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  memos: Memo[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
};

export function Sidebar({
  isOpen,
  onClose,
  memos,
  currentId,
  onSelect,
  onNew,
  onDelete,
}: Props) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [printMemo, setPrintMemo] = useState<Memo | null>(null);

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  const handleNew = () => {
    onNew();
    onClose();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPendingDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId) onDelete(pendingDeleteId);
    setPendingDeleteId(null);
  };

  const handleCancelDelete = () => {
    setPendingDeleteId(null);
  };

  return (
    <>
      {pendingDeleteId && (
        <ConfirmDialog
          message="このメモを削除しますか？"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
      {printMemo && (
        <PrintOverlay memo={printMemo} onClose={() => setPrintMemo(null)} />
      )}
      {/* オーバーレイ */}
      <div
        className={`fixed inset-0 z-20 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.15)" }}
        onClick={onClose}
      />

      {/* ドロワー */}
      <div
        className={`fixed top-0 right-0 h-full z-30 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        style={{
          width: "75vw",
          maxWidth: "300px",
          background: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "-2px 0 16px rgba(0,0,0,0.08)",
        }}
      >
        {/* 閉じるボタン */}
        <div className="flex justify-end px-5 py-5">
          <button
            onClick={onClose}
            className="text-2xl leading-none"
            style={{ color: "#999" }}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* 新規ボタン */}
        <div className="px-5 pb-4">
          <button
            onClick={handleNew}
            className="text-sm font-bold active:opacity-50"
            style={{ color: "#d4a9a0" }}
          >
            ＋ 新しいメモ
          </button>
        </div>

        {/* 一覧 */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-0">
          {memos.length === 0 ? (
            <p className="text-sm mt-4" style={{ color: "#bbb" }}>
              まだメモがないよ
            </p>
          ) : (
            memos.map((memo) => (
              <div
                key={memo.id}
                className="flex items-center"
                style={{
                  borderBottom: "1px solid #f0f0f0",
                  opacity: memo.id === currentId ? 1 : 0.6,
                }}
              >
                <button
                  onClick={() => handleSelect(memo.id)}
                  className="flex-1 text-left active:opacity-50"
                  style={{ padding: "20px 0" }}
                >
                  <p
                    className="font-bold text-sm truncate"
                    style={{ color: "#333" }}
                  >
                    {memo.title || "（タイトルなし）"}
                  </p>
                </button>
                <ExportButton
                  label=".txt"
                  onClick={(e) => {
                    e.stopPropagation();
                    exportAsText(memo);
                  }}
                  ariaLabel="テキストで保存"
                  className="ml-2"
                />
                <ExportButton
                  label="PDF"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPrintMemo(memo);
                  }}
                  ariaLabel="PDFで保存"
                  className="ml-1"
                />
                <button
                  onClick={(e) => handleDelete(e, memo.id)}
                  className="shrink-0 active:opacity-50 pl-3"
                  style={{ color: "#ccc", fontSize: "18px", lineHeight: 1 }}
                  aria-label="削除"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
