# MCP ACS Debugger Server - Registry Description

## Overview

The **MCP ACS Debugger Server** is an enterprise-grade Model Context Protocol (MCP) server that provides comprehensive debugging capabilities for Node.js and TypeScript applications. It enables AI agents to interactively debug code through 25+ specialized tools, offering everything from basic breakpoint management to advanced CPU/memory profiling and hang detection.

## Key Features

### 🎯 Core Debugging Capabilities

- **Breakpoint Management**: Set, remove, toggle, and list breakpoints with optional conditions
- **Execution Control**: Continue, step over, step into, step out, and pause execution
- **Variable Inspection**: Inspect local and global variables, evaluate expressions, and watch variables
- **Call Stack Navigation**: View and navigate through call stack frames with context switching

### 🚀 Advanced Features

- **Hang Detection**: Detect infinite loops and hanging processes with configurable timeouts and sampling
- **TypeScript Support**: Full source map support for debugging TypeScript code with original source locations
- **Performance Profiling**: CPU profiling, memory profiling, and heap snapshots for performance analysis
- **Test Framework Integration**: Debug Jest, Mocha, and Vitest tests with full debugging capabilities
- **Session Management**: Support for multiple concurrent debug sessions with complete isolation

### 🏢 Enterprise Features

- **Observability**: Structured logging, metrics collection, and health check endpoints
- **Security**: Authentication, rate limiting, sensitive data masking, and audit logging
- **Production Ready**: Circuit breakers, retry logic, graceful shutdown, and resource limits
- **Monitoring**: Prometheus metrics export and performance timeline tracking

## Available Tools (25 Total)

### Session Management (2 tools)

1. **debugger_start** - Start a new debug session with a Node.js process
2. **debugger_stop_session** - Stop a debug session and cleanup all resources

### Breakpoint Management (4 tools)

3. **debugger_set_breakpoint** - Set a breakpoint at a specific file and line number with optional condition
4. **debugger_remove_breakpoint** - Remove a breakpoint from the session
5. **debugger_toggle_breakpoint** - Toggle a breakpoint between enabled and disabled states
6. **debugger_list_breakpoints** - Get all breakpoints for a debug session

### Execution Control (5 tools)

7. **debugger_continue** - Resume execution until the next breakpoint or program termination
8. **debugger_step_over** - Execute the current line and pause at the next line in the same scope
9. **debugger_step_into** - Execute the current line and pause at the first line inside any called function
10. **debugger_step_out** - Execute until the current function returns and pause at the calling location
11. **debugger_pause** - Pause a running debug session

### Variable Inspection (4 tools)

12. **debugger_inspect** - Evaluate a JavaScript expression in the current execution context
13. **debugger_get_local_variables** - Get all local variables in the current scope
14. **debugger_get_global_variables** - Get global variables accessible from the current scope
15. **debugger_inspect_object** - Inspect an object's properties with nested resolution

### Variable Watching (3 tools)

16. **debugger_add_watch** - Add an expression to the watch list
17. **debugger_remove_watch** - Remove an expression from the watch list
18. **debugger_get_watches** - Get all watched expressions with their current values

### Call Stack (2 tools)

19. **debugger_get_stack** - Get the current call stack with function names and file locations
20. **debugger_switch_stack_frame** - Switch the execution context to a specific stack frame

### Hang Detection (1 tool)

21. **debugger_detect_hang** - Detect if a process hangs or enters an infinite loop

### Performance Profiling (4 tools)

22. **debugger_start_cpu_profile** - Start CPU profiling for performance analysis
23. **debugger_stop_cpu_profile** - Stop CPU profiling and get profile data
24. **debugger_take_heap_snapshot** - Take a heap snapshot for memory analysis
25. **debugger_get_performance_metrics** - Get performance metrics for the debug session

## Use Cases

### 1. Debugging Failing Tests

Debug Jest, Mocha, or Vitest tests by setting breakpoints in test files, inspecting test state, and stepping through test execution to identify failures.

### 2. Investigating Production Issues

Use hang detection to identify infinite loops or hanging processes, and inspect call stacks to understand where code is stuck.

### 3. Performance Optimization

Profile CPU usage and memory allocation to identify performance bottlenecks, analyze heap snapshots to detect memory leaks, and track performance metrics over time.

### 4. TypeScript Debugging

Debug TypeScript applications with full source map support, set breakpoints in TypeScript files, and inspect variables with their original TypeScript names.

### 5. AI-Assisted Debugging

Enable AI agents (Kiro, Amazon Q, GitHub Copilot) to autonomously debug code by providing them with comprehensive debugging capabilities through the MCP protocol.

## Technical Details

### Architecture

- **Protocol**: Model Context Protocol (MCP) over stdio transport
- **Debugging Protocol**: Chrome DevTools Protocol (CDP) / Node.js Inspector Protocol
- **Communication**: WebSocket connection to Node.js Inspector
- **Language**: TypeScript with full type safety

### Requirements

- **Node.js**: >= 18.0.0
- **Operating Systems**: macOS, Linux, Windows
- **CPU Architectures**: x64, arm64

### Integration

The server integrates seamlessly with:

- **AI Agents**: Kiro, Amazon Q, GitHub Copilot
- **IDEs**: VS Code (via extension)
- **Test Frameworks**: Jest, Mocha, Vitest
- **Monitoring**: Prometheus, custom metrics endpoints

## Installation

### NPM (Recommended)

```bash
npm install -g @ai-capabilities-suite/mcp-debugger-server
```

### Docker

```bash
docker pull digitaldefiance/mcp-debugger-server:latest
```

### Configuration

Add to your MCP configuration file (`.kiro/settings/mcp.json`):

```json
{
  "mcpServers": {
    "debugger": {
      "command": "ts-mcp-server",
      "args": [],
      "disabled": false
    }
  }
}
```

## Documentation

- **README**: Comprehensive user documentation with examples
- **API Documentation**: Detailed API reference with JSDoc comments
- **Tool Reference**: Complete tool reference with parameters and examples
- **AI Agent Integration Guide**: Integration patterns for AI agents
- **VS Code Integration Guide**: VS Code extension setup and usage
- **Testing Guide**: Testing documentation and examples

## Support & Community

- **GitHub Repository**: <https://github.com/digital-defiance/ai-capabilities-suite>
- **Issues**: <https://github.com/digital-defiance/ai-capabilities-suite/issues>
- **NPM Package**: <https://www.npmjs.com/package/@ai-capabilities-suite/mcp-debugger-server>
- **Email**: <info@digitaldefiance.org>

## License

MIT License - See LICENSE file for details

## Author

**Digital Defiance**

- Website: <https://digitaldefiance.org>
- Email: <info@digitaldefiance.org>
- GitHub: <https://github.com/digital-defiance>

## Version

Current Version: 1.0.0

## Keywords

debugging, debugger, typescript, nodejs, breakpoints, profiling, performance, inspector-protocol, chrome-devtools-protocol, hang-detection, source-maps, variable-inspection, execution-control, test-debugging, enterprise, observability, mcp, mcp-server, model-context-protocol
