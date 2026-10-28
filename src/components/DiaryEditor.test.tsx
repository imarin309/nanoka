import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Memo } from "../types";
import { DiaryEditor } from "./DiaryEditor";

function diary(entries: Memo["entries"]): Memo {
  return {
    id: "a",
    title: "日記",
    content: "",
    createdAt: 100,
    updatedAt: 100,
    mode: "diary",
    entries,
  };
}

// Date だけを固定する（タイマーまで偽物にすると userEvent が進まない）
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 8, 5));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("DiaryEditor", () => {
  it("日付ごとのカードを新しい順に並べ、今日のカードを補う", () => {
    render(
      <DiaryEditor
        memo={diary([{ date: "2026-09-01", content: "前の日" }])}
        onUpdate={vi.fn()}
      />,
    );

    const cards = screen.getAllByRole("textbox");
    expect(cards.map((c) => c.getAttribute("aria-label"))).toEqual([
      "2026/09/05(土)",
      "2026/09/01(火)",
    ]);
    expect(cards[0]).toHaveValue("");
    expect(cards[1]).toHaveValue("前の日");
  });

  it("今日のカードに書くとカードを追加して伝える", async () => {
    const onUpdate = vi.fn();
    render(
      <DiaryEditor
        memo={diary([{ date: "2026-09-01", content: "前の日" }])}
        onUpdate={onUpdate}
      />,
    );

    await userEvent.type(screen.getByLabelText("2026/09/05(土)"), "晴");

    expect(onUpdate).toHaveBeenCalledWith("a", {
      entries: [
        { date: "2026-09-05", content: "晴" },
        { date: "2026-09-01", content: "前の日" },
      ],
    });
  });

  it("過去のカードも書き換えられる", async () => {
    const onUpdate = vi.fn();
    render(
      <DiaryEditor
        memo={diary([{ date: "2026-09-01", content: "前の日" }])}
        onUpdate={onUpdate}
      />,
    );

    await userEvent.type(screen.getByLabelText("2026/09/01(火)"), "！");

    expect(onUpdate).toHaveBeenCalledWith("a", {
      entries: [{ date: "2026-09-01", content: "前の日！" }],
    });
  });
});
