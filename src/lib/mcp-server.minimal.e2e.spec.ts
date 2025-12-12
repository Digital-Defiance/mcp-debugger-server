import { spawn, ChildProcess } from "child_process";
import * as path from "path";

/**
 * Minimal E2E test to debug the issue
 */
describe("MCP ACS Debugger Server - Minimal E2E", () => {
  let serverProcess: ChildProcess;
  let messageId = 0;

  async function startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      const serverPath = path.join(__dirname, "../../dist/src/index.js");

      serverProcess = spawn("node", [serverPath], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      if (!serverProcess || !serverProcess.stdout || !serverProcess.stdin) {
        reject(new Error("Failed to start server process"));
        return;
      }

      serverProcess.stdout?.setMaxListeners(100);
      serverProcess.stderr?.setMaxListeners(100);
      serverProcess.stdin?.setMaxListeners(100);

      serverProcess.stderr?.on("data", (data) => {
        console.error("Server stderr:", data.toString());
      });

      serverProcess.on("error", (error) => {
        console.error("Server process error:", error);
        reject(error);
      });

      setTimeout(() => resolve(), 2000);
    });
  }

  function sendRequest(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = ++messageId;
      const request = {
        jsonrpc: "2.0",
        id,
        method,
        params: params || {},
      };

      console.log("Sending request:", JSON.stringify(request));

      let responseData = "";
      const timeout = setTimeout(() => {
        console.log("Timeout! Response data so far:", responseData);
        reject(new Error(`Request timeout for ${method}`));
      }, 10000);

      const onData = (data: Buffer) => {
        const chunk = data.toString();
        console.log("Received chunk:", chunk);
        responseData += chunk;

        const lines = responseData.split("\n");
        for (const line of lines) {
          if (line.trim()) {
            try {
              const response = JSON.parse(line);
              console.log("Parsed response:", response);
              if (response.id === id) {
                clearTimeout(timeout);
                serverProcess.stdout?.removeListener("data", onData);

                if (response.error) {
                  reject(new Error(response.error.message));
                } else {
                  resolve(response.result);
                }
                return;
              }
            } catch (e) {
              // Not complete JSON yet
            }
          }
        }
      };

      serverProcess.stdout?.on("data", onData);
      serverProcess.stdin?.write(JSON.stringify(request) + "\n");
    });
  }

  function stopServer(): void {
    if (serverProcess && !serverProcess.killed) {
      serverProcess.stdout?.removeAllListeners();
      serverProcess.stderr?.removeAllListeners();
      serverProcess.stdin?.removeAllListeners();
      serverProcess.removeAllListeners();
      serverProcess.kill();
    }
  }

  beforeAll(async () => {
    await startServer();
  }, 60000);

  afterAll(() => {
    stopServer();
  });

  it("should respond to initialize request", async () => {
    const result = await sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0",
      },
    });

    expect(result).toBeDefined();
    expect(result.protocolVersion).toBeDefined();
  }, 15000);

  it("should list tools", async () => {
    const result = await sendRequest("tools/list");
    expect(result).toBeDefined();
    expect(result.tools).toBeDefined();
    expect(Array.isArray(result.tools)).toBe(true);
  }, 15000);
});
