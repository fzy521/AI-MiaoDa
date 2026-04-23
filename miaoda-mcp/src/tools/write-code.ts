import { z } from "zod";
import { getOrLaunch, getMonacoFrame, getWorkbenchFrame, openFileInEditor, withLock, getContext, clickCodeButton } from "../browser/manager.js";
import fs from "node:fs";

export const writeCodeSchema = {
  filePath: z.string().describe("Target file path in Miaoda (e.g., 'src/App.tsx')"),
  content: z.string().optional().describe("The code content to write. Mutually exclusive with localFilePath."),
  localFilePath: z.string().optional().describe("Path to a local file to read and inject. Mutually exclusive with content."),
  save: z.boolean().default(true).describe("Whether to trigger save after writing (Cmd/Ctrl+S)"),
};

async function ensureCodeView(): Promise<boolean> {
  const clicked = await clickCodeButton();
  if (clicked) return true;

  const { page } = await getOrLaunch();
  const hasMonaco = await page.locator(".monaco-editor").count();
  return hasMonaco > 0;
}

/**
 * Get the currently active editor tab's file URI from the Monaco editor DOM.
 */
async function getActiveFileUri(page: any): Promise<string | null> {
  // Try page-level first (Monaco is in main page DOM)
  try {
    return await page.evaluate(() => {
      const editor = document.querySelector(".monaco-editor");
      if (!editor) return null;
      return editor.getAttribute("data-uri") || null;
    });
  } catch {}

  // Fallback: try via frame
  const monacoFrame = await getMonacoFrame(page);
  if (!monacoFrame) return null;

  try {
    return await monacoFrame.evaluate(() => {
      const editor = document.querySelector(".monaco-editor");
      if (!editor) return null;
      return editor.getAttribute("data-uri") || null;
    });
  } catch {
    return null;
  }
}

/**
 * Click directly on the Monaco editor textarea to focus it.
 */
async function focusEditor(page: any): Promise<boolean> {
  // Click on the Monaco editor to give it browser-level focus
  // Using Playwright's click is more reliable than evaluate-based textarea.focus()
  try {
    const editor = page.locator(".monaco-editor").first();
    await editor.click({ force: true, timeout: 5000 });
    return true;
  } catch {}

  return false;
}

async function pasteContent(page: any, content: string): Promise<boolean> {
  const focused = await focusEditor(page);
  if (!focused) return false;

  await page.waitForTimeout(300);
  await page.keyboard.press("Meta+a");
  await page.waitForTimeout(300);

  try {
    await page.evaluate((c: string) => navigator.clipboard.writeText(c), content);
    await page.waitForTimeout(100);
    await page.keyboard.press("Meta+v");
    await page.waitForTimeout(500);
    return true;
  } catch {
    return false;
  }
}

async function pasteLargeContent(page: any, content: string): Promise<boolean> {
  const MAX_CHUNK = 50000;

  if (content.length <= MAX_CHUNK) {
    return pasteContent(page, content);
  }

  const lines = content.split("\n");
  let currentPos = 0;

  while (currentPos < lines.length) {
    let chunk = "";
    let endPos = currentPos;

    while (endPos < lines.length && chunk.length < MAX_CHUNK) {
      chunk += (endPos > currentPos ? "\n" : "") + lines[endPos];
      endPos++;
    }

    if (currentPos === 0) {
      const ok = await pasteContent(page, chunk);
      if (!ok) return false;
    } else {
      await page.keyboard.press("Meta+ArrowDown");
      await page.waitForTimeout(100);
      try {
        await page.evaluate((c: string) => navigator.clipboard.writeText(c), "\n" + chunk);
        await page.waitForTimeout(100);
        await page.keyboard.press("Meta+v");
        await page.waitForTimeout(300);
      } catch {
        return false;
      }
    }

    currentPos = endPos;
    if (currentPos % 200 < lines.length / 10) {
      await page.waitForTimeout(200);
    }
  }

  return true;
}

/**
 * Write flow:
 * 1. Ensure code view
 * 2. Open target file via file tree (works even with no editor open)
 * 3. Verify correct file is active via data-uri
 * 4. Focus editor and paste
 * 5. Save
 */
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
      const context = getContext();
      await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: page.url() }).catch(() => {});

      // Step 1: Ensure we are in code view
      const inCodeView = await ensureCodeView();
      if (!inCodeView) {
        return {
          content: [{ type: "text" as const, text: "Error: Cannot enter code view." }],
          isError: true,
        };
      }
      await page.waitForTimeout(1000);

      // Step 2: Open the target file via file tree
      const openResult = await openFileInEditor(args.filePath);
      if (!openResult.success) {
        await page.waitForTimeout(1000);
        const retryResult = await openFileInEditor(args.filePath);
        if (!retryResult.success) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ success: false, error: `Cannot open file: ${openResult.error}`, file: args.filePath }, null, 2) }],
            isError: true,
          };
        }
      }

      // Step 4: Verify the correct file is active
      const fileName = args.filePath.split("/").pop()!;
      const activeUri = await getActiveFileUri(page);
      const correctFileActive = activeUri && activeUri.includes(fileName);

      writeResult = {
        step: "opened-file",
        filePath: args.filePath,
        activeUri,
        correctFileActive,
        openResult,
      };

      // Step 5: Paste content
      const pasted = await pasteLargeContent(page, codeContent);

      if (pasted) {
        writeResult = {
          success: true,
          method: "clipboard-paste",
          chars: codeContent.length,
          lines: codeContent.split("\n").length,
          file: args.filePath,
          activeUri,
        };
        writeSuccess = true;
      } else {
        writeResult = { success: false, error: "Failed to paste content into editor", activeUri };
      }

      // Step 5: Save
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
