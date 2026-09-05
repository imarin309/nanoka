export type Template = {
  id: string;
  name: string;
  /** `{{date}}` のような差し込み文字は、挿入時に PLACEHOLDERS で置き換える */
  body: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "fighting-game-combo",
    name: "格ゲーメモ_コンボ",
    body: `・始動:
・レシピ:
・ダメージ:
・ゲージ:
・位置(中央/端):
`,
  },
  {
    id: "diary",
    name: "日記",
    body: `{{date}}`,
  },
];

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}/${month}/${date}(${WEEKDAYS[now.getDay()]})`;
}

const PLACEHOLDERS: Record<string, () => string> = {
  date: today,
};

export function renderTemplate(body: string): string {
  // プロトタイプ由来のキー（{{toString}} など）を差し込み文字として拾わないため
  return body.replace(/\{\{(\w+)\}\}/g, (matched, key: string) =>
    Object.hasOwn(PLACEHOLDERS, key) ? PLACEHOLDERS[key]() : matched,
  );
}

export function insertTemplate(content: string, template: Template): string {
  const body = renderTemplate(template.body).trimEnd();
  const current = content.trimEnd();
  if (current === "") return body;
  return `${current}\n\n${body}`;
}
