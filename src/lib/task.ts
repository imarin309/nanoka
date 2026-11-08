import type { TaskItem, TaskSection } from "../types";
import { generateId } from "./id";

export function createInitialSections(): TaskSection[] {
  return [{ id: generateId(), title: "", items: [] }];
}

function mapSection(
  sections: TaskSection[],
  sectionId: string,
  fn: (section: TaskSection) => TaskSection,
): TaskSection[] {
  return sections.map((s) => (s.id === sectionId ? fn(s) : s));
}

export function addSection(
  sections: TaskSection[],
  section: TaskSection,
): TaskSection[] {
  return [...sections, section];
}

export function renameSection(
  sections: TaskSection[],
  sectionId: string,
  title: string,
): TaskSection[] {
  return mapSection(sections, sectionId, (s) => ({ ...s, title }));
}

/** afterId を省くと末尾に足す */
export function addItem(
  sections: TaskSection[],
  sectionId: string,
  item: TaskItem,
  afterId?: string,
): TaskSection[] {
  return mapSection(sections, sectionId, (s) => {
    const index = s.items.findIndex((i) => i.id === afterId);
    const at = index === -1 ? s.items.length : index + 1;
    return {
      ...s,
      items: [...s.items.slice(0, at), item, ...s.items.slice(at)],
    };
  });
}

export function updateItem(
  sections: TaskSection[],
  sectionId: string,
  itemId: string,
  patch: Partial<Pick<TaskItem, "text" | "done">>,
): TaskSection[] {
  return mapSection(sections, sectionId, (s) => ({
    ...s,
    items: s.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
  }));
}

// 以下の削除系は、消すものがなければ同じ配列を返すので、呼び出し側は参照比較で保存の要否を判断できる

export function removeEmptyItem(
  sections: TaskSection[],
  sectionId: string,
  itemId: string,
): TaskSection[] {
  const section = sections.find((s) => s.id === sectionId);
  const item = section?.items.find((i) => i.id === itemId);
  if (!item || item.text !== "") return sections;
  return mapSection(sections, sectionId, (s) => ({
    ...s,
    items: s.items.filter((i) => i.id !== itemId),
  }));
}

/**
 * 空の項目を取り除き、見出しも項目も空になった見出しごと取り除く。
 * 最後の1つまで消すと書き始める箱がなくなるので、それだけは残す
 */
export function pruneSection(
  sections: TaskSection[],
  sectionId: string,
): TaskSection[] {
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return sections;
  const items = section.items.filter((i) => i.text !== "");
  if (section.title === "" && items.length === 0 && sections.length > 1) {
    return sections.filter((s) => s.id !== sectionId);
  }
  if (items.length === section.items.length) return sections;
  return mapSection(sections, sectionId, (s) => ({ ...s, items }));
}

export function taskBodyText(sections: TaskSection[]): string {
  return sections
    .map((s) =>
      [s.title, ...s.items.map((i) => `${i.done ? "☑" : "☐"} ${i.text}`)].join(
        "\n",
      ),
    )
    .join("\n\n");
}
