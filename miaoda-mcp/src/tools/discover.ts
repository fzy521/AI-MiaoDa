import { z } from "zod";
import { getOrLaunch, getMonacoFrame, MIAODA_URL, withLock } from "../browser/manager.js";

export const discoverSchema = {
  navigate: z.boolean().default(true).describe("Whether to navigate to Miaoda first (default: true)"),
};

export async function handleDiscover(args: z.infer<z.ZodObject<typeof discoverSchema>>) {
  return withLock(async () => {
    const { page } = await getOrLaunch();

    if (args.navigate !== false) {
      const currentUrl = page.url();
      const alreadyOnProject = currentUrl.includes(MIAODA_URL) &&
        !currentUrl.includes("login") && !currentUrl.includes("accounts");
      if (!alreadyOnProject) {
        await page.goto(MIAODA_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(5000);
      }
    }

    const monacoFrame = await getMonacoFrame(page);

    const mainResult = await page.evaluate(() => ({
      url: window.location.href,
      monacoEditorCount: document.querySelectorAll(".monaco-editor").length,
      workbenchCount: document.querySelectorAll(".monaco-workbench").length,
    }));

    const frameResults: Array<{ url: string; name: string; hasMonaco: boolean; modelCount: number }> = [];
    for (const frame of page.frames()) {
      try {
        const info = await frame.evaluate(() => {
          const monaco = (window as any).monaco;
          return {
            hasMonaco: typeof monaco !== "undefined",
            monacoEditorCount: document.querySelectorAll(".monaco-editor").length,
            modelCount: monaco?.editor?.getModels?.()?.length ?? 0,
          };
        });
        frameResults.push({
          url: frame.url(),
          name: frame.name(),
          hasMonaco: info.hasMonaco,
          modelCount: info.modelCount,
        });
      } catch {
        frameResults.push({ url: frame.url(), name: frame.name(), hasMonaco: false, modelCount: 0 });
      }
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          mainPage: mainResult,
          monacoFrame: monacoFrame ? { name: monacoFrame.name(), url: monacoFrame.url() } : null,
          frames: frameResults,
        }, null, 2),
      }],
    };
  });
}
