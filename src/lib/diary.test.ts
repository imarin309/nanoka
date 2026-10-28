import { describe, expect, it } from "vitest";
import type { Memo } from "../types";
import {
  addEntry,
  formatDateKey,
  memoBodyText,
  removeEmptyEntry,
  toDateKey,
  updateEntry,
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

describe("addEntry", () => {
  it("日付の新しい順に差し込む", () => {
    const entries = [
      { id: "1", date: "2026-09-05", content: "a" },
      { id: "2", date: "2026-09-01", content: "b" },
    ];

    expect(
      addEntry(entries, { id: "3", date: "2026-09-03", content: "" }).map(
        (e) => e.id,
      ),
    ).toEqual(["1", "3", "2"]);
  });

  it("同じ日付なら後から足したカードを上にする", () => {
    const entries = [{ id: "1", date: "2026-09-05", content: "朝" }];

    expect(
      addEntry(entries, { id: "2", date: "2026-09-05", content: "" }).map(
        (e) => e.id,
      ),
    ).toEqual(["2", "1"]);
  });
});

describe("updateEntry", () => {
  const entries = [
    { id: "1", date: "2026-09-05", content: "a" },
    { id: "2", date: "2026-09-01", content: "b" },
  ];

  it("指定したカードの本文を書き換える", () => {
    expect(updateEntry(entries, "2", { content: "c" })).toEqual([
      { id: "1", date: "2026-09-05", content: "a" },
      { id: "2", date: "2026-09-01", content: "c" },
    ]);
  });

  it("日付を変えたら並び直す", () => {
    expect(
      updateEntry(entries, "2", { date: "2026-09-10" }).map((e) => e.id),
    ).toEqual(["2", "1"]);
  });
});

describe("removeEmptyEntry", () => {
  it("空のカードを取り除く", () => {
    const entries = [
      { id: "1", date: "2026-09-05", content: "" },
      { id: "2", date: "2026-09-01", content: "b" },
    ];

    expect(removeEmptyEntry(entries, "1").map((e) => e.id)).toEqual(["2"]);
  });

  it("本文のあるカードは残し、同じ配列を返す", () => {
    const entries = [{ id: "1", date: "2026-09-05", content: "a" }];

    expect(removeEmptyEntry(entries, "1")).toBe(entries);
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
        { id: "2", date: "2026-09-05", content: "晴れ" },
        { id: "1", date: "2026-09-04", content: "雨" },
      ],
    };

    expect(memoBodyText(diary)).toBe(
      "2026/09/05(土)\n晴れ\n\n2026/09/04(金)\n雨",
    );
  });
});
