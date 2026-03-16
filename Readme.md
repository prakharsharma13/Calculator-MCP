# 🧮 MCP Calculator Server

A simple, well-documented **Model Context Protocol (MCP)** server built with TypeScript. Exposes basic math operations as tools that any MCP-compatible AI client (Claude Desktop, Cursor, VS Code, etc.) can discover and call.

Built as a learning reference for anyone getting started with MCP server development.

---

## Features

- **Tools** — `add` and `multiply` with validated inputs via Zod
- **Resources** — A `calculator://help` document describing available operations
- **Prompts** — A `math-assistant` template for guided problem-solving
- **Stdio transport** — Zero-config local usage with Claude Desktop

## Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- npm (comes with Node.js)

## Quick Start

```bash
# Clone the project
git clone https://github.com/prakharsharma13/Calculator-MCP
cd calculator-mcp

# Install dependencies
npm install

# Build
npm run build

# Run
npm start
```

## Installation from Scratch

If you're creating the project fresh instead of cloning:

```bash
mkdir mcp-calculator && cd mcp-calculator
npm init -y
npm install @modelcontextprotocol/sdk zod@3
npm install -D @types/node typescript
mkdir src
```

Then copy `src/index.ts` from this repo and configure `package.json` and `tsconfig.json` as shown below.

## Project Structure

```
mcp-calculator/
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── README.md
├── src/
│   └── index.ts        # Server source code
└── build/              # Compiled output (generated)
    └── index.js
```

## Configuration

### package.json

```json
{
  "name": "mcp-calculator",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "mcp-calculator": "./build/index.js"
  },
  "scripts": {
    "build": "tsc && chmod 755 build/index.js",
    "start": "node build/index.js"
  },
  "files": ["build"],
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.1",
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "@types/node": "^22.15.21",
    "typescript": "^5.8.3"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## Usage

### Connect to Claude Desktop

1. Open the Claude Desktop config file:

   | OS      | Path                                                              |
   | ------- | ----------------------------------------------------------------- |
   | macOS   | `~/Library/Application Support/Claude/claude_desktop_config.json` |
   | Windows | `%APPDATA%\Claude\claude_desktop_config.json`                     |

2. Add the server entry:

   ```json
   {
     "mcpServers": {
       "calculator": {
         "command": "node",
         "args": ["/absolute/path/to/mcp-calculator/build/index.js"]
       }
     }
   }
   ```

3. Restart Claude Desktop. A 🔨 icon confirms the tools are loaded.

4. Try asking: _"What is 42 + 58?"_ or _"Multiply 7 by 13"_

### Test with MCP Inspector

The official inspector provides an interactive web UI for testing:

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

### Manual Smoke Test

Pipe a JSON-RPC initialize request to verify the server responds:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node build/index.js
```

## API Reference

### Tools

| Tool       | Description          | Parameters               |
| ---------- | -------------------- | ------------------------ |
| `add`      | Add two numbers      | `a: number`, `b: number` |
| `multiply` | Multiply two numbers | `a: number`, `b: number` |

### Resources

| URI                 | Description                                                   |
| ------------------- | ------------------------------------------------------------- |
| `calculator://help` | Plain-text help document listing available tools and examples |

### Prompts

| Prompt           | Description                      | Arguments         |
| ---------------- | -------------------------------- | ----------------- |
| `math-assistant` | Step-by-step math problem solver | `problem: string` |

## Key Concepts

### Transport

This server uses **stdio** transport — the host application (Claude Desktop) launches it as a child process and communicates over stdin/stdout pipes. No network ports required.

For remote deployment, the SDK also supports **Streamable HTTP** transport via `StreamableHTTPServerTransport`.

### Logging

> ⚠️ **Never use `console.log()` in stdio-based MCP servers.**

`console.log()` writes to stdout, which corrupts the JSON-RPC message stream. Always use `console.error()` for any logging or debug output.

### Response Format

All tool handlers return a standard content array:

```typescript
return {
  content: [{ type: "text", text: "Result here" }],
  isError: false, // optional, set true on failure
};
```

## Extending the Server

Add a new tool in `src/index.ts`:

```typescript
server.tool(
  "divide",
  "Divide two numbers",
  {
    a: z.number().describe("Numerator"),
    b: z.number().describe("Denominator"),
  },
  async ({ a, b }) => {
    if (b === 0) {
      return {
        content: [{ type: "text", text: "Error: Division by zero" }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: `${a} ÷ ${b} = ${a / b}` }],
    };
  },
);
```

Rebuild with `npm run build` and restart your MCP client.

## Tech Stack

- **[TypeScript](https://www.typescriptlang.org/)** — Type-safe JavaScript
- **[@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)** — Official MCP TypeScript SDK
- **[Zod](https://zod.dev/)** — Runtime schema validation and type inference

## Resources

- [MCP Specification](https://modelcontextprotocol.io/docs/getting-started/intro)
- [Build an MCP Server — Official Tutorial](https://modelcontextprotocol.io/docs/develop/build-server)
- [TypeScript SDK on GitHub](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)

## License

MIT
