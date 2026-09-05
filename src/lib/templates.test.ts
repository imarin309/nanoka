import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TEMPLATES, insertTemplate, renderTemplate } from "./templates";

const withBody = (body: string) => ({ id: "t", name: "テスト", body });

describe("TEMPLATES", () => {
  it("id が重複しない", () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(TEMPLATES)("$name は id・名前・本文を持つ", (template) => {
    expect(template.id).not.toBe("");
    expect(template.name).not.toBe("");
    expect(template.body).not.toBe("");
  });
});

describe("renderTemplate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 5));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("{{date}} をその日の日付にする", () => {
    expect(renderTemplate("{{date}}")).toBe("2026/09/05(土)");
  });

  it("知らない差し込み文字はそのまま残す", () => {
    expect(renderTemplate("{{unknown}}")).toBe("{{unknown}}");
  });

  it("差し込み文字がなければ何も変えない", () => {
    expect(renderTemplate("■ 見出し")).toBe("■ 見出し");
  });
});

describe("insertTemplate", () => {
  it("本文が空ならテンプレそのものになる", () => {
    expect(insertTemplate("", withBody("■ 見出し"))).toBe("■ 見出し");
  });

  it("本文が空白だけでもテンプレそのものになる", () => {
    expect(insertTemplate("  \n\n ", withBody("■ 見出し"))).toBe("■ 見出し");
  });

  it("本文があれば空行を挟んで末尾に足す", () => {
    expect(insertTemplate("メモ", withBody("■ 見出し"))).toBe(
      "メモ\n\n■ 見出し",
    );
  });

  it("本文の末尾の改行を重ねない", () => {
    expect(insertTemplate("メモ\n\n\n", withBody("■ 見出し"))).toBe(
      "メモ\n\n■ 見出し",
    );
  });

  it("テンプレの末尾の改行を落とす", () => {
    expect(insertTemplate("メモ", withBody("■ 見出し\n\n"))).toBe(
      "メモ\n\n■ 見出し",
    );
  });
});
