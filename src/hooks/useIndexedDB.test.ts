import { describe, expect, it } from "vitest";
import type { Memo } from "../types";
import { deleteMemo, getAllMemos, openDB, putMemo } from "./useIndexedDB";

function memo(id: string, updatedAt: number): Memo {
  return {
    id,
    title: `title-${id}`,
    content: `content-${id}`,
    createdAt: updatedAt,
    updatedAt,
  };
}

describe("openDB", () => {
  it("memos ストアと updatedAt インデックスを作る", async () => {
    const db = await openDB();

    expect(db.objectStoreNames.contains("memos")).toBe(true);
    const index = db
      .transaction("memos", "readonly")
      .objectStore("memos")
      .index("updatedAt");
    expect(index.keyPath).toBe("updatedAt");

    db.close();
  });

  it("既存 DB を再度開いてもデータが残る", async () => {
    const db = await openDB();
    await putMemo(db, memo("a", 1));
    db.close();

    const reopened = await openDB();
    expect(await getAllMemos(reopened)).toHaveLength(1);
    reopened.close();
  });
});

describe("getAllMemos", () => {
  it("updatedAt の降順で返す", async () => {
    const db = await openDB();
    await putMemo(db, memo("old", 100));
    await putMemo(db, memo("new", 300));
    await putMemo(db, memo("mid", 200));

    const memos = await getAllMemos(db);

    expect(memos.map((m) => m.id)).toEqual(["new", "mid", "old"]);
    db.close();
  });

  it("空の DB では空配列を返す", async () => {
    const db = await openDB();
    expect(await getAllMemos(db)).toEqual([]);
    db.close();
  });
});

describe("putMemo", () => {
  it("メモを保存する", async () => {
    const db = await openDB();
    await putMemo(db, memo("a", 1));

    expect(await getAllMemos(db)).toEqual([memo("a", 1)]);
    db.close();
  });

  it("同じ id は上書きする", async () => {
    const db = await openDB();
    await putMemo(db, memo("a", 1));
    await putMemo(db, { ...memo("a", 2), title: "updated" });

    const memos = await getAllMemos(db);
    expect(memos).toHaveLength(1);
    expect(memos[0].title).toBe("updated");
    db.close();
  });
});

describe("deleteMemo", () => {
  it("指定した id だけ削除する", async () => {
    const db = await openDB();
    await putMemo(db, memo("a", 1));
    await putMemo(db, memo("b", 2));

    await deleteMemo(db, "a");

    expect((await getAllMemos(db)).map((m) => m.id)).toEqual(["b"]);
    db.close();
  });

  it("存在しない id でも失敗しない", async () => {
    const db = await openDB();
    await expect(deleteMemo(db, "missing")).resolves.toBeUndefined();
    db.close();
  });
});
