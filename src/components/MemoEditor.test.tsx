import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Memo } from "../types";
import { MemoEditor } from "./MemoEditor";

const memo: Memo = {
  id: "a",
  title: "タイトル",
  content: "本文",
  createdAt: 100,
  updatedAt: 100,
};

describe("MemoEditor", () => {
  it("メモがなければ作成を促す", async () => {
    const onNew = vi.fn();
    render(<MemoEditor memo={null} onUpdate={vi.fn()} onNew={onNew} />);

    expect(screen.getByText("メモがまだありません")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "＋ 最初のメモを作る" }),
    );

    expect(onNew).toHaveBeenCalledOnce();
  });

  it("本文を表示する", () => {
    render(<MemoEditor memo={memo} onUpdate={vi.fn()} onNew={vi.fn()} />);

    expect(screen.getByRole("textbox")).toHaveValue("本文");
  });

  it("入力のたびに本文の更新を伝える", async () => {
    const onUpdate = vi.fn();
    render(<MemoEditor memo={memo} onUpdate={onUpdate} onNew={vi.fn()} />);

    await userEvent.type(screen.getByRole("textbox"), "！");

    expect(onUpdate).toHaveBeenCalledWith("a", { content: "本文！" });
  });
});
