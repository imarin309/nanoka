import { describe, expect, it } from "vitest";
import {
  EMPTY_DRAFT,
  addDirections,
  buildMove,
  buildThrow,
  describeDraft,
  insertMove,
  insertNewline,
  removeLastMove,
} from "./combo";

describe("buildMove", () => {
  it("方向がなければ 5 を付ける", () => {
    expect(buildMove(EMPTY_DRAFT, "強", "P")).toBe("5強P");
  });

  it("押した方向を順につなげる", () => {
    const draft = addDirections(addDirections(EMPTY_DRAFT, "2"), "36");
    expect(buildMove(draft, "強", "P")).toBe("236強P");
  });

  it("ジャンプ攻撃には 5 を付けない", () => {
    expect(buildMove({ ...EMPTY_DRAFT, jump: true }, "強", "K")).toBe("J強K");
  });

  it("OD 技は強さを書かない", () => {
    const draft = addDirections({ ...EMPTY_DRAFT, od: true }, "236");
    expect(buildMove(draft, "強", "P")).toBe("OD236P");
  });

  it("溜めは次に押した方向を [] で囲む", () => {
    const charged = addDirections({ ...EMPTY_DRAFT, charging: true }, "4");
    expect(charged.charging).toBe(false);
    expect(buildMove(addDirections(charged, "6"), "中", "P")).toBe("[4]6中P");
  });

  it("ディレイは頭に付ける", () => {
    expect(buildMove({ ...EMPTY_DRAFT, delay: true }, "中", "P")).toBe(
      "ディレイ5中P",
    );
  });
});

describe("buildThrow", () => {
  it("方向がなければそのまま投げにする", () => {
    expect(buildThrow(EMPTY_DRAFT)).toBe("投げ");
  });

  it("方向を付けられる", () => {
    expect(buildThrow(addDirections(EMPTY_DRAFT, "4"))).toBe("4投げ");
  });
});

describe("describeDraft", () => {
  it("入力途中の状態を見せる", () => {
    const draft = { ...EMPTY_DRAFT, od: true, directions: "2", charging: true };
    expect(describeDraft(draft)).toBe("OD2[");
  });
});

describe("insertMove", () => {
  it("行頭には区切りを付けない", () => {
    expect(insertMove("", 0, "2中K")).toEqual({ content: "2中K", caret: 3 });
  });

  it("前に技があれば区切りを付ける", () => {
    expect(insertMove("2中K", 3, "236強P")).toEqual({
      content: "2中K > 236強P",
      caret: 11,
    });
  });

  it("見出しの直後は空白だけ付ける", () => {
    expect(insertMove("・レシピ:", 5, "2中K").content).toBe("・レシピ: 2中K");
    expect(insertMove("・レシピ: ", 6, "2中K").content).toBe("・レシピ: 2中K");
  });

  it("区切りで終わっていれば足さない", () => {
    expect(insertMove("2中K > ", 6, "DR").content).toBe("2中K > DR");
  });

  it("前の行は見ない", () => {
    expect(insertMove("2中K\n", 4, "DR").content).toBe("2中K\nDR");
  });

  it("カーソルの位置に入れる", () => {
    expect(insertMove("2中K\n後ろ", 3, "DR")).toEqual({
      content: "2中K > DR\n後ろ",
      caret: 8,
    });
  });
});

describe("insertMove（後ろに技があるとき）", () => {
  it("後ろの技との間にも区切りを付ける", () => {
    expect(insertMove("2中K > 236強P", 6, "DR")).toEqual({
      content: "2中K > DR > 236強P",
      caret: 8,
    });
  });

  it("後ろが区切りで始まっていれば足さない", () => {
    expect(insertMove("2中K > 236強P", 3, "DR").content).toBe(
      "2中K > DR > 236強P",
    );
  });

  it("次の行は見ない", () => {
    expect(insertMove("2中K\n5強P", 3, "DR").content).toBe("2中K > DR\n5強P");
  });
});

describe("insertNewline", () => {
  it("カーソルの位置で改行する", () => {
    expect(insertNewline("ab", 1)).toEqual({ content: "a\nb", caret: 2 });
  });
});

describe("removeLastMove", () => {
  it("直前の技を区切りごと消す", () => {
    expect(removeLastMove("2中K > 236強P", 11)).toEqual({
      content: "2中K",
      caret: 3,
    });
  });

  it("区切りで終わっていれば、その前の技まで消す", () => {
    expect(removeLastMove("2中K > DR > ", 11).content).toBe("2中K");
  });

  it("見出しは消さない", () => {
    expect(removeLastMove("・レシピ: 2中K", 9).content).toBe("・レシピ:");
    expect(removeLastMove("・レシピ:", 5).content).toBe("・レシピ:");
  });

  it("前の行までは消さない", () => {
    expect(removeLastMove("2中K\nDR", 6).content).toBe("2中K\n");
    expect(removeLastMove("2中K\n", 4).content).toBe("2中K\n");
  });

  it("先頭の改行を増やさない", () => {
    expect(removeLastMove("\n2中K", 0)).toEqual({
      content: "\n2中K",
      caret: 0,
    });
  });

  it("カーソルより後ろは残す", () => {
    expect(removeLastMove("2中K > DR\n次", 8).content).toBe("2中K\n次");
  });
});
