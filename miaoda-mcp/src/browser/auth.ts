import { getOrLaunch, saveAuthState, MIAODA_URL } from "./manager.js";

export async function ensureAuthenticated(): Promise<{ authenticated: boolean; url: string }> {
  const { page } = await getOrLaunch();
  const url = page.url();
  const authenticated = url.includes("miaoda.feishu.cn") && !url.includes("login") && !url.includes("accounts");

  if (authenticated) {
    await saveAuthState();
  }

  return { authenticated, url };
}

export async function waitForLogin(timeoutMs = 120000): Promise<{ authenticated: boolean; url: string }> {
  const { page } = await getOrLaunch();

  await page.goto(MIAODA_URL, { waitUntil: "domcontentloaded", timeout: 30000 });

  const url = await page.waitForFunction(
    () => {
      const u = window.location.href;
      return u.includes("miaoda.feishu.cn") && !u.includes("login") && !u.includes("accounts");
    },
    { timeout: timeoutMs }
  ).then(() => page.url()).catch(() => page.url());

  const authenticated = url.includes("miaoda.feishu.cn") && !url.includes("login") && !url.includes("accounts");

  if (authenticated) {
    await saveAuthState();
  }

  return { authenticated, url };
}
