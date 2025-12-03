#!/usr/bin/env node

/**
 * Manual Testing Script for MCP Debugger Server
 *
 * This script provides an interactive way to test the MCP debugger server
 * with colored output and clear pass/fail indicators.
 *
 * Usage:
 *   node test-mcp-manual.js
 *
 * Requirements:
 *   - Node.js 16+
 *   - Built MCP server (run `npx nx build @ai-capabilities-suite/mcp-server` first)
 */

const { spawn } = require("child_process");
const path = require("path");
const readline = require("readline");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, "green");
}

function logError(message) {
  log(`✗ ${message}`, "red");
}

function logInfo(message) {
  log(`ℹ ${message}`, "cyan");
}

function logWarning(message) {
  log(`⚠ ${message}`, "yellow");
}

function logSection(message) {
  log(`\n${"=".repeat(60)}`, "blue");
  log(message, "bright");
  log("=".repeat(60), "blue");
}

class MCPTester {
  constructor() {
    this.serverProcess = null;
    this.messageId = 0;
    this.pendingRequests = new Map();
  }

  async start() {
    logSection("MCP Debugger Server - Manual Test Suite");

    try {
      await this.startServer();
      await this.runTests();
    } catch (error) {
      logError(`Test suite failed: ${error.message}`);
      process.exit(1);
    } finally {
      this.stopServer();
    }
  }

  async startServer() {
    logInfo("Starting MCP server...");

    const serverPath = path.join(__dirname, "dist/src/index.js");
    this.serverProcess = spawn("node", [serverPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.serverProcess.stderr.on("data", (data) => {
      logWarning(`Server stderr: ${data.toString()}`);
    });

    this.serverProcess.stdout.on("data", (data) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            if (response.id && this.pendingRequests.has(response.id)) {
              const { resolve, reject } = this.pendingRequests.get(response.id);
              this.pendingRequests.delete(response.id);

              if (response.error) {
                reject(new Error(response.error.message));
              } else {
                resolve(response.result);
              }
            }
          } catch (e) {
            // Not JSON or not a response we're waiting for
          }
        }
      }
    });

    // Wait for server to be ready
    await new Promise((resolve) => setTimeout(resolve, 500));
    logSuccess("Server started");
  }

  stopServer() {
    if (this.serverProcess && !this.serverProcess.killed) {
      this.serverProcess.kill();
      logInfo("Server stopped");
    }
  }

  async sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      const request = {
        jsonrpc: "2.0",
        id,
        method,
        params,
      };

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout for ${method}`));
      }, 10000);

      this.pendingRequests.set(id, {
        resolve: (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });

      this.serverProcess.stdin.write(JSON.stringify(request) + "\n");
    });
  }

  async runTests() {
    let passed = 0;
    let failed = 0;

    // Test 1: Initialize
    logSection("Test 1: Protocol Initialization");
    try {
      const result = await this.sendRequest("initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "manual-test",
          version: "1.0.0",
        },
      });

      if (result.serverInfo && result.serverInfo.name === "debugger-server") {
        logSuccess("Server initialized correctly");
        logInfo(
          `  Server: ${result.serverInfo.name} v${result.serverInfo.version}`
        );
        passed++;
      } else {
        logError("Server initialization returned unexpected response");
        failed++;
      }
    } catch (error) {
      logError(`Initialization failed: ${error.message}`);
      failed++;
    }

    // Test 2: Tool Discovery
    logSection("Test 2: Tool Discovery");
    try {
      const result = await this.sendRequest("tools/list");

      if (result.tools && Array.isArray(result.tools)) {
        const toolNames = result.tools.map((t) => t.name);
        const expectedTools = [
          "debugger_start",
          "debugger_set_breakpoint",
          "debugger_continue",
          "debugger_step_over",
          "debugger_inspect",
          "debugger_get_stack",
          "debugger_detect_hang",
        ];

        const allPresent = expectedTools.every((name) =>
          toolNames.includes(name)
        );

        if (allPresent) {
          logSuccess(`All ${expectedTools.length} tools discovered`);
          expectedTools.forEach((name) => logInfo(`  - ${name}`));
          passed++;
        } else {
          logError("Some tools are missing");
          failed++;
        }
      } else {
        logError("Tool list returned unexpected response");
        failed++;
      }
    } catch (error) {
      logError(`Tool discovery failed: ${error.message}`);
      failed++;
    }

    // Test 3: Hang Detection
    logSection("Test 3: Hang Detection");
    try {
      const testFile = path.join(
        __dirname,
        "../debugger-core/test-fixtures/infinite-loop.js"
      );

      logInfo("Testing infinite loop detection...");
      const result = await this.sendRequest("tools/call", {
        name: "debugger_detect_hang",
        arguments: {
          command: "node",
          args: [testFile],
          timeout: 2000,
          sampleInterval: 100,
        },
      });

      const response = JSON.parse(result.content[0].text);

      if (response.status === "success" && response.hung === true) {
        logSuccess("Hang detected correctly");
        logInfo(`  Location: ${response.location}`);
        passed++;
      } else {
        logError("Hang detection failed or returned unexpected result");
        logInfo(`  Response: ${JSON.stringify(response, null, 2)}`);
        failed++;
      }
    } catch (error) {
      logError(`Hang detection test failed: ${error.message}`);
      failed++;
    }

    // Test 4: Start Debug Session
    logSection("Test 4: Start Debug Session");
    let sessionId = null;
    try {
      const testFile = path.join(
        __dirname,
        "../debugger-core/test-fixtures/simple-script.js"
      );

      const result = await this.sendRequest("tools/call", {
        name: "debugger_start",
        arguments: {
          command: "node",
          args: [testFile],
          timeout: 10000,
        },
      });

      const response = JSON.parse(result.content[0].text);

      if (response.status === "success" && response.sessionId) {
        sessionId = response.sessionId;
        logSuccess("Debug session started");
        logInfo(`  Session ID: ${sessionId}`);
        logInfo(`  State: ${response.state}`);
        passed++;
      } else {
        logError("Failed to start debug session");
        logInfo(`  Response: ${JSON.stringify(response, null, 2)}`);
        failed++;
      }
    } catch (error) {
      logError(`Debug session start failed: ${error.message}`);
      failed++;
    }

    // Test 5: Set Breakpoint
    if (sessionId) {
      logSection("Test 5: Set Breakpoint");
      try {
        const testFile = path.join(
          __dirname,
          "../debugger-core/test-fixtures/simple-script.js"
        );

        const result = await this.sendRequest("tools/call", {
          name: "debugger_set_breakpoint",
          arguments: {
            sessionId,
            file: testFile,
            line: 2,
          },
        });

        const response = JSON.parse(result.content[0].text);

        if (response.status === "success" && response.breakpointId) {
          logSuccess("Breakpoint set successfully");
          logInfo(`  Breakpoint ID: ${response.breakpointId}`);
          logInfo(`  File: ${response.file}`);
          logInfo(`  Line: ${response.line}`);
          passed++;
        } else {
          logError("Failed to set breakpoint");
          logInfo(`  Response: ${JSON.stringify(response, null, 2)}`);
          failed++;
        }
      } catch (error) {
        logError(`Set breakpoint failed: ${error.message}`);
        failed++;
      }
    }

    // Test 6: Error Handling
    logSection("Test 6: Error Handling");
    try {
      const result = await this.sendRequest("tools/call", {
        name: "debugger_continue",
        arguments: {
          sessionId: "invalid-session-id",
        },
      });

      const response = JSON.parse(result.content[0].text);

      if (
        response.status === "error" &&
        response.code === "SESSION_NOT_FOUND"
      ) {
        logSuccess("Error handling works correctly");
        logInfo(`  Error code: ${response.code}`);
        logInfo(`  Message: ${response.message}`);
        passed++;
      } else {
        logError("Error handling returned unexpected response");
        failed++;
      }
    } catch (error) {
      logError(`Error handling test failed: ${error.message}`);
      failed++;
    }

    // Summary
    logSection("Test Summary");
    const total = passed + failed;
    log(`Total tests: ${total}`, "bright");
    logSuccess(`Passed: ${passed}`);
    if (failed > 0) {
      logError(`Failed: ${failed}`);
    }

    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    log(
      `\nSuccess rate: ${percentage}%`,
      percentage === 100 ? "green" : "yellow"
    );

    if (failed === 0) {
      log("\n🎉 All tests passed!", "green");
    } else {
      log(
        "\n⚠️  Some tests failed. Check the output above for details.",
        "yellow"
      );
    }
  }
}

// Run the tests
const tester = new MCPTester();
tester.start().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
