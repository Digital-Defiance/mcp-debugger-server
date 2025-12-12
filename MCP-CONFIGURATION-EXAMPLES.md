# MCP ACS Debugger Server - Configuration Examples

This document provides comprehensive configuration examples for integrating the MCP ACS Debugger Server with various MCP clients and AI agents.

## Table of Contents

- [Kiro Configuration](#kiro-configuration)
- [Claude Desktop Configuration](#claude-desktop-configuration)
- [Amazon Q Configuration](#amazon-q-configuration)
- [VS Code Configuration](#vs-code-configuration)
- [GitHub Copilot Configuration](#github-copilot-configuration)
- [Custom MCP Client Configuration](#custom-mcp-client-configuration)
- [Environment Variables](#environment-variables)
- [Common Use Cases](#common-use-cases)
- [Advanced Configuration](#advanced-configuration)
- [Troubleshooting](#troubleshooting)

## Kiro Configuration

### Basic Configuration

Add to `.kiro/settings/mcp.json`:

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

### With Auto-Approve

Auto-approve common debugging operations:

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
        "debugger_get_stack",
        "debugger_get_local_variables"
      ]
    }
  }
}
```

### With Custom Path

If installed locally or from source:

```json
{
  "mcpServers": {
    "debugger": {
      "command": "node",
      "args": [
        "/absolute/path/to/ai-capabilities-suite/packages/mcp-debugger-server/dist/src/cli.js"
      ],
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "mcp:*"
      },
      "disabled": false
    }
  }
}
```

### With Environment Variables

Enable debug logging and authentication:

```json
{
  "mcpServers": {
    "debugger": {
      "command": "ts-mcp-server",
      "args": [],
      "env": {
        "MCP_LOG_LEVEL": "debug",
        "MCP_AUTH_TOKEN": "your-secret-token",
        "MCP_RATE_LIMIT": "100",
        "MCP_AUDIT_LOG": "true"
      },
      "disabled": false
    }
  }
}
```

## Claude Desktop Configuration

### macOS Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

### Windows Configuration

Add to `%APPDATA%\Claude\claude_desktop_config.json`:

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

### Linux Configuration

Add to `~/.config/Claude/claude_desktop_config.json`:

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

### With NPX (No Installation)

Use NPX to run without installing:

```json
{
  "mcpServers": {
    "debugger": {
      "command": "npx",
      "args": ["@ai-capabilities-suite/mcp-debugger-server"]
    }
  }
}
```

## Amazon Q Configuration

### Workspace Configuration

Add to `.vscode/settings.json` or workspace settings:

```json
{
  "amazonQ.mcp": {
    "servers": {
      "debugger": {
        "command": "ts-mcp-server",
        "args": [],
        "transport": "stdio"
      }
    }
  }
}
```

### User Configuration

Add to VS Code user settings:

```json
{
  "amazonQ.mcp": {
    "servers": {
      "debugger": {
        "command": "ts-mcp-server",
        "args": [],
        "transport": "stdio",
        "enabled": true
      }
    }
  }
}
```

### With Docker

Use Docker container for Amazon Q:

```json
{
  "amazonQ.mcp": {
    "servers": {
      "debugger": {
        "command": "docker",
        "args": [
          "run",
          "-i",
          "--rm",
          "-v",
          "${workspaceFolder}:/workspace",
          "digitaldefiance/mcp-debugger-server:latest"
        ],
        "transport": "stdio"
      }
    }
  }
}
```

## VS Code Configuration

### Basic Configuration

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

### With Launch Configuration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "mcp-debugger",
      "request": "launch",
      "name": "Debug Current File",
      "program": "${file}",
      "cwd": "${workspaceFolder}",
      "timeout": 30000
    },
    {
      "type": "mcp-debugger",
      "request": "launch",
      "name": "Debug Jest Tests",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["${file}", "--runInBand"],
      "cwd": "${workspaceFolder}",
      "timeout": 60000
    }
  ]
}
```

### With Tasks

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start MCP ACS Debugger",
      "type": "shell",
      "command": "ts-mcp-server",
      "isBackground": true,
      "problemMatcher": []
    }
  ]
}
```

## GitHub Copilot Configuration

### VS Code Extension Configuration

Add to `.vscode/settings.json`:

```json
{
  "github.copilot.mcp": {
    "servers": {
      "debugger": {
        "command": "ts-mcp-server",
        "args": [],
        "enabled": true
      }
    }
  }
}
```

### With Agent Mode

Enable Copilot agent mode for debugging:

```json
{
  "github.copilot.mcp": {
    "servers": {
      "debugger": {
        "command": "ts-mcp-server",
        "args": [],
        "enabled": true,
        "agentMode": true,
        "capabilities": [
          "debugging",
          "breakpoints",
          "variable-inspection",
          "hang-detection"
        ]
      }
    }
  }
}
```

## Custom MCP Client Configuration

### Node.js Client

```javascript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

// Create transport
const serverProcess = spawn("ts-mcp-server", [], {
  stdio: ["pipe", "pipe", "pipe"],
});

const transport = new StdioClientTransport({
  reader: serverProcess.stdout,
  writer: serverProcess.stdin,
});

// Create client
const client = new Client(
  {
    name: "my-debugger-client",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Connect
await client.connect(transport);

// Use tools
const result = await client.callTool("debugger_start", {
  command: "node",
  args: ["app.js"],
});

console.log(result);
```

### Python Client

```python
import subprocess
import json

class MCPDebuggerClient:
    def __init__(self):
        self.process = subprocess.Popen(
            ['ts-mcp-server'],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

    def call_tool(self, tool_name, arguments):
        request = {
            'jsonrpc': '2.0',
            'id': 1,
            'method': 'tools/call',
            'params': {
                'name': tool_name,
                'arguments': arguments
            }
        }

        self.process.stdin.write(json.dumps(request) + '\n')
        self.process.stdin.flush()

        response = json.loads(self.process.stdout.readline())
        return response['result']

    def close(self):
        self.process.terminate()

# Usage
client = MCPDebuggerClient()
result = client.call_tool('debugger_start', {
    'command': 'node',
    'args': ['app.js']
})
print(result)
client.close()
```

## Environment Variables

### Available Variables

| Variable               | Description               | Default   | Example                          |
| ---------------------- | ------------------------- | --------- | -------------------------------- |
| `MCP_LOG_LEVEL`        | Logging level             | `info`    | `debug`, `info`, `warn`, `error` |
| `MCP_AUTH_TOKEN`       | Authentication token      | None      | `your-secret-token`              |
| `MCP_RATE_LIMIT`       | Rate limit (requests/min) | Unlimited | `100`                            |
| `MCP_AUDIT_LOG`        | Enable audit logging      | `false`   | `true`, `false`                  |
| `MCP_SESSION_TIMEOUT`  | Session timeout (ms)      | `3600000` | `1800000`                        |
| `MCP_MAX_SESSIONS`     | Max concurrent sessions   | `100`     | `50`                             |
| `MCP_ENABLE_PROFILING` | Enable profiling          | `true`    | `true`, `false`                  |
| `MCP_ENABLE_METRICS`   | Enable metrics            | `true`    | `true`, `false`                  |
| `DEBUG`                | Debug namespaces          | None      | `mcp:*`, `mcp:server`            |

### Setting Environment Variables

**Linux/macOS:**

```bash
export MCP_LOG_LEVEL=debug
export MCP_AUTH_TOKEN=your-secret-token
ts-mcp-server
```

**Windows (PowerShell):**

```powershell
$env:MCP_LOG_LEVEL="debug"
$env:MCP_AUTH_TOKEN="your-secret-token"
ts-mcp-server
```

**In Configuration File:**

```json
{
  "mcpServers": {
    "debugger": {
      "command": "ts-mcp-server",
      "args": [],
      "env": {
        "MCP_LOG_LEVEL": "debug",
        "MCP_AUTH_TOKEN": "your-secret-token"
      }
    }
  }
}
```

## Common Use Cases

### Use Case 1: Development Environment

Minimal configuration for local development:

```json
{
  "mcpServers": {
    "debugger": {
      "command": "ts-mcp-server",
      "args": [],
      "env": {
        "NODE_ENV": "development",
        "MCP_LOG_LEVEL": "debug"
      }
    }
  }
}
```

### Use Case 2: CI/CD Pipeline

Configuration for automated testing:

```json
{
  "mcpServers": {
    "debugger": {
      "command": "ts-mcp-server",
      "args": [],
      "env": {
        "NODE_ENV": "test",
        "MCP_LOG_LEVEL": "error",
        "MCP_SESSION_TIMEOUT": "300000",
        "MCP_MAX_SESSIONS": "10"
      }
    }
  }
}
```

### Use Case 3: Production Debugging

Secure configuration for production:

```json
{
  "mcpServers": {
    "debugger": {
      "command": "ts-mcp-server",
      "args": [],
      "env": {
        "NODE_ENV": "production",
        "MCP_LOG_LEVEL": "warn",
        "MCP_AUTH_TOKEN": "${MCP_AUTH_TOKEN}",
        "MCP_RATE_LIMIT": "50",
        "MCP_AUDIT_LOG": "true",
        "MCP_SESSION_TIMEOUT": "1800000"
      }
    }
  }
}
```

### Use Case 4: Team Collaboration

Configuration for shared team environment:

```json
{
  "mcpServers": {
    "debugger": {
      "command": "ts-mcp-server",
      "args": [],
      "env": {
        "MCP_LOG_LEVEL": "info",
        "MCP_MAX_SESSIONS": "50",
        "MCP_ENABLE_METRICS": "true",
        "MCP_AUDIT_LOG": "true"
      },
      "autoApprove": [
        "debugger_start",
        "debugger_set_breakpoint",
        "debugger_continue",
        "debugger_get_stack"
      ]
    }
  }
}
```

### Use Case 5: TypeScript Project

Configuration optimized for TypeScript:

```json
{
  "mcpServers": {
    "debugger": {
      "command": "ts-mcp-server",
      "args": [],
      "env": {
        "NODE_OPTIONS": "--enable-source-maps",
        "MCP_LOG_LEVEL": "info"
      }
    }
  }
}
```

### Use Case 6: Monorepo

Configuration for monorepo debugging:

```json
{
  "mcpServers": {
    "debugger": {
      "command": "ts-mcp-server",
      "args": [],
      "env": {
        "MCP_LOG_LEVEL": "info",
        "MCP_MAX_SESSIONS": "100"
      }
    }
  }
}
```

## Advanced Configuration

### With Docker Compose

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  mcp-debugger:
    image: digitaldefiance/mcp-debugger-server:latest
    stdin_open: true
    tty: true
    volumes:
      - ./:/workspace
    environment:
      - MCP_LOG_LEVEL=info
      - MCP_AUTH_TOKEN=${MCP_AUTH_TOKEN}
      - MCP_RATE_LIMIT=100
    networks:
      - mcp-network

networks:
  mcp-network:
    driver: bridge
```

Configuration to use Docker Compose:

```json
{
  "mcpServers": {
    "debugger": {
      "command": "docker-compose",
      "args": ["-f", "docker-compose.yml", "run", "--rm", "mcp-debugger"]
    }
  }
}
```

### With Kubernetes

Create `mcp-debugger-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-debugger
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mcp-debugger
  template:
    metadata:
      labels:
        app: mcp-debugger
    spec:
      containers:
        - name: mcp-debugger
          image: digitaldefiance/mcp-debugger-server:latest
          env:
            - name: MCP_LOG_LEVEL
              value: "info"
            - name: MCP_AUTH_TOKEN
              valueFrom:
                secretKeyRef:
                  name: mcp-secrets
                  key: auth-token
            - name: MCP_RATE_LIMIT
              value: "100"
          ports:
            - containerPort: 3000
```

### With Systemd (Linux)

Create `/etc/systemd/system/mcp-debugger.service`:

```ini
[Unit]
Description=MCP ACS Debugger Server
After=network.target

[Service]
Type=simple
User=mcp
Group=mcp
WorkingDirectory=/opt/mcp-debugger
Environment="MCP_LOG_LEVEL=info"
Environment="MCP_AUTH_TOKEN=your-secret-token"
ExecStart=/usr/local/bin/ts-mcp-server
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable mcp-debugger
sudo systemctl start mcp-debugger
```

### With PM2 (Process Manager)

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "mcp-debugger",
      script: "ts-mcp-server",
      instances: 4,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        MCP_LOG_LEVEL: "info",
        MCP_AUTH_TOKEN: process.env.MCP_AUTH_TOKEN,
        MCP_RATE_LIMIT: "100",
      },
    },
  ],
};
```

Start with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Troubleshooting

### Issue: Server Not Starting

**Check configuration syntax:**

```bash
# Validate JSON
cat .kiro/settings/mcp.json | jq .
```

**Check server installation:**

```bash
# Verify installation
ts-mcp-server --version

# Test server manually
ts-mcp-server
```

### Issue: Connection Timeout

**Increase timeout in configuration:**

```json
{
  "mcpServers": {
    "debugger": {
      "command": "ts-mcp-server",
      "args": [],
      "timeout": 60000
    }
  }
}
```

### Issue: Authentication Errors

**Verify token is set:**

```bash
# Check environment variable
echo $MCP_AUTH_TOKEN

# Set token
export MCP_AUTH_TOKEN=your-secret-token
```

### Issue: Rate Limit Exceeded

**Increase rate limit:**

```json
{
  "mcpServers": {
    "debugger": {
      "command": "ts-mcp-server",
      "args": [],
      "env": {
        "MCP_RATE_LIMIT": "200"
      }
    }
  }
}
```

### Issue: Debug Logging

**Enable debug logging:**

```json
{
  "mcpServers": {
    "debugger": {
      "command": "ts-mcp-server",
      "args": [],
      "env": {
        "MCP_LOG_LEVEL": "debug",
        "DEBUG": "mcp:*"
      }
    }
  }
}
```

## See Also

- [README.md](./README.md) - Main documentation
- [AI-AGENT-INTEGRATION.md](./AI-AGENT-INTEGRATION.md) - AI agent integration guide
- [VSCODE-INTEGRATION.md](./VSCODE-INTEGRATION.md) - VS Code integration guide
- [TOOL-REFERENCE.md](./TOOL-REFERENCE.md) - Complete tool reference
- [INSTALLATION.md](../../INSTALLATION.md) - Installation guide

## Support

For configuration help:

- **Documentation**: [Full documentation](https://github.com/digital-defiance/ai-capabilities-suite/tree/main/packages/mcp-debugger-server)
- **Issues**: [GitHub Issues](https://github.com/digital-defiance/ai-capabilities-suite/issues)
- **Email**: <info@digitaldefiance.org>
