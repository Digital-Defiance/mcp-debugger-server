# AI Agent Integration Guide

This guide provides comprehensive instructions for integrating the MCP Debugger Server with AI agents like Kiro and Amazon Q.

## Table of Contents

- [Overview](#overview)
- [Configuration](#configuration)
- [Workflow Examples](#workflow-examples)
- [Tool Schemas](#tool-schemas)
- [Troubleshooting](#troubleshooting)

## Overview

The MCP Debugger Server enables AI agents to debug Node.js and TypeScript applications through the Model Context Protocol. The server provides 21 comprehensive debugging tools. AI agents can:

- Start and manage debug sessions
- Set and manage breakpoints (with conditions)
- Control execution flow (continue, step over/into/out, pause)
- Inspect variables and evaluate expressions
- Watch variable changes
- Navigate call stacks and switch frames
- Inspect objects with nested resolution
- Detect hanging processes and infinite loops

## Configuration

### Kiro Configuration

Add the debugger server to your Kiro MCP configuration file at `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "debugger": {
      "command": "node",
      "args": ["packages/mcp-server/dist/src/index.js"],
      "env": {
        "NODE_ENV": "production"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

**Configuration Options:**

- `command`: The Node.js executable (usually "node")
- `args`: Path to the compiled MCP server entry point
- `env`: Environment variables (optional)
- `disabled`: Set to `true` to disable the server
- `autoApprove`: List of tool names to auto-approve (empty for manual approval)

### Amazon Q Configuration

For Amazon Q, configure the MCP server in your workspace settings:

```json
{
  "mcp": {
    "servers": {
      "debugger": {
        "command": "node",
        "args": ["path/to/mcp-server/dist/src/index.js"],
        "transport": "stdio"
      }
    }
  }
}
```

### Verification

After configuration, verify the server is available:

1. Restart your AI agent
2. Ask the agent: "What debugging tools are available?"
3. The agent should list all 21 debugging tools

## Workflow Examples

### Workflow 1: Debug a Failing Script

**Scenario:** A Node.js script is throwing an error, and you want to investigate.

**Agent Conversation:**

```
User: "Debug my script at src/app.js and find out why it's crashing"

Agent: I'll start a debug session and investigate.

[Agent calls debugger_start]
{
  "command": "node",
  "args": ["src/app.js"]
}

[Response: sessionId: "session-123", state: "paused"]

Agent: Session started. Let me set a breakpoint at the suspected location.

[Agent calls debugger_set_breakpoint]
{
  "sessionId": "session-123",
  "file": "/absolute/path/to/src/app.js",
  "line": 25
}

[Agent calls debugger_continue]
{
  "sessionId": "session-123"
}

[Process pauses at breakpoint]

Agent: Paused at line 25. Let me inspect the variables.

[Agent calls debugger_get_local_variables]
{
  "sessionId": "session-123"
}

[Response shows: user = undefined]

Agent: I found the issue! The 'user' variable is undefined at line 25. 
This is likely causing the crash. The user object should be initialized 
before this point.

[Agent calls debugger_stop_session]
{
  "sessionId": "session-123"
}

Agent: The issue is that 'user' is undefined. You need to initialize it 
before line 25, or add a null check.
```

### Workflow 2: Debug a Failing Test

**Scenario:** A Jest test is failing, and you want to understand why.

**Agent Conversation:**

```
User: "Debug the failing test in tests/user.test.js"

Agent: I'll debug the test and find the issue.

[Agent calls debugger_start]
{
  "command": "node",
  "args": ["node_modules/.bin/jest", "tests/user.test.js", "--runInBand"],
  "timeout": 60000
}

[Agent calls debugger_set_breakpoint]
{
  "sessionId": "session-456",
  "file": "/absolute/path/to/tests/user.test.js",
  "line": 42
}

[Agent calls debugger_continue]

[Paused at breakpoint]

[Agent calls debugger_inspect]
{
  "sessionId": "session-456",
  "expression": "expect.getState()"
}

[Agent calls debugger_get_local_variables]

Agent: The test is failing because the expected value is "John" but the 
actual value is "john" (lowercase). The comparison is case-sensitive.

[Agent calls debugger_stop_session]
```

### Workflow 3: Detect an Infinite Loop

**Scenario:** A script seems to hang indefinitely.

**Agent Conversation:**

```
User: "My script at src/process-data.js seems to hang. Can you check if 
there's an infinite loop?"

Agent: I'll use hang detection to identify the issue.

[Agent calls debugger_detect_hang]
{
  "command": "node",
  "args": ["src/process-data.js"],
  "timeout": 5000,
  "sampleInterval": 100
}

[Response: hung: true, location: "/path/to/src/process-data.js:78"]

Agent: Yes, there's an infinite loop at line 78 in src/process-data.js. 
The execution is stuck at this location. Here's the call stack:

1. processItems (process-data.js:78)
2. main (process-data.js:120)

The loop at line 78 never terminates. Check the loop condition to ensure 
it can exit.
```

### Workflow 4: Step Through Complex Logic

**Scenario:** You want to understand how a complex function works.

**Agent Conversation:**

```
User: "Step through the calculateDiscount function in src/pricing.js and 
show me how it calculates the final price"

Agent: I'll step through the function and explain each step.

[Agent calls debugger_start]
{
  "command": "node",
  "args": ["src/pricing.js"]
}

[Agent calls debugger_set_breakpoint]
{
  "sessionId": "session-789",
  "file": "/path/to/src/pricing.js",
  "line": 15
}

[Agent calls debugger_continue]

[Paused at line 15]

[Agent calls debugger_get_local_variables]

Agent: At line 15, we have:
- basePrice = 100
- discountPercent = 20

[Agent calls debugger_step_over]

[Agent calls debugger_get_local_variables]

Agent: After line 16, discount is calculated as 20 (20% of 100)

[Agent calls debugger_step_over]

Agent: After line 17, finalPrice = 80 (100 - 20)

The function calculates the discount amount, then subtracts it from the 
base price to get the final price.

[Agent calls debugger_stop_session]
```

### Workflow 5: Watch Variable Changes

**Scenario:** You want to track how a variable changes during execution.

**Agent Conversation:**

```
User: "Track how the 'balance' variable changes in src/account.js"

Agent: I'll set up a watch on the balance variable.

[Agent calls debugger_start]
{
  "command": "node",
  "args": ["src/account.js"]
}

[Agent calls debugger_add_watch]
{
  "sessionId": "session-101",
  "expression": "balance"
}

[Agent calls debugger_set_breakpoint at multiple locations]

[Agent calls debugger_continue]

[Paused at first breakpoint]

[Agent calls debugger_get_watches]

Agent: At line 20, balance = 1000

[Agent calls debugger_continue]

[Paused at second breakpoint]

[Agent calls debugger_get_watches]

Agent: At line 35, balance changed from 1000 to 900 (withdrawal of 100)

[Agent calls debugger_continue]

[Paused at third breakpoint]

[Agent calls debugger_get_watches]

Agent: At line 50, balance changed from 900 to 1150 (deposit of 250)

The balance starts at 1000, decreases to 900 after a withdrawal, then 
increases to 1150 after a deposit.

[Agent calls debugger_stop_session]
```

### Workflow 6: Debug TypeScript Code

**Scenario:** Debug TypeScript code with source map support.

**Agent Conversation:**

```
User: "Debug my TypeScript file at src/app.ts"

Agent: I'll debug the TypeScript file using source maps.

[Agent calls debugger_start]
{
  "command": "node",
  "args": ["--enable-source-maps", "dist/app.js"]
}

[Agent calls debugger_set_breakpoint]
{
  "sessionId": "session-202",
  "file": "/path/to/src/app.ts",  // TypeScript source file
  "line": 42
}

[Agent calls debugger_continue]

[Paused at breakpoint - automatically mapped to compiled JS]

[Agent calls debugger_get_local_variables]

Agent: Paused at line 42 in src/app.ts. The variables are:
- user: { name: "John", age: 30 }
- isValid: true

Note: Variable names are preserved from the TypeScript source thanks to 
source maps.

[Agent calls debugger_stop_session]
```

## Tool Schemas

### Session Management Tools

#### debugger_start

**Description:** Start a new debug session with a Node.js process.

**Schema:**
```json
{
  "name": "debugger_start",
  "description": "Start a new debug session with a Node.js process. The process will be paused at the start.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "command": {
        "type": "string",
        "description": "The command to execute (e.g., 'node', 'npm')"
      },
      "args": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Command arguments (e.g., ['test.js'])"
      },
      "cwd": {
        "type": "string",
        "description": "Working directory for the process"
      },
      "timeout": {
        "type": "number",
        "description": "Timeout in milliseconds (default: 30000)"
      }
    },
    "required": ["command"]
  }
}
```

**Usage Tips for AI Agents:**
- Always use absolute paths for file arguments
- Set appropriate timeouts based on expected execution time
- Store the returned sessionId for subsequent operations
- The process starts in a paused state

#### debugger_stop_session

**Description:** Stop a debug session and cleanup all resources.

**Schema:**
```json
{
  "name": "debugger_stop_session",
  "description": "Stop a debug session, cleanup all resources, and kill the process if still running.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": {
        "type": "string",
        "description": "The debug session ID"
      }
    },
    "required": ["sessionId"]
  }
}
```

**Usage Tips for AI Agents:**
- Always call this when done debugging
- Prevents resource leaks
- Safe to call even if the process has already terminated

### Breakpoint Management Tools

#### debugger_set_breakpoint

**Description:** Set a breakpoint at a specific file and line number.

**Schema:**
```json
{
  "name": "debugger_set_breakpoint",
  "description": "Set a breakpoint at a specific file and line number. Optionally provide a condition.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": { "type": "string" },
      "file": { "type": "string", "description": "Absolute or relative file path" },
      "line": { "type": "number", "description": "Line number (1-indexed)" },
      "condition": { "type": "string", "description": "Optional condition (e.g., 'x > 10')" }
    },
    "required": ["sessionId", "file", "line"]
  }
}
```

**Usage Tips for AI Agents:**
- Use absolute paths for reliability
- Line numbers are 1-indexed (first line is 1)
- Conditions are JavaScript expressions
- Check the `verified` field in the response
- Store the returned breakpointId for later operations

#### debugger_list_breakpoints

**Description:** Get all breakpoints for a debug session.

**Schema:**
```json
{
  "name": "debugger_list_breakpoints",
  "description": "Get all breakpoints for a debug session with their file, line, condition, and enabled state.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": { "type": "string" }
    },
    "required": ["sessionId"]
  }
}
```

**Usage Tips for AI Agents:**
- Use this to verify breakpoints are set correctly
- Check the `verified` field to ensure breakpoints will hit
- Use the returned breakpointIds for remove/toggle operations

### Execution Control Tools

#### debugger_continue

**Description:** Resume execution until the next breakpoint or program termination.

**Schema:**
```json
{
  "name": "debugger_continue",
  "description": "Resume execution of a paused debug session until the next breakpoint or program termination.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": { "type": "string" }
    },
    "required": ["sessionId"]
  }
}
```

**Usage Tips for AI Agents:**
- Only call when the session is paused
- Execution will continue until a breakpoint or program end
- Listen for the response to know when execution pauses again

#### debugger_step_over

**Description:** Execute the current line and pause at the next line in the same scope.

**Schema:**
```json
{
  "name": "debugger_step_over",
  "description": "Execute the current line and pause at the next line in the same scope.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": { "type": "string" }
    },
    "required": ["sessionId"]
  }
}
```

**Usage Tips for AI Agents:**
- Use to step through code line by line
- Doesn't enter function calls
- Returns the new location after stepping

#### debugger_step_into

**Description:** Execute the current line and pause at the first line inside any called function.

**Schema:**
```json
{
  "name": "debugger_step_into",
  "description": "Execute the current line and pause at the first line inside any called function.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": { "type": "string" }
    },
    "required": ["sessionId"]
  }
}
```

**Usage Tips for AI Agents:**
- Use to investigate function calls
- Steps into the called function
- Returns the new location inside the function

#### debugger_step_out

**Description:** Execute until the current function returns and pause at the calling location.

**Schema:**
```json
{
  "name": "debugger_step_out",
  "description": "Execute until the current function returns and pause at the calling location.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": { "type": "string" }
    },
    "required": ["sessionId"]
  }
}
```

**Usage Tips for AI Agents:**
- Use to exit the current function
- Returns to the caller
- Useful when you've stepped into a function and want to return

### Variable Inspection Tools

#### debugger_inspect

**Description:** Evaluate a JavaScript expression in the current execution context.

**Schema:**
```json
{
  "name": "debugger_inspect",
  "description": "Evaluate a JavaScript expression in the current execution context and return the result with type information.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": { "type": "string" },
      "expression": { "type": "string", "description": "JavaScript expression (e.g., 'x + 1')" }
    },
    "required": ["sessionId", "expression"]
  }
}
```

**Usage Tips for AI Agents:**
- Can evaluate any valid JavaScript expression
- Returns value, type, and objectId (if object)
- Use objectId with debugger_inspect_object for nested inspection
- Session must be paused

#### debugger_get_local_variables

**Description:** Get all local variables in the current scope.

**Schema:**
```json
{
  "name": "debugger_get_local_variables",
  "description": "Get all local variables in the current scope with their names, values, and types.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": { "type": "string" }
    },
    "required": ["sessionId"]
  }
}
```

**Usage Tips for AI Agents:**
- Returns all variables in the current function scope
- Session must be paused
- Use to understand the current state

#### debugger_get_global_variables

**Description:** Get global variables accessible from the current scope.

**Schema:**
```json
{
  "name": "debugger_get_global_variables",
  "description": "Get global variables accessible from the current scope with their names, values, and types.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": { "type": "string" }
    },
    "required": ["sessionId"]
  }
}
```

**Usage Tips for AI Agents:**
- Returns user-defined global variables
- Built-in globals (console, process, etc.) are filtered out
- Session must be paused

### Call Stack Tools

#### debugger_get_stack

**Description:** Get the current call stack with function names and file locations.

**Schema:**
```json
{
  "name": "debugger_get_stack",
  "description": "Get the current call stack with function names, file locations (absolute paths), and line numbers.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": { "type": "string" }
    },
    "required": ["sessionId"]
  }
}
```

**Usage Tips for AI Agents:**
- Returns the complete call stack
- Frame 0 is the current location (top of stack)
- All file paths are absolute
- Use to understand the execution path

#### debugger_switch_stack_frame

**Description:** Switch the execution context to a specific stack frame.

**Schema:**
```json
{
  "name": "debugger_switch_stack_frame",
  "description": "Switch the execution context to a specific stack frame by index. Frame 0 is the top frame (current location).",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sessionId": { "type": "string" },
      "frameIndex": { "type": "number", "description": "Frame index (0 = top)" }
    },
    "required": ["sessionId", "frameIndex"]
  }
}
```

**Usage Tips for AI Agents:**
- Use to inspect variables in different stack frames
- Frame 0 is the current location
- Higher indices are further up the call stack
- Subsequent variable inspections use the selected frame

### Hang Detection Tools

#### debugger_detect_hang

**Description:** Detect if a process hangs or enters an infinite loop.

**Schema:**
```json
{
  "name": "debugger_detect_hang",
  "description": "Run a command and detect if it hangs or enters an infinite loop. Returns hang status, location, and stack trace if hung.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "command": { "type": "string" },
      "args": { "type": "array", "items": { "type": "string" } },
      "cwd": { "type": "string" },
      "timeout": { "type": "number", "description": "Timeout in milliseconds" },
      "sampleInterval": { "type": "number", "description": "Sample interval (default: 100ms)" }
    },
    "required": ["command", "timeout"]
  }
}
```

**Usage Tips for AI Agents:**
- Use when a script seems to hang
- Returns the exact location of the hang
- Provides the call stack at the hang point
- Adjust sampleInterval for different detection sensitivity

## Troubleshooting

### Common Issues for AI Agents

#### Issue: "Session not found" errors

**Cause:** The session ID is invalid or expired.

**Solution:**
```
1. Check if you stored the sessionId from debugger_start
2. Verify the session wasn't already stopped
3. Start a new session if needed
```

#### Issue: "Process must be paused" errors

**Cause:** Trying to inspect variables while the process is running.

**Solution:**
```
1. Set a breakpoint first
2. Call debugger_continue to run to the breakpoint
3. Then inspect variables
OR
1. Call debugger_pause to pause execution
2. Then inspect variables
```

#### Issue: Breakpoints not hitting

**Cause:** Breakpoint location is invalid or code path not executed.

**Solution:**
```
1. Use absolute file paths
2. Verify the line number has executable code
3. Check if the code path is actually executed
4. Use debugger_list_breakpoints to verify the breakpoint is set
```

#### Issue: TypeScript breakpoints not working

**Cause:** Source maps not enabled or not found.

**Solution:**
```
1. Ensure the process is started with --enable-source-maps
2. Verify .map files exist alongside compiled JavaScript
3. Use the TypeScript source file path, not the compiled JS path
```

### Best Practices for AI Agents

1. **Always cleanup sessions:**
   ```
   Always call debugger_stop_session when done, even if an error occurs.
   ```

2. **Use absolute paths:**
   ```
   Convert relative paths to absolute before calling debugger_set_breakpoint.
   ```

3. **Check session state:**
   ```
   Before inspecting variables, ensure the session is paused.
   ```

4. **Handle errors gracefully:**
   ```
   If a tool call fails, explain the error to the user and suggest solutions.
   ```

5. **Provide context:**
   ```
   When showing debugging results, explain what they mean in the context
   of the user's question.
   ```

6. **Be efficient:**
   ```
   Don't set unnecessary breakpoints or make redundant tool calls.
   ```

7. **Explain your actions:**
   ```
   Tell the user what you're doing and why at each step.
   ```

## Advanced Scenarios

### Scenario: Debugging a Race Condition

```
User: "I think there's a race condition in my async code"

Agent approach:
1. Start a debug session
2. Set breakpoints at key async operations
3. Use debugger_add_watch to track shared state
4. Step through the code with debugger_step_over
5. Check debugger_get_watches at each pause
6. Identify when the shared state changes unexpectedly
7. Explain the race condition to the user
```

### Scenario: Memory Leak Investigation

```
User: "My application seems to have a memory leak"

Agent approach:
1. Start a debug session
2. Set breakpoints at object creation points
3. Use debugger_inspect_object to examine object references
4. Track object counts with debugger_add_watch
5. Identify objects that aren't being garbage collected
6. Explain the leak source to the user
```

### Scenario: Performance Bottleneck

```
User: "Why is this function so slow?"

Agent approach:
1. Use debugger_detect_hang with a reasonable timeout
2. If it hangs, identify the slow location
3. Start a regular debug session
4. Set breakpoints around the slow code
5. Step through and inspect variables
6. Identify the performance issue (e.g., nested loops, large data)
7. Suggest optimizations
```

## Integration Testing

To test your AI agent integration:

1. **Basic connectivity:**
   ```
   Ask: "What debugging tools are available?"
   Expected: List of 17 tools
   ```

2. **Simple debugging:**
   ```
   Ask: "Debug test-fixtures/simple-script.js"
   Expected: Session starts, breakpoint set, variables inspected
   ```

3. **Error handling:**
   ```
   Ask: "Debug a non-existent file"
   Expected: Graceful error handling and explanation
   ```

4. **Cleanup:**
   ```
   After debugging, verify: "Are there any active debug sessions?"
   Expected: No active sessions (all cleaned up)
   ```

## Support

For issues with AI agent integration:

1. Check the MCP server logs
2. Verify the configuration is correct
3. Test the server manually with test-mcp-manual.js
4. Review the tool schemas in this document
5. Check the troubleshooting section

## See Also

- [README.md](./README.md) - User documentation
- [API.md](./API.md) - API documentation
- [TESTING.md](./TESTING.md) - Testing documentation
