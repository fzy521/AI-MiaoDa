import { z } from "zod";
import { getOrLaunch, getMonacoFrame, withLock } from "../browser/manager.js";

export const listFilesSchema = {};

export async function handleListFiles() {
  return withLock(async () => {
    const { page } = await getOrLaunch();

    // Strategy 1: Monaco API via frame
    const monacoFrame = await getMonacoFrame(page);
    if (monacoFrame) {
      try {
        const result: any = await monacoFrame.evaluate(() => {
          const w = window as any;
          const monaco = w.monaco || (typeof w.require === "function" ? require("monaco") : null);
          if (!monaco || !monaco.editor || !monaco.editor.getModels) return null;
          return monaco.editor.getModels().map((m: any) => ({
            uri: m.uri.toString(),
            path: m.uri.path,
            language: m.getLanguageId(),
            dirty: m.isDirty(),
          }));
        });

        if (result) {
          return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        }
      } catch {
        // fall through
      }
    }

    // Strategy 2: DOM extraction
    const result: any = await page.evaluate(() => {
      const files: string[] = [];

      const treeRows = document.querySelectorAll(".monaco-list-row");
      for (const row of treeRows) {
        const label = row.querySelector(".monaco-highlighted-label");
        if (label) {
          const text = label.textContent?.trim();
          if (text) files.push(text);
        }
      }

      const fileItems = document.querySelectorAll("[class*='file-icon']");
      for (const item of fileItems) {
        const parent = item.closest(".monaco-tree-row, .explorer-item");
        if (parent) {
          const label = parent.querySelector(".monaco-highlighted-label, .label-name");
          if (label) {
            const text = label.textContent?.trim();
            if (text && !files.includes(text)) files.push(text);
          }
        }
      }

      const tabs = document.querySelectorAll(".monaco-tab");
      const openTabs: string[] = [];
      for (const tab of tabs) {
        const label = tab.querySelector(".monaco-tab-label");
        if (label) openTabs.push(label.textContent?.trim() || "");
      }

      return { files, openTabs };
    });

    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  });
}
