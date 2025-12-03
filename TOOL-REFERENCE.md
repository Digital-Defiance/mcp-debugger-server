# MCP Debugger Server - Tool Reference

Complete reference documentation for all 21 MCP debugging tools with schemas, examples, and debugging scenarios.

## Table of Contents

- [Session Management](#session-management)
- [Breakpoint Management](#breakpoint-management)
- [Execution Control](#execution-control)
- [Variable Inspection](#variable-inspection)
- [Variable Watching](#variable-watching)
- [Call Stack Navigation](#call-stack-navigation)
- [Hang Detection](#hang-detection)
- [Debugging Scenarios](#debugging-scenarios)
- [Error Codes Reference](#error-codes-reference)

## Session Management

### 1. debugger_start

Start a new debug session with a Node.js process. The process will be paused at the start.

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

**Parameters:**
- `command` (string, required): The command to execute
- `args` (string[], optional): Command arguments
- `cwd` (string, optional): Working directory
- `timeout` (number, optional): Timeout in milliseconds (default: 30000)

**Example Request:**
```json
{
  "command": "node",
  "args": ["src/app.js"],
  "cwd": "/path/to/project",
  "timeout": 30000
}
```

**Example Response (Success):**
```json
{
  "status": "success",
  "sessionId": "session-abc123",
  "state": "paused",
  "pid": 12345
}
```

**Example Response (Error):**
```json
{
  "status": "error",
  "code": "SESSION_START_FAILED",
  "message": "Failed to spawn process: ENOENT"
}
```

**Usage Notes:**
- The process starts in a paused state at the first line
- Store the returned `sessionId` for all subsequent operations
- Use absolute paths for file arguments when possible
- Set appropriate timeouts based on expected execution time
- The process will have the Inspector Protocol attached

**Requirements:** 2.1, 9.1


---

### 2. debugger_stop_session

Stop a debug session, cleanup all resources, and kill the process if still running.

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

**Parameters:**
- `sessionId` (string, required): The debug session ID

**Example Request:**
```json
{
  "sessionId": "session-abc123"
}
```

**Example Response (Success):**
```json
{
  "status": "success",
  "sessionId": "session-abc123",
  "stopped": true
}
```

**Usage Notes:**
- Always call this when done debugging to prevent resource leaks
- Safe to call even if the process has already terminated
- Removes all breakpoints and disconnects the inspector
- Kills the process if it's still running

**Requirements:** 8.2, 9.1

---

## Breakpoint Management


### 3. debugger_set_breakpoint

Set a breakpoint at a specific file and line number with optional condition.

**Parameters:** `sessionId` (required), `file` (required), `line` (required), `condition` (optional)

**Example:** `{"sessionId": "session-123", "file": "/path/to/file.js", "line": 42, "condition": "x > 10"}`

**Response:** Returns breakpoint ID, file, line, condition, enabled status, and verification status

**Requirements:** 1.1, 1.2, 9.1

### 4. debugger_remove_breakpoint

Remove a breakpoint from the session.

**Parameters:** `sessionId` (required), `breakpointId` (required)

**Requirements:** 1.4, 9.1

### 5. debugger_toggle_breakpoint

Toggle a breakpoint between enabled and disabled states.

**Parameters:** `sessionId` (required), `breakpointId` (required)

**Requirements:** 1.5, 9.1

### 6. debugger_list_breakpoints

Get all breakpoints for a debug session with their properties.

**Parameters:** `sessionId` (required)

**Response:** Array of breakpoints with id, file, line, condition, enabled, and verified status

**Requirements:** 1.3, 9.1

---

## Execution Control

### 7. debugger_continue

Resume execution until the next breakpoint or program termination.

**Parameters:** `sessionId` (required)

**Requirements:** 2.2, 9.1

### 8. debugger_step_over

Execute the current line and pause at the next line in the same scope.

**Parameters:** `sessionId` (required)

**Response:** Returns new state and location

**Requirements:** 2.3, 9.1

### 9. debugger_step_into

Execute the current line and pause at the first line inside any called function.

**Parameters:** `sessionId` (required)

**Requirements:** 2.4, 9.1

### 10. debugger_step_out

Execute until the current function returns and pause at the calling location.

**Parameters:** `sessionId` (required)

**Requirements:** 2.5, 9.1

### 11. debugger_pause

Pause a running debug session and return the current execution location.

**Parameters:** `sessionId` (required)

**Requirements:** 2.6, 9.1

---

## Variable Inspection

### 12. debugger_inspect

Evaluate a JavaScript expression in the current execution context.

**Parameters:** `sessionId` (required), `expression` (required)

**Example:** `{"sessionId": "session-123", "expression": "user.name + ' ' + user.age"}`

**Response:** Returns value, type, and objectId (if object)

**Requirements:** 3.4, 9.1, 9.3

### 13. debugger_get_local_variables

Get all local variables in the current scope with names, values, and types.

**Parameters:** `sessionId` (required)

**Requirements:** 3.1, 9.1, 9.3

### 14. debugger_get_global_variables

Get global variables accessible from the current scope.

**Parameters:** `sessionId` (required)

**Requirements:** 3.2, 9.1, 9.3

### 15. debugger_inspect_object

Inspect an object's properties with nested resolution up to specified depth.

**Parameters:** `sessionId` (required), `objectId` (required), `maxDepth` (optional, default: 2)

**Requirements:** 3.3, 9.1, 9.3

---

## Variable Watching

### 16. debugger_add_watch

Add an expression to the watch list for automatic evaluation on each pause.

**Parameters:** `sessionId` (required), `expression` (required)

**Requirements:** 3.5, 9.1

### 17. debugger_remove_watch

Remove an expression from the watch list.

**Parameters:** `sessionId` (required), `watchId` (required)

**Requirements:** 3.5, 9.1

### 18. debugger_get_watches

Get all watched expressions with current values and change detection.

**Parameters:** `sessionId` (required)

**Response:** Array of watches with watchId, expression, value, changed flag, oldValue, newValue

**Requirements:** 3.5, 9.1

---

## Call Stack Navigation

### 19. debugger_get_stack

Get the current call stack with function names, file locations (absolute paths), and line numbers.

**Parameters:** `sessionId` (required)

**Response:** Array of stack frames with function, file, line, column

**Requirements:** 4.1, 9.1, 9.4

### 20. debugger_switch_stack_frame

Switch the execution context to a specific stack frame by index (0 = top frame).

**Parameters:** `sessionId` (required), `frameIndex` (required)

**Requirements:** 4.2, 9.1

---

## Hang Detection

### 21. debugger_detect_hang

Detect if a process hangs or enters an infinite loop.

**Parameters:** `command` (required), `args` (optional), `cwd` (optional), `timeout` (required), `sampleInterval` (optional, default: 100)

**Example:** `{"command": "node", "args": ["script.js"], "timeout": 5000, "sampleInterval": 100}`

**Response (Hung):** `{"hung": true, "location": "/path/file.js:42", "stack": [...], "message": "...", "duration": 5000}`

**Response (Completed):** `{"hung": false, "completed": true, "exitCode": 0, "duration": 1234}`

**Requirements:** 5.1, 5.2, 5.3, 5.4, 9.1


---

## Debugging Scenarios

### Scenario 1: Basic Script Debugging

**Goal:** Debug a simple Node.js script

**Steps:**
1. `debugger_start` - Start the session
2. `debugger_set_breakpoint` - Set breakpoint at line of interest
3. `debugger_continue` - Run to breakpoint
4. `debugger_get_local_variables` - Inspect variables
5. `debugger_step_over` - Step through code
6. `debugger_stop_session` - Cleanup

### Scenario 2: Conditional Breakpoint

**Goal:** Pause only when a specific condition is true

**Steps:**
1. `debugger_start` - Start the session
2. `debugger_set_breakpoint` with condition: `{"condition": "count > 100"}`
3. `debugger_continue` - Run until condition is met
4. `debugger_inspect` - Evaluate expressions
5. `debugger_stop_session` - Cleanup

### Scenario 3: Infinite Loop Detection

**Goal:** Find where code is stuck in an infinite loop

**Steps:**
1. `debugger_detect_hang` with timeout and sample interval
2. Review the returned location and stack trace
3. Fix the loop condition

### Scenario 4: Test Debugging

**Goal:** Debug a failing Jest test

**Steps:**
1. `debugger_start` with Jest command: `{"command": "node", "args": ["node_modules/.bin/jest", "test.js", "--runInBand"]}`
2. `debugger_set_breakpoint` in test file
3. `debugger_continue` to breakpoint
4. `debugger_get_local_variables` - Check test state
5. `debugger_inspect` - Evaluate test assertions
6. `debugger_stop_session` - Cleanup

### Scenario 5: Variable Tracking

**Goal:** Track how a variable changes during execution

**Steps:**
1. `debugger_start` - Start the session
2. `debugger_add_watch` - Add variable to watch list
3. `debugger_set_breakpoint` at multiple locations
4. `debugger_continue` - Run to first breakpoint
5. `debugger_get_watches` - Check variable value
6. Repeat steps 4-5 for each breakpoint
7. `debugger_stop_session` - Cleanup

### Scenario 6: Call Stack Analysis

**Goal:** Understand the execution path leading to a point

**Steps:**
1. `debugger_start` - Start the session
2. `debugger_set_breakpoint` at the point of interest
3. `debugger_continue` - Run to breakpoint
4. `debugger_get_stack` - View the call stack
5. `debugger_switch_stack_frame` - Navigate to different frames
6. `debugger_get_local_variables` - Inspect variables in each frame
7. `debugger_stop_session` - Cleanup

### Scenario 7: TypeScript Debugging

**Goal:** Debug TypeScript code with source maps

**Steps:**
1. Ensure tsconfig.json has `"sourceMap": true`
2. `debugger_start` with `--enable-source-maps` flag
3. `debugger_set_breakpoint` using TypeScript file path
4. `debugger_continue` - Breakpoint automatically maps to compiled JS
5. `debugger_get_local_variables` - Variable names preserved from TS
6. `debugger_stop_session` - Cleanup

### Scenario 8: Object Inspection

**Goal:** Deeply inspect a complex object

**Steps:**
1. `debugger_start` - Start the session
2. `debugger_set_breakpoint` where object exists
3. `debugger_continue` - Run to breakpoint
4. `debugger_inspect` - Evaluate object expression, get objectId
5. `debugger_inspect_object` - Inspect with maxDepth
6. `debugger_stop_session` - Cleanup

---

## Error Codes Reference

### Session Errors

- **SESSION_NOT_FOUND**: Session ID doesn't exist or was terminated
- **SESSION_START_FAILED**: Failed to start the process or attach inspector

### Breakpoint Errors

- **BREAKPOINT_SET_FAILED**: Invalid file path, line number, or condition
- **BREAKPOINT_NOT_FOUND**: Breakpoint ID doesn't exist
- **REMOVE_BREAKPOINT_FAILED**: Failed to remove breakpoint
- **TOGGLE_BREAKPOINT_FAILED**: Failed to toggle breakpoint state
- **LIST_BREAKPOINTS_FAILED**: Failed to list breakpoints

### Execution Errors

- **CONTINUE_FAILED**: Session not paused or process terminated
- **STEP_OVER_FAILED**: Session not paused or at end of execution
- **STEP_INTO_FAILED**: Session not paused or no function to step into
- **STEP_OUT_FAILED**: Session not paused or already at top level
- **PAUSE_FAILED**: Session already paused or process terminated

### Inspection Errors

- **INSPECT_FAILED**: Invalid expression or session not paused
- **GET_STACK_FAILED**: Session not paused or no call frames
- **NOT_PAUSED**: Operation requires paused state
- **GET_LOCAL_VARIABLES_FAILED**: Session not paused or no local scope
- **GET_GLOBAL_VARIABLES_FAILED**: Session not paused or no global scope
- **INSPECT_OBJECT_FAILED**: Invalid object ID or object no longer exists

### Watch Errors

- **ADD_WATCH_FAILED**: Invalid expression
- **REMOVE_WATCH_FAILED**: Internal error
- **WATCH_NOT_FOUND**: Watch ID doesn't exist
- **GET_WATCHES_FAILED**: Internal error

### Frame Errors

- **SWITCH_FRAME_FAILED**: Invalid frame index or session not paused

### Hang Detection Errors

- **HANG_DETECTION_FAILED**: Failed to start process or attach inspector

### Cleanup Errors

- **STOP_SESSION_FAILED**: Session already stopped or internal error

---

## Quick Reference Table

| Tool | Purpose | Requires Paused | Returns Location |
|------|---------|----------------|------------------|
| debugger_start | Start session | No | No |
| debugger_stop_session | Stop session | No | No |
| debugger_set_breakpoint | Set breakpoint | No | No |
| debugger_remove_breakpoint | Remove breakpoint | No | No |
| debugger_toggle_breakpoint | Toggle breakpoint | No | No |
| debugger_list_breakpoints | List breakpoints | No | No |
| debugger_continue | Resume execution | Yes | No |
| debugger_step_over | Step over line | Yes | Yes |
| debugger_step_into | Step into function | Yes | Yes |
| debugger_step_out | Step out of function | Yes | Yes |
| debugger_pause | Pause execution | No | Yes |
| debugger_inspect | Evaluate expression | Yes | No |
| debugger_get_local_variables | Get local vars | Yes | No |
| debugger_get_global_variables | Get global vars | Yes | No |
| debugger_inspect_object | Inspect object | Yes | No |
| debugger_add_watch | Add watch | No | No |
| debugger_remove_watch | Remove watch | No | No |
| debugger_get_watches | Get watches | No | No |
| debugger_get_stack | Get call stack | Yes | No |
| debugger_switch_stack_frame | Switch frame | Yes | No |
| debugger_detect_hang | Detect hang | No | Yes (if hung) |

---

## Best Practices

1. **Always cleanup sessions** - Call `debugger_stop_session` when done
2. **Use absolute paths** - For file arguments and breakpoints
3. **Check verification** - Verify breakpoints are set correctly
4. **Handle errors** - Check response status and handle errors gracefully
5. **Set appropriate timeouts** - Based on expected execution time
6. **Use conditional breakpoints** - To reduce noise and focus on specific cases
7. **Track variable changes** - Use watches for important variables
8. **Navigate stack frames** - To understand execution context
9. **Enable source maps** - For TypeScript debugging
10. **Test hang detection** - Before running potentially problematic code

---

## See Also

- [README.md](./README.md) - User documentation and usage examples
- [API.md](./API.md) - Detailed API documentation with JSDoc
- [AI-AGENT-INTEGRATION.md](./AI-AGENT-INTEGRATION.md) - AI agent integration guide
- [VSCODE-INTEGRATION.md](./VSCODE-INTEGRATION.md) - VS Code extension guide
- [TESTING.md](./TESTING.md) - Testing documentation
