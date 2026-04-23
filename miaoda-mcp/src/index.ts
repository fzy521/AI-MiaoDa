#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { discoverSchema, handleDiscover } from "./tools/discover.js";
import { checkAuthSchema, handleCheckAuth } from "./tools/auth.js";
import { readCodeSchema, handleReadCode } from "./tools/read-code.js";
import { writeCodeSchema, handleWriteCode } from "./tools/write-code.js";
import { listFilesSchema, handleListFiles } from "./tools/list-files.js";
import { screenshotSchema, handleScreenshot } from "./tools/screenshot.js";
import { setEditorSchema, handleSetEditor } from "./tools/set-editor.js";

const server = new McpServer({
  name: "miaoda",
  version: "0.1.0",
});

server.tool(
  "miaoda_discover",
  "Discover the Miaoda editor structure - find Monaco editor instances, iframe layout, and available code files.",
  discoverSchema,
  async (args) => handleDiscover(args as any)
);

server.tool(
  "miaoda_check_auth",
  "Check if authenticated with Miaoda. Opens browser for SSO login if needed.",
  checkAuthSchema,
  async (args) => handleCheckAuth(args as any)
);

server.tool(
  "miaoda_read_code",
  "Read code from the Miaoda Monaco editor. Specify filePath for a specific file, or omit to read all.",
  readCodeSchema,
  async (args) => handleReadCode(args as any)
);

server.tool(
  "miaoda_write_code",
  "Write code into the Miaoda Monaco editor. Provide filePath + content, or localFilePath to inject from a local file.",
  writeCodeSchema,
  async (args) => handleWriteCode(args as any)
);

server.tool(
  "miaoda_list_files",
  "List all files in the current Miaoda project by querying Monaco editor models.",
  listFilesSchema,
  async () => handleListFiles()
);

server.tool(
  "miaoda_screenshot",
  "Take a screenshot of the current Miaoda page for verification.",
  screenshotSchema,
  async (args) => handleScreenshot(args as any)
);

server.tool(
  "miaoda_set_editor",
  "Set the project editor URL. The browser will auto-navigate to this page on subsequent operations.",
  setEditorSchema,
  async (args) => handleSetEditor(args as any)
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Miaoda MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
