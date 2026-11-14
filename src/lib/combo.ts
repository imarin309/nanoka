export type Strength = "弱" | "中" | "強";
export type Limb = "P" | "K";

export type MoveDraft = {
  directions: string;
  jump: boolean;
  od: boolean;
  delay: boolean;
  charging: boolean;
};

export type TextEdit = {
  content: string;
  caret: number;
};

export const EMPTY_DRAFT: MoveDraft = {
  directions: "",
  jump: false,
  od: false,
  delay: false,
  charging: false,
};

export const SEPARATOR = " > ";

export function addDirections(draft: MoveDraft, input: string): MoveDraft {
  const added = draft.charging ? `[${input}]` : input;
  return { ...draft, directions: draft.directions + added, charging: false };
}

function prefixOf(draft: MoveDraft): string {
  return (draft.delay ? "ディレイ" : "") + (draft.jump ? "J" : "");
}

export function buildMove(
  draft: MoveDraft,
  strength: Strength,
  limb: Limb,
): string {
  // ジャンプ攻撃にニュートラルの 5 は付けない（J5強P とは書かない）
  const directions = draft.directions || (draft.jump ? "" : "5");
  // OD 技はボタンを2つ押すので、強さは表記しない
  const body = draft.od
    ? `OD${directions}${limb}`
    : `${directions}${strength}${limb}`;
  return prefixOf(draft) + body;
}

export function buildThrow(draft: MoveDraft): string {
  return prefixOf(draft) + draft.directions + "投げ";
}

export function describeDraft(draft: MoveDraft): string {
  const od = draft.od ? "OD" : "";
  const charging = draft.charging ? "[" : "";
  return prefixOf(draft) + od + draft.directions + charging;
}

function lineStartOf(content: string, caret: number): number {
  return content.lastIndexOf("\n", caret - 1) + 1;
}

function separatorFor(before: string): string {
  const trimmed = before.trimEnd();
  if (trimmed === "") return "";
  const endsWithSpace = trimmed.length < before.length;
  if (/[:：>]$/.test(trimmed)) return endsWithSpace ? "" : " ";
  return endsWithSpace ? SEPARATOR.trimStart() : SEPARATOR;
}

export function insertMove(
  content: string,
  caret: number,
  move: string,
): TextEdit {
  const before = content.slice(lineStartOf(content, caret), caret);
  const inserted = separatorFor(before) + move;
  return {
    content: content.slice(0, caret) + inserted + content.slice(caret),
    caret: caret + inserted.length,
  };
}

export function insertNewline(content: string, caret: number): TextEdit {
  return {
    content: content.slice(0, caret) + "\n" + content.slice(caret),
    caret: caret + 1,
  };
}

/**
 * `・レシピ:` のような見出しは技ではないので、`:` より前は消さない。
 * 同じ行に技がなければ何もしない（前の行までは遡らない）。
 */
export function removeLastMove(content: string, caret: number): TextEdit {
  const lineStart = lineStartOf(content, caret);
  let before = content.slice(lineStart, caret).trimEnd();
  if (before.endsWith(">")) before = before.slice(0, -1).trimEnd();

  const separatorAt = before.lastIndexOf(">");
  const labelEnd =
    Math.max(before.lastIndexOf(":"), before.lastIndexOf("：")) + 1;
  const kept =
    separatorAt >= labelEnd
      ? before.slice(0, separatorAt).trimEnd()
      : before.slice(0, labelEnd);

  const cutAt = lineStart + kept.length;
  return {
    content: content.slice(0, cutAt) + content.slice(caret),
    caret: cutAt,
  };
}
