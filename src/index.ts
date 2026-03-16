#!/usr/bin/env node

// ============================================================
// MCP Calculator Server — A complete, minimal MCP server
// ============================================================

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ------------------------------------------------------------
// 1. CREATE THE SERVER INSTANCE
// ------------------------------------------------------------
// The McpServer class is the high-level wrapper that handles
// JSON-RPC communication, capability negotiation, and routing.

const server = new McpServer({
  name: "mcp-calculator",     // Unique name for your server
  version: "1.0.0",           // Semantic version
});

// ------------------------------------------------------------
// 2. REGISTER TOOLS
// ------------------------------------------------------------
// Tools are functions the LLM can call. Each tool needs:
//   - A unique name
//   - A description (the LLM reads this to decide when to use it)
//   - An input schema (defined with Zod for type safety)
//   - A handler function that returns the result

// TOOL 1: Addition
server.tool(
  "add",                                         // tool name
  "Add two numbers together",                    // description
  {
    a: z.number().describe("First number"),      // input schema
    b: z.number().describe("Second number"),
  },
  async ({ a, b }) => {                          // handler
    const result = a + b;
    return {
      content: [
        {
          type: "text",
          text: `${a} + ${b} = ${result}`,
        },
      ],
    };
  }
);

// TOOL 2: Multiplication
server.tool(
  "multiply",
  "Multiply two numbers together",
  {
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  },
  async ({ a, b }) => {
    const result = a * b;
    return {
      content: [
        {
          type: "text",
          text: `${a} × ${b} = ${result}`,
        },
      ],
    };
  }
);

// ------------------------------------------------------------
// 3. REGISTER RESOURCES
// ------------------------------------------------------------
// Resources are read-only data that clients can access.
// They are identified by a URI (like a URL).

server.resource(
  "help",                                       // resource name
  "calculator://help",                          // URI
  async (uri) => ({                             // handler
    contents: [
      {
        uri: uri.href,
        mimeType: "text/plain",
        text: [
          "Calculator MCP Server — Help",
          "==============================",
          "",
          "Available tools:",
          "  • add(a, b)      — Returns the sum of two numbers",
          "  • multiply(a, b) — Returns the product of two numbers",
          "",
          "Example usage:",
          '  "What is 42 + 58?"',
          '  "Multiply 7 by 13"',
        ].join("\n"),
      },
    ],
  })
);

// ------------------------------------------------------------
// 4. REGISTER PROMPTS
// ------------------------------------------------------------
// Prompts are reusable templates that help users accomplish
// specific tasks. They can accept arguments.

server.prompt(
  "math-assistant",                             // prompt name
  "A helpful math assistant prompt",            // description
  {
    problem: z.string().describe("The math problem to solve"),
  },
  ({ problem }) => ({                           // handler
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are a helpful math assistant. Please solve the following problem step by step, using the calculator tools when needed:\n\n${problem}`,
        },
      },
    ],
  })
);

// ------------------------------------------------------------
// 5. START THE SERVER
// ------------------------------------------------------------
// The transport determines HOW the server communicates.
// StdioServerTransport uses stdin/stdout — the simplest option,
// perfect for local servers launched by Claude Desktop or Cursor.

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // IMPORTANT: Use console.error, NOT console.log!
  // console.log writes to stdout, which would corrupt the
  // JSON-RPC messages being sent over stdio.
  console.error("Calculator MCP server is running on stdio");
}

main().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});