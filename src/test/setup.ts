import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { afterEach, beforeEach } from "vitest";

// jsdom は IndexedDB を実装していないため、テストごとに空の実装へ差し替えて状態を持ち越さない
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

afterEach(() => {
  cleanup();
});
