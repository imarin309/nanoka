export const imageUrls = Object.values(
  import.meta.glob<string>("../assets/image/*.png", {
    eager: true,
    query: "?url",
    import: "default",
  }),
);

export function pickCharacter(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return imageUrls[hash % imageUrls.length];
}
