import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { Memo } from "../types";
import { TEMPLATES, renderTemplate } from "../lib/templates";
import { MemoEditor } from "./MemoEditor";

const memo: Memo = {
  id: "a",
  title: "タイトル",
  content: "本文",
  createdAt: 100,
  updatedAt: 100,
};

function StatefulEditor({ initial }: { initial: string }) {
  const [content, setContent] = useState(initial);
  return (
    <MemoEditor
      memo={{ ...memo, content }}
      onUpdate={(_, patch) => setContent(patch.content ?? content)}
      onNew={vi.fn()}
    />
  );
}

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

  it("テンプレを選ぶと本文の末尾に足す", async () => {
    const onUpdate = vi.fn();
    render(<MemoEditor memo={memo} onUpdate={onUpdate} onNew={vi.fn()} />);

    await userEvent.click(
      screen.getByRole("button", { name: "テンプレを挿入" }),
    );
    const template = TEMPLATES[0];
    await userEvent.click(screen.getByRole("button", { name: template.name }));

    expect(onUpdate).toHaveBeenCalledWith("a", {
      content: `本文\n\n${renderTemplate(template.body).trimEnd()}`,
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("テンプレ選択はとじられる", async () => {
    render(<MemoEditor memo={memo} onUpdate={vi.fn()} onNew={vi.fn()} />);

    await userEvent.click(
      screen.getByRole("button", { name: "テンプレを挿入" }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "とじる" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  describe("コンボ入力", () => {
    const tap = (name: string) =>
      userEvent.click(screen.getByRole("button", { name }));

    it("技をつなぐと間に > が入る", async () => {
      render(<StatefulEditor initial="・レシピ:" />);

      await tap("コンボ入力を開く");
      await tap("2");
      await tap("中K");
      await tap("236");
      await tap("強P");
      await tap("DR");

      expect(screen.getByRole("textbox")).toHaveValue(
        "・レシピ: 2中K > 236強P > DR",
      );
    });

    it("1つ戻すと直前の技を消す", async () => {
      render(<StatefulEditor initial="・レシピ: 2中K > DR" />);

      await tap("コンボ入力を開く");
      await tap("1つ戻す");

      expect(screen.getByRole("textbox")).toHaveValue("・レシピ: 2中K");
    });

    it("カーソルの位置に入れる", async () => {
      render(<StatefulEditor initial={"2中K\n次"} />);
      const textbox = screen.getByRole<HTMLTextAreaElement>("textbox");
      textbox.focus();
      textbox.setSelectionRange(3, 3);

      await tap("コンボ入力を開く");
      await tap("弱P");
      await tap("強K");

      expect(textbox).toHaveValue("2中K > 5弱P > 5強K\n次");
    });

    it("とじるとパレットが消える", async () => {
      render(<MemoEditor memo={memo} onUpdate={vi.fn()} onNew={vi.fn()} />);

      await tap("コンボ入力を開く");
      expect(screen.getByRole("toolbar")).toBeInTheDocument();

      await tap("とじる");
      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    });
  });
});
