import { describe, expect, it } from "vitest";
import type { TaskSection } from "../types";
import {
  addItem,
  addSection,
  createInitialSections,
  pruneSection,
  removeEmptyItem,
  renameSection,
  taskBodyText,
  updateItem,
} from "./task";

function section(id: string, title: string, texts: string[] = []): TaskSection {
  return {
    id,
    title,
    items: texts.map((text, i) => ({ id: `${id}-${i}`, text, done: false })),
  };
}

const itemIds = (sections: TaskSection[], sectionId: string) =>
  sections.find((s) => s.id === sectionId)!.items.map((i) => i.id);

describe("createInitialSections", () => {
  it("空の見出しを1つだけ用意する", () => {
    expect(createInitialSections()).toMatchObject([{ title: "", items: [] }]);
  });
});

describe("addSection", () => {
  it("末尾に足す", () => {
    const sections = [section("a", "課題")];

    expect(addSection(sections, section("b", "")).map((s) => s.id)).toEqual([
      "a",
      "b",
    ]);
  });
});

describe("renameSection", () => {
  it("指定した見出しの名前を変える", () => {
    const sections = [section("a", "課題"), section("b", "コンボ")];

    expect(renameSection(sections, "b", "対策").map((s) => s.title)).toEqual([
      "課題",
      "対策",
    ]);
  });
});

describe("addItem", () => {
  const sections = [section("a", "課題", ["対空", "投げ抜け"])];
  const item = { id: "new", text: "", done: false };

  it("指定がなければ末尾に足す", () => {
    expect(itemIds(addItem(sections, "a", item), "a")).toEqual([
      "a-0",
      "a-1",
      "new",
    ]);
  });

  it("指定した項目の直後に差し込む", () => {
    expect(itemIds(addItem(sections, "a", item, "a-0"), "a")).toEqual([
      "a-0",
      "new",
      "a-1",
    ]);
  });
});

describe("updateItem", () => {
  it("指定した項目だけを書き換える", () => {
    const sections = [section("a", "課題", ["対空", "投げ抜け"])];

    expect(updateItem(sections, "a", "a-1", { done: true })[0].items).toEqual([
      { id: "a-0", text: "対空", done: false },
      { id: "a-1", text: "投げ抜け", done: true },
    ]);
  });
});

describe("removeEmptyItem", () => {
  it("空の項目を取り除く", () => {
    const sections = [section("a", "課題", ["", "対空"])];

    expect(itemIds(removeEmptyItem(sections, "a", "a-0"), "a")).toEqual([
      "a-1",
    ]);
  });

  it("書いてある項目は残し、同じ配列を返す", () => {
    const sections = [section("a", "課題", ["対空"])];

    expect(removeEmptyItem(sections, "a", "a-0")).toBe(sections);
  });
});

describe("pruneSection", () => {
  it("空の項目をまとめて取り除く", () => {
    const sections = [section("a", "課題", ["", "対空", ""])];

    expect(itemIds(pruneSection(sections, "a"), "a")).toEqual(["a-1"]);
  });

  it("見出しも項目も空なら見出しごと取り除く", () => {
    const sections = [section("a", "課題"), section("b", "", [""])];

    expect(pruneSection(sections, "b").map((s) => s.id)).toEqual(["a"]);
  });

  it("最後の1つは、見出しも項目も空でも残す", () => {
    const sections = [section("a", "")];

    expect(pruneSection(sections, "a")).toBe(sections);
  });

  it("名前のある見出しは、項目が空でも残す", () => {
    const sections = [section("a", "課題")];

    expect(pruneSection(sections, "a")).toBe(sections);
  });

  it("項目のある見出しは、名前が空でも残す", () => {
    const sections = [section("a", "", ["対空"])];

    expect(pruneSection(sections, "a")).toBe(sections);
  });
});

describe("taskBodyText", () => {
  it("見出しごとに、できたかどうかの印をつけて並べる", () => {
    const sections = [
      {
        id: "a",
        title: "課題",
        items: [
          { id: "1", text: "対空", done: true },
          { id: "2", text: "SA1、SA3が安定しない", done: false },
        ],
      },
      section("b", "安定させたいコンボ", ["2強P → 強ダロイ"]),
    ];

    expect(taskBodyText(sections)).toBe(
      "課題\n☑ 対空\n☐ SA1、SA3が安定しない\n\n安定させたいコンボ\n☐ 2強P → 強ダロイ",
    );
  });
});
