type Props = {
  src: string;
  onClick: () => void;
};

export function AnpanButton({ src, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-0 right-0 select-none active:opacity-60 transition-opacity"
      aria-label="メニューを開く"
      style={{ zIndex: 15 }}
    >
      <img
        src={src}
        alt=""
        style={{ width: "min(45vw, 160px)", opacity: 0.5 }}
      />
    </button>
  );
}
