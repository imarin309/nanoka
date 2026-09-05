import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Memo } from "../types";

const overrides = vi.hoisted(() => ({
  putMemo: null as ((db: IDBDatabase, memo: Memo) => Promise<void>) | null,
  deleteMemo: null as ((db: IDBDatabase, id: string) => Promise<void>) | null,
}));

vi.mock("./useIndexedDB", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./useIndexedDB")>();
  return {
    ...actual,
    putMemo: (db: IDBDatabase, memo: Memo) =>
      (overrides.putMemo ?? actual.putMemo)(db, memo),
    deleteMemo: (db: IDBDatabase, id: string) =>
      (overrides.deleteMemo ?? actual.deleteMemo)(db, id),
  };
});

const db =
  await vi.importActual<typeof import("./useIndexedDB")>("./useIndexedDB");

const { useMemos } = await import("./useMemos");

function memo(id: string, updatedAt: number): Memo {
  return {
    id,
    title: `title-${id}`,
    content: `content-${id}`,
    createdAt: updatedAt,
    updatedAt,
  };
}

async function seed(...memos: Memo[]) {
  const conn = await db.openDB();
  for (const m of memos) await db.putMemo(conn, m);
  conn.close();
}

async function storedMemos() {
  const conn = await db.openDB();
  const memos = await db.getAllMemos(conn);
  conn.close();
  return memos;
}

async function renderUseMemos() {
  const view = renderHook(() => useMemos());
  await waitFor(() => expect(view.result.current.isLoading).toBe(false));
  return view;
}

beforeEach(() => {
  overrides.putMemo = null;
  overrides.deleteMemo = null;
});

describe("初期化", () => {
  it("保存済みメモを updatedAt 降順で読み込み、先頭を選択する", async () => {
    await seed(memo("old", 100), memo("new", 300), memo("mid", 200));

    const { result } = await renderUseMemos();

    expect(result.current.memos.map((m) => m.id)).toEqual([
      "new",
      "mid",
      "old",
    ]);
    expect(result.current.currentMemo?.id).toBe("new");
    expect(result.current.error).toBeNull();
  });

  it("メモがなければ選択なしで始まる", async () => {
    const { result } = await renderUseMemos();

    expect(result.current.memos).toEqual([]);
    expect(result.current.currentMemo).toBeNull();
  });
});

describe("createMemo", () => {
  it("空のメモを先頭に追加して選択する", async () => {
    await seed(memo("a", 100));
    const { result } = await renderUseMemos();

    let created: string | undefined;
    await act(async () => {
      created = await result.current.createMemo();
    });

    expect(result.current.memos.map((m) => m.id)).toEqual([created, "a"]);
    expect(result.current.currentMemo?.id).toBe(created);
    expect(result.current.currentMemo?.title).toBe("");
    expect(result.current.currentMemo?.content).toBe("");
  });

  it("追加したメモを永続化する", async () => {
    const { result } = await renderUseMemos();

    await act(async () => {
      await result.current.createMemo();
    });

    expect(await storedMemos()).toHaveLength(1);
  });

  it("保存に失敗したらメモを追加せずエラーを立てる", async () => {
    const { result } = await renderUseMemos();
    overrides.putMemo = () => Promise.reject(new Error("保存失敗"));

    await act(async () => {
      await result.current.createMemo();
    });

    expect(result.current.memos).toEqual([]);
    expect(result.current.error?.message).toBe("保存失敗");
  });
});

describe("updateMemo", () => {
  it("タイトルと本文を更新して永続化する", async () => {
    await seed(memo("a", 100));
    const { result } = await renderUseMemos();

    await act(async () => {
      await result.current.updateMemo("a", { title: "新タイトル" });
    });
    await act(async () => {
      await result.current.updateMemo("a", { content: "新本文" });
    });

    expect(result.current.currentMemo).toMatchObject({
      title: "新タイトル",
      content: "新本文",
    });
    expect(await storedMemos()).toMatchObject([
      { id: "a", title: "新タイトル", content: "新本文" },
    ]);
  });

  it("updatedAt を進める", async () => {
    await seed(memo("a", 100));
    const { result } = await renderUseMemos();

    await act(async () => {
      await result.current.updateMemo("a", { title: "x" });
    });

    expect(result.current.currentMemo!.updatedAt).toBeGreaterThan(100);
    expect(result.current.currentMemo!.createdAt).toBe(100);
  });

  it("存在しない id は何もしない", async () => {
    await seed(memo("a", 100));
    const { result } = await renderUseMemos();

    await act(async () => {
      await result.current.updateMemo("missing", { title: "x" });
    });

    expect(await storedMemos()).toMatchObject([{ id: "a", title: "title-a" }]);
  });

  it("保存に失敗したら編集前の内容へ戻してエラーを立てる", async () => {
    await seed(memo("a", 100));
    const { result } = await renderUseMemos();
    overrides.putMemo = () => Promise.reject(new Error("保存失敗"));

    await act(async () => {
      await result.current.updateMemo("a", { title: "消える変更" });
    });

    expect(result.current.currentMemo?.title).toBe("title-a");
    expect(result.current.error?.message).toBe("保存失敗");
  });

  it("古い保存の失敗は、後続の保存結果を巻き戻さない", async () => {
    await seed(memo("a", 100));
    const { result } = await renderUseMemos();

    let failFirst!: (e: Error) => void;
    const first = new Promise<void>((_, reject) => {
      failFirst = reject;
    });
    let call = 0;
    overrides.putMemo = () => (++call === 1 ? first : Promise.resolve());

    let firstSave!: Promise<void>;
    await act(async () => {
      firstSave = result.current.updateMemo("a", { title: "1回目" });
    });
    await act(async () => {
      await result.current.updateMemo("a", { title: "2回目" });
    });

    await act(async () => {
      failFirst(new Error("保存失敗"));
      await firstSave;
    });

    expect(result.current.currentMemo?.title).toBe("2回目");
    expect(result.current.error).toBeNull();
  });

  it("保存の完了前に削除された場合、保存内容を DB へ残さない", async () => {
    await seed(memo("a", 100));
    const { result } = await renderUseMemos();

    let startSave!: () => void;
    const gate = new Promise<void>((resolve) => {
      startSave = resolve;
    });
    overrides.putMemo = async (conn, m) => {
      await gate;
      await db.putMemo(conn, m);
    };

    let save!: Promise<void>;
    await act(async () => {
      save = result.current.updateMemo("a", { title: "保存中" });
    });
    await act(async () => {
      await result.current.deleteMemo("a");
    });

    await act(async () => {
      startSave();
      await save;
    });

    expect(await storedMemos()).toEqual([]);
  });
});

describe("deleteMemo", () => {
  it("一覧と DB から取り除く", async () => {
    await seed(memo("a", 100), memo("b", 200));
    const { result } = await renderUseMemos();

    await act(async () => {
      await result.current.deleteMemo("a");
    });

    expect(result.current.memos.map((m) => m.id)).toEqual(["b"]);
    expect((await storedMemos()).map((m) => m.id)).toEqual(["b"]);
  });

  it("選択中のメモを消したら次の先頭を選ぶ", async () => {
    await seed(memo("a", 100), memo("b", 200));
    const { result } = await renderUseMemos();
    expect(result.current.currentMemo?.id).toBe("b");

    await act(async () => {
      await result.current.deleteMemo("b");
    });

    expect(result.current.currentMemo?.id).toBe("a");
  });

  it("選択していないメモを消しても選択は変わらない", async () => {
    await seed(memo("a", 100), memo("b", 200));
    const { result } = await renderUseMemos();

    await act(async () => {
      await result.current.deleteMemo("a");
    });

    expect(result.current.currentMemo?.id).toBe("b");
  });

  it("最後の1件を消したら選択なしになる", async () => {
    await seed(memo("a", 100));
    const { result } = await renderUseMemos();

    await act(async () => {
      await result.current.deleteMemo("a");
    });

    expect(result.current.currentMemo).toBeNull();
  });

  it("削除に失敗したら一覧を保ったままエラーを立てる", async () => {
    await seed(memo("a", 100));
    const { result } = await renderUseMemos();
    overrides.deleteMemo = () => Promise.reject(new Error("削除失敗"));

    await act(async () => {
      await result.current.deleteMemo("a");
    });

    expect(result.current.memos.map((m) => m.id)).toEqual(["a"]);
    expect(result.current.error?.message).toBe("削除失敗");
  });
});

describe("selectMemo", () => {
  it("選択中のメモを切り替える", async () => {
    await seed(memo("a", 100), memo("b", 200));
    const { result } = await renderUseMemos();

    act(() => {
      result.current.selectMemo("a");
    });

    expect(result.current.currentMemo?.id).toBe("a");
  });
});
