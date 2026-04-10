import { useState, useEffect, useCallback } from "react";
import type { Memo } from "../types";

const STORAGE_KEY = "maine-memos";

function loadMemos(): Memo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMemos(memos: Memo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
}

export function useMemos() {
  const [memos, setMemos] = useState<Memo[]>(loadMemos);
  const [currentId, setCurrentId] = useState<string | null>(() => {
    const list = loadMemos();
    return list.length > 0 ? list[0].id : null;
  });

  useEffect(() => {
    saveMemos(memos);
  }, [memos]);

  const currentMemo = memos.find((m) => m.id === currentId) ?? null;

  const createMemo = useCallback(() => {
    const newMemo: Memo = {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setMemos((prev) => [newMemo, ...prev]);
    setCurrentId(newMemo.id);
    return newMemo.id;
  }, []);

  const updateMemo = useCallback(
    (id: string, patch: Partial<Pick<Memo, "title" | "content">>) => {
      setMemos((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, ...patch, updatedAt: Date.now() } : m,
        ),
      );
    },
    [],
  );

  const selectMemo = useCallback((id: string) => {
    setCurrentId(id);
  }, []);

  return { memos, currentMemo, createMemo, updateMemo, selectMemo };
}
