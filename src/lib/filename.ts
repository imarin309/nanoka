/** Windows のファイル名に使えない文字を置き換える */
export function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_").trim() || "メモ";
}
