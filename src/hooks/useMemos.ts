import { useState, useEffect, useCallback, useRef } from "react";
import type { Memo } from "../types";
import {
  openDB,
  getAllMemos,
  putMemo,
  deleteMemo as deleteMemoFromDB,
} from "./useIndexedDB";

export function useMemos() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const dbRef = useRef<IDBDatabase | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const db = await openDB();
        if (cancelled) return;
        dbRef.current = db;

        if (navigator.storage?.persist) {
          await navigator.storage.persist();
        }

        const loaded = await getAllMemos(db);

        if (cancelled) return;
        setMemos(loaded);
        setCurrentId(loaded.length > 0 ? loaded[0].id : null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentMemo = memos.find((m) => m.id === currentId) ?? null;

  const createMemo = useCallback(async () => {
    const newMemo: Memo = {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    if (dbRef.current) {
      try {
        await putMemo(dbRef.current, newMemo);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      }
    }
    setMemos((prev) => [newMemo, ...prev]);
    setCurrentId(newMemo.id);
    return newMemo.id;
  }, []);

  const updateMemo = useCallback(
    async (id: string, patch: Partial<Pick<Memo, "title" | "content">>) => {
      setMemos((prev) => {
        const updated = prev.map((m) =>
          m.id === id ? { ...m, ...patch, updatedAt: Date.now() } : m,
        );
        if (dbRef.current) {
          const target = updated.find((m) => m.id === id);
          if (target) {
            putMemo(dbRef.current, target).catch((e) =>
              setError(e instanceof Error ? e : new Error(String(e))),
            );
          }
        }
        return updated;
      });
    },
    [],
  );

  const deleteMemo = useCallback(async (id: string) => {
    if (dbRef.current) {
      try {
        await deleteMemoFromDB(dbRef.current, id);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        return;
      }
    }
    setMemos((prev) => {
      const next = prev.filter((m) => m.id !== id);
      setCurrentId((cur) => {
        if (cur !== id) return cur;
        return next.length > 0 ? next[0].id : null;
      });
      return next;
    });
  }, []);

  const selectMemo = useCallback((id: string) => {
    setCurrentId(id);
  }, []);

  return {
    memos,
    currentMemo,
    createMemo,
    updateMemo,
    deleteMemo,
    selectMemo,
    isLoading,
    error,
  };
}
