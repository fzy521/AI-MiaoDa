import { z } from "zod";
import { getOrLaunch, getMonacoFrame, openFileInEditor, withLock, getContext } from "../browser/manager.js";
import fs from "node:fs";

export const writeCodeSchema = {
  filePath: z.string().describe("Target file path in Miaoda (e.g., 'src/App.tsx')"),
  content: z.string().optional().describe("The code content to write. Mutually exclusive with localFilePath."),
  localFilePath: z.string().optional().describe("Path to a local file to read and inject. Mutually exclusive with content."),
  save: z.boolean().default(true).describe("Whether to trigger save after writing (Cmd/Ctrl+S)"),
};

/**
 * Inline helper to find Monaco API inside a browser evaluate() context.
 * Self-contained — cannot reference Node.js module-scope variables.
 */
function findMonacoGlobal(): any {
  const w = window as any;
  if (w.monaco?.editor?.getModels) return w.monaco;
  if (typeof w.require === "function") {
    for (const mod of ["monaco", "vs/editor/editor.main", "vs/editor/edcore.main"]) {
      try {
        const m = w.require(mod);
        if (m?.editor?.getModels) return m;
      } catch {}
    }
  }
  // Try AMD define/require from VS Code workbench
  if (typeof w.require === "function") {
    try {
      const m = w.require("vs/editor/editor.api");
      if (m?.editor?.getModels) return m;
    } catch {}
  }
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

export async function handleWriteCode(args: z.infer<z.ZodObject<typeof writeCodeSchema>>) {
  return withLock(async () => {
    let codeContent: string;

    if (args.localFilePath) {
      codeContent = await fs.promises.readFile(args.localFilePath, "utf-8");
    } else if (args.content !== undefined) {
      codeContent = args.content;
    } else {
      return {
        content: [{ type: "text" as const, text: "Error: Either 'content' or 'localFilePath' must be provided." }],
        isError: true,
      };
    }

    const { page } = await getOrLaunch();
    let writeResult: any = null;
    let writeSuccess = false;

    try {
      // Pre-grant clipboard permissions to avoid browser dialog
      const context = getContext();
      await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: page.url() }).catch(() => {});

      const monacoFrame = await getMonacoFrame(page);
      if (!monacoFrame) {
        return {
          content: [{ type: "text" as const, text: "Error: Monaco editor frame not found. Make sure the code editor is open." }],
          isError: true,
        };
      }

      // Step 1: Open the file in the editor via file tree
      const openResult = await openFileInEditor(args.filePath);
      await page.waitForTimeout(800);

      // Step 2: Try Monaco API first
      const result: any = await monacoFrame.evaluate(
        ({ filePath, content, finder }) => {
          const findMonaco = new Function("return (" + finder + ")()")();
          if (!findMonaco) return { error: "Monaco API not found in frame" };

          const models = findMonaco.editor.getModels();
          const target = models.find((m: any) =>
            m.uri.path === filePath || m.uri.path.endsWith("/" + filePath) || m.uri.toString().includes(filePath)
          );

          if (!target) {
            return { error: "Model not found: " + filePath, availableFiles: models.map((m: any) => m.uri.path) };
          }

          const activeEditor = findMonaco.editor.getEditors().find((e: any) => e.getModel()?.uri.toString() === target.uri.toString());
          if (activeEditor) {
            activeEditor.setSelection(activeEditor.getModel().getFullModelRange());
            activeEditor.executeEdits("write-code", [{
              range: activeEditor.getModel().getFullModelRange(),
              text: content,
            }]);
          } else {
            target.setValue(content);
          }

          return { success: true, method: "monaco-api", path: target.uri.path };
        },
        { filePath: args.filePath, content: codeContent, finder: findMonacoGlobal.toString() }
      );

      if (result?.error) {
        // Fallback: clipboard paste via Monaco editor textarea
        await monacoFrame.locator(".monaco-editor").click({ force: true }).catch(() => {});
        await page.waitForTimeout(200);

        // Focus the hidden inputarea inside Monaco
        const inputarea = monacoFrame.locator("textarea.inputarea").first();
        await inputarea.click({ force: true, timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(300);

        // Select all existing content
        await page.keyboard.press("Meta+a");
        await page.waitForTimeout(200);

        // Save original clipboard, write new content, paste
        let originalClipboard: string | null = null;
        try { originalClipboard = await page.evaluate(() => navigator.clipboard.readText()); } catch {}

        await page.evaluate((c: string) => navigator.clipboard.writeText(c), codeContent);
        await page.waitForTimeout(100);

        await page.keyboard.press("Meta+v");
        await page.waitForTimeout(1000);

        if (originalClipboard !== null) {
          try { await page.evaluate((t: string) => navigator.clipboard.writeText(t), originalClipboard); } catch {}
        }

        writeResult = { success: true, method: "clipboard-paste", note: result.error };
        writeSuccess = true;
      } else {
        writeResult = result;
        writeSuccess = true;
      }

      // Trigger save
      if (args.save !== false && writeSuccess) {
        try {
          await page.keyboard.press("Meta+s");
          await page.waitForTimeout(1500);
          writeResult.save = { triggered: true };
        } catch (e: any) {
          writeResult.save = { triggered: false, error: e.message };
        }
      }
    } catch (e: any) {
      writeResult = { success: false, error: e.message };
    }

    return {
      content: [{ type: "text" as const, text: JSON.stringify(writeResult, null, 2) }],
      isError: !writeSuccess,
    };
  });
}
