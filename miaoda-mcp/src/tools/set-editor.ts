import { z } from "zod";
import { getOrLaunch, setEditorUrl, withLock } from "../browser/manager.js";

export const setEditorSchema = {
  url: z.string().describe("The project editor URL (e.g., 'https://miaoda.feishu.cn/app/app_xxx')"),
};

export async function handleSetEditor(args: z.infer<z.ZodObject<typeof setEditorSchema>>) {
  return withLock(async () => {
    setEditorUrl(args.url);

    // Navigate to the editor page and verify Monaco loads
    const { page } = await getOrLaunch();

    return {
      content: [{ type: "text" as const, text: `Editor URL set to ${args.url}. Browser will auto-navigate to this page.` }],
    };
  });
}
