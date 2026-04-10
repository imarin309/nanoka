import { useState, useMemo } from "react";
import { useMemos } from "./hooks/useMemos";
import { Sidebar } from "./components/Sidebar";
import { MemoEditor } from "./components/MemoEditor";

const imageUrls = Object.values(
  import.meta.glob<string>("./assets/image/*.png", {
    eager: true,
    query: "?url",
    import: "default",
  }),
);

function pickCharacter(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return imageUrls[hash % imageUrls.length];
}

export default function App() {
  const { memos, currentMemo, createMemo, updateMemo, selectMemo } = useMemos();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const characterSrc = useMemo(() => {
    const seed = currentMemo?.id ?? "default";
    return pickCharacter(seed);
  }, [currentMemo?.id]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center relative overflow-hidden">
      <div
        className="w-full flex flex-col flex-1"
        style={{ maxWidth: "480px" }}
      >
        <div className="flex items-center px-6 pt-16 pb-6">
          <input
            type="text"
            value={currentMemo?.title ?? ""}
            onChange={(e) =>
              currentMemo &&
              updateMemo(currentMemo.id, { title: e.target.value })
            }
            placeholder="タイトル"
            className="flex-1 text-3xl font-bold bg-transparent border-none text-center"
            style={{ color: "#111", fontFamily: "inherit" }}
          />
        </div>

        {/* エディタ（本文のみ） */}
        <div className="flex-1 flex flex-col">
          <MemoEditor
            memo={currentMemo}
            onUpdate={updateMemo}
            onNew={createMemo}
          />
        </div>
      </div>

      {/* キャラクター（タップでサイドバーを開く） */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-0 right-0 select-none active:opacity-60 transition-opacity"
        aria-label="メニューを開く"
        style={{ zIndex: 15 }}
      >
        <img
          src={characterSrc}
          alt=""
          style={{ width: "min(45vw, 160px)", opacity: 0.5 }}
        />
      </button>

      {/* サイドバー */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        memos={memos}
        currentId={currentMemo?.id ?? null}
        onSelect={selectMemo}
        onNew={createMemo}
      />
    </div>
  );
}
