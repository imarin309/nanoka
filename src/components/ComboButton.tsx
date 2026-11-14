type Props = {
  onClick: () => void;
};

export function ComboButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      // 書いている途中で開いても、カーソル位置とキーボードを保つ
      onMouseDown={(e) => e.preventDefault()}
      className="fixed bottom-6 left-21 w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold active:opacity-60 transition-opacity"
      aria-label="コンボ入力を開く"
      style={{
        background: "#fff",
        color: "#c9a9a2",
        boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
        zIndex: 10,
      }}
    >
      <span aria-hidden="true">P&gt;K</span>
    </button>
  );
}
