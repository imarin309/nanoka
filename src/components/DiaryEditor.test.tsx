import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DiaryEntry, Memo, MemoPatch } from "../types";
import { DiaryEditor } from "./DiaryEditor";

function diary(entries: DiaryEntry[]): Memo {
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

// 追加・削除・並び替えは保存結果が画面に戻ってきて初めて見えるので、親の状態更新まで再現する
function StatefulDiary({ initial }: { initial: DiaryEntry[] }) {
  const [memo, setMemo] = useState(diary(initial));
  const handleUpdate = (_id: string, patch: MemoPatch) =>
    setMemo((m) => ({ ...m, ...patch }));
  return <DiaryEditor memo={memo} onUpdate={handleUpdate} />;
}

const cardLabels = () =>
  screen.getAllByRole("textbox").map((c) => c.getAttribute("aria-label"));

// Date だけを固定する（タイマーまで偽物にすると userEvent が進まない）
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 8, 5));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("DiaryEditor", () => {
  it("カードごとに日付と本文を表示する", () => {
    render(
      <DiaryEditor
        memo={diary([
          { id: "2", date: "2026-09-03", content: "後" },
          { id: "1", date: "2026-09-01", content: "前" },
        ])}
        onUpdate={vi.fn()}
      />,
    );

    expect(cardLabels()).toEqual(["2026/09/03(木)", "2026/09/01(火)"]);
    expect(screen.getAllByRole("textbox").map((c) => c.textContent)).toEqual([
      "後",
      "前",
    ]);
  });

  it("＋で今日の日付の空カードを上に足し、書き始められるようにする", async () => {
    render(
      <StatefulDiary
        initial={[{ id: "1", date: "2026-09-05", content: "朝" }]}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "カードを追加" }));

    const cards = screen.getAllByRole("textbox");
    expect(cardLabels()).toEqual(["2026/09/05(土)", "2026/09/05(土)"]);
    expect(cards[0]).toHaveValue("");
    expect(cards[0]).toHaveFocus();
  });

  it("本文の変更を伝える", async () => {
    const onUpdate = vi.fn();
    render(
      <DiaryEditor
        memo={diary([{ id: "1", date: "2026-09-01", content: "前" }])}
        onUpdate={onUpdate}
      />,
    );

    await userEvent.type(screen.getByRole("textbox"), "！");

    expect(onUpdate).toHaveBeenCalledWith("a", {
      entries: [{ id: "1", date: "2026-09-01", content: "前！" }],
    });
  });

  it("日付を変えると並び直す", () => {
    render(
      <StatefulDiary
        initial={[
          { id: "2", date: "2026-09-03", content: "a" },
          { id: "1", date: "2026-09-01", content: "b" },
        ]}
      />,
    );

    fireEvent.change(screen.getByLabelText("2026/09/01(火)の日付を変える"), {
      target: { value: "2026-09-04" },
    });

    expect(cardLabels()).toEqual(["2026/09/04(金)", "2026/09/03(木)"]);
  });

  it("空のままカードの外へ出ると消す", async () => {
    render(<StatefulDiary initial={[]} />);

    await userEvent.click(screen.getByRole("button", { name: "カードを追加" }));
    await userEvent.click(document.body);

    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
  });

  it("空でも日付の入力へ移るだけなら消さない", async () => {
    render(<StatefulDiary initial={[]} />);

    await userEvent.click(screen.getByRole("button", { name: "カードを追加" }));
    await userEvent.click(
      screen.getByLabelText("2026/09/05(土)の日付を変える"),
    );

    expect(screen.getAllByRole("textbox")).toHaveLength(1);
  });

  it("書いたカードは外へ出ても残す", async () => {
    render(<StatefulDiary initial={[]} />);

    await userEvent.click(screen.getByRole("button", { name: "カードを追加" }));
    await userEvent.keyboard("晴れ");
    await userEvent.click(document.body);

    expect(screen.getByRole("textbox")).toHaveValue("晴れ");
  });
});
