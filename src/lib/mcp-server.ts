import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  SessionManager,
  HangDetector,
  DebugSessionConfig,
  GracefulShutdownHandler,
} from "@ai-capabilities-suite/mcp-debugger-core";

/**
 * MCP Debugger Server
 * Provides debugging capabilities for Node.js and TypeScript applications
 * through the Model Context Protocol
 */
export class McpDebuggerServer {
  private server: McpServer;
  private sessionManager: SessionManager;
  private hangDetector: HangDetector;
  private shutdownHandler: GracefulShutdownHandler;

  constructor() {
    this.server = new McpServer(
      {
        name: "debugger-server",
        version: "1.1.6",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.sessionManager = new SessionManager();
    this.hangDetector = new HangDetector();
    this.shutdownHandler = new GracefulShutdownHandler(30000);

    this.registerTools();
    this.setupShutdownHandlers();
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupShutdownHandlers(): void {
    // Register cleanup for session manager
    this.shutdownHandler.registerCleanup("sessions", async () => {
      console.log("Cleaning up all debug sessions...");
      await this.sessionManager.cleanupAll();
    });

    // Register cleanup for MCP server
    this.shutdownHandler.registerCleanup("mcp-server", async () => {
      console.log("Closing MCP server...");
      await this.server.close();
    });

    // Initialize signal handlers
    this.shutdownHandler.initialize();
  }

  /**
   * Register all MCP tools
   */
  private registerTools(): void {
    this.registerDebuggerStart();
    this.registerDebuggerSetBreakpoint();
    this.registerDebuggerContinue();
    this.registerDebuggerStepOver();
    this.registerDebuggerStepInto();
    this.registerDebuggerStepOut();
    this.registerDebuggerPause();
    this.registerDebuggerRemoveBreakpoint();
    this.registerDebuggerToggleBreakpoint();
    this.registerDebuggerListBreakpoints();
    this.registerDebuggerGetLocalVariables();
    this.registerDebuggerGetGlobalVariables();
    this.registerDebuggerInspectObject();
    this.registerDebuggerAddWatch();
    this.registerDebuggerRemoveWatch();
    this.registerDebuggerGetWatches();
    this.registerDebuggerSwitchStackFrame();
    this.registerDebuggerStopSession();
    this.registerDebuggerInspect();
    this.registerDebuggerGetStack();
    this.registerDebuggerDetectHang();
    // Advanced breakpoint types
    this.registerDebuggerSetLogpoint();
    this.registerDebuggerSetExceptionBreakpoint();
    this.registerDebuggerSetFunctionBreakpoint();
    this.registerDebuggerSetHitCountCondition();
    // Performance profiling tools
    this.registerDebuggerStartCPUProfile();
    this.registerDebuggerStopCPUProfile();
    this.registerDebuggerTakeHeapSnapshot();
    this.registerDebuggerGetPerformanceMetrics();
  }

  /**
   * Tool: debugger_start
   * Start a new debug session
   * Requirements: 2.1, 9.1
   */
  private registerDebuggerStart(): void {
    this.server.registerTool(
      "debugger_start",
      {
        description:
          "Start a new debug session with a Node.js process. The process will be paused at the start.",
        inputSchema: {
          command: z
            .string()
            .describe('The command to execute (e.g., "node", "npm")'),
          args: z
            .array(z.string())
            .optional()
            .describe('Command arguments (e.g., ["test.js"])'),
          cwd: z
            .string()
            .optional()
            .describe("Working directory for the process"),
          timeout: z
            .number()
            .optional()
            .describe("Timeout in milliseconds (default: 30000)"),
        },
      },
      async (args) => {
        try {
          const config: DebugSessionConfig = {
            command: args.command,
            args: args.args,
            cwd: args.cwd,
            timeout: args.timeout || 30000,
          };

          const session = await this.sessionManager.createSession(config);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    sessionId: session.id,
                    state: session.getState(),
                    pid: session.getProcess()?.pid,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "SESSION_START_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_set_breakpoint
   * Set a breakpoint in the debug session
   * Requirements: 1.1, 1.2, 9.1
   */
  private registerDebuggerSetBreakpoint(): void {
    this.server.registerTool(
      "debugger_set_breakpoint",
      {
        description:
          "Set a breakpoint at a specific file and line number. Optionally provide a condition.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
          file: z.string().describe("The file path (absolute or relative)"),
          line: z.number().describe("The line number (1-indexed)"),
          condition: z
            .string()
            .optional()
            .describe('Optional condition expression (e.g., "x > 10")'),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const breakpoint = await session.setBreakpoint(
            args.file,
            args.line,
            args.condition
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    breakpointId: breakpoint.id,
                    file: breakpoint.file,
                    line: breakpoint.line,
                    condition: breakpoint.condition,
                    enabled: breakpoint.enabled,
                    verified: !!breakpoint.cdpBreakpointId,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "BREAKPOINT_SET_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_continue
   * Resume execution of a paused debug session
   * Requirements: 2.2, 9.1
   */
  private registerDebuggerContinue(): void {
    this.server.registerTool(
      "debugger_continue",
      {
        description:
          "Resume execution of a paused debug session until the next breakpoint or program termination.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          await session.resume();

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    state: session.getState(),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "CONTINUE_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_step_over
   * Step over the current line
   * Requirements: 2.3, 9.1
   */
  private registerDebuggerStepOver(): void {
    this.server.registerTool(
      "debugger_step_over",
      {
        description:
          "Execute the current line and pause at the next line in the same scope.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          await session.stepOver();

          // Wait a bit for the paused event to populate call frames
          await new Promise((resolve) => setTimeout(resolve, 100));

          const stack = await session.getCallStack();
          const location =
            stack.length > 0
              ? { file: stack[0].file, line: stack[0].line }
              : null;

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    state: session.getState(),
                    location,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "STEP_OVER_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_inspect
   * Evaluate an expression in the current execution context
   * Requirements: 3.4, 9.1, 9.3
   */
  private registerDebuggerInspect(): void {
    this.server.registerTool(
      "debugger_inspect",
      {
        description:
          "Evaluate a JavaScript expression in the current execution context and return the result with type information.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
          expression: z
            .string()
            .describe('The JavaScript expression to evaluate (e.g., "x + 1")'),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const result = await session.evaluateExpression(args.expression);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    expression: args.expression,
                    value: result.value,
                    type: result.type,
                    objectId: result.objectId,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "INSPECT_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_get_stack
   * Get the current call stack
   * Requirements: 4.1, 9.1, 9.4
   */
  private registerDebuggerGetStack(): void {
    this.server.registerTool(
      "debugger_get_stack",
      {
        description:
          "Get the current call stack with function names, file locations (absolute paths), and line numbers.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const stack = await session.getCallStack();

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    stack: stack.map((frame: any) => ({
                      function: frame.functionName,
                      file: frame.file,
                      line: frame.line,
                      column: frame.column,
                    })),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "GET_STACK_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_detect_hang
   * Detect if a process hangs or enters an infinite loop
   * Requirements: 5.1, 5.2, 5.3, 5.4, 9.1
   */
  private registerDebuggerDetectHang(): void {
    this.server.registerTool(
      "debugger_detect_hang",
      {
        description:
          "Run a command and detect if it hangs or enters an infinite loop. Returns hang status, location, and stack trace if hung.",
        inputSchema: {
          command: z
            .string()
            .describe('The command to execute (e.g., "node", "npm")'),
          args: z
            .array(z.string())
            .optional()
            .describe('Command arguments (e.g., ["test.js"])'),
          cwd: z
            .string()
            .optional()
            .describe("Working directory for the process"),
          timeout: z.number().describe("Timeout in milliseconds (e.g., 5000)"),
          sampleInterval: z
            .number()
            .optional()
            .describe(
              "Sample interval in milliseconds for infinite loop detection (e.g., 100)"
            ),
        },
      },
      async (args) => {
        try {
          console.log("[MCP Server] debugger_detect_hang called with:", args);
          const result = await this.hangDetector.detectHang({
            command: args.command,
            args: args.args,
            cwd: args.cwd,
            timeout: args.timeout,
            sampleInterval: args.sampleInterval,
          });
          console.log("[MCP Server] detectHang completed:", result);

          if (result.hung) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "success",
                      hung: true,
                      location: result.location,
                      stack: result.stack,
                      message: result.message,
                      duration: result.duration,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          } else {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "success",
                      hung: false,
                      completed: result.completed,
                      exitCode: result.exitCode,
                      duration: result.duration,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "HANG_DETECTION_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_step_into
   * Step into the current line
   * Requirements: 2.4, 9.1
   */
  private registerDebuggerStepInto(): void {
    this.server.registerTool(
      "debugger_step_into",
      {
        description:
          "Execute the current line and pause at the first line inside any called function.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          await session.stepInto();

          // Wait a bit for the paused event to populate call frames
          await new Promise((resolve) => setTimeout(resolve, 100));

          const stack = await session.getCallStack();
          const location =
            stack.length > 0
              ? { file: stack[0].file, line: stack[0].line }
              : null;

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    state: session.getState(),
                    location,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "STEP_INTO_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_step_out
   * Step out of the current function
   * Requirements: 2.5, 9.1
   */
  private registerDebuggerStepOut(): void {
    this.server.registerTool(
      "debugger_step_out",
      {
        description:
          "Execute until the current function returns and pause at the calling location.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          await session.stepOut();

          // Wait a bit for the paused event to populate call frames
          await new Promise((resolve) => setTimeout(resolve, 100));

          const stack = await session.getCallStack();
          const location =
            stack.length > 0
              ? { file: stack[0].file, line: stack[0].line }
              : null;

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    state: session.getState(),
                    location,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "STEP_OUT_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_pause
   * Pause running execution
   * Requirements: 2.6, 9.1
   */
  private registerDebuggerPause(): void {
    this.server.registerTool(
      "debugger_pause",
      {
        description:
          "Pause a running debug session and return the current execution location.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          await session.pause();

          const stack = await session.getCallStack();
          const location =
            stack.length > 0
              ? { file: stack[0].file, line: stack[0].line }
              : null;

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    state: session.getState(),
                    location,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "PAUSE_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_remove_breakpoint
   * Remove a breakpoint from the session
   * Requirements: 1.4, 9.1
   */
  private registerDebuggerRemoveBreakpoint(): void {
    this.server.registerTool(
      "debugger_remove_breakpoint",
      {
        description: "Remove a breakpoint from the debug session.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
          breakpointId: z.string().describe("The breakpoint ID to remove"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const removed = await session.removeBreakpoint(args.breakpointId);

          if (!removed) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "BREAKPOINT_NOT_FOUND",
                      message: `Breakpoint ${args.breakpointId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    breakpointId: args.breakpointId,
                    removed: true,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "REMOVE_BREAKPOINT_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_toggle_breakpoint
   * Toggle a breakpoint's enabled state
   * Requirements: 1.5, 9.1
   */
  private registerDebuggerToggleBreakpoint(): void {
    this.server.registerTool(
      "debugger_toggle_breakpoint",
      {
        description: "Toggle a breakpoint between enabled and disabled states.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
          breakpointId: z.string().describe("The breakpoint ID to toggle"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const breakpoint = await session.toggleBreakpoint(args.breakpointId);

          if (!breakpoint) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "BREAKPOINT_NOT_FOUND",
                      message: `Breakpoint ${args.breakpointId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    breakpointId: breakpoint.id,
                    file: breakpoint.file,
                    line: breakpoint.line,
                    condition: breakpoint.condition,
                    enabled: breakpoint.enabled,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "TOGGLE_BREAKPOINT_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_list_breakpoints
   * List all breakpoints in the session
   * Requirements: 1.3, 9.1
   */
  private registerDebuggerListBreakpoints(): void {
    this.server.registerTool(
      "debugger_list_breakpoints",
      {
        description:
          "Get all breakpoints for a debug session with their file, line, condition, and enabled state.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const breakpoints = session.getAllBreakpoints();

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    breakpoints: breakpoints.map((bp: any) => ({
                      id: bp.id,
                      file: bp.file,
                      line: bp.line,
                      condition: bp.condition,
                      enabled: bp.enabled,
                      verified: !!bp.cdpBreakpointId,
                    })),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "LIST_BREAKPOINTS_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_get_local_variables
   * Get all local variables in the current scope
   * Requirements: 3.1, 9.1, 9.3
   */
  private registerDebuggerGetLocalVariables(): void {
    this.server.registerTool(
      "debugger_get_local_variables",
      {
        description:
          "Get all local variables in the current scope with their names, values, and types.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          if (!session.isPaused()) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "NOT_PAUSED",
                      message: "Process must be paused to get local variables",
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const callFrames = session.getCurrentCallFrames();
          if (!callFrames || callFrames.length === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "success",
                      variables: [],
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          const currentFrame = callFrames[session.getCurrentFrameIndex()];
          const scopeChain = currentFrame.scopeChain || [];

          // Get local scope (first scope in chain is usually local)
          const localScope = scopeChain.find(
            (scope: any) => scope.type === "local"
          );

          if (!localScope || !localScope.object?.objectId) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "success",
                      variables: [],
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          const properties = await session.getObjectProperties(
            localScope.object.objectId
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    variables: properties.map((prop: any) => ({
                      name: prop.name,
                      value: prop.value,
                      type: prop.type,
                    })),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "GET_LOCAL_VARIABLES_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_get_global_variables
   * Get global variables accessible from the current scope
   * Requirements: 3.2, 9.1, 9.3
   */
  private registerDebuggerGetGlobalVariables(): void {
    this.server.registerTool(
      "debugger_get_global_variables",
      {
        description:
          "Get global variables accessible from the current scope with their names, values, and types.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          if (!session.isPaused()) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "NOT_PAUSED",
                      message: "Process must be paused to get global variables",
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const callFrames = session.getCurrentCallFrames();
          if (!callFrames || callFrames.length === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "success",
                      variables: [],
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          const currentFrame = callFrames[session.getCurrentFrameIndex()];
          const scopeChain = currentFrame.scopeChain || [];

          // Get global scope (last scope in chain is usually global)
          const globalScope = scopeChain.find(
            (scope: any) => scope.type === "global"
          );

          if (!globalScope || !globalScope.object?.objectId) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "success",
                      variables: [],
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          const properties = await session.getObjectProperties(
            globalScope.object.objectId
          );

          // Filter out built-in globals to reduce noise
          const userGlobals = properties.filter(
            (prop: any) =>
              !["console", "process", "Buffer", "global", "require"].includes(
                prop.name
              )
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    variables: userGlobals.map((prop: any) => ({
                      name: prop.name,
                      value: prop.value,
                      type: prop.type,
                    })),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "GET_GLOBAL_VARIABLES_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_inspect_object
   * Inspect an object's properties with nested resolution
   * Requirements: 3.3, 9.1, 9.3
   */
  private registerDebuggerInspectObject(): void {
    this.server.registerTool(
      "debugger_inspect_object",
      {
        description:
          "Inspect an object by its object reference, returning properties with values. Handles nested objects and arrays up to a specified depth.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
          objectId: z
            .string()
            .describe(
              "The object ID (from a previous inspection or evaluation)"
            ),
          maxDepth: z
            .number()
            .optional()
            .describe("Maximum depth to traverse (default: 2)"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          if (!session.isPaused()) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "NOT_PAUSED",
                      message: "Process must be paused to inspect objects",
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const maxDepth = args.maxDepth || 2;
          const objectData = await session.inspectObject(
            args.objectId,
            maxDepth
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    objectId: args.objectId,
                    properties: objectData,
                    maxDepth,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "INSPECT_OBJECT_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_add_watch
   * Add a watched expression
   * Requirements: 3.5, 9.1
   */
  private registerDebuggerAddWatch(): void {
    this.server.registerTool(
      "debugger_add_watch",
      {
        description:
          "Add an expression to the watch list. The expression will be evaluated each time the process pauses.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
          expression: z
            .string()
            .describe('The expression to watch (e.g., "x", "obj.prop")'),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          // Use expression as the watch ID/name
          const watchId = args.expression;

          session.addWatchedVariable({
            name: watchId,
            expression: args.expression,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    watchId,
                    expression: args.expression,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "ADD_WATCH_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_remove_watch
   * Remove a watched expression
   * Requirements: 3.5, 9.1
   */
  private registerDebuggerRemoveWatch(): void {
    this.server.registerTool(
      "debugger_remove_watch",
      {
        description: "Remove an expression from the watch list.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
          watchId: z.string().describe("The watch ID (expression) to remove"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const removed = session.removeWatchedVariable(args.watchId);

          if (!removed) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "WATCH_NOT_FOUND",
                      message: `Watch ${args.watchId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    watchId: args.watchId,
                    removed: true,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "REMOVE_WATCH_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_get_watches
   * Get all watched expressions with their current values
   * Requirements: 3.5, 9.1
   */
  private registerDebuggerGetWatches(): void {
    this.server.registerTool(
      "debugger_get_watches",
      {
        description:
          "Get all watched expressions with their current values. Reports value changes since the last pause.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const watches = session.getAllWatchedVariables();
          const changes = session.getWatchedVariableChanges();

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    watches: watches.map((watch: any) => ({
                      watchId: watch.name,
                      expression: watch.expression,
                      value: watch.lastValue,
                      changed: changes.has(watch.name),
                      oldValue: changes.get(watch.name)?.oldValue,
                      newValue: changes.get(watch.name)?.newValue,
                    })),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "GET_WATCHES_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_switch_stack_frame
   * Switch context to a different stack frame
   * Requirements: 4.2, 9.1
   */
  private registerDebuggerSwitchStackFrame(): void {
    this.server.registerTool(
      "debugger_switch_stack_frame",
      {
        description:
          "Switch the execution context to a specific stack frame by index. Frame 0 is the top frame (current location).",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
          frameIndex: z
            .number()
            .describe("The frame index (0 = top frame, 1 = caller, etc.)"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          session.switchToFrame(args.frameIndex);

          const stack = await session.getCallStack();
          const frame = stack[args.frameIndex];

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    frameIndex: args.frameIndex,
                    frame: frame
                      ? {
                          function: frame.functionName,
                          file: frame.file,
                          line: frame.line,
                          column: frame.column,
                        }
                      : null,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "SWITCH_FRAME_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_stop_session
   * Stop a debug session and cleanup resources
   * Requirements: 8.2, 9.1
   */
  private registerDebuggerStopSession(): void {
    this.server.registerTool(
      "debugger_stop_session",
      {
        description:
          "Stop a debug session, cleanup all resources, and kill the process if still running.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          await this.sessionManager.removeSession(args.sessionId);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    sessionId: args.sessionId,
                    stopped: true,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "STOP_SESSION_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_set_logpoint
   * Set a logpoint (non-breaking breakpoint) in the debug session
   */
  private registerDebuggerSetLogpoint(): void {
    this.server.registerTool(
      "debugger_set_logpoint",
      {
        description:
          "Set a logpoint that logs a message without pausing execution. Use {variable} syntax for interpolation.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
          file: z.string().describe("The file path (absolute or relative)"),
          line: z.number().describe("The line number (1-indexed)"),
          logMessage: z
            .string()
            .describe(
              'Log message template with {variable} interpolation (e.g., "Value is {x}")'
            ),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const logpoint = await session.setLogpoint(
            args.file,
            args.line,
            args.logMessage
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    logpointId: logpoint.id,
                    file: logpoint.file,
                    line: logpoint.line,
                    logMessage: logpoint.logMessage,
                    enabled: logpoint.enabled,
                    verified: !!logpoint.cdpBreakpointId,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "LOGPOINT_SET_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_set_exception_breakpoint
   * Set an exception breakpoint to pause on caught/uncaught exceptions
   */
  private registerDebuggerSetExceptionBreakpoint(): void {
    this.server.registerTool(
      "debugger_set_exception_breakpoint",
      {
        description:
          "Set an exception breakpoint to pause on caught and/or uncaught exceptions.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
          breakOnCaught: z
            .boolean()
            .describe("Whether to break on caught exceptions"),
          breakOnUncaught: z
            .boolean()
            .describe("Whether to break on uncaught exceptions"),
          exceptionFilter: z
            .string()
            .optional()
            .describe(
              "Optional regex pattern to filter exceptions by type/message"
            ),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const exceptionBreakpoint = await session.setExceptionBreakpoint(
            args.breakOnCaught,
            args.breakOnUncaught,
            args.exceptionFilter
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    exceptionBreakpointId: exceptionBreakpoint.id,
                    breakOnCaught: exceptionBreakpoint.breakOnCaught,
                    breakOnUncaught: exceptionBreakpoint.breakOnUncaught,
                    exceptionFilter: exceptionBreakpoint.exceptionFilter,
                    enabled: exceptionBreakpoint.enabled,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "EXCEPTION_BREAKPOINT_SET_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_set_function_breakpoint
   * Set a function breakpoint to pause when a function is called
   */
  private registerDebuggerSetFunctionBreakpoint(): void {
    this.server.registerTool(
      "debugger_set_function_breakpoint",
      {
        description:
          "Set a function breakpoint to pause when a function with the given name is called.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
          functionName: z
            .string()
            .describe("Function name or regex pattern to match"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const functionBreakpoint = await session.setFunctionBreakpoint(
            args.functionName
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    functionBreakpointId: functionBreakpoint.id,
                    functionName: functionBreakpoint.functionName,
                    enabled: functionBreakpoint.enabled,
                    verified: !!functionBreakpoint.cdpBreakpointId,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "FUNCTION_BREAKPOINT_SET_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_set_hit_count_condition
   * Set a hit count condition for an existing breakpoint
   */
  private registerDebuggerSetHitCountCondition(): void {
    this.server.registerTool(
      "debugger_set_hit_count_condition",
      {
        description:
          "Set a hit count condition for a breakpoint. The breakpoint will only pause when the condition is met.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
          breakpointId: z.string().describe("The breakpoint ID"),
          operator: z
            .enum(["==", ">", ">=", "<", "<=", "%"])
            .describe("Hit count operator (==, >, >=, <, <=, % for modulo)"),
          value: z.number().describe("Hit count value to compare against"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const breakpoint = session.setBreakpointHitCountCondition(
            args.breakpointId,
            {
              operator: args.operator as any,
              value: args.value,
            }
          );

          if (!breakpoint) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "BREAKPOINT_NOT_FOUND",
                      message: `Breakpoint ${args.breakpointId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    breakpointId: breakpoint.id,
                    hitCountCondition: breakpoint.hitCountCondition,
                    currentHitCount: breakpoint.hitCount,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "HIT_COUNT_CONDITION_SET_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_start_cpu_profile
   * Start CPU profiling for a debug session
   */
  private registerDebuggerStartCPUProfile(): void {
    this.server.registerTool(
      "debugger_start_cpu_profile",
      {
        description:
          "Start CPU profiling for a debug session. Collects CPU profile data for performance analysis.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          await session.startCPUProfile();

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    message: "CPU profiling started",
                    sessionId: args.sessionId,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "CPU_PROFILE_START_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_stop_cpu_profile
   * Stop CPU profiling and return the profile data with analysis
   */
  private registerDebuggerStopCPUProfile(): void {
    this.server.registerTool(
      "debugger_stop_cpu_profile",
      {
        description:
          "Stop CPU profiling and return the profile data with bottleneck analysis.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const profile = await session.stopCPUProfile();
          const analysis = session.analyzeCPUProfile(profile);
          const cpuProfiler = session.getCPUProfiler();

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    profile: {
                      startTime: profile.startTime,
                      endTime: profile.endTime,
                      duration: profile.endTime - profile.startTime,
                      nodeCount: profile.nodes.length,
                      sampleCount: profile.samples?.length || 0,
                    },
                    analysis: {
                      totalTime: analysis.totalTime,
                      topFunctions: analysis.topFunctions.slice(0, 10),
                      bottlenecks: analysis.bottlenecks,
                    },
                    formattedAnalysis: cpuProfiler?.formatAnalysis(analysis),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "CPU_PROFILE_STOP_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_take_heap_snapshot
   * Take a heap snapshot for memory analysis
   */
  private registerDebuggerTakeHeapSnapshot(): void {
    this.server.registerTool(
      "debugger_take_heap_snapshot",
      {
        description:
          "Take a heap snapshot for memory analysis. Returns memory usage report.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const snapshot = await session.takeHeapSnapshot();
          const report = await session.generateMemoryReport(snapshot);
          const memoryProfiler = session.getMemoryProfiler();

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    snapshot: {
                      nodeCount: snapshot.snapshot.node_count,
                      edgeCount: snapshot.snapshot.edge_count,
                    },
                    report: {
                      totalHeapSize: report.totalHeapSize,
                      usedHeapSize: report.usedHeapSize,
                      heapUsagePercentage:
                        (report.usedHeapSize / report.totalHeapSize) * 100,
                      topObjectTypes: report.objectTypes.slice(0, 10),
                    },
                    formattedReport: memoryProfiler?.formatMemoryReport(report),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "HEAP_SNAPSHOT_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Tool: debugger_get_performance_metrics
   * Get performance metrics including memory usage and timeline data
   */
  private registerDebuggerGetPerformanceMetrics(): void {
    this.server.registerTool(
      "debugger_get_performance_metrics",
      {
        description:
          "Get performance metrics including current memory usage, performance timeline, and leak detection.",
        inputSchema: {
          sessionId: z.string().describe("The debug session ID"),
          includeLeakDetection: z
            .boolean()
            .optional()
            .describe(
              "Whether to run memory leak detection (takes 10 seconds)"
            ),
          includePerformanceTimeline: z
            .boolean()
            .optional()
            .describe("Whether to include performance timeline data"),
        },
      },
      async (args) => {
        try {
          const session = this.sessionManager.getSession(args.sessionId);
          if (!session) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      code: "SESSION_NOT_FOUND",
                      message: `Session ${args.sessionId} not found`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const memoryUsage = await session.getMemoryUsage();
          const result: any = {
            status: "success",
            memoryUsage: {
              usedSize: memoryUsage.usedSize,
              totalSize: memoryUsage.totalSize,
              usagePercentage:
                (memoryUsage.usedSize / memoryUsage.totalSize) * 100,
              timestamp: memoryUsage.timestamp,
            },
          };

          // Optional leak detection
          if (args.includeLeakDetection) {
            const leakAnalysis = await session.detectMemoryLeaks();
            result.leakDetection = {
              isLeaking: leakAnalysis.isLeaking,
              growthRate: leakAnalysis.growthRate,
              growthRateMBPerSecond: leakAnalysis.growthRate / (1024 * 1024),
              snapshotCount: leakAnalysis.snapshots.length,
            };
          }

          // Optional performance timeline
          if (args.includePerformanceTimeline) {
            const timeline = session.getPerformanceTimeline();
            if (timeline && timeline.isRecording()) {
              const events = timeline.getEvents();
              const functionTimings = timeline.getFunctionTimings();
              result.performanceTimeline = {
                eventCount: events.length,
                topFunctions: functionTimings.slice(0, 10),
              };
            }
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    code: "PERFORMANCE_METRICS_FAILED",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  /**
   * Stop the MCP server and cleanup all sessions
   */
  async stop(): Promise<void> {
    await this.shutdownHandler.shutdown();
  }

  /**
   * Check if server is shutting down
   */
  isShuttingDown(): boolean {
    return this.shutdownHandler.isShuttingDown();
  }
}

/**
 * Create and start the MCP debugger server
 */
export async function startMcpDebuggerServer(): Promise<McpDebuggerServer> {
  const server = new McpDebuggerServer();
  await server.start();
  return server;
}
