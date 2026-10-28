import { describe, expect, it } from "vitest";
import type { Memo } from "../types";
import {
  entriesWithToday,
  formatDateKey,
  memoBodyText,
  toDateKey,
  upsertEntry,
} from "./diary";

describe("toDateKey", () => {
  it("ローカル日付を YYYY-MM-DD にする", () => {
    expect(toDateKey(new Date(2026, 8, 5, 23, 59))).toBe("2026-09-05");
  });
});

describe("formatDateKey", () => {
  it("曜日つきの表示にする", () => {
    expect(formatDateKey("2026-09-05")).toBe("2026/09/05(土)");
  });
});

describe("upsertEntry", () => {
  it("新しい日付のカードを新しい順に差し込む", () => {
    const entries = [
      { date: "2026-09-05", content: "a" },
      { date: "2026-09-01", content: "b" },
    ];

    expect(upsertEntry(entries, "2026-09-03", "c").map((e) => e.date)).toEqual([
      "2026-09-05",
      "2026-09-03",
      "2026-09-01",
    ]);
  });

  it("同じ日付のカードは書き換える", () => {
    const entries = [{ date: "2026-09-05", content: "a" }];

    expect(upsertEntry(entries, "2026-09-05", "b")).toEqual([
      { date: "2026-09-05", content: "b" },
    ]);
  });

  it("空にしたカードは取り除く", () => {
    const entries = [{ date: "2026-09-05", content: "a" }];

    expect(upsertEntry(entries, "2026-09-05", "")).toEqual([]);
  });
});

describe("entriesWithToday", () => {
  it("今日のカードがなければ空のカードを足す", () => {
    const entries = [{ date: "2026-09-01", content: "a" }];

    expect(entriesWithToday(entries, "2026-09-05")).toEqual([
      { date: "2026-09-05", content: "" },
      { date: "2026-09-01", content: "a" },
    ]);
  });

  it("今日のカードがあればそのまま", () => {
    const entries = [{ date: "2026-09-05", content: "a" }];

    expect(entriesWithToday(entries, "2026-09-05")).toEqual(entries);
  });
});

describe("memoBodyText", () => {
  const base: Memo = {
    id: "a",
    title: "",
    content: "本文",
    createdAt: 0,
    updatedAt: 0,
  };

  it("通常メモは本文をそのまま返す", () => {
    expect(memoBodyText(base)).toBe("本文");
  });

  it("日記は日付と本文をカードごとに並べる", () => {
    const diary: Memo = {
      ...base,
      mode: "diary",
      entries: [
        { date: "2026-09-05", content: "晴れ" },
        { date: "2026-09-04", content: "雨" },
      ],
    };

    expect(memoBodyText(diary)).toBe(
      "2026/09/05(土)\n晴れ\n\n2026/09/04(金)\n雨",
    );
  });
});
