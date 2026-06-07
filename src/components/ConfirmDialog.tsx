type Props = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.25)" }}
      onClick={onCancel}
    >
      <div
        className="rounded-2xl px-7 py-6 flex flex-col gap-5"
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
          {message}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-full text-sm active:opacity-50"
            style={{ background: "#f0f0f0", color: "#888" }}
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-full text-sm font-bold active:opacity-50"
            style={{ background: "#d4a9a0", color: "#fff" }}
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
