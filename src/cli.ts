#!/usr/bin/env node

/**
 * CLI entry point for the MCP ACS Debugger Server
 *
 * This script provides a command-line interface for starting the MCP debugger server
 * with various configuration options.
 */

import { startMcpDebuggerServer } from "./lib/mcp-server.js";

const VERSION = "1.5.23";

function printHelp(): void {
  console.log(`
MCP ACS Debugger Server v${VERSION}
Enterprise-grade debugging capabilities for Node.js and TypeScript applications

USAGE:
  ts-mcp-server [OPTIONS]
  mcp-debugger [OPTIONS]

OPTIONS:
  -h, --help              Show this help message
  -v, --version           Show version information
  --stdio                 Use stdio transport (default)
  --port <port>           Use TCP transport on specified port
  --host <host>           Host to bind to (default: localhost)
  --log-level <level>     Set log level (debug, info, warn, error)
  --no-auth               Disable authentication (not recommended for production)
  --config <file>         Load configuration from file

EXAMPLES:
  # Start server with stdio transport (default for MCP)
  ts-mcp-server

  # Start server with TCP transport
  ts-mcp-server --port 3000

  # Start server with debug logging
  ts-mcp-server --log-level debug

  # Start server with custom configuration
  ts-mcp-server --config ./mcp-config.json

ENVIRONMENT VARIABLES:
  MCP_LOG_LEVEL           Set log level (overridden by --log-level)
  MCP_AUTH_TOKEN          Authentication token for secure connections
  MCP_PORT                TCP port (overridden by --port)
  MCP_HOST                Host to bind to (overridden by --host)

DOCUMENTATION:
  Homepage: https://github.com/digital-defiance/ai-capabilities-suite
  Issues:   https://github.com/digital-defiance/ai-capabilities-suite/issues

For more information, visit the documentation at:
https://github.com/digital-defiance/ai-capabilities-suite/tree/main/packages/mcp-debugger-server
`);
}

function printVersion(): void {
  console.log(`MCP ACS Debugger Server v${VERSION}`);
}

interface CliOptions {
  help?: boolean;
  version?: boolean;
  stdio?: boolean;
  port?: number;
  host?: string;
  logLevel?: string;
  noAuth?: boolean;
  config?: string;
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    stdio: true, // Default to stdio for MCP
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "-h":
      case "--help":
        options.help = true;
        break;

      case "-v":
      case "--version":
        options.version = true;
        break;

      case "--stdio":
        options.stdio = true;
        break;

      case "--port":
        if (i + 1 >= args.length) {
          console.error("Error: --port requires a value");
          process.exit(1);
        }
        options.port = parseInt(args[++i], 10);
        if (isNaN(options.port)) {
          console.error("Error: --port must be a number");
          process.exit(1);
        }
        options.stdio = false;
        break;

      case "--host":
        if (i + 1 >= args.length) {
          console.error("Error: --host requires a value");
          process.exit(1);
        }
        options.host = args[++i];
        break;

      case "--log-level":
        if (i + 1 >= args.length) {
          console.error("Error: --log-level requires a value");
          process.exit(1);
        }
        options.logLevel = args[++i];
        if (!["debug", "info", "warn", "error"].includes(options.logLevel)) {
          console.error(
            "Error: --log-level must be one of: debug, info, warn, error"
          );
          process.exit(1);
        }
        break;

      case "--no-auth":
        options.noAuth = true;
        break;

      case "--config":
        if (i + 1 >= args.length) {
          console.error("Error: --config requires a value");
          process.exit(1);
        }
        options.config = args[++i];
        break;

      default:
        console.error(`Error: Unknown option: ${arg}`);
        console.error("Run with --help for usage information");
        process.exit(1);
    }
  }

  return options;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // Handle help and version flags
  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (options.version) {
    printVersion();
    process.exit(0);
  }

  // Apply environment variables
  const logLevel = options.logLevel || process.env["MCP_LOG_LEVEL"] || "info";
  const port =
    options.port ||
    (process.env["MCP_PORT"]
      ? parseInt(process.env["MCP_PORT"], 10)
      : undefined);
  const host = options.host || process.env["MCP_HOST"] || "localhost";

  // Log startup information
  if (logLevel === "debug" || logLevel === "info") {
    console.error("Starting MCP ACS Debugger Server...");
    console.error(`Version: ${VERSION}`);
    console.error(
      `Transport: ${options.stdio ? "stdio" : `TCP (${host}:${port})`}`
    );
    console.error(`Log Level: ${logLevel}`);
    console.error(`Authentication: ${options.noAuth ? "disabled" : "enabled"}`);
    if (options.config) {
      console.error(`Config File: ${options.config}`);
    }
    console.error("");
  }

  try {
    // Start the MCP server
    await startMcpDebuggerServer();
  } catch (error) {
    console.error("Failed to start MCP debugger server:", error);
    process.exit(1);
  }
}

// Run the CLI
main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
