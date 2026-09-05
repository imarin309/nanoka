import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Memo } from "../types";
import { Sidebar } from "./Sidebar";

function memo(id: string, title: string): Memo {
  return { id, title, content: "", createdAt: 100, updatedAt: 100 };
}

function renderSidebar(
  memos: Memo[] = [memo("a", "買い物"), memo("b", "日記")],
) {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    memos,
    currentId: "a",
    onSelect: vi.fn(),
    onNew: vi.fn(),
    onDelete: vi.fn(),
  };
  render(<Sidebar {...props} />);
  return props;
}

// 一覧の削除ボタンとダイアログの削除ボタンはどちらもアクセシブル名が「削除」なので、ダイアログ内に絞り込む
function confirmDialog() {
  return screen.getByText("このメモを削除しますか？").parentElement!;
}

describe("Sidebar", () => {
  it("メモのタイトルを一覧表示する", () => {
    renderSidebar();

    expect(screen.getByText("買い物")).toBeInTheDocument();
    expect(screen.getByText("日記")).toBeInTheDocument();
  });

  it("タイトルが空のメモは代替表示にする", () => {
    renderSidebar([memo("a", "")]);

    expect(screen.getByText("（タイトルなし）")).toBeInTheDocument();
  });

  it("メモがなければその旨を表示する", () => {
    renderSidebar([]);

    expect(screen.getByText("まだメモがないよ")).toBeInTheDocument();
  });

  it("メモを選ぶと選択を伝えて閉じる", async () => {
    const props = renderSidebar();

    await userEvent.click(screen.getByText("日記"));

    expect(props.onSelect).toHaveBeenCalledWith("b");
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it("新しいメモを作ると閉じる", async () => {
    const props = renderSidebar();

    await userEvent.click(screen.getByText("＋ 新しいメモ"));

    expect(props.onNew).toHaveBeenCalledOnce();
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it("削除は確認してから実行する", async () => {
    const props = renderSidebar();

    await userEvent.click(screen.getAllByLabelText("削除")[1]);
    expect(props.onDelete).not.toHaveBeenCalled();

    await userEvent.click(
      within(confirmDialog()).getByRole("button", { name: "削除" }),
    );

    expect(props.onDelete).toHaveBeenCalledWith("b");
  });

  it("確認をキャンセルすると削除しない", async () => {
    const props = renderSidebar();

    await userEvent.click(screen.getAllByLabelText("削除")[0]);
    await userEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(props.onDelete).not.toHaveBeenCalled();
    expect(
      screen.queryByText("このメモを削除しますか？"),
    ).not.toBeInTheDocument();
  });
});
