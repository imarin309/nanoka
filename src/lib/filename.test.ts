import { describe, expect, it } from "vitest";
import { sanitizeFilename } from "./filename";

describe("sanitizeFilename", () => {
  it("そのまま使える名前は変えない", () => {
    expect(sanitizeFilename("買い物メモ")).toBe("買い物メモ");
  });

  it("ファイル名に使えない文字を _ に置き換える", () => {
    expect(sanitizeFilename('a\\b/c:d*e?f"g<h>i|j')).toBe(
      "a_b_c_d_e_f_g_h_i_j",
    );
  });

  it("前後の空白を落とす", () => {
    expect(sanitizeFilename("  メモ  ")).toBe("メモ");
  });

  it("空文字や空白だけの場合は既定名を返す", () => {
    expect(sanitizeFilename("")).toBe("メモ");
    expect(sanitizeFilename("   ")).toBe("メモ");
  });

  it("置き換えた結果が空白だけになる場合も既定名を返す", () => {
    expect(sanitizeFilename(" ")).toBe("メモ");
  });
});
