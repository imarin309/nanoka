type Props = {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  ariaLabel?: string;
  className?: string;
};

export function ExportButton({ label, onClick, ariaLabel, className = "" }: Props) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 active:scale-95 transition-transform text-xs font-medium px-2 py-1 rounded-md ${className}`}
      style={{ background: "#d4a9a0", color: "#fff" }}
      aria-label={ariaLabel}
    >
      {label}
    </button>
  );
}
