# 移行計画: localStorage → IndexedDB

## 目標

localStorage の破損リスクを IndexedDB で解消する。
あわせてメモ削除とエクスポート機能を追加し、機種変更時のデータ消失にも対処する。

## スコープ外

- iCloud 同期（iOS Chrome では技術的に不可）
- インポート機能
- 外部ライブラリの追加

---

## データ設計

```
DB名:    nanoka
バージョン: 1

オブジェクトストア: memos
  keyPath:  "id"（Memo.id の UUID）
  インデックス: updatedAt（ソート用）
```

`types.ts` の `Memo` 型はそのまま格納する。スキーマ変更なし。

---

## 変更ファイル一覧

```
src/
  hooks/
    useIndexedDB.ts   新規作成（IndexedDB ラッパー）
    useMemos.ts       全面書き換え（非同期化）
  components/
    Sidebar.tsx       削除ボタン・エクスポートボタンを追加
  App.tsx             isLoading 分岐を追加

  types.ts            変更なし
  components/MemoEditor.tsx  変更なし
```

---

## 実装ステップ

### Step 1: `useIndexedDB.ts` の作成

IndexedDB の open / read / write / delete を Promise でラップしたユーティリティ。

```ts
openDB(): Promise<IDBDatabase>
getAllMemos(db): Promise<Memo[]>
putMemo(db, memo: Memo): Promise<void>
deleteMemo(db, id: string): Promise<void>
```

`openDB` の `onupgradeneeded` で `memos` ストアと `updatedAt` インデックスを作成する。

---

### Step 2: `useMemos.ts` の書き換え

外部インターフェースに `deleteMemo` と `isLoading` / `error` を追加する以外は現在と同じにし、App.tsx・コンポーネント側への影響を最小にする。

```ts
// 変更前
return { memos, currentMemo, createMemo, updateMemo, selectMemo }

// 変更後
return { memos, currentMemo, createMemo, updateMemo, deleteMemo, selectMemo, isLoading, error }
```

**主な変更点:**

| 項目 | 現在 | 移行後 |
|---|---|---|
| 初期化 | `useState(loadMemos)` で同期 | `useEffect` 内で `getAllMemos(db)` を await |
| 保存 | `useEffect([memos])` で全件上書き | `createMemo` / `updateMemo` 内でその1件だけ `putMemo` |
| 削除 | なし | `deleteMemo(db, id)` を呼び、memos state からも除去 |
| エラー処理 | なし | try-catch で補足し `error` state にセット |

**初回マイグレーション（Step 2 内で実装）:**

```
DB オープン後、memos ストアのレコード数を確認
0件 かつ localStorage["maine-memos"] が存在する場合:
  → JSON.parse して全件を putMemo で書き込む
  → localStorage["maine-memos"] を削除する
```

**ストレージ保護（Step 2 内で実装）:**

```ts
if (navigator.storage?.persist) {
  await navigator.storage.persist();
}
```

iOS の自動削除対象から外れる。ユーザー承認ダイアログが出る場合がある。

---

### Step 3: `Sidebar.tsx` の修正

**削除ボタン:** メモ一覧の各行に追加。`onDelete(id)` を props で受け取る。

**エクスポートボタン:** サイドバー下部に配置。全メモを `nanoka-backup.json` としてダウンロードする。

```ts
const blob = new Blob([JSON.stringify(memos, null, 2)], { type: "application/json" });
const url = URL.createObjectURL(blob);
// <a download> をトリガー
```

---

### Step 4: `App.tsx` の修正

`isLoading` の間はエディタを表示しない分岐を追加するだけ。

```tsx
const { memos, ..., isLoading, error } = useMemos();

if (isLoading) return null;
```

`error` が出た場合の表示も任意で追加する。

---

## 移行後のリスク残存状況

| リスク | 移行前 | 移行後 |
|---|---|---|
| 書き込み中クラッシュで全消失 | あり | **なし**（トランザクションロールバック） |
| 容量超過で黙って失敗 | あり | **なし**（エラー検知・通知） |
| iOS 自動削除 | あり | **ほぼなし**（persist() で保護） |
| Chrome アップデートで消える | もともとなし | なし |
| 機種変更で消える | あり | **エクスポートで対処可能** |
| サイトデータ消去で消える | あり | あり（防ぎようがない） |
