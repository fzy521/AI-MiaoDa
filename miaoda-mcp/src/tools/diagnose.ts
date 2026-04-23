import { withLock, getOrLaunch, getMonacoFrame } from "../browser/manager.js";

export const diagnoseSchema = {};

export async function handleDiagnose() {
  return withLock(async () => {
    const { page } = await getOrLaunch();
    const monacoFrame = await getMonacoFrame(page);

    if (!monacoFrame) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: "Monaco frame not found" }, null, 2) }],
      };
    }

    // Run comprehensive diagnostics inside the Monaco frame
    const result: any = await monacoFrame.evaluate(() => {
      const w = window as any;
      const diagnostics: Record<string, any> = {};

      // 1. Check window.monaco
      diagnostics.windowMonaco = !!w.monaco;
      if (w.monaco) {
        diagnostics.monacoKeys = Object.keys(w.monaco);
        diagnostics.monacoEditorKeys = w.monaco.editor ? Object.keys(w.monaco.editor) : [];
        diagnostics.hasGetModels = !!w.monaco.editor?.getModels;
      }

      // 2. Check AMD require
      diagnostics.hasRequire = typeof w.require === "function";
      if (w.require) {
        try {
          const mods = [
            "monaco", "vs/editor/editor.main", "vs/editor/edcore.main",
            "vs/editor/editor.api", "vs/editor/editor.api.main",
          ];
          diagnostics.requireResults = {};
          for (const mod of mods) {
            try {
              const m = w.require(mod);
              diagnostics.requireResults[mod] = {
                found: true,
                keys: m ? Object.keys(m).slice(0, 20) : [],
                hasEditor: !!m?.editor,
                hasGetModels: !!m?.editor?.getModels,
              };
            } catch (e: any) {
              diagnostics.requireResults[mod] = { found: false, error: e.message?.slice(0, 80) };
            }
          }
        } catch (e: any) {
          diagnostics.requireError = e.message;
        }

        // Check what's loaded in require cache
        try {
          if (w.require.s?.contexts) {
            const ctxKeys = Object.keys(w.require.s.contexts);
            diagnostics.requireContexts = ctxKeys.slice(0, 10);
          }
          if (w.require.entries) {
            diagnostics.requireEntriesCount = Object.keys(w.require.entries).length;
            const entryKeys = Object.keys(w.require.entries).slice(0, 20);
            diagnostics.requireEntriesSample = entryKeys;
          }
        } catch {}
      }

      // 3. Scan all global properties for Monaco-like objects
      const monacoCandidates: string[] = [];
      for (const key of Object.getOwnPropertyNames(w)) {
        try {
          const val = w[key];
          if (val && typeof val === "object" && !Array.isArray(val)) {
            const keys = Object.keys(val);
            if (keys.includes("editor") && typeof val.editor === "object") {
              monacoCandidates.push(`${key}: ${keys.join(",")}`);
            }
            if (keys.includes("getModels") || keys.includes("createModel")) {
              monacoCandidates.push(`${key}: has getModels/createModel`);
            }
          }
          if (val && typeof val === "function" && val.getModels) {
            monacoCandidates.push(`${key}: function with getModels`);
          }
        } catch {}
      }
      diagnostics.monacoCandidates = monacoCandidates;

      // 4. Check for Monaco in child iframes
      const iframes = document.querySelectorAll("iframe");
      diagnostics.iframeCount = iframes.length;
      diagnostics.iframeSrcs = [];
      // Note: can't access cross-origin iframe content

      // 5. Check DOM for Monaco-specific elements
      diagnostics.monacoEditorCount = document.querySelectorAll(".monaco-editor").length;
      diagnostics.monacoTextareaCount = document.querySelectorAll("textarea.inputarea").length;

      // 5b. Find ALL textareas in the editor
      const allTextareas = document.querySelectorAll("textarea");
      diagnostics.allTextareaInfo = Array.from(allTextareas).map(t => ({
        classes: t.className,
        id: t.id,
        name: t.name,
        parentClasses: t.parentElement?.className?.slice(0, 100),
        visible: (t as HTMLElement).offsetParent !== null,
        cols: t.cols,
        rows: t.rows,
        ariaLabel: t.getAttribute("aria-label"),
      }));

      // 5c. Check for .lines-content and other Monaco internals
      diagnostics.linesContent = !!document.querySelector(".lines-content");
      diagnostics.viewLines = !!document.querySelector(".view-lines");
      diagnostics.overflowGuard = !!document.querySelector(".overflow-guard");

      // 5d. Try to find the Monaco editor instance via DOM data attribute or parent chain
      const editorEl = document.querySelector(".monaco-editor");
      if (editorEl) {
        // Check all properties on the element that might store editor reference
        const domKeys = Object.keys(editorEl).filter(k =>
          !['style', 'dataset', 'classList', 'className', 'id', 'innerHTML', 'outerHTML', 'innerText', 'textContent', 'children', 'childNodes', 'parentNode', 'parentElement', 'firstChild', 'lastChild', 'nextSibling', 'previousSibling', 'ownerDocument', 'attributes', 'classList'].includes(k)
        ).slice(0, 30);
        diagnostics.editorDomKeys = domKeys;

        // Check for __vue__ or React fiber
        const keys = Object.keys(editorEl) as string[];
        const vueKey = keys.find(k => k.startsWith('__vue'));
        const reactKey = keys.find(k => k.startsWith('__react'));
        const internalKey = keys.find(k => k.startsWith('_'));
        diagnostics.hasVue = !!vueKey;
        diagnostics.hasReact = !!reactKey;
        diagnostics.hasInternalKey = !!internalKey;
        diagnostics.sampleInternalKeys = keys.filter(k => k.startsWith('_') || k.startsWith('$')).slice(0, 20);
      }

      // 6. Check for VS Code state globals
      diagnostics.hasVSCode = !!w.vscode;
      diagnostics.hasWorkbench = !!w.workbench;
      diagnostics.hasAcquireVsCodeApi = typeof w.acquireVsCodeApi === "function";

      // 7. Try accessing Monaco through common patterns
      try {
        // Monaco might be loaded in a web worker context, accessible via require
        if (w.require) {
          // Try to get all loaded modules
          const loadedModules = Object.keys(w.require.entries || {}).filter(
            k => k.includes("editor") || k.includes("monaco")
          );
          diagnostics.editorModules = loadedModules;
        }
      } catch {}

      // 8. Check for Monaco editor instances via DOM traversal
      const editors = document.querySelectorAll(".monaco-editor");
      const editorData: any[] = [];
      for (const ed of editors) {
        const dataAttrs: Record<string, string | null> = {};
        for (const attr of Array.from(ed.attributes)) {
          dataAttrs[attr.name] = attr.value;
        }
        // Check for Monaco editor ID stored in DOM
        const domId = ed.getAttribute("data-uri");
        editorData.push({
          visible: (ed as HTMLElement).offsetParent !== null,
          dataUri: domId,
          classes: ed.className?.slice(0, 100),
          childCount: ed.children.length,
          hasTextarea: !!ed.querySelector("textarea"),
        });
      }
      diagnostics.editorInstances = editorData;

      return diagnostics;
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  });
}
