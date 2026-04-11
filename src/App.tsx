import { useState, useMemo } from "react";
import { useMemos } from "./hooks/useMemos";
import { Sidebar } from "./components/Sidebar";
import { MemoEditor } from "./components/MemoEditor";
import { TitleInput } from "./components/TitleInput";
import { AnpanButton } from "./components/AnpanButton";

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
  const {
    memos,
    currentMemo,
    createMemo,
    updateMemo,
    deleteMemo,
    selectMemo,
    isLoading,
  } = useMemos();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const characterSrc = useMemo(() => {
    const seed = currentMemo?.id ?? "default";
    return pickCharacter(seed);
  }, [currentMemo?.id]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center relative overflow-hidden">
      <div
        className="w-full flex flex-col flex-1"
        style={{ maxWidth: "480px" }}
      >
        <TitleInput memo={currentMemo} onUpdate={updateMemo} />

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
      <AnpanButton src={characterSrc} onClick={() => setSidebarOpen(true)} />

      {/* サイドバー */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        memos={memos}
        currentId={currentMemo?.id ?? null}
        onSelect={selectMemo}
        onNew={createMemo}
        onDelete={deleteMemo}
      />
    </div>
  );
}
