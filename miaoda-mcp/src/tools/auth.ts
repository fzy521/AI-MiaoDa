import { z } from "zod";
import { getOrLaunch, saveAuthState, MIAODA_URL, withLock } from "../browser/manager.js";

export const checkAuthSchema = {
  waitForLogin: z.boolean().default(true).describe("If true and not authenticated, wait for user SSO login (up to 2 min)"),
};

export async function handleCheckAuth(args: { waitForLogin?: boolean }) {
  return withLock(async () => {
    const { page } = await getOrLaunch();

    const url = page.url();
    const authenticated = url.includes("miaoda.feishu.cn") && !url.includes("login") && !url.includes("accounts");

    if (authenticated) {
      await saveAuthState();
      return {
        content: [{ type: "text" as const, text: `Already authenticated. Current URL: ${url}` }],
      };
    }

    if (args.waitForLogin !== false) {
      try {
        await page.waitForFunction(
          () => {
            const u = window.location.href;
            return u.includes("miaoda.feishu.cn") && !u.includes("login") && !u.includes("accounts");
          },
          { timeout: 120000 }
        );
        await saveAuthState();
        return {
          content: [{ type: "text" as const, text: `Login successful. Current URL: ${page.url()}` }],
        };
      } catch {
        return {
          content: [{ type: "text" as const, text: `Login not completed within timeout. Current URL: ${page.url()}` }],
          isError: true,
        };
      }
    }

    return {
      content: [{ type: "text" as const, text: `Not authenticated. Current URL: ${url}. Call with waitForLogin=true to open browser for SSO.` }],
    };
  });
}
