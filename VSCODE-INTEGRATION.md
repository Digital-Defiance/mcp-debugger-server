# VS Code Extension Integration Guide

This guide provides instructions for integrating the MCP Debugger Server with VS Code and GitHub Copilot.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Configuration](#configuration)
- [Debugging Workflows](#debugging-workflows)
- [GitHub Copilot Integration](#github-copilot-integration)
- [Configuration Examples](#configuration-examples)

## Overview

The MCP Debugger Server can be integrated with VS Code in two ways:

1. **Direct MCP Integration**: Use VS Code's MCP support (if available)
2. **Custom Extension**: Create a VS Code extension that wraps the MCP server

This guide covers both approaches and provides examples for common project types.

## Installation

### Prerequisites

- VS Code 1.80 or higher
- Node.js 16 or higher
- MCP Debugger Server built and ready

### Option 1: Direct MCP Integration

If VS Code supports MCP directly:

1. Install the MCP extension for VS Code (if available)
2. Configure the MCP server in VS Code settings

### Option 2: Custom Extension

To create a custom VS Code extension:

```bash
# Install Yeoman and VS Code extension generator
npm install -g yo generator-code

# Generate a new extension
yo code

# Select "New Extension (TypeScript)"
# Name: mcp-debugger-vscode
# Description: MCP Debugger integration for VS Code
```

## Configuration

### VS Code Settings

Add the MCP Debugger Server to your VS Code settings (`.vscode/settings.json`):

```json
{
  "mcp.servers": {
    "debugger": {
      "command": "node",
      "args": ["${workspaceFolder}/packages/mcp-server/dist/src/index.js"],
      "transport": "stdio"
    }
  }
}
```

### Workspace Configuration

For multi-root workspaces, configure in the workspace file:

```json
{
  "folders": [
    { "path": "." }
  ],
  "settings": {
    "mcp.servers": {
      "debugger": {
        "command": "node",
        "args": ["${workspaceFolder}/packages/mcp-server/dist/src/index.js"]
      }
    }
  }
}
```

## Debugging Workflows

### Workflow 1: Debug Current File

**Steps:**

1. Open a JavaScript or TypeScript file
2. Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Run: "MCP Debugger: Debug Current File"
4. The debugger starts and pauses at the first line

**VS Code Extension Command:**

```typescript
vscode.commands.registerCommand('mcp-debugger.debugCurrentFile', async () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  const filePath = editor.document.uri.fsPath;
  
  // Call MCP tool: debugger_start
  const session = await mcpClient.callTool('debugger_start', {
    command: 'node',
    args: [filePath]
  });

  vscode.window.showInformationMessage(`Debug session started: ${session.sessionId}`);
});
```

### Workflow 2: Debug with Breakpoints

**Steps:**

1. Set breakpoints in your code (click in the gutter)
2. Open Command Palette
3. Run: "MCP Debugger: Start Debugging"
4. The debugger starts and stops at your breakpoints

**VS Code Extension Command:**

```typescript
vscode.commands.registerCommand('mcp-debugger.startDebugging', async () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const filePath = editor.document.uri.fsPath;
  
  // Start session
  const session = await mcpClient.callTool('debugger_start', {
    command: 'node',
    args: [filePath]
  });

  // Set breakpoints from VS Code
  const breakpoints = vscode.debug.breakpoints;
  for (const bp of breakpoints) {
    if (bp instanceof vscode.SourceBreakpoint) {
      await mcpClient.callTool('debugger_set_breakpoint', {
        sessionId: session.sessionId,
        file: bp.location.uri.fsPath,
        line: bp.location.range.start.line + 1
      });
    }
  }

  // Continue execution
  await mcpClient.callTool('debugger_continue', {
    sessionId: session.sessionId
  });
});
```

### Workflow 3: Debug Tests

**Steps:**

1. Open a test file
2. Open Command Palette
3. Run: "MCP Debugger: Debug Test File"
4. Select test framework (Jest/Mocha/Vitest)
5. The debugger runs your tests with debugging enabled

**VS Code Extension Command:**

```typescript
vscode.commands.registerCommand('mcp-debugger.debugTestFile', async () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const filePath = editor.document.uri.fsPath;
  
  // Detect test framework
  const framework = await detectTestFramework();
  
  let command, args;
  if (framework === 'jest') {
    command = 'node';
    args = ['node_modules/.bin/jest', filePath, '--runInBand'];
  } else if (framework === 'mocha') {
    command = 'node';
    args = ['node_modules/.bin/mocha', filePath];
  } else if (framework === 'vitest') {
    command = 'node';
    args = ['node_modules/.bin/vitest', 'run', filePath];
  }

  // Start debug session
  const session = await mcpClient.callTool('debugger_start', {
    command,
    args,
    timeout: 60000
  });

  vscode.window.showInformationMessage(`Debugging tests: ${filePath}`);
});
```

### Workflow 4: Inspect Variables

**Steps:**

1. While paused at a breakpoint
2. Hover over a variable to see its value
3. Or use the Debug Console to evaluate expressions

**VS Code Extension Implementation:**

```typescript
// Hover provider for variable inspection
vscode.languages.registerHoverProvider(['javascript', 'typescript'], {
  async provideHover(document, position, token) {
    const session = getCurrentDebugSession();
    if (!session || !session.isPaused) return;

    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) return;

    const word = document.getText(wordRange);

    // Evaluate expression
    const result = await mcpClient.callTool('debugger_inspect', {
      sessionId: session.sessionId,
      expression: word
    });

    return new vscode.Hover(`**${word}**: ${result.value} (${result.type})`);
  }
});
```

### Workflow 5: Step Through Code

**Steps:**

1. While paused at a breakpoint
2. Use the debug toolbar or keyboard shortcuts:
   - F10: Step Over
   - F11: Step Into
   - Shift+F11: Step Out
   - F5: Continue

**VS Code Extension Commands:**

```typescript
// Step Over
vscode.commands.registerCommand('mcp-debugger.stepOver', async () => {
  const session = getCurrentDebugSession();
  if (!session) return;

  await mcpClient.callTool('debugger_step_over', {
    sessionId: session.sessionId
  });

  updateDebugView();
});

// Step Into
vscode.commands.registerCommand('mcp-debugger.stepInto', async () => {
  const session = getCurrentDebugSession();
  if (!session) return;

  await mcpClient.callTool('debugger_step_into', {
    sessionId: session.sessionId
  });

  updateDebugView();
});

// Step Out
vscode.commands.registerCommand('mcp-debugger.stepOut', async () => {
  const session = getCurrentDebugSession();
  if (!session) return;

  await mcpClient.callTool('debugger_step_out', {
    sessionId: session.sessionId
  });

  updateDebugView();
});

// Continue
vscode.commands.registerCommand('mcp-debugger.continue', async () => {
  const session = getCurrentDebugSession();
  if (!session) return;

  await mcpClient.callTool('debugger_continue', {
    sessionId: session.sessionId
  });
});
```

## GitHub Copilot Integration

### Overview

GitHub Copilot can use the MCP Debugger Server to assist with debugging tasks.

### Configuration

Enable Copilot to access the MCP server:

```json
{
  "github.copilot.advanced": {
    "mcp": {
      "enabled": true,
      "servers": ["debugger"]
    }
  }
}
```

### Copilot Debugging Patterns

#### Pattern 1: Ask Copilot to Debug

**User:** "Debug this function and tell me why it's not working"

**Copilot:**
```
I'll debug the function for you.

[Copilot uses debugger_start to start a session]
[Copilot uses debugger_set_breakpoint to set a breakpoint]
[Copilot uses debugger_continue to run to the breakpoint]
[Copilot uses debugger_get_local_variables to inspect state]

The issue is that the 'user' variable is undefined at line 25. 
You need to initialize it before this point.
```

#### Pattern 2: Ask Copilot to Find a Bug

**User:** "Find the bug in this code"

**Copilot:**
```
I'll analyze the code with the debugger.

[Copilot uses debugger_detect_hang to check for infinite loops]
[If no hang, uses debugger_start and steps through the code]
[Copilot uses debugger_inspect to evaluate expressions]

Found the bug: The loop condition on line 42 should be 'i < array.length' 
not 'i <= array.length'. This causes an array index out of bounds error.
```

#### Pattern 3: Ask Copilot to Explain Execution

**User:** "Explain how this function executes"

**Copilot:**
```
I'll step through the function and explain each step.

[Copilot uses debugger_start]
[Copilot uses debugger_set_breakpoint at key locations]
[Copilot uses debugger_step_over to step through]
[Copilot uses debugger_get_local_variables at each step]

Here's how the function executes:
1. Line 10: Initializes count = 0
2. Line 11: Loops through items array
3. Line 12: For each item, checks if item.active is true
4. Line 13: If true, increments count
5. Line 15: Returns the final count

The function counts the number of active items in the array.
```

### Copilot Agent Mode

In agent mode, Copilot can autonomously use debugging tools:

```typescript
// Copilot agent configuration
{
  "agent": {
    "name": "debugger-assistant",
    "description": "Helps debug Node.js and TypeScript code",
    "tools": [
      "debugger_start",
      "debugger_set_breakpoint",
      "debugger_continue",
      "debugger_step_over",
      "debugger_step_into",
      "debugger_step_out",
      "debugger_inspect",
      "debugger_get_local_variables",
      "debugger_get_stack",
      "debugger_detect_hang",
      "debugger_stop_session"
    ],
    "instructions": [
      "When asked to debug code, start a debug session",
      "Set breakpoints at key locations",
      "Step through the code to understand execution",
      "Inspect variables to find issues",
      "Explain findings clearly to the user",
      "Always cleanup sessions when done"
    ]
  }
}
```

## Configuration Examples

### Example 1: Node.js Application

**Project Structure:**
```
my-app/
├── src/
│   ├── index.js
│   └── utils.js
├── package.json
└── .vscode/
    └── settings.json
```

**VS Code Settings:**
```json
{
  "mcp.servers": {
    "debugger": {
      "command": "node",
      "args": ["${workspaceFolder}/node_modules/@ai-capabilities-suite/mcp-server/dist/src/index.js"]
    }
  },
  "mcp-debugger.defaultCommand": "node",
  "mcp-debugger.defaultArgs": ["${file}"]
}
```

### Example 2: TypeScript Application

**Project Structure:**
```
my-ts-app/
├── src/
│   ├── index.ts
│   └── utils.ts
├── dist/
│   ├── index.js
│   └── utils.js
├── tsconfig.json
└── .vscode/
    └── settings.json
```

**VS Code Settings:**
```json
{
  "mcp.servers": {
    "debugger": {
      "command": "node",
      "args": ["${workspaceFolder}/node_modules/@ai-capabilities-suite/mcp-server/dist/src/index.js"]
    }
  },
  "mcp-debugger.defaultCommand": "node",
  "mcp-debugger.defaultArgs": [
    "--enable-source-maps",
    "${workspaceFolder}/dist/${fileBasenameNoExtension}.js"
  ],
  "mcp-debugger.sourceMapSupport": true
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "sourceMap": true,
    "outDir": "./dist"
  }
}
```

### Example 3: Jest Tests

**Project Structure:**
```
my-app/
├── src/
│   └── utils.js
├── tests/
│   └── utils.test.js
├── package.json
└── .vscode/
    └── settings.json
```

**VS Code Settings:**
```json
{
  "mcp.servers": {
    "debugger": {
      "command": "node",
      "args": ["${workspaceFolder}/node_modules/@ai-capabilities-suite/mcp-server/dist/src/index.js"]
    }
  },
  "mcp-debugger.testFramework": "jest",
  "mcp-debugger.testCommand": "node",
  "mcp-debugger.testArgs": [
    "${workspaceFolder}/node_modules/.bin/jest",
    "${file}",
    "--runInBand"
  ],
  "mcp-debugger.testTimeout": 60000
}
```

### Example 4: Monorepo

**Project Structure:**
```
monorepo/
├── packages/
│   ├── app/
│   │   └── src/
│   └── lib/
│       └── src/
├── package.json
└── .vscode/
    └── settings.json
```

**VS Code Settings:**
```json
{
  "mcp.servers": {
    "debugger": {
      "command": "node",
      "args": ["${workspaceFolder}/node_modules/@ai-capabilities-suite/mcp-server/dist/src/index.js"]
    }
  },
  "mcp-debugger.workspaceAware": true,
  "mcp-debugger.packageManager": "yarn"
}
```

### Example 5: Docker Development

**Project Structure:**
```
my-app/
├── src/
├── Dockerfile
├── docker-compose.yml
└── .vscode/
    └── settings.json
```

**VS Code Settings:**
```json
{
  "mcp.servers": {
    "debugger": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "my-app-container",
        "node",
        "/app/node_modules/@ai-capabilities-suite/mcp-server/dist/src/index.js"
      ]
    }
  }
}
```

## Keyboard Shortcuts

Add these to your `keybindings.json`:

```json
[
  {
    "key": "f9",
    "command": "mcp-debugger.toggleBreakpoint",
    "when": "editorTextFocus"
  },
  {
    "key": "f5",
    "command": "mcp-debugger.continue",
    "when": "inDebugMode"
  },
  {
    "key": "f10",
    "command": "mcp-debugger.stepOver",
    "when": "inDebugMode"
  },
  {
    "key": "f11",
    "command": "mcp-debugger.stepInto",
    "when": "inDebugMode"
  },
  {
    "key": "shift+f11",
    "command": "mcp-debugger.stepOut",
    "when": "inDebugMode"
  },
  {
    "key": "shift+f5",
    "command": "mcp-debugger.stop",
    "when": "inDebugMode"
  },
  {
    "key": "ctrl+shift+d",
    "command": "mcp-debugger.debugCurrentFile",
    "when": "editorTextFocus"
  }
]
```

## Troubleshooting

### Issue: MCP server not starting

**Cause:** The server path is incorrect or Node.js is not found.

**Solution:**
1. Verify the path in settings.json
2. Check that the server is built: `npx nx build @ai-capabilities-suite/mcp-server`
3. Test the server manually: `node packages/mcp-server/dist/src/index.js`

### Issue: Breakpoints not hitting

**Cause:** Source maps not configured or file paths don't match.

**Solution:**
1. For TypeScript, ensure `"sourceMap": true` in tsconfig.json
2. Use `--enable-source-maps` flag when starting Node.js
3. Verify file paths are absolute

### Issue: Variables not showing

**Cause:** Process is not paused or scope is incorrect.

**Solution:**
1. Ensure the process is paused at a breakpoint
2. Check that you're in the correct stack frame
3. Use the Debug Console to manually evaluate expressions

### Issue: Copilot not using debugger

**Cause:** MCP integration not enabled or configured.

**Solution:**
1. Enable MCP in Copilot settings
2. Verify the debugger server is in the allowed servers list
3. Restart VS Code

## Best Practices

1. **Use workspace settings** for project-specific configuration
2. **Enable source maps** for TypeScript projects
3. **Set appropriate timeouts** for long-running tests
4. **Use conditional breakpoints** to reduce noise
5. **Leverage Copilot** for automated debugging assistance
6. **Clean up sessions** to prevent resource leaks
7. **Use keyboard shortcuts** for efficient debugging

## Extension Development

To create a full VS Code extension:

1. **Generate extension:**
   ```bash
   yo code
   ```

2. **Add MCP client:**
   ```bash
   npm install @modelcontextprotocol/sdk
   ```

3. **Implement commands:**
   - See workflow examples above

4. **Add debug adapter:**
   ```typescript
   vscode.debug.registerDebugAdapterDescriptorFactory('mcp-debugger', {
     createDebugAdapterDescriptor(session) {
       return new vscode.DebugAdapterInlineImplementation(new McpDebugAdapter());
     }
   });
   ```

5. **Package extension:**
   ```bash
   vsce package
   ```

6. **Publish to marketplace:**
   ```bash
   vsce publish
   ```

## See Also

- [README.md](./README.md) - User documentation
- [AI-AGENT-INTEGRATION.md](./AI-AGENT-INTEGRATION.md) - AI agent integration
- [API.md](./API.md) - API documentation
- [VS Code Extension API](https://code.visualstudio.com/api) - VS Code extension development
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot) - Copilot integration
