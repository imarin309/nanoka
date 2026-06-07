import type { Memo } from "../types";
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

function exportAsPDF(memo: Memo) {
  const style = document.createElement("style");
  style.textContent = `
    @media print {
      body > *:not(#print-memo) { display: none !important; }
      #print-memo {
        display: block !important;
        font-family: sans-serif;
        padding: 20px;
        color: #333;
      }
      #print-memo h1 {
        font-size: 24px;
        margin-bottom: 24px;
        border-bottom: 1px solid #eee;
        padding-bottom: 12px;
      }
      #print-memo pre {
        white-space: pre-wrap;
        font-family: inherit;
        font-size: 15px;
        line-height: 1.6;
      }
    }
  `;

  const container = document.createElement("div");
  container.id = "print-memo";
  container.style.display = "none";

  const h1 = document.createElement("h1");
  h1.textContent = memo.title || "メモ";
  const pre = document.createElement("pre");
  pre.textContent = memo.content;

  container.appendChild(h1);
  container.appendChild(pre);
  document.head.appendChild(style);
  document.body.appendChild(container);

  const prevTitle = document.title;
  document.title = memo.title || "メモ";

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    document.title = prevTitle;
    style.parentNode?.removeChild(style);
    container.parentNode?.removeChild(container);
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
  cleanup();
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
    onDelete(id);
  };

  return (
    <>
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
          isOpen ? "translate-x-0" : "translate-x-full"
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
                    exportAsPDF(memo);
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
