export type MemoMode = "normal" | "diary";

export type DiaryEntry = {
  id: string;
  /** ローカル日付の YYYY-MM-DD */
  date: string;
  content: string;
};

export type Memo = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  // 日記モード導入前に保存されたメモは mode を持たないので、未設定は通常メモとして扱う
  mode?: MemoMode;
  entries?: DiaryEntry[];
};

export type MemoPatch = Partial<Pick<Memo, "title" | "content" | "entries">>;
