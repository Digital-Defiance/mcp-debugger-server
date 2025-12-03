# MCP Debugger Server - E2E Testing Guide

This document provides comprehensive instructions for running and troubleshooting E2E tests for the MCP Debugger Server.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Running E2E Tests](#running-e2e-tests)
- [Manual Testing](#manual-testing)
- [Using MCP Inspector](#using-mcp-inspector)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before running E2E tests, ensure you have:

1. **Node.js 16+** installed
2. **Built packages**: Run `npx nx build @ai-capabilities-suite/mcp-server` to build both the core and server packages
3. **Test fixtures**: The test fixtures are located in `packages/debugger-core/test-fixtures/`

## Running E2E Tests

### Automated E2E Tests

The E2E test suite validates the MCP protocol implementation and all debugging tools.

```bash
# Run all E2E tests
npx nx test @ai-capabilities-suite/mcp-server --testPathPattern=e2e

# Run with increased timeout (recommended)
npx nx test @ai-capabilities-suite/mcp-server --testPathPattern=e2e --testTimeout=60000

# Run a specific test
npx nx test @ai-capabilities-suite/mcp-server --testPathPattern="should detect a hanging process"
```

### Test Coverage

The E2E test suite covers:

1. **MCP Protocol Initialization** (1 test)
   - Server initialization with protocol version and capabilities

2. **Tool Discovery** (2 tests)
   - Listing all available tools
   - Validating tool schemas

3. **Hang Detection** (2 tests)
   - Detecting infinite loops
   - Detecting normal completion without false positives

4. **Debug Session Management** (1 test)
   - Starting debug sessions with paused state

5. **Session Operations** (5 tests)
   - Setting breakpoints
   - Continuing execution
   - Stepping over code
   - Inspecting variables
   - Getting call stacks

6. **Error Handling** (4 tests)
   - Invalid session IDs
   - Missing required parameters
   - Invalid tool names
   - Proper error response structure

**Total: 15 tests**

### Expected Results

All tests should pass:

```
Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
```

## Manual Testing

For interactive testing with colored output and clear pass/fail indicators, use the manual testing script:

```bash
# Make the script executable (first time only)
chmod +x packages/mcp-server/test-mcp-manual.js

# Run manual tests
node packages/mcp-server/test-mcp-manual.js
```

The manual testing script provides:
- ✓ Green checkmarks for passing tests
- ✗ Red X marks for failing tests
- ℹ Blue info messages
- ⚠ Yellow warnings
- Detailed test output with response data
- Summary with success rate percentage

### Manual Test Coverage

The manual script tests:
1. Protocol initialization
2. Tool discovery
3. Hang detection (infinite loop)
4. Debug session start
5. Breakpoint setting
6. Error handling

## Using MCP Inspector

The MCP Inspector is a tool for interactively testing MCP servers. It's particularly useful for debugging protocol issues.

### Installation

```bash
npm install -g @modelcontextprotocol/inspector
```

### Usage

1. **Start the MCP server**:
   ```bash
   node packages/mcp-server/dist/src/index.js
   ```

2. **In another terminal, use the inspector**:
   ```bash
   mcp-inspector
   ```

3. **Connect to the server** using stdio transport

4. **Test tools interactively**:
   - View available tools
   - Call tools with custom parameters
   - Inspect responses in real-time

### Example Inspector Session

```json
// Initialize
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {"name": "inspector", "version": "1.0.0"}
  }
}

// List tools
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}

// Call debugger_detect_hang
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "debugger_detect_hang",
    "arguments": {
      "command": "node",
      "args": ["test-fixtures/infinite-loop.js"],
      "timeout": 2000,
      "sampleInterval": 100
    }
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Build Errors

**Problem**: Tests fail with "Cannot find module" errors

**Solution**:
```bash
# Clean and rebuild
rm -rf packages/*/dist
npx nx build @ai-capabilities-suite/mcp-core
npx nx build @ai-capabilities-suite/mcp-server
```

#### 2. Test Timeouts

**Problem**: Tests timeout with "Request timeout for X" errors

**Solution**:
- Increase test timeout: `--testTimeout=60000`
- Check if the server is starting correctly
- Look for stderr output in test logs

#### 3. WebSocket Connection Issues

**Problem**: "ws_1.default is not a constructor" or similar WebSocket errors

**Solution**:
- Ensure you're using CommonJS module format
- Check that `ws` package is properly installed
- Verify tsconfig.json has `"module": "CommonJS"`

#### 4. False Positive Hang Detection

**Problem**: Normal completion scripts are detected as hung

**Solution**:
- Increase the timeout parameter in hang detection calls
- The default 2000ms may be too short for some scripts
- Use 5000ms or higher for scripts with I/O operations

#### 5. Session State Issues

**Problem**: "Cannot step over in state: running" or "Process must be paused"

**Solution**:
- Ensure the process is paused before calling step/inspect operations
- Set breakpoints and continue to them before stepping
- Wait for breakpoint events after calling continue

### Debug Logging

Enable debug logging to see detailed server output:

```bash
# Run tests with server stderr visible
npx nx test @ai-capabilities-suite/mcp-server --testPathPattern=e2e 2>&1 | grep -A 5 "Server stderr"
```

### Checking Server Health

Test if the server responds to basic requests:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node packages/mcp-server/dist/src/index.js
```

Expected output:
```json
{"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{"listChanged":true}},"serverInfo":{"name":"debugger-server","version":"1.0.0"}},"jsonrpc":"2.0","id":1}
```

### Test Fixtures

If tests fail due to missing fixtures, verify they exist:

```bash
ls -la packages/debugger-core/test-fixtures/
```

Required fixtures:
- `infinite-loop.js` - For hang detection tests
- `normal-completion.js` - For normal completion tests
- `simple-script.js` - For basic debugging tests
- `step-test-simple.js` - For step operation tests

### Getting Help

If you encounter issues not covered here:

1. Check the test output for specific error messages
2. Review the server stderr output
3. Verify all dependencies are installed: `npm install`
4. Ensure Node.js version is 16 or higher: `node --version`
5. Check that the build completed successfully

## Continuous Integration

For CI/CD pipelines, use:

```bash
# Build and test in one command
npx nx build @ai-capabilities-suite/mcp-server && \
npx nx test @ai-capabilities-suite/mcp-server --testPathPattern=e2e --testTimeout=60000
```

### CI Best Practices

1. **Always build before testing**: E2E tests require built artifacts
2. **Use adequate timeouts**: CI environments may be slower
3. **Cache node_modules**: Speed up builds with dependency caching
4. **Run tests in isolation**: Each test should be independent
5. **Collect test artifacts**: Save test logs and coverage reports

## Performance Benchmarks

Expected test execution times (approximate):

- Protocol initialization: < 20ms
- Tool discovery: < 10ms
- Hang detection (infinite loop): ~2.5s
- Hang detection (normal): ~500ms
- Debug session start: ~200ms
- Session operations: ~100-500ms each
- Error handling: < 10ms

**Total suite execution**: ~6-8 seconds

## Next Steps

After E2E tests pass:

1. Run unit tests: `npx nx test @ai-capabilities-suite/mcp-core`
2. Run property-based tests (if implemented)
3. Test with real-world debugging scenarios
4. Integrate with MCP clients (Kiro, VS Code, etc.)
5. Deploy to production environment

## Additional Resources

- [MCP Protocol Specification](https://modelcontextprotocol.io/docs)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Node.js Inspector API](https://nodejs.org/api/inspector.html)
