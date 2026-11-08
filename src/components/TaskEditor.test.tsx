import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { Memo, MemoPatch, TaskSection } from "../types";
import { TaskEditor } from "./TaskEditor";

function task(sections: TaskSection[]): Memo {
  return {
    id: "a",
    title: "課題",
    content: "",
    createdAt: 100,
    updatedAt: 100,
    mode: "task",
    sections,
  };
}

function section(id: string, title: string, texts: string[] = []) {
  return {
    id,
    title,
    items: texts.map((text, i) => ({ id: `${id}-${i}`, text, done: false })),
  };
}

// 追加・削除は保存結果が画面に戻ってきて初めて見えるので、親の状態更新まで再現する
function StatefulTask({ initial }: { initial: TaskSection[] }) {
  const [memo, setMemo] = useState(task(initial));
  const handleUpdate = (_id: string, patch: MemoPatch) =>
    setMemo((m) => ({ ...m, ...patch }));
  return <TaskEditor memo={memo} onUpdate={handleUpdate} />;
}

const headings = () =>
  screen
    .getAllByLabelText("見出し")
    .map((el) => (el as HTMLInputElement).value);
const items = () =>
  screen
    .queryAllByLabelText("項目")
    .map((el) => (el as HTMLTextAreaElement).value);

describe("TaskEditor", () => {
  it("見出しごとに項目を表示する", () => {
    render(
      <TaskEditor
        memo={task([
          section("a", "課題", ["対空"]),
          section("b", "安定させたいコンボ", ["2強P → 強ダロイ"]),
        ])}
        onUpdate={vi.fn()}
      />,
    );

    expect(headings()).toEqual(["課題", "安定させたいコンボ"]);
    expect(items()).toEqual(["対空", "2強P → 強ダロイ"]);
  });

  it("＋でその見出しの末尾に空の項目を足し、書き始められるようにする", async () => {
    render(<StatefulTask initial={[section("a", "課題", ["対空"])]} />);

    await userEvent.click(
      screen.getByRole("button", { name: "課題に項目を追加" }),
    );

    expect(items()).toEqual(["対空", ""]);
    expect(screen.getAllByLabelText("項目")[1]).toHaveFocus();
  });

  it("Enter で直後に次の項目を足す", async () => {
    render(<StatefulTask initial={[section("a", "課題", ["対空", "投げ"])]} />);

    await userEvent.click(screen.getAllByLabelText("項目")[0]);
    await userEvent.keyboard("{Enter}");

    expect(items()).toEqual(["対空", "", "投げ"]);
    expect(screen.getAllByLabelText("項目")[1]).toHaveFocus();
  });

  it("空の項目で Enter を押しても項目を増やさない", async () => {
    render(<StatefulTask initial={[section("a", "課題")]} />);

    await userEvent.click(
      screen.getByRole("button", { name: "課題に項目を追加" }),
    );
    await userEvent.keyboard("{Enter}");

    expect(items()).toEqual([""]);
  });

  it("Safari の変換確定の Enter では項目を増やさない", async () => {
    render(<StatefulTask initial={[section("a", "課題", ["対空"])]} />);

    fireEvent.keyDown(screen.getByLabelText("項目"), {
      key: "Enter",
      keyCode: 229,
    });

    expect(items()).toEqual(["対空"]);
  });

  // 押した瞬間に空の項目が消えるなら、フォーカスが移った時点で一覧から外れる
  it("空の項目からチェックを押しても、空の項目を消さずにチェックする", async () => {
    render(<StatefulTask initial={[section("a", "課題", ["", "対空"])]} />);

    await userEvent.click(screen.getAllByLabelText("項目")[0]);
    await userEvent.click(screen.getByLabelText("対空をできたにする"));

    expect(items()).toEqual(["", "対空"]);
    expect(screen.getByLabelText("対空をできたにする")).toBeChecked();
  });

  it("チェックでできたことを伝える", async () => {
    const onUpdate = vi.fn();
    render(
      <TaskEditor
        memo={task([section("a", "課題", ["対空"])])}
        onUpdate={onUpdate}
      />,
    );

    await userEvent.click(screen.getByLabelText("対空をできたにする"));

    expect(onUpdate).toHaveBeenCalledWith("a", {
      sections: [
        {
          id: "a",
          title: "課題",
          items: [{ id: "a-0", text: "対空", done: true }],
        },
      ],
    });
  });

  it("空の項目は、ほかの項目へ移ると消す", async () => {
    render(<StatefulTask initial={[section("a", "課題", ["対空"])]} />);

    await userEvent.click(
      screen.getByRole("button", { name: "課題に項目を追加" }),
    );
    await userEvent.click(screen.getAllByLabelText("項目")[0]);

    expect(items()).toEqual(["対空"]);
  });

  it("空の項目は、見出しの外へ出ても消す", async () => {
    render(<StatefulTask initial={[section("a", "課題")]} />);

    await userEvent.click(
      screen.getByRole("button", { name: "課題に項目を追加" }),
    );
    await userEvent.click(document.body);

    expect(items()).toEqual([]);
    expect(headings()).toEqual(["課題"]);
  });

  it("空の項目から＋を押しても、押している間に項目を消さない", async () => {
    render(<StatefulTask initial={[section("a", "課題")]} />);
    const add = screen.getByRole("button", { name: "課題に項目を追加" });

    await userEvent.click(add);
    await userEvent.pointer({ keys: "[MouseLeft>]", target: add });
    expect(items()).toEqual([""]);

    await userEvent.pointer({ keys: "[/MouseLeft]", target: add });
    expect(items()).toEqual([""]);
    expect(screen.getByLabelText("項目")).toHaveFocus();
  });

  it("見出しを足すと名前を書き始められ、空のまま外へ出ると消す", async () => {
    render(<StatefulTask initial={[section("a", "課題")]} />);

    await userEvent.click(
      screen.getByRole("button", { name: "＋ 見出しを追加" }),
    );
    expect(headings()).toEqual(["課題", ""]);
    expect(screen.getAllByLabelText("見出し")[1]).toHaveFocus();

    await userEvent.click(document.body);
    expect(headings()).toEqual(["課題"]);
  });

  it("名前をつけた見出しは、項目がなくても残す", async () => {
    render(<StatefulTask initial={[]} />);

    await userEvent.click(
      screen.getByRole("button", { name: "＋ 見出しを追加" }),
    );
    await userEvent.keyboard("対策");
    await userEvent.click(document.body);

    expect(headings()).toEqual(["対策"]);
  });
});
