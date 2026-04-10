# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

```bash
npm run dev          # 開発サーバー起動（ホットリロード）
npm run build        # 型チェック後プロダクションビルド（dist/）
npm run lint         # ESLint でコード検査
npm run lint:fix     # ESLint で自動修正
npm run format       # Prettier で src/**/*.{ts,tsx} を整形
npm run format:check # Prettier の整形状態を確認
npm run preview      # ビルド済み成果物をプレビュー
```

テストフレームワークは現時点で未導入。

## アーキテクチャ

ブラウザのみで動作するシンプルなメモアプリ。サーバーなし、永続化は `localStorage`（キー: `maine-memos`）のみ。

### データフロー

```
App
├── useMemos()  ← メモの全 CRUD + 選択状態を管理
│   └── localStorage に自動同期（useEffect）
├── Sidebar     ← メモ一覧・新規作成・選択
└── MemoEditor  ← タイトル・本文編集（自動リサイズ textarea）
```

### 主要ファイル

| ファイル | 役割 |
|---|---|
| `src/types.ts` | `Memo` 型（id: UUID, title, content, createdAt, updatedAt） |
| `src/hooks/useMemos.ts` | ロジック層。createMemo / updateMemo / selectMemo を提供 |
| `src/App.tsx` | レイアウト・キャラクター選択ロジック（メモIDのハッシュ値から 16 種の画像を決定） |
| `src/components/Sidebar.tsx` | ドロワー式サイドバー（右スライドイン） |
| `src/components/MemoEditor.tsx` | プレーンテキストエディタ |

### 技術スタック

- React 19 + TypeScript（ESNext / ES2023）
- Vite 8（ビルド）+ `@vitejs/plugin-react`（Oxc Transform）
- TailwindCSS 4（`@tailwindcss/vite` プラグイン経由）
- ESLint 9 FlatConfig + typescript-eslint + Prettier
