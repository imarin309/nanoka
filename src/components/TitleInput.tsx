import type { Memo } from "../types";

type Props = {
  memo: Memo | null;
  onUpdate: (id: string, patch: Partial<Pick<Memo, "title" | "content">>) => void;
};

export function TitleInput({ memo, onUpdate }: Props) {
  return (
    <div className="flex items-center px-6 pt-16 pb-6">
      <input
        type="text"
        value={memo?.title ?? ""}
        onChange={(e) =>
          memo && onUpdate(memo.id, { title: e.target.value })
        }
        placeholder="タイトル"
        className="flex-1 text-3xl font-bold bg-transparent border-none text-center"
        style={{ color: "#111", fontFamily: "inherit" }}
      />
    </div>
  );
}
