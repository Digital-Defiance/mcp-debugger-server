---
name: "acs-debugger"
displayName: "ACS Debugger"
description: "Advanced debugging for Node.js and TypeScript with hang detection, profiling, and 25+ debugging tools"
keywords:
  [
    "debugging",
    "debugger",
    "typescript",
    "nodejs",
    "breakpoints",
    "profiling",
    "hang-detection",
    "performance",
    "testing",
    "jest",
    "mocha",
    "vitest",
  ]
author: "Digital Defiance"
---

# ACS Debugger Power

## Overview

Enterprise-grade debugging capabilities for Node.js and TypeScript applications. This power provides AI agents with 25+ debugging tools including breakpoints, variable inspection, execution control, CPU/memory profiling, hang detection, and comprehensive observability features.

**Key capabilities:**

- 25+ debugging tools (breakpoints, stepping, inspection)
- Hang detection for infinite loops
- CPU and memory profiling
- Test framework support (Jest, Mocha, Vitest)
- LSP integration with 13 code intelligence features

**VS Code Extension**: `DigitalDefiance.ts-mcp-debugger`

## Available MCP Servers

### acs-debugger

**Package:** `@ai-capabilities-suite/mcp-debugger-server`
**Connection:** Local MCP server via npx

## Configuration

```json
{
  "mcpServers": {
    "acs-debugger": {
      "command": "npx",
      "args": ["-y", "@ai-capabilities-suite/mcp-debugger-server@latest"]
    }
  }
}
```

## Resources

- [Package on npm](https://www.npmjs.com/package/@ai-capabilities-suite/mcp-debugger-server)
- [GitHub Repository](https://github.com/digital-defiance/ai-capabilities-suite/tree/main/packages/mcp-debugger-server)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=DigitalDefiance.ts-mcp-debugger)

---

**Package:** `@ai-capabilities-suite/mcp-debugger-server`  
**License:** MIT
