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
    error,
  } = useMemos();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const characterSrc = useMemo(() => {
    const seed = currentMemo?.id ?? "default";
    return pickCharacter(seed);
  }, [currentMemo?.id]);

  if (isLoading) return null;

  return (
    <>
      {error && (
        <div
          className="fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm text-center"
          style={{ background: "#fee2e2", color: "#b91c1c" }}
        >
          保存できませんでした：{error.message}
        </div>
      )}
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
    </>
  );
}
