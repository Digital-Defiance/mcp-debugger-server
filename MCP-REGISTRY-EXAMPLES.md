# MCP ACS Debugger Server - Usage Examples and Configuration Templates

## Configuration Templates

### Kiro Configuration

Add to `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "debugger": {
      "command": "ts-mcp-server",
      "args": [],
      "env": {
        "NODE_ENV": "production"
      },
      "disabled": false,
      "autoApprove": [
        "debugger_start",
        "debugger_set_breakpoint",
        "debugger_continue",
        "debugger_step_over",
        "debugger_inspect",
        "debugger_get_stack"
      ]
    }
  }
}
```

### Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "debugger": {
      "command": "ts-mcp-server",
      "args": []
    }
  }
}
```

### VS Code Configuration

Add to `.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "debugger": {
      "command": "ts-mcp-server",
      "args": [],
      "enabled": true
    }
  }
}
```

### Docker Compose Configuration

```yaml
version: "3.8"
services:
  mcp-debugger:
    image: digitaldefiance/mcp-debugger-server:latest
    container_name: mcp-debugger
    restart: unless-stopped
    ports:
      - "9229:9229" # Inspector port
    environment:
      - NODE_ENV=production
    volumes:
      - ./workspace:/workspace
    working_dir: /workspace
```

## Usage Examples

### Example 1: Debug a Simple Node.js Script

```javascript
// Step 1: Start a debug session
{
  "tool": "debugger_start",
  "arguments": {
    "command": "node",
    "args": ["app.js"],
    "cwd": "/path/to/project",
    "timeout": 30000
  }
}
// Response: { "sessionId": "session-abc123", "state": "paused", "pid": 12345 }

// Step 2: Set a breakpoint
{
  "tool": "debugger_set_breakpoint",
  "arguments": {
    "sessionId": "session-abc123",
    "file": "/path/to/project/app.js",
    "line": 15
  }
}
// Response: { "breakpointId": "bp-1", "verified": true }

// Step 3: Continue execution
{
  "tool": "debugger_continue",
  "arguments": {
    "sessionId": "session-abc123"
  }
}
// Process runs until breakpoint is hit

// Step 4: Inspect local variables
{
  "tool": "debugger_get_local_variables",
  "arguments": {
    "sessionId": "session-abc123"
  }
}
// Response: { "variables": [{ "name": "user", "value": {...}, "type": "object" }] }

// Step 5: Step over to next line
{
  "tool": "debugger_step_over",
  "arguments": {
    "sessionId": "session-abc123"
  }
}

// Step 6: Stop the session
{
  "tool": "debugger_stop_session",
  "arguments": {
    "sessionId": "session-abc123"
  }
}
```

### Example 2: Debug a Failing Jest Test

```javascript
// Step 1: Start debugging a Jest test
{
  "tool": "debugger_start",
  "arguments": {
    "command": "node",
    "args": [
      "node_modules/.bin/jest",
      "user.test.js",
      "--runInBand",
      "--no-coverage"
    ],
    "cwd": "/path/to/project",
    "timeout": 60000
  }
}

// Step 2: Set breakpoint in test file
{
  "tool": "debugger_set_breakpoint",
  "arguments": {
    "sessionId": "session-xyz789",
    "file": "/path/to/project/user.test.js",
    "line": 42,
    "condition": "user.age > 18"
  }
}

// Step 3: Continue to breakpoint
{
  "tool": "debugger_continue",
  "arguments": {
    "sessionId": "session-xyz789"
  }
}

// Step 4: Evaluate test assertion
{
  "tool": "debugger_inspect",
  "arguments": {
    "sessionId": "session-xyz789",
    "expression": "expect.getState()"
  }
}

// Step 5: Get call stack to see test context
{
  "tool": "debugger_get_stack",
  "arguments": {
    "sessionId": "session-xyz789"
  }
}
```

### Example 3: Detect an Infinite Loop

```javascript
// Use hang detection to identify infinite loops
{
  "tool": "debugger_detect_hang",
  "arguments": {
    "command": "node",
    "args": ["potentially-hanging-script.js"],
    "cwd": "/path/to/project",
    "timeout": 5000,
    "sampleInterval": 100
  }
}

// Response (if hung):
{
  "hung": true,
  "location": "/path/to/project/script.js:25",
  "stack": [
    {
      "function": "infiniteLoop",
      "file": "/path/to/project/script.js",
      "line": 25,
      "column": 10
    }
  ],
  "message": "Process hung at /path/to/project/script.js:25",
  "duration": 5000
}

// Response (if completed normally):
{
  "hung": false,
  "completed": true,
  "exitCode": 0,
  "duration": 1234
}
```

### Example 4: Debug TypeScript Code with Source Maps

```javascript
// TypeScript debugging works automatically with source maps

// Step 1: Start debugging compiled TypeScript
{
  "tool": "debugger_start",
  "arguments": {
    "command": "node",
    "args": ["--enable-source-maps", "dist/app.js"],
    "cwd": "/path/to/project",
    "timeout": 30000
  }
}

// Step 2: Set breakpoint using TypeScript source file
{
  "tool": "debugger_set_breakpoint",
  "arguments": {
    "sessionId": "session-ts123",
    "file": "/path/to/project/src/app.ts",  // TypeScript source
    "line": 42
  }
}
// The debugger automatically maps to the compiled JavaScript location

// Step 3: Continue and inspect
{
  "tool": "debugger_continue",
  "arguments": {
    "sessionId": "session-ts123"
  }
}

// Step 4: Inspect variables (shows TypeScript names)
{
  "tool": "debugger_get_local_variables",
  "arguments": {
    "sessionId": "session-ts123"
  }
}
// Response shows original TypeScript variable names, not mangled JavaScript names
```

### Example 5: Watch Variable Changes

```javascript
// Step 1: Start session and set breakpoint
// ... (as in Example 1)

// Step 2: Add watched variables
{
  "tool": "debugger_add_watch",
  "arguments": {
    "sessionId": "session-watch123",
    "expression": "user.balance"
  }
}

{
  "tool": "debugger_add_watch",
  "arguments": {
    "sessionId": "session-watch123",
    "expression": "transaction.amount"
  }
}

// Step 3: Continue execution
{
  "tool": "debugger_continue",
  "arguments": {
    "sessionId": "session-watch123"
  }
}

// Step 4: Check watched variables at each pause
{
  "tool": "debugger_get_watches",
  "arguments": {
    "sessionId": "session-watch123"
  }
}

// Response:
{
  "watches": [
    {
      "watchId": "user.balance",
      "value": 150,
      "changed": true,
      "oldValue": 100,
      "newValue": 150
    },
    {
      "watchId": "transaction.amount",
      "value": 50,
      "changed": false
    }
  ]
}
```

### Example 6: Profile CPU Performance

```javascript
// Step 1: Start session
{
  "tool": "debugger_start",
  "arguments": {
    "command": "node",
    "args": ["performance-test.js"],
    "timeout": 60000
  }
}

// Step 2: Start CPU profiling
{
  "tool": "debugger_start_cpu_profile",
  "arguments": {
    "sessionId": "session-prof123"
  }
}

// Step 3: Continue execution
{
  "tool": "debugger_continue",
  "arguments": {
    "sessionId": "session-prof123"
  }
}

// Step 4: Stop profiling and get results
{
  "tool": "debugger_stop_cpu_profile",
  "arguments": {
    "sessionId": "session-prof123"
  }
}

// Response includes CPU profile data with:
// - Function call times
// - Call tree
// - Bottleneck identification
```

### Example 7: Analyze Memory Usage

```javascript
// Step 1: Start session
{
  "tool": "debugger_start",
  "arguments": {
    "command": "node",
    "args": ["memory-intensive-app.js"],
    "timeout": 60000
  }
}

// Step 2: Set breakpoint at suspected memory leak
{
  "tool": "debugger_set_breakpoint",
  "arguments": {
    "sessionId": "session-mem123",
    "file": "/path/to/app.js",
    "line": 100
  }
}

// Step 3: Continue to breakpoint
{
  "tool": "debugger_continue",
  "arguments": {
    "sessionId": "session-mem123"
  }
}

// Step 4: Take heap snapshot
{
  "tool": "debugger_take_heap_snapshot",
  "arguments": {
    "sessionId": "session-mem123"
  }
}

// Step 5: Get performance metrics
{
  "tool": "debugger_get_performance_metrics",
  "arguments": {
    "sessionId": "session-mem123"
  }
}

// Response includes:
// - Heap size
// - Memory usage
// - Object counts
// - Potential memory leaks
```

### Example 8: Navigate Call Stack

```javascript
// Step 1: Start session and hit breakpoint
// ... (as in Example 1)

// Step 2: Get call stack
{
  "tool": "debugger_get_stack",
  "arguments": {
    "sessionId": "session-stack123"
  }
}

// Response:
{
  "stack": [
    {
      "function": "processUser",
      "file": "/path/to/app.js",
      "line": 42,
      "column": 10
    },
    {
      "function": "handleRequest",
      "file": "/path/to/app.js",
      "line": 25,
      "column": 5
    },
    {
      "function": "main",
      "file": "/path/to/app.js",
      "line": 10,
      "column": 1
    }
  ]
}

// Step 3: Switch to parent frame
{
  "tool": "debugger_switch_stack_frame",
  "arguments": {
    "sessionId": "session-stack123",
    "frameIndex": 1  // Switch to handleRequest frame
  }
}

// Step 4: Inspect variables in parent frame
{
  "tool": "debugger_get_local_variables",
  "arguments": {
    "sessionId": "session-stack123"
  }
}
// Now shows variables from handleRequest function
```

### Example 9: Conditional Breakpoints

```javascript
// Set breakpoint that only triggers when condition is true
{
  "tool": "debugger_set_breakpoint",
  "arguments": {
    "sessionId": "session-cond123",
    "file": "/path/to/app.js",
    "line": 50,
    "condition": "user.age > 18 && user.verified === true"
  }
}

// The breakpoint will only pause when:
// - user.age is greater than 18
// - AND user.verified is true
```

### Example 10: Inspect Complex Objects

```javascript
// Step 1: Evaluate expression to get object
{
  "tool": "debugger_inspect",
  "arguments": {
    "sessionId": "session-obj123",
    "expression": "user"
  }
}

// Response:
{
  "value": {
    "name": "John",
    "age": 30,
    "address": "[Object]"
  },
  "type": "object",
  "objectId": "obj-abc123"
}

// Step 2: Inspect nested object
{
  "tool": "debugger_inspect_object",
  "arguments": {
    "sessionId": "session-obj123",
    "objectId": "obj-abc123",
    "maxDepth": 3
  }
}

// Response includes full nested structure:
{
  "name": "John",
  "age": 30,
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "coordinates": {
      "lat": 42.1234,
      "lng": -71.5678
    }
  }
}
```

## Common Workflows

### Workflow 1: Debug Production Issue

1. Start session with production-like environment
2. Set breakpoints at suspected problem areas
3. Continue execution to reproduce issue
4. Inspect variables and call stack
5. Step through code to identify root cause
6. Stop session and apply fix

### Workflow 2: Performance Optimization

1. Start session with performance test
2. Start CPU profiling
3. Run performance-critical code
4. Stop profiling and analyze results
5. Take heap snapshots at key points
6. Identify bottlenecks and memory leaks
7. Optimize and re-test

### Workflow 3: Test-Driven Debugging

1. Start session with failing test
2. Set breakpoint at test assertion
3. Continue to breakpoint
4. Inspect test state and variables
5. Step through test execution
6. Identify why test fails
7. Fix code and verify test passes

## Best Practices

### 1. Use Absolute Paths

Always use absolute file paths for breakpoints to avoid ambiguity:

```javascript
// Good
"file": "/absolute/path/to/project/app.js"

// Avoid
"file": "app.js"
```

### 2. Set Appropriate Timeouts

Adjust timeouts based on expected execution time:

```javascript
// Short timeout for unit tests
"timeout": 10000  // 10 seconds

// Longer timeout for integration tests
"timeout": 60000  // 60 seconds
```

### 3. Use Conditional Breakpoints

Reduce noise by using conditions:

```javascript
"condition": "i > 1000"  // Only break after 1000 iterations
```

### 4. Clean Up Sessions

Always stop sessions when done:

```javascript
{
  "tool": "debugger_stop_session",
  "arguments": {
    "sessionId": "session-id"
  }
}
```

### 5. Enable Source Maps for TypeScript

Ensure source maps are enabled:

```bash
node --enable-source-maps dist/app.js
```

## Troubleshooting

### Issue: Breakpoint Not Hitting

**Solution**: Verify file path is absolute and line has executable code

### Issue: Session Timeout

**Solution**: Increase timeout parameter or check for infinite loops

### Issue: TypeScript Breakpoints Not Working

**Solution**: Ensure source maps are enabled and .map files exist

### Issue: Variables Not Visible

**Solution**: Ensure session is paused before inspecting variables

## Additional Resources

- **Full Documentation**: See README.md for comprehensive documentation
- **API Reference**: See API.md for detailed API documentation
- **Tool Reference**: See TOOL-REFERENCE.md for complete tool reference
- **GitHub**: <https://github.com/digital-defiance/ai-capabilities-suite>
- **NPM**: <https://www.npmjs.com/package/@ai-capabilities-suite/mcp-debugger-server>
