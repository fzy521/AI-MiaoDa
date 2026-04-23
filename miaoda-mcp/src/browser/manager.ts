import { chromium, type Browser, type BrowserContext, type Page, type Frame } from "playwright";
import path from "node:path";
import fs from "node:fs";

const BROWSER_DATA_DIR = path.resolve(import.meta.dirname, "../../.browser-data");
const MIAODA_URL = "https://miaoda.feishu.cn/app/app_4ju8u5yypk357";
const EDITOR_READY_TIMEOUT = 30000;

// Override project editor URL - can be updated via setEditorUrl()
let editorUrl: string | null = null;

export function setEditorUrl(url: string) {
  editorUrl = url;
}

export function getEditorUrl(): string | null {
  return editorUrl;
}

let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;
let monacoFrameName: string | null = null;

// --- Async Mutex ---
let lockPromise: Promise<void> = Promise.resolve();

export async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const previous = lockPromise;
  let resolver!: () => void;
  lockPromise = new Promise<void>((resolve) => { resolver = resolve; });
  await previous;
  try {
    return await fn();
  } finally {
    resolver();
  }
}

// --- Browser Lifecycle ---

export async function getOrLaunch(): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
  if (browser && context && page && !page.isClosed()) {
    try {
      if (browser.isConnected()) {
        return { browser, context, page };
      }
    } catch {
      // Browser disconnected, re-launch
    }
  }

  await fs.promises.mkdir(BROWSER_DATA_DIR, { recursive: true });

  browser = await chromium.launch({ headless: false });
  context = await browser.newContext({
    storageState: await loadStorageState(),
  });
  page = await context.newPage();

  // Graceful shutdown
  process.on("exit", close);

  // Browser crash recovery
  browser.on("disconnected", () => {
    browser = null;
    context = null;
    page = null;
    monacoFrameName = null;
  });

  // Auto-navigate and wait for editor ready
  await autoNavigate();

  return { browser, context, page };
}

async function autoNavigate(): Promise<void> {
  if (!page) return;

  try {
    const currentUrl = page.url();
    const targetUrl = editorUrl || MIAODA_URL;
    const alreadyOnProject = currentUrl.includes(targetUrl) &&
      !currentUrl.includes("login") && !currentUrl.includes("accounts");

    if (!alreadyOnProject) {
      await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    }

    // Wait for page UI to render
    await page.waitForTimeout(3000);

    // Step 1: Collapse the chat/AI conversation panel if it's open
    await collapseChatPanel();

    // Step 2: Click the "代码" (Code) button to enter code editor mode
    await clickCodeButton();

    // Step 3: Wait for Monaco editor to be ready
    await waitForEditorReady();
  } catch {
    // Navigation failed - return page anyway, tools will handle the error
  }
}

// Collapse the AI chat / conversation panel by clicking the SidebarOutlined icon button
async function collapseChatPanel(): Promise<void> {
  if (!page) return;

  try {
    const clicked = await page.evaluate(() => {
      // Primary: the sidebar toggle button with SidebarOutlined icon
      const btn = document.querySelector('button:has(svg[data-icon="SidebarOutlined"])') as HTMLElement;
      if (btn && btn.offsetParent !== null) {
        btn.click();
        return true;
      }
      return false;
    });
    if (clicked) await page.waitForTimeout(500);
  } catch {
    // Ignore - chat panel may not exist
  }
}

// Click the </> code button on the Miaoda page to enter code editor mode
// Skips if already in code view (avoids toggle-back to preview)
export async function clickCodeButton(): Promise<boolean> {
  if (!page) return false;

  try {
    const result = await page.evaluate(() => {
      // Check if Monaco editor is already visible (already in code view)
      const hasMonaco = document.querySelector('.monaco-editor');
      if (hasMonaco) return { alreadyInCodeView: true };

      // Find the </> code tab button
      const codeBtn = document.querySelector('[data-testid="panel_tab_code"]') as HTMLElement;
      if (codeBtn && codeBtn.offsetParent !== null) {
        // Check if code tab is already active (avoid toggle-back)
        const cls = codeBtn.className || "";
        if (cls.includes("segmentItemActive") || cls.includes("Active")) {
          return { alreadyInCodeView: true };
        }
        codeBtn.click();
        return { clicked: true };
      }

      // Fallback: find by SVG icon
      const codeIcon = document.querySelector('svg[data-icon="CodeOutlined"]')?.closest('[data-segment-item="true"]') as HTMLElement;
      if (codeIcon && codeIcon.offsetParent !== null) {
        codeIcon.click();
        return { clicked: true };
      }

      return { found: false };
    });

    if (result.alreadyInCodeView) return true;
    if (result.clicked) {
      await page.waitForTimeout(3000);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// Hide the preview iframe that overlays the code editor
export async function hidePreviewIframe(page: Page): Promise<void> {
  await page.evaluate(() => {
    const iframe = document.querySelector('iframe[data-testid="preview_iframe"]') as HTMLElement;
    if (iframe) {
      iframe.style.display = "none";
    }
    // Also hide any overlay containers
    document.querySelectorAll('.w-full.h-full.relative').forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.querySelector('iframe')) {
        htmlEl.style.display = "none";
      }
    });
  });
}

// Restore the preview iframe
export async function showPreviewIframe(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelectorAll('iframe[data-testid="preview_iframe"]').forEach((el) => {
      (el as HTMLElement).style.display = "";
    });
    document.querySelectorAll('.w-full.h-full.relative').forEach((el) => {
      (el as HTMLElement).style.display = "";
    });
  });
}

async function waitForEditorReady(timeoutMs = EDITOR_READY_TIMEOUT): Promise<boolean> {
  if (!page) return false;

  try {
    // Wait for .monaco-editor to appear in any frame (DOM-based detection)
    // This works across origin boundaries via Playwright's CDP protocol
    await page.waitForSelector(".monaco-editor", { timeout: timeoutMs });
    // Give Monaco a moment to fully initialize
    await page.waitForTimeout(2000);
    return true;
  } catch {
    return false;
  }
}

// --- Workbench Frame Management ---

// Find the VS Code workbench iframe (the aiforce.run frame) regardless of Monaco state
let workbenchFrameUrl: string | null = null;

export async function getWorkbenchFrame(page: Page): Promise<Frame | null> {
  // Use cached URL if available
  if (workbenchFrameUrl) {
    const cachedFrame = page.frames().find(f => f.url().includes(workbenchFrameUrl!));
    if (cachedFrame) return cachedFrame;
    workbenchFrameUrl = null;
  }

  // Find the frame that looks like the VS Code workbench
  const frames = page.frames();
  for (const frame of frames) {
    const url = frame.url();
    // Workbench iframe is on aiforce.run and has the app path
    if (url.includes("aiforce.run") && url.includes("/app/")) {
      workbenchFrameUrl = url.split("?")[0]; // Cache without query params
      return frame;
    }
  }

  return null;
}

// --- Monaco Frame Management ---

export async function getMonacoFrame(page: Page): Promise<Frame | null> {
  // Use cached frame name if available
  if (monacoFrameName) {
    const cachedFrame = page.frame(monacoFrameName);
    if (cachedFrame) {
      const hasEditor = await cachedFrame.locator(".monaco-editor").count().catch(() => 0);
      if (hasEditor > 0) return cachedFrame;
    }
    monacoFrameName = null;
  }

  // Find the frame that contains the Monaco editor DOM
  const frames = page.frames();
  for (const frame of frames) {
    try {
      const count = await frame.locator(".monaco-editor").count();
      if (count > 0) {
        monacoFrameName = frame.name() || frame.url();
        return frame;
      }
    } catch {
      continue;
    }
  }

  return null;
}

// Execute JS in the Monaco editor's frame. Returns null if frame not found.
export async function evalInMonacoFrame<T = any>(page: Page, fn: (...args: any[]) => T, arg?: any): Promise<T | null> {
  const frame = await getMonacoFrame(page);
  if (!frame) return null;

  try {
    return await frame.evaluate(fn as any, arg);
  } catch {
    return null;
  }
}

// --- Auth ---

async function loadStorageState(): Promise<string | undefined> {
  const statePath = path.join(BROWSER_DATA_DIR, "storage-state.json");
  try {
    await fs.promises.access(statePath);
    return statePath;
  } catch {
    return undefined;
  }
}

export async function saveAuthState(): Promise<void> {
  if (!context) throw new Error("Browser context not initialized");
  const statePath = path.join(BROWSER_DATA_DIR, "storage-state.json");
  await context.storageState({ path: statePath });
}

export async function close(): Promise<void> {
  if (browser) {
    try {
      await browser.close();
    } catch { /* already closed */ }
    browser = null;
    context = null;
    page = null;
    monacoFrameName = null;
  }
}

export function getPage(): Page {
  if (!page) throw new Error("Browser not launched. Call getOrLaunch() first.");
  return page;
}

export function getContext(): BrowserContext {
  if (!context) throw new Error("Browser not launched. Call getOrLaunch() first.");
  return context;
}

// --- File Tree Navigation ---

export async function openFileInEditor(filePath: string): Promise<{ success: boolean; error?: string }> {
  const { page } = await getOrLaunch();

  try {
    // File tree is in the MAIN page DOM, not in an iframe.
    // Use page.evaluate() directly for all file tree operations.

    // Click Explorer icon to ensure file tree is visible
    await page.evaluate(() => {
      const explorerIcon = document.querySelector('.activitybarleft .action-label[title*="Explorer"], .activitybarleft .action-label[title*="资源管理器"]');
      if (explorerIcon) (explorerIcon as HTMLElement).click();
    }).catch(() => {});
    await page.waitForTimeout(500);

    const segments = filePath.split("/").filter(Boolean);
    const fileName = segments.pop()!;

    // Expand directories in the file tree using page-level evaluate
    for (const dir of segments) {
      const expanded = await expandDirectoryInPage(page, dir);
      if (!expanded) {
        await scrollTreeToFindInPage(page, dir);
        const retryExpanded = await expandDirectoryInPage(page, dir);
        if (!retryExpanded) {
          return { success: false, error: `Cannot expand directory: ${dir}` };
        }
      }
      await page.waitForTimeout(500);
    }

    // Click the file to open it
    const clicked = await clickTreeItemInPage(page, fileName);
    if (clicked) {
      await page.waitForSelector(".monaco-editor", { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);
      return { success: true };
    }

    // Fallback: scroll through tree
    const scrollClicked = await scrollTreeToFindAndClickInPage(page, fileName);
    if (scrollClicked) {
      await page.waitForSelector(".monaco-editor", { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);
      return { success: true };
    }

    // Final fallback: aria-label click
    const ariaClicked = await page.evaluate((name: string) => {
      const item = document.querySelector(`[aria-label*="${name}"]`);
      if (item) { (item as HTMLElement).click(); return true; }
      return false;
    }, fileName).catch(() => false);

    if (ariaClicked) {
      await page.waitForSelector(".monaco-editor", { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);
      return { success: true };
    }

    return { success: false, error: `File not found: ${filePath}` };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// --- Page-level file tree operations (file tree is in main page DOM) ---

async function expandDirectoryInPage(page: Page, dirName: string): Promise<boolean> {
  const result = await page.evaluate((targetDir: string) => {
    const treeRows = document.querySelectorAll(".monaco-list-row");
    for (const row of treeRows) {
      const label = row.querySelector(".monaco-highlighted-label, .label-name");
      const text = label?.textContent?.trim() || row.textContent?.trim()?.split("\n")[0];
      if (text === targetDir || text?.startsWith(targetDir)) {
        const twistie = row.querySelector(".monaco-tl-twistie");
        if (twistie) {
          const cls = twistie.getAttribute("class") || "";
          if (cls.includes("collapsed")) {
            (twistie as HTMLElement).click();
          }
          return true;
        }
        (row as HTMLElement).click();
        return true;
      }
    }
    return false;
  }, dirName);
  return result;
}

async function clickTreeItemInPage(page: Page, itemName: string): Promise<boolean> {
  const result = await page.evaluate((name: string) => {
    const treeRows = document.querySelectorAll(".monaco-list-row");
    for (const row of treeRows) {
      const label = row.querySelector(".monaco-highlighted-label, .label-name");
      if (label) {
        const text = label.textContent?.trim();
        if (text === name) {
          (row as HTMLElement).click();
          return true;
        }
      }
    }
    return false;
  }, itemName);
  return result;
}

async function scrollTreeToFindInPage(page: Page, dirName: string): Promise<boolean> {
  return page.evaluate((name: string) => {
    const treeContainer = document.querySelector('.explorer-viewlet .monaco-scrollable-element, .monaco-tree .monaco-scrollable-element, .monaco-scrollable-element');
    if (!treeContainer) return false;
    for (let i = 0; i < 20; i++) {
      (treeContainer as HTMLElement).scrollTop += (treeContainer as HTMLElement).clientHeight * 0.8;
      const rows = document.querySelectorAll(".monaco-list-row");
      for (const row of rows) {
        const text = row.textContent?.trim()?.split("\n")[0];
        if (text === name) return true;
      }
    }
    return false;
  }, dirName);
}

async function scrollTreeToFindAndClickInPage(page: Page, itemName: string): Promise<boolean> {
  return page.evaluate((name: string) => {
    const treeContainer = document.querySelector('.explorer-viewlet .monaco-scrollable-element, .monaco-tree .monaco-scrollable-element, .monaco-scrollable-element');
    if (!treeContainer) return false;
    for (let i = 0; i < 20; i++) {
      (treeContainer as HTMLElement).scrollTop += (treeContainer as HTMLElement).clientHeight * 0.8;
      const rows = document.querySelectorAll(".monaco-list-row");
      for (const row of rows) {
        const label = row.querySelector(".monaco-highlighted-label, .label-name");
        if (label && label.textContent?.trim() === name) {
          (row as HTMLElement).click();
          return true;
        }
      }
    }
    return false;
  }, itemName);
}

// --- Frame-level file tree operations (kept for backward compatibility) ---

async function expandDirectory(frame: Frame, dirName: string): Promise<boolean> {
  const result = await frame.evaluate((targetDir: string) => {
    const treeRows = document.querySelectorAll(".monaco-list-row");
    for (const row of treeRows) {
      const label = row.querySelector(".monaco-highlighted-label, .label-name");
      const text = label?.textContent?.trim() || row.textContent?.trim()?.split("\n")[0];
      if (text === targetDir || text?.startsWith(targetDir)) {
        const twistie = row.querySelector(".monaco-tl-twistie");
        if (twistie) {
          const cls = twistie.getAttribute("class") || "";
          if (cls.includes("collapsed")) {
            (twistie as HTMLElement).click();
          }
          return true;
        }
        (row as HTMLElement).click();
        return true;
      }
    }
    return false;
  }, dirName);

  return result;
}

async function clickTreeItem(frame: Frame, itemName: string): Promise<boolean> {
  const result = await frame.evaluate((name: string) => {
    const treeRows = document.querySelectorAll(".monaco-list-row");
    for (const row of treeRows) {
      const label = row.querySelector(".monaco-highlighted-label, .label-name");
      if (label) {
        const text = label.textContent?.trim();
        if (text === name) {
          (row as HTMLElement).click();
          return true;
        }
      }
    }
    return false;
  }, itemName);

  return result;
}

async function scrollTreeToFind(frame: Frame, dirName: string): Promise<boolean> {
  return frame.evaluate((name: string) => {
    const treeContainer = document.querySelector('.explorer-viewlet .monaco-scrollable-element, .monaco-tree .monaco-scrollable-element, .monaco-scrollable-element');
    if (!treeContainer) return false;
    for (let i = 0; i < 20; i++) {
      (treeContainer as HTMLElement).scrollTop += (treeContainer as HTMLElement).clientHeight * 0.8;
      const rows = document.querySelectorAll(".monaco-list-row");
      for (const row of rows) {
        const text = row.textContent?.trim()?.split("\n")[0];
        if (text === name) return true;
      }
    }
    return false;
  }, dirName);
}

async function scrollTreeToFindAndClick(frame: Frame, itemName: string): Promise<boolean> {
  return frame.evaluate((name: string) => {
    const treeContainer = document.querySelector('.explorer-viewlet .monaco-scrollable-element, .monaco-tree .monaco-scrollable-element, .monaco-scrollable-element');
    if (!treeContainer) return false;
    for (let i = 0; i < 20; i++) {
      (treeContainer as HTMLElement).scrollTop += (treeContainer as HTMLElement).clientHeight * 0.8;
      const rows = document.querySelectorAll(".monaco-list-row");
      for (const row of rows) {
        const label = row.querySelector(".monaco-highlighted-label, .label-name");
        if (label && label.textContent?.trim() === name) {
          (row as HTMLElement).click();
          return true;
        }
      }
    }
    return false;
  }, itemName);
}

export { MIAODA_URL };
