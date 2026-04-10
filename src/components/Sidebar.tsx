import type { Memo } from "../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  memos: Memo[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
};

export function Sidebar({
  isOpen,
  onClose,
  memos,
  currentId,
  onSelect,
  onNew,
}: Props) {
  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  const handleNew = () => {
    onNew();
    onClose();
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
          background: "#fff",
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
              <button
                key={memo.id}
                onClick={() => handleSelect(memo.id)}
                className="w-full text-left active:opacity-50"
                style={{
                  padding: "20px 0",
                  borderBottom: "1px solid #f0f0f0",
                  opacity: memo.id === currentId ? 1 : 0.6,
                }}
              >
                <p
                  className="font-bold text-sm truncate"
                  style={{ color: "#333" }}
                >
                  {memo.title || "（タイトルなし）"}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
