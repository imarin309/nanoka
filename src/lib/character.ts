const modules = import.meta.glob<string>("../assets/image/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

// 本番ビルドの URL はコンテンツハッシュを含むため、値ではなくソースパスで並べる。
// 順序が変わると既存メモのキャラクターが総入れ替えになる
export const imageUrls = Object.keys(modules)
  .sort()
  .map((path) => modules[path]);

export function pickCharacter(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return imageUrls[hash % imageUrls.length];
}
