type Props = {
  onClick: () => void;
};

export function TemplateButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 w-12 h-12 rounded-full flex items-center justify-center active:opacity-60 transition-opacity"
      aria-label="テンプレを挿入"
      style={{
        background: "#fff",
        color: "#c9a9a2",
        boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
        zIndex: 10,
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M5 5h14M5 12h14M5 19h8" />
      </svg>
    </button>
  );
}
