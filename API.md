# MCP Debugger Server - API Documentation

## Overview

This document provides detailed API documentation for the MCP Debugger Server, including JSDoc-style documentation for all public APIs, CDP protocol interactions, and error codes.

## Table of Contents

- [Core Classes](#core-classes)
- [CDP Protocol Interactions](#cdp-protocol-interactions)
- [Error Codes](#error-codes)
- [Type Definitions](#type-definitions)

## Core Classes

### McpDebuggerServer

The main server class that implements the MCP protocol and exposes debugging tools.

```typescript
/**
 * MCP Debugger Server
 * 
 * Provides debugging capabilities for Node.js and TypeScript applications
 * through the Model Context Protocol.
 * 
 * @class McpDebuggerServer
 * @example
 * ```typescript
 * const server = new McpDebuggerServer();
 * await server.start();
 * ```
 */
class McpDebuggerServer {
  /**
   * Creates a new MCP Debugger Server instance
   * 
   * Initializes the MCP server with debugging capabilities and registers
   * all available debugging tools.
   * 
   * @constructor
   */
  constructor();

  /**
   * Start the MCP server
   * 
   * Connects the server to stdio transport and begins listening for
   * MCP protocol messages.
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If the server fails to start
   */
  async start(): Promise<void>;

  /**
   * Stop the MCP server and cleanup all sessions
   * 
   * Terminates all active debug sessions, disconnects from all processes,
   * and closes the MCP server connection.
   * 
   * @async
   * @returns {Promise<void>}
   */
  async stop(): Promise<void>;
}
```

### SessionManager

Manages multiple concurrent debug sessions.

```typescript
/**
 * Session Manager
 * 
 * Manages the lifecycle of debug sessions, including creation, retrieval,
 * and cleanup. Ensures session isolation and resource management.
 * 
 * @class SessionManager
 */
class SessionManager {
  /**
   * Create a new debug session
   * 
   * Spawns a Node.js process with the Inspector Protocol attached and
   * creates a new DebugSession instance to manage it.
   * 
   * @async
   * @param {DebugSessionConfig} config - Session configuration
   * @returns {Promise<DebugSession>} The created debug session
   * @throws {Error} If the process fails to start or inspector fails to attach
   * 
   * @example
   * ```typescript
   * const session = await sessionManager.createSession({
   *   command: 'node',
   *   args: ['app.js'],
   *   timeout: 30000
   * });
   * ```
   */
  async createSession(config: DebugSessionConfig): Promise<DebugSession>;

  /**
   * Get an existing debug session by ID
   * 
   * @param {string} sessionId - The session ID
   * @returns {DebugSession | null} The session or null if not found
   */
  getSession(sessionId: string): DebugSession | null;

  /**
   * Remove a debug session and cleanup resources
   * 
   * Terminates the process, disconnects the inspector, and removes
   * the session from the manager.
   * 
   * @async
   * @param {string} sessionId - The session ID to remove
   * @returns {Promise<void>}
   */
  async removeSession(sessionId: string): Promise<void>;

  /**
   * Cleanup all active sessions
   * 
   * Called during server shutdown to ensure all resources are released.
   * 
   * @async
   * @returns {Promise<void>}
   */
  async cleanupAll(): Promise<void>;
}
```

### DebugSession

Represents a single debug session with a Node.js process.

```typescript
/**
 * Debug Session
 * 
 * Manages a single debugging session with a Node.js process, including
 * breakpoints, execution control, and variable inspection.
 * 
 * @class DebugSession
 */
class DebugSession {
  /**
   * Session unique identifier
   * @type {string}
   */
  readonly id: string;

  /**
   * Set a breakpoint at a specific location
   * 
   * Uses the Chrome DevTools Protocol to set a breakpoint. If a condition
   * is provided, the breakpoint will only pause when the condition evaluates
   * to true.
   * 
   * @async
   * @param {string} file - Absolute or relative file path
   * @param {number} line - Line number (1-indexed)
   * @param {string} [condition] - Optional condition expression
   * @returns {Promise<Breakpoint>} The created breakpoint
   * @throws {Error} If the breakpoint cannot be set
   * 
   * @example
   * ```typescript
   * const bp = await session.setBreakpoint('/path/to/file.js', 42, 'x > 10');
   * ```
   */
  async setBreakpoint(
    file: string,
    line: number,
    condition?: string
  ): Promise<Breakpoint>;

  /**
   * Remove a breakpoint by ID
   * 
   * @async
   * @param {string} breakpointId - The breakpoint ID
   * @returns {Promise<boolean>} True if removed, false if not found
   */
  async removeBreakpoint(breakpointId: string): Promise<boolean>;

  /**
   * Toggle a breakpoint's enabled state
   * 
   * @async
   * @param {string} breakpointId - The breakpoint ID
   * @returns {Promise<Breakpoint | null>} The updated breakpoint or null
   */
  async toggleBreakpoint(breakpointId: string): Promise<Breakpoint | null>;

  /**
   * Get all breakpoints in this session
   * 
   * @returns {Breakpoint[]} Array of all breakpoints
   */
  getAllBreakpoints(): Breakpoint[];

  /**
   * Resume execution until the next breakpoint or program termination
   * 
   * Sends the Debugger.resume CDP command to continue execution.
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If the session is not paused
   */
  async resume(): Promise<void>;

  /**
   * Step over the current line
   * 
   * Executes the current line and pauses at the next line in the same scope.
   * Uses the Debugger.stepOver CDP command.
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If the session is not paused
   */
  async stepOver(): Promise<void>;

  /**
   * Step into the current line
   * 
   * Executes the current line and pauses at the first line inside any
   * called function. Uses the Debugger.stepInto CDP command.
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If the session is not paused
   */
  async stepInto(): Promise<void>;

  /**
   * Step out of the current function
   * 
   * Executes until the current function returns and pauses at the calling
   * location. Uses the Debugger.stepOut CDP command.
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If the session is not paused
   */
  async stepOut(): Promise<void>;

  /**
   * Pause execution
   * 
   * Interrupts the running process and pauses at the current execution point.
   * Uses the Debugger.pause CDP command.
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If the session is already paused
   */
  async pause(): Promise<void>;

  /**
   * Evaluate an expression in the current execution context
   * 
   * Uses Debugger.evaluateOnCallFrame to evaluate the expression in the
   * context of the current call frame.
   * 
   * @async
   * @param {string} expression - JavaScript expression to evaluate
   * @returns {Promise<EvaluationResult>} The evaluation result
   * @throws {Error} If evaluation fails or session is not paused
   * 
   * @example
   * ```typescript
   * const result = await session.evaluateExpression('user.name + " " + user.age');
   * console.log(result.value); // "John 30"
   * ```
   */
  async evaluateExpression(expression: string): Promise<EvaluationResult>;

  /**
   * Get the current call stack
   * 
   * Returns the complete call stack with function names, file locations
   * (absolute paths), and line numbers.
   * 
   * @async
   * @returns {Promise<StackFrame[]>} Array of stack frames
   * @throws {Error} If the session is not paused
   */
  async getCallStack(): Promise<StackFrame[]>;

  /**
   * Switch to a different stack frame
   * 
   * Changes the context for variable inspection to the specified frame.
   * Frame 0 is the top frame (current location).
   * 
   * @param {number} frameIndex - The frame index (0-based)
   * @throws {Error} If the frame index is invalid
   */
  switchToFrame(frameIndex: number): void;

  /**
   * Get object properties
   * 
   * Uses Runtime.getProperties CDP command to retrieve all properties
   * of an object by its object ID.
   * 
   * @async
   * @param {string} objectId - The object ID from a previous inspection
   * @returns {Promise<Property[]>} Array of object properties
   */
  async getObjectProperties(objectId: string): Promise<Property[]>;

  /**
   * Inspect an object with nested resolution
   * 
   * Recursively inspects an object up to the specified depth, resolving
   * nested objects and arrays.
   * 
   * @async
   * @param {string} objectId - The object ID
   * @param {number} maxDepth - Maximum depth to traverse (default: 2)
   * @returns {Promise<any>} The inspected object data
   */
  async inspectObject(objectId: string, maxDepth: number): Promise<any>;

  /**
   * Add a watched variable
   * 
   * Adds an expression to the watch list. The expression will be evaluated
   * each time the process pauses.
   * 
   * @param {WatchedVariable} watch - The watch configuration
   */
  addWatchedVariable(watch: WatchedVariable): void;

  /**
   * Remove a watched variable
   * 
   * @param {string} watchId - The watch ID (expression)
   * @returns {boolean} True if removed, false if not found
   */
  removeWatchedVariable(watchId: string): boolean;

  /**
   * Get all watched variables
   * 
   * @returns {WatchedVariable[]} Array of watched variables
   */
  getAllWatchedVariables(): WatchedVariable[];

  /**
   * Get watched variable changes since last pause
   * 
   * @returns {Map<string, VariableChange>} Map of variable changes
   */
  getWatchedVariableChanges(): Map<string, VariableChange>;

  /**
   * Get the current session state
   * 
   * @returns {'paused' | 'running' | 'terminated'} The session state
   */
  getState(): 'paused' | 'running' | 'terminated';

  /**
   * Check if the session is paused
   * 
   * @returns {boolean} True if paused
   */
  isPaused(): boolean;

  /**
   * Get the Node.js process
   * 
   * @returns {ChildProcess | null} The process or null if terminated
   */
  getProcess(): ChildProcess | null;
}
```

### HangDetector

Detects hanging processes and infinite loops.

```typescript
/**
 * Hang Detector
 * 
 * Monitors process execution to detect hangs and infinite loops using
 * timeout-based detection and periodic call stack sampling.
 * 
 * @class HangDetector
 */
class HangDetector {
  /**
   * Detect if a process hangs or enters an infinite loop
   * 
   * Starts a debug session and monitors execution. If the process doesn't
   * complete within the timeout, or if the execution location remains
   * unchanged across multiple samples, a hang is detected.
   * 
   * @async
   * @param {HangDetectionConfig} config - Detection configuration
   * @returns {Promise<HangDetectionResult>} The detection result
   * 
   * @example
   * ```typescript
   * const result = await hangDetector.detectHang({
   *   command: 'node',
   *   args: ['script.js'],
   *   timeout: 5000,
   *   sampleInterval: 100
   * });
   * 
   * if (result.hung) {
   *   console.log('Hung at:', result.location);
   *   console.log('Stack:', result.stack);
   * }
   * ```
   */
  async detectHang(config: HangDetectionConfig): Promise<HangDetectionResult>;
}
```

## CDP Protocol Interactions

The MCP Debugger Server uses the Chrome DevTools Protocol (CDP) to communicate with the Node.js Inspector. Below are the key CDP domains and commands used.

### Debugger Domain

The Debugger domain provides debugging functionality.

#### Debugger.enable
Enables the debugger for the target.

**CDP Command:**
```json
{
  "method": "Debugger.enable"
}
```

**Usage:**
Called during session initialization to enable debugging capabilities.

#### Debugger.setBreakpointByUrl
Sets a breakpoint at a specific URL and line number.

**CDP Command:**
```json
{
  "method": "Debugger.setBreakpointByUrl",
  "params": {
    "lineNumber": 41,
    "url": "file:///path/to/file.js",
    "columnNumber": 0,
    "condition": "x > 10"
  }
}
```

**Response:**
```json
{
  "breakpointId": "1:41:0:file:///path/to/file.js",
  "locations": [
    {
      "scriptId": "123",
      "lineNumber": 41,
      "columnNumber": 0
    }
  ]
}
```

**Usage:**
Called by `setBreakpoint()` to create breakpoints.

#### Debugger.removeBreakpoint
Removes a breakpoint by ID.

**CDP Command:**
```json
{
  "method": "Debugger.removeBreakpoint",
  "params": {
    "breakpointId": "1:41:0:file:///path/to/file.js"
  }
}
```

**Usage:**
Called by `removeBreakpoint()` to delete breakpoints.

#### Debugger.resume
Resumes execution.

**CDP Command:**
```json
{
  "method": "Debugger.resume"
}
```

**Usage:**
Called by `resume()` to continue execution.

#### Debugger.stepOver
Steps over the current line.

**CDP Command:**
```json
{
  "method": "Debugger.stepOver"
}
```

**Usage:**
Called by `stepOver()` to execute the current line and pause at the next.

#### Debugger.stepInto
Steps into the current line.

**CDP Command:**
```json
{
  "method": "Debugger.stepInto"
}
```

**Usage:**
Called by `stepInto()` to step into function calls.

#### Debugger.stepOut
Steps out of the current function.

**CDP Command:**
```json
{
  "method": "Debugger.stepOut"
}
```

**Usage:**
Called by `stepOut()` to return from the current function.

#### Debugger.pause
Pauses execution.

**CDP Command:**
```json
{
  "method": "Debugger.pause"
}
```

**Usage:**
Called by `pause()` to interrupt running execution.

#### Debugger.evaluateOnCallFrame
Evaluates an expression in the context of a call frame.

**CDP Command:**
```json
{
  "method": "Debugger.evaluateOnCallFrame",
  "params": {
    "callFrameId": "frame-id",
    "expression": "user.name",
    "returnByValue": true
  }
}
```

**Response:**
```json
{
  "result": {
    "type": "string",
    "value": "John"
  }
}
```

**Usage:**
Called by `evaluateExpression()` to evaluate expressions.

#### Debugger.paused (Event)
Fired when execution pauses.

**CDP Event:**
```json
{
  "method": "Debugger.paused",
  "params": {
    "reason": "breakpoint",
    "callFrames": [
      {
        "callFrameId": "frame-id",
        "functionName": "myFunction",
        "location": {
          "scriptId": "123",
          "lineNumber": 41,
          "columnNumber": 0
        },
        "scopeChain": [...]
      }
    ]
  }
}
```

**Usage:**
Listened to by the session to update state and call frames.

#### Debugger.resumed (Event)
Fired when execution resumes.

**CDP Event:**
```json
{
  "method": "Debugger.resumed"
}
```

**Usage:**
Listened to by the session to update state.

### Runtime Domain

The Runtime domain provides runtime information and object inspection.

#### Runtime.enable
Enables the runtime for the target.

**CDP Command:**
```json
{
  "method": "Runtime.enable"
}
```

**Usage:**
Called during session initialization.

#### Runtime.getProperties
Gets properties of an object.

**CDP Command:**
```json
{
  "method": "Runtime.getProperties",
  "params": {
    "objectId": "object-id",
    "ownProperties": true
  }
}
```

**Response:**
```json
{
  "result": [
    {
      "name": "propertyName",
      "value": {
        "type": "string",
        "value": "propertyValue"
      }
    }
  ]
}
```

**Usage:**
Called by `getObjectProperties()` and `inspectObject()`.

## Error Codes

All error responses follow this structure:

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

### Session Errors

#### SESSION_NOT_FOUND
**Description:** The specified session ID doesn't exist.

**Causes:**
- Invalid session ID provided
- Session was already terminated
- Session expired

**Resolution:**
- Verify the session ID is correct
- Start a new session with `debugger_start`

#### SESSION_START_FAILED
**Description:** Failed to start the debug session.

**Causes:**
- Invalid command or arguments
- Process failed to spawn
- Inspector failed to attach
- Timeout waiting for inspector

**Resolution:**
- Verify the command and arguments are correct
- Check that Node.js is installed and accessible
- Increase the timeout parameter
- Check process stderr for error messages

### Breakpoint Errors

#### BREAKPOINT_SET_FAILED
**Description:** Failed to set the breakpoint.

**Causes:**
- Invalid file path
- Line number out of range
- Script not loaded yet
- Invalid condition expression

**Resolution:**
- Use absolute file paths
- Verify the line number is valid
- Wait for the script to load before setting breakpoints
- Check the condition expression syntax

#### BREAKPOINT_NOT_FOUND
**Description:** The specified breakpoint doesn't exist.

**Causes:**
- Invalid breakpoint ID
- Breakpoint was already removed

**Resolution:**
- Use `debugger_list_breakpoints` to get valid breakpoint IDs
- Verify the breakpoint wasn't already removed

### Execution Errors

#### CONTINUE_FAILED
**Description:** Failed to resume execution.

**Causes:**
- Session is not paused
- Process has terminated
- CDP command failed

**Resolution:**
- Ensure the session is paused before calling continue
- Check if the process is still running

#### STEP_OVER_FAILED
**Description:** Failed to step over.

**Causes:**
- Session is not paused
- Process has terminated
- At the end of execution

**Resolution:**
- Ensure the session is paused
- Check if there are more lines to execute

#### STEP_INTO_FAILED
**Description:** Failed to step into.

**Causes:**
- Session is not paused
- No function call on current line
- Process has terminated

**Resolution:**
- Ensure the session is paused
- Verify there's a function call to step into

#### STEP_OUT_FAILED
**Description:** Failed to step out.

**Causes:**
- Session is not paused
- Already at the top level
- Process has terminated

**Resolution:**
- Ensure the session is paused
- Verify you're inside a function

#### PAUSE_FAILED
**Description:** Failed to pause execution.

**Causes:**
- Session is already paused
- Process has terminated
- CDP command failed

**Resolution:**
- Check the session state before pausing
- Verify the process is still running

### Inspection Errors

#### INSPECT_FAILED
**Description:** Failed to evaluate expression.

**Causes:**
- Session is not paused
- Invalid expression syntax
- Variable not in scope
- Expression threw an error

**Resolution:**
- Ensure the session is paused
- Check the expression syntax
- Verify variables are in scope
- Handle expression errors gracefully

#### GET_STACK_FAILED
**Description:** Failed to get call stack.

**Causes:**
- Session is not paused
- No call frames available
- CDP command failed

**Resolution:**
- Ensure the session is paused
- Verify execution has started

#### NOT_PAUSED
**Description:** Operation requires the process to be paused.

**Causes:**
- Trying to inspect variables while running
- Trying to step while running

**Resolution:**
- Set a breakpoint and continue to it
- Use `debugger_pause` to pause execution

#### GET_LOCAL_VARIABLES_FAILED
**Description:** Failed to get local variables.

**Causes:**
- Session is not paused
- No local scope available
- CDP command failed

**Resolution:**
- Ensure the session is paused
- Verify you're inside a function

#### GET_GLOBAL_VARIABLES_FAILED
**Description:** Failed to get global variables.

**Causes:**
- Session is not paused
- No global scope available
- CDP command failed

**Resolution:**
- Ensure the session is paused

#### INSPECT_OBJECT_FAILED
**Description:** Failed to inspect object.

**Causes:**
- Invalid object ID
- Object no longer exists
- CDP command failed

**Resolution:**
- Verify the object ID is valid
- Re-evaluate the expression to get a fresh object ID

### Watch Errors

#### ADD_WATCH_FAILED
**Description:** Failed to add watched variable.

**Causes:**
- Invalid expression
- Internal error

**Resolution:**
- Check the expression syntax

#### REMOVE_WATCH_FAILED
**Description:** Failed to remove watched variable.

**Causes:**
- Internal error

**Resolution:**
- Retry the operation

#### WATCH_NOT_FOUND
**Description:** The specified watch doesn't exist.

**Causes:**
- Invalid watch ID
- Watch was already removed

**Resolution:**
- Use `debugger_get_watches` to get valid watch IDs

#### GET_WATCHES_FAILED
**Description:** Failed to get watched variables.

**Causes:**
- Internal error

**Resolution:**
- Retry the operation

### Frame Errors

#### SWITCH_FRAME_FAILED
**Description:** Failed to switch stack frame.

**Causes:**
- Invalid frame index
- Session is not paused
- No call frames available

**Resolution:**
- Use `debugger_get_stack` to get valid frame indices
- Ensure the session is paused

### Hang Detection Errors

#### HANG_DETECTION_FAILED
**Description:** Failed to detect hang.

**Causes:**
- Failed to start process
- Inspector failed to attach
- Internal error

**Resolution:**
- Verify the command and arguments
- Check process stderr for errors
- Retry with different parameters

### Cleanup Errors

#### STOP_SESSION_FAILED
**Description:** Failed to stop the session.

**Causes:**
- Session already stopped
- Internal error during cleanup

**Resolution:**
- The session may already be terminated
- Check if resources were released

#### REMOVE_BREAKPOINT_FAILED
**Description:** Failed to remove breakpoint.

**Causes:**
- CDP command failed
- Breakpoint already removed

**Resolution:**
- Verify the breakpoint exists
- Retry the operation

#### TOGGLE_BREAKPOINT_FAILED
**Description:** Failed to toggle breakpoint.

**Causes:**
- CDP command failed
- Breakpoint doesn't exist

**Resolution:**
- Verify the breakpoint exists
- Use `debugger_list_breakpoints` to check status

#### LIST_BREAKPOINTS_FAILED
**Description:** Failed to list breakpoints.

**Causes:**
- Internal error

**Resolution:**
- Retry the operation

## Type Definitions

### DebugSessionConfig

Configuration for creating a debug session.

```typescript
interface DebugSessionConfig {
  /** The command to execute (e.g., "node", "npm") */
  command: string;
  
  /** Command arguments (e.g., ["test.js"]) */
  args?: string[];
  
  /** Working directory for the process */
  cwd?: string;
  
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
}
```

### Breakpoint

Represents a breakpoint in a debug session.

```typescript
interface Breakpoint {
  /** Unique breakpoint identifier */
  id: string;
  
  /** Absolute file path */
  file: string;
  
  /** Line number (1-indexed) */
  line: number;
  
  /** Optional condition expression */
  condition?: string;
  
  /** Whether the breakpoint is enabled */
  enabled: boolean;
  
  /** CDP breakpoint ID (present if verified) */
  cdpBreakpointId?: string;
}
```

### StackFrame

Represents a call stack frame.

```typescript
interface StackFrame {
  /** Function name (or "<anonymous>") */
  functionName: string;
  
  /** Absolute file path */
  file: string;
  
  /** Line number (1-indexed) */
  line: number;
  
  /** Column number (0-indexed) */
  column: number;
  
  /** CDP call frame ID */
  callFrameId?: string;
}
```

### EvaluationResult

Result of evaluating an expression.

```typescript
interface EvaluationResult {
  /** The evaluated value */
  value: any;
  
  /** The value type (e.g., "string", "number", "object") */
  type: string;
  
  /** Object ID if the value is an object */
  objectId?: string;
}
```

### Property

Represents an object property.

```typescript
interface Property {
  /** Property name */
  name: string;
  
  /** Property value */
  value: any;
  
  /** Property type */
  type: string;
  
  /** Object ID if the value is an object */
  objectId?: string;
}
```

### WatchedVariable

Represents a watched variable.

```typescript
interface WatchedVariable {
  /** Watch identifier (expression) */
  name: string;
  
  /** Expression to evaluate */
  expression: string;
  
  /** Last evaluated value */
  lastValue?: any;
}
```

### VariableChange

Represents a change in a watched variable.

```typescript
interface VariableChange {
  /** Old value */
  oldValue: any;
  
  /** New value */
  newValue: any;
}
```

### HangDetectionConfig

Configuration for hang detection.

```typescript
interface HangDetectionConfig {
  /** The command to execute */
  command: string;
  
  /** Command arguments */
  args?: string[];
  
  /** Working directory */
  cwd?: string;
  
  /** Timeout in milliseconds */
  timeout: number;
  
  /** Sample interval for loop detection (default: 100ms) */
  sampleInterval?: number;
}
```

### HangDetectionResult

Result of hang detection.

```typescript
interface HangDetectionResult {
  /** Whether the process hung */
  hung: boolean;
  
  /** Location where the process hung (if hung) */
  location?: string;
  
  /** Call stack at hang location (if hung) */
  stack?: StackFrame[];
  
  /** Hang message (if hung) */
  message?: string;
  
  /** Whether the process completed normally (if not hung) */
  completed?: boolean;
  
  /** Exit code (if completed) */
  exitCode?: number;
  
  /** Execution duration in milliseconds */
  duration: number;
}
```

## Best Practices

### Error Handling

Always handle errors gracefully:

```typescript
try {
  const result = await session.evaluateExpression('user.name');
  console.log(result.value);
} catch (error) {
  if (error.code === 'NOT_PAUSED') {
    // Pause the session first
    await session.pause();
    // Retry
    const result = await session.evaluateExpression('user.name');
  } else {
    console.error('Evaluation failed:', error.message);
  }
}
```

### Resource Cleanup

Always cleanup sessions when done:

```typescript
const session = await sessionManager.createSession(config);
try {
  // Use the session
  await session.setBreakpoint('file.js', 42);
  await session.resume();
} finally {
  // Always cleanup
  await sessionManager.removeSession(session.id);
}
```

### Breakpoint Verification

Check if breakpoints are verified before relying on them:

```typescript
const bp = await session.setBreakpoint('file.js', 42);
if (!bp.cdpBreakpointId) {
  console.warn('Breakpoint not verified - may not hit');
}
```

### Timeout Configuration

Use appropriate timeouts for different scenarios:

```typescript
// Short timeout for unit tests
const testSession = await sessionManager.createSession({
  command: 'node',
  args: ['test.js'],
  timeout: 10000  // 10 seconds
});

// Longer timeout for integration tests
const integrationSession = await sessionManager.createSession({
  command: 'node',
  args: ['integration-test.js'],
  timeout: 60000  // 60 seconds
});
```

## See Also

- [README.md](./README.md) - User documentation and usage examples
- [TESTING.md](./TESTING.md) - Testing documentation
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) - CDP specification
- [Node.js Inspector API](https://nodejs.org/api/inspector.html) - Node.js debugging API
