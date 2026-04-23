import { z } from "zod";
import { getOrLaunch } from "../browser/manager.js";

export const screenshotSchema = {
  fullPage: z.boolean().default(false).describe("Whether to capture the full scrollable page"),
  selector: z.string().optional().describe("CSS selector to capture a specific element"),
};

export async function handleScreenshot(args: z.infer<z.ZodObject<typeof screenshotSchema>>) {
  const { page } = await getOrLaunch();

  let buffer: Buffer;

  if (args.selector) {
    const element = await page.$(args.selector);
    if (!element) {
      return {
        content: [{ type: "text" as const, text: `Element not found: ${args.selector}` }],
        isError: true,
      };
    }
    buffer = await element.screenshot({ type: "png" });
  } else {
    buffer = await page.screenshot({ type: "png", fullPage: args.fullPage });
  }

  return {
    content: [
      {
        type: "image" as const,
        data: buffer.toString("base64"),
        mimeType: "image/png",
      },
    ],
  };
}
