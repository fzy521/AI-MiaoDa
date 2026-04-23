import { z } from "zod";
import { getOrLaunch, getMonacoFrame, openFileInEditor, withLock } from "../browser/manager.js";
import fs from "node:fs";
import path from "node:path";

const CACHE_DIR = path.resolve(import.meta.dirname, "../../.miaoda-read-cache");

export const readCodeSchema = {
  filePath: z.string().optional().describe("Specific file path to read (e.g., 'src/App.tsx'). Omit to read all files."),
  saveToLocal: z.boolean().default(true).describe("Whether to save the read code to local cache directory"),
};

/**
 * Inline helper to find Monaco API inside a browser evaluate() context.
 * This function is stringified by Playwright and must be self-contained —
 * it cannot reference any Node.js module-scope variables.
 */
function findMonacoGlobal(): any {
  const w = window as any;

  // A. Direct global
  if (w.monaco?.editor?.getModels) return w.monaco;

  // B. AMD require with common module IDs
  if (typeof w.require === "function") {
    for (const mod of ["monaco", "vs/editor/editor.main", "vs/editor/edcore.main"]) {
      try {
        const m = w.require(mod);
        if (m?.editor?.getModels) return m;
      } catch {}
    }
  }

  // C. Scan global objects for something that looks like Monaco
  for (const key of Object.getOwnPropertyNames(w)) {
    try {
      const val = w[key];
      if (val && typeof val === "object" && val.editor && typeof val.editor.getModels === "function") {
        return val;
      }
    } catch {}
  }

  return null;
}

export async function handleReadCode(args: z.infer<z.ZodObject<typeof readCodeSchema>>) {
  return withLock(async () => {
    const { page } = await getOrLaunch();
    const save = args.saveToLocal !== false;

    // Strategy 1: Try Monaco API via the editor frame
    const monacoFrame = await getMonacoFrame(page);

    if (monacoFrame) {
      try {
        if (args.filePath) {
          const result: any = await monacoFrame.evaluate(
            ({ filePath, finder }) => {
              const findMonaco = new Function("return (" + finder + ")()")();
              if (!findMonaco) return null;
              const models = findMonaco.editor.getModels();
              const target = models.find((m: any) =>
                m.uri.path === filePath || m.uri.path.endsWith("/" + filePath) || m.uri.toString().includes(filePath)
              );
              if (!target) {
                return { error: "File not found: " + filePath, availableFiles: models.map((m: any) => m.uri.path) };
              }
              return { uri: target.uri.toString(), path: target.uri.path, language: target.getLanguageId(), content: target.getValue() };
            },
            { filePath: args.filePath, finder: findMonacoGlobal.toString() }
          );

          if (result) {
            if (!result.error && save && result.path) {
              await saveToLocalCache(result.path, result.content);
            }
            return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
          }
        } else {
          const results: any = await monacoFrame.evaluate(
            (finder: string) => {
              const monaco = new Function("return (" + finder + ")()")();
              if (!monaco) return null;
              return monaco.editor.getModels().map((m: any) => ({
                uri: m.uri.toString(),
                path: m.uri.path,
                language: m.getLanguageId(),
                content: m.getValue(),
              }));
            },
            findMonacoGlobal.toString()
          );

          if (results) {
            if (save) {
              for (const file of results) {
                if (file.path && file.content) await saveToLocalCache(file.path, file.content);
              }
            }
            return { content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }] };
          }
        }
      } catch (e: any) {
        console.error("[miaoda-read-code] Monaco API strategy failed:", e.message);
      }
    }

    // Strategy 2: DOM-based extraction (fallback) — MUST run in the Monaco frame
    const domFrame = await getMonacoFrame(page);
    const evalCtx = domFrame || page;

    if (args.filePath) {
      const openResult = await openFileInEditor(args.filePath);
      if (!openResult.success) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: openResult.error, tip: "Use miaoda_list_files to see available files" }, null, 2) }],
          isError: true,
        };
      }
      // Wait for model to load after opening the file
      await waitForModelLoad(evalCtx, args.filePath, 5000);
    }

    // Scroll editor to top
    const scrollable = await evalCtx.$(".monaco-editor .lines-content");
    if (scrollable) {
      await scrollable.evaluate((el: any) => {
        const container = el.closest(".monaco-scrollable-element");
        if (container) container.scrollTop = 0;
      });
      await page.waitForTimeout(300);
    }

    // Extract code by scrolling, using line numbers for deduplication
    const allLines: string[] = [];
    const seenLineNumbers = new Set<number>();
    let consecutiveNoNew = 0;

    for (let i = 0; i < 100; i++) {
      const batch = await evalCtx.evaluate(() => {
        const editorEl = document.querySelector(".monaco-editor");
        if (!editorEl) return null;
        const viewLines = editorEl.querySelectorAll(".view-line");
        const lineNumbers = editorEl.querySelectorAll(".line-numbers");
        const lines: Array<{ num: number; text: string }> = [];
        for (let j = 0; j < viewLines.length; j++) {
          const ln = lineNumbers[j]?.textContent?.trim();
          const num = ln ? parseInt(ln, 10) : -1;
          lines.push({ num, text: viewLines[j].textContent || "" });
        }
        return lines;
      });

      if (!batch || batch.length === 0) break;

      let newInBatch = 0;
      for (const line of batch) {
        if (line.num === -1) continue; // Skip lines without valid line numbers
        if (!seenLineNumbers.has(line.num)) {
          seenLineNumbers.add(line.num);
          allLines.push(line.text);
          newInBatch++;
        }
      }

      if (newInBatch === 0) {
        consecutiveNoNew++;
        if (consecutiveNoNew >= 3) break;
      } else {
        consecutiveNoNew = 0;
      }

      const container = await evalCtx.$(".monaco-editor .monaco-scrollable-element");
      if (container) {
        await container.evaluate((el: any) => {
          el.scrollTop += el.clientHeight * 0.7;
        });
        await page.waitForTimeout(100);
      } else {
        break;
      }
    }

    const fullCode = allLines.join("\n");
    const [fileName, fileTree] = await Promise.all([getCurrentFileName(page), getFileTree(page)]);

    const result: any = {
      method: "dom-scroll-extraction",
      currentFile: fileName,
      code: fullCode,
      fileTree,
      lineCount: fullCode.split("\n").length,
    };

    if (save && (args.filePath || fileName) && fullCode) {
      await saveToLocalCache(args.filePath || fileName || "unknown", fullCode);
    }

    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  });
}

async function waitForModelLoad(evalCtx: any, filePath: string, timeoutMs: number) {
  const finderStr = findMonacoGlobal.toString();
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const found = await evalCtx.evaluate(
        ({ fp, finder }: { fp: string; finder: string }) => {
          const monaco = new Function("return (" + finder + ")()")();
          if (!monaco?.editor?.getModels) return false;
          return monaco.editor.getModels().some((m: any) => m.uri.path.includes(fp));
        },
        { fp: filePath, finder: finderStr }
      );
      if (found) return;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
}

async function getCurrentFileName(page: any) {
  return await page.evaluate(() => {
    const activeTab = document.querySelector(".tab.active, .monaco-tab.active, .tab.active .tab-label, .monaco-tab.active .monaco-tab-label");
    if (activeTab) return activeTab.textContent?.trim() || null;
    const breadcrumb = document.querySelector(".monaco-breadcrumb-item, .breadcrumb-item");
    if (breadcrumb) return breadcrumb.textContent?.trim() || null;
    return null;
  });
}

async function getFileTree(page: any) {
  return await page.evaluate(() => {
    const files: string[] = [];
    const treeItems = document.querySelectorAll(".monaco-list-row[role=treeitem]");
    for (const item of treeItems) {
      const label = item.querySelector(".monaco-highlighted-label");
      if (label) {
        const text = label.textContent?.trim();
        if (text) files.push(text);
      }
    }
    return [...new Set(files)];
  });
}

async function saveToLocalCache(filePath: string, content: string) {
  const relativePath = filePath.replace(/^\/+/, "");
  const fullPath = path.join(CACHE_DIR, relativePath);
  await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.promises.writeFile(fullPath, content, "utf-8");
}
