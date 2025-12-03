#!/usr/bin/env node

/**
 * Manual Testing Script for MCP Debugger Server
 *
 * This script provides an interactive way to test the MCP debugger server
 * by sending JSON-RPC requests and displaying responses with colored output.
 *
 * Usage:
 *   node test-mcp-server.js
 *
 * Requirements:
 *   - Node.js 16+
 *   - Built MCP server (run: npx tsc -p tsconfig.lib.json)
 */

const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logSection(message) {
  log(`\n${'='.repeat(60)}`, 'bright');
  log(message, 'bright');
  log('='.repeat(60), 'bright');
}

class McpTester {
  constructor() {
    this.serverProcess = null;
    this.messageId = 0;
    this.pendingRequests = new Map();
  }

  async start() {
    logSection('Starting MCP Debugger Server');

    return new Promise((resolve, reject) => {
      const serverPath = path.join(__dirname, 'dist/index.js');

      logInfo(`Server path: ${serverPath}`);

      this.serverProcess = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      this.serverProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (line.trim()) {
            try {
              const response = JSON.parse(line);
              this.handleResponse(response);
            } catch (e) {
              // Not JSON, might be log output
              log(`Server output: ${line}`, 'dim');
            }
          }
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        log(`Server error: ${data.toString()}`, 'red');
      });

      this.serverProcess.on('exit', (code) => {
        if (code !== 0) {
          logError(`Server exited with code ${code}`);
        }
      });

      // Wait a bit for server to start
      setTimeout(() => {
        logSuccess('Server started');
        resolve();
      }, 1000);
    });
  }

  handleResponse(response) {
    if (response.id && this.pendingRequests.has(response.id)) {
      const { resolve, reject } = this.pendingRequests.get(response.id);
      this.pendingRequests.delete(response.id);

      if (response.error) {
        reject(response.error);
      } else {
        resolve(response.result);
      }
    }
  }

  async sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      this.pendingRequests.set(id, { resolve, reject });

      // Set timeout
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout for ${method}`));
        }
      }, 10000);

      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async testInitialization() {
    logSection('Test 1: MCP Protocol Initialization');

    try {
      const result = await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'manual-test-client',
          version: '1.0.0',
        },
      });

      logSuccess('Initialize request succeeded');
      logInfo(`Server name: ${result.serverInfo.name}`);
      logInfo(`Server version: ${result.serverInfo.version}`);
      logInfo(`Protocol version: ${result.protocolVersion}`);

      if (result.capabilities.tools) {
        logSuccess('Tools capability advertised');
      } else {
        logWarning('Tools capability not advertised');
      }
    } catch (error) {
      logError(`Initialize failed: ${error.message}`);
      throw error;
    }
  }

  async testToolDiscovery() {
    logSection('Test 2: Tool Discovery');

    try {
      const result = await this.sendRequest('tools/list');

      logSuccess(`Found ${result.tools.length} tools`);

      const expectedTools = [
        'debugger_start',
        'debugger_set_breakpoint',
        'debugger_continue',
        'debugger_step_over',
        'debugger_inspect',
        'debugger_get_stack',
        'debugger_detect_hang',
      ];

      for (const toolName of expectedTools) {
        const tool = result.tools.find((t) => t.name === toolName);
        if (tool) {
          logSuccess(`  ${toolName}`);
          if (!tool.description) {
            logWarning(`    Missing description`);
          }
          if (!tool.inputSchema) {
            logWarning(`    Missing input schema`);
          }
        } else {
          logError(`  ${toolName} - NOT FOUND`);
        }
      }
    } catch (error) {
      logError(`Tool discovery failed: ${error.message}`);
      throw error;
    }
  }

  async testHangDetection() {
    logSection('Test 3: Hang Detection');

    // Test with normal completion
    try {
      logInfo('Testing normal completion...');
      const testFile = path.join(
        __dirname,
        '../debugger-core/test-fixtures/normal-completion.js',
      );

      const result = await this.sendRequest('tools/call', {
        name: 'debugger_detect_hang',
        arguments: {
          command: 'node',
          args: [testFile],
          timeout: 2000,
        },
      });

      const response = JSON.parse(result.content[0].text);

      if (response.status === 'success' && response.hung === false) {
        logSuccess('Normal completion detected correctly');
      } else {
        logError('Normal completion not detected correctly');
      }
    } catch (error) {
      logError(`Normal completion test failed: ${error.message}`);
    }

    // Test with infinite loop
    try {
      logInfo('Testing infinite loop detection...');
      const testFile = path.join(
        __dirname,
        '../debugger-core/test-fixtures/infinite-loop.js',
      );

      const result = await this.sendRequest('tools/call', {
        name: 'debugger_detect_hang',
        arguments: {
          command: 'node',
          args: [testFile],
          timeout: 2000,
          sampleInterval: 100,
        },
      });

      const response = JSON.parse(result.content[0].text);

      if (response.status === 'success' && response.hung === true) {
        logSuccess('Infinite loop detected correctly');
        logInfo(`  Location: ${response.location}`);
      } else {
        logError('Infinite loop not detected correctly');
      }
    } catch (error) {
      logError(`Infinite loop test failed: ${error.message}`);
    }
  }

  async testDebugSession() {
    logSection('Test 4: Debug Session Operations');

    let sessionId;

    // Start session
    try {
      logInfo('Starting debug session...');
      const testFile = path.join(
        __dirname,
        '../debugger-core/test-fixtures/simple-script.js',
      );

      const result = await this.sendRequest('tools/call', {
        name: 'debugger_start',
        arguments: {
          command: 'node',
          args: [testFile],
          timeout: 10000,
        },
      });

      const response = JSON.parse(result.content[0].text);

      if (response.status === 'success') {
        sessionId = response.sessionId;
        logSuccess(`Session started: ${sessionId}`);
        logInfo(`  State: ${response.state}`);
        logInfo(`  PID: ${response.pid}`);
      } else {
        logError('Failed to start session');
        return;
      }
    } catch (error) {
      logError(`Session start failed: ${error.message}`);
      return;
    }

    // Set breakpoint
    try {
      logInfo('Setting breakpoint...');
      const testFile = path.join(
        __dirname,
        '../debugger-core/test-fixtures/simple-script.js',
      );

      const result = await this.sendRequest('tools/call', {
        name: 'debugger_set_breakpoint',
        arguments: {
          sessionId,
          file: testFile,
          line: 2,
        },
      });

      const response = JSON.parse(result.content[0].text);

      if (response.status === 'success') {
        logSuccess(`Breakpoint set: ${response.breakpointId}`);
      } else {
        logError('Failed to set breakpoint');
      }
    } catch (error) {
      logError(`Set breakpoint failed: ${error.message}`);
    }

    // Get call stack
    try {
      logInfo('Getting call stack...');

      const result = await this.sendRequest('tools/call', {
        name: 'debugger_get_stack',
        arguments: {
          sessionId,
        },
      });

      const response = JSON.parse(result.content[0].text);

      if (response.status === 'success') {
        logSuccess(`Call stack retrieved (${response.stack.length} frames)`);
        if (response.stack.length > 0) {
          const frame = response.stack[0];
          logInfo(
            `  Top frame: ${frame.function || '(anonymous)'} at ${frame.file}:${frame.line}`,
          );
        }
      } else {
        logError('Failed to get call stack');
      }
    } catch (error) {
      logError(`Get call stack failed: ${error.message}`);
    }

    // Inspect variable
    try {
      logInfo('Inspecting expression...');

      const result = await this.sendRequest('tools/call', {
        name: 'debugger_inspect',
        arguments: {
          sessionId,
          expression: '1 + 1',
        },
      });

      const response = JSON.parse(result.content[0].text);

      if (response.status === 'success') {
        logSuccess(
          `Expression evaluated: ${response.expression} = ${response.value}`,
        );
        logInfo(`  Type: ${response.type}`);
      } else {
        logError('Failed to inspect expression');
      }
    } catch (error) {
      logError(`Inspect failed: ${error.message}`);
    }
  }

  async testErrorHandling() {
    logSection('Test 5: Error Handling');

    // Test invalid session
    try {
      logInfo('Testing invalid session ID...');

      const result = await this.sendRequest('tools/call', {
        name: 'debugger_continue',
        arguments: {
          sessionId: 'invalid-session-id',
        },
      });

      const response = JSON.parse(result.content[0].text);

      if (
        response.status === 'error' &&
        response.code === 'SESSION_NOT_FOUND'
      ) {
        logSuccess('Invalid session error handled correctly');
        logInfo(`  Error code: ${response.code}`);
        logInfo(`  Error message: ${response.message}`);
      } else {
        logError('Invalid session error not handled correctly');
      }
    } catch (error) {
      logError(`Error handling test failed: ${error.message}`);
    }
  }

  async runAllTests() {
    try {
      await this.start();
      await this.testInitialization();
      await this.testToolDiscovery();
      await this.testHangDetection();
      await this.testDebugSession();
      await this.testErrorHandling();

      logSection('All Tests Complete');
      logSuccess('Testing finished successfully!');
    } catch (error) {
      logSection('Testing Failed');
      logError(`Fatal error: ${error.message}`);
      process.exit(1);
    } finally {
      this.stop();
    }
  }

  stop() {
    if (this.serverProcess && !this.serverProcess.killed) {
      this.serverProcess.kill();
      logInfo('Server stopped');
    }
  }
}

// Main execution
if (require.main === module) {
  const tester = new McpTester();

  logSection('MCP Debugger Server - Manual Test Suite');
  logInfo('This script will test all major MCP operations');
  logInfo('Press Ctrl+C to stop at any time\n');

  process.on('SIGINT', () => {
    log('\nInterrupted by user', 'yellow');
    tester.stop();
    process.exit(0);
  });

  tester.runAllTests().catch((error) => {
    logError(`Unhandled error: ${error.message}`);
    tester.stop();
    process.exit(1);
  });
}

module.exports = { McpTester };
