export * from "./lib/mcp-server.js";

// Main entry point for running the server
import { startMcpDebuggerServer } from "./lib/mcp-server.js";

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("[MCP Server] Unhandled promise rejection:", reason);
  // Don't exit - let the operation continue
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("[MCP Server] Uncaught exception:", error);
  // Don't exit - let the operation continue
});

// Start the server if this is the main module
if (require.main === module) {
  startMcpDebuggerServer().catch((error) => {
    console.error("Failed to start MCP debugger server:", error);
    process.exit(1);
  });
}
