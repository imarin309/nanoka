import { describe, expect, it } from "vitest";
import { imageUrls, pickCharacter } from "./character";

describe("pickCharacter", () => {
  it("画像を読み込めている", () => {
    expect(imageUrls.length).toBeGreaterThan(0);
  });

  it("常に候補の中から返す", () => {
    for (const seed of ["", "a", "メモ", crypto.randomUUID()]) {
      expect(imageUrls).toContain(pickCharacter(seed));
    }
  });

  it("同じ seed なら同じ画像を返す", () => {
    const seed = "0e1f2a3b-4c5d-6e7f-8a9b-0c1d2e3f4a5b";
    expect(pickCharacter(seed)).toBe(pickCharacter(seed));
  });

  // 既存メモのキャラクターが変わらないよう、seed と画像の対応そのものを固定する。
  // 画像を増減させると全メモで入れ替わるため、その場合はここも意図して更新する
  it("seed と画像の対応を保つ", () => {
    const filename = (seed: string) => pickCharacter(seed).split("/").pop();

    expect(filename("default")).toMatch(/^ikari[.-]/);
    expect(filename("memo-1")).toMatch(/^three2[.-]/);
    expect(filename("memo-2")).toMatch(/^three3[.-]/);
    expect(filename("memo-3")).toMatch(/^funny[.-]/);
  });

  it("seed によって結果が分かれる", () => {
    const picked = new Set(
      Array.from({ length: 200 }, (_, i) => pickCharacter(`memo-${i}`)),
    );
    expect(picked.size).toBeGreaterThan(1);
  });
});
