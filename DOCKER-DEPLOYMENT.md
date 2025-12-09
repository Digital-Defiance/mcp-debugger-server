# Docker Deployment Guide

This guide covers deploying the MCP Debugger Server using Docker for containerized environments.

## Table of Contents

- [Quick Start](#quick-start)
- [Docker Image](#docker-image)
- [Docker Compose](#docker-compose)
- [Configuration](#configuration)
- [Volumes and Persistence](#volumes-and-persistence)
- [Networking](#networking)
- [Security](#security)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## Quick Start

### Pull and Run

```bash
# Pull the latest image
docker pull digitaldefiance/mcp-debugger-server:latest

# Run the container
docker run -d \
  --name mcp-debugger \
  -p 3000:3000 \
  -v $(pwd)/workspace:/workspace:ro \
  digitaldefiance/mcp-debugger-server:latest
```

### Using Docker Compose

```bash
# Clone the repository or download docker-compose.yml
cd packages/mcp-debugger-server

# Start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

## Docker Image

### Available Tags

- `latest` - Latest stable release from main branch
- `v1.0.0` - Specific version tags
- `develop` - Development branch (unstable)
- `main-<sha>` - Specific commit from main branch

### Image Details

- **Base Image:** `node:18-alpine`
- **Size:** ~150MB (optimized multi-stage build)
- **Platforms:** `linux/amd64`, `linux/arm64`
- **User:** Non-root user `mcp` (UID 1001)
- **Init System:** `tini` for proper signal handling

### Building Locally

```bash
# From repository root
docker build -t mcp-debugger-server -f packages/mcp-debugger-server/Dockerfile .

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t mcp-debugger-server \
  -f packages/mcp-debugger-server/Dockerfile \
  .
```

## Docker Compose

### Basic Configuration

```yaml
version: "3.8"

services:
  mcp-debugger:
    image: digitaldefiance/mcp-debugger-server:latest
    container_name: mcp-debugger-server
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./workspace:/workspace:ro
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
```

### With Monitoring Stack

```bash
# Start with monitoring (Prometheus + Grafana)
docker-compose --profile monitoring up -d

# Access Grafana at http://localhost:3001
# Default credentials: admin/admin
```

## Configuration

### Environment Variables

| Variable                      | Default      | Description                              |
| ----------------------------- | ------------ | ---------------------------------------- |
| `NODE_ENV`                    | `production` | Node.js environment                      |
| `LOG_LEVEL`                   | `info`       | Logging level (debug, info, warn, error) |
| `PORT`                        | `3000`       | Service port                             |
| `MCP_AUTH_ENABLED`            | `false`      | Enable authentication                    |
| `MCP_AUTH_TOKEN`              | -            | Authentication token                     |
| `MCP_RATE_LIMIT_ENABLED`      | `false`      | Enable rate limiting                     |
| `MCP_RATE_LIMIT_MAX_REQUESTS` | `100`        | Max requests per window                  |
| `MCP_RATE_LIMIT_WINDOW_MS`    | `60000`      | Rate limit window (ms)                   |
| `MCP_SESSION_TIMEOUT_MS`      | `3600000`    | Session timeout (ms)                     |
| `MCP_METRICS_ENABLED`         | `false`      | Enable Prometheus metrics                |
| `MCP_METRICS_PORT`            | `9090`       | Metrics endpoint port                    |

### Example with Authentication

```yaml
services:
  mcp-debugger:
    image: digitaldefiance/mcp-debugger-server:latest
    environment:
      - MCP_AUTH_ENABLED=true
      - MCP_AUTH_TOKEN=${MCP_AUTH_TOKEN} # Set in .env file
      - MCP_RATE_LIMIT_ENABLED=true
      - MCP_RATE_LIMIT_MAX_REQUESTS=100
```

Create a `.env` file:

```bash
MCP_AUTH_TOKEN=your-secret-token-here
```

## Volumes and Persistence

### Recommended Volume Mounts

```yaml
volumes:
  # Workspace (read-only) - code to debug
  - ./workspace:/workspace:ro

  # Logs (read-write) - application logs
  - ./logs:/app/logs

  # Config (read-only) - custom configuration
  - ./config:/app/config:ro

  # Temp (tmpfs) - temporary files
  - type: tmpfs
    target: /tmp
```

### Data Persistence

The container is designed to be stateless. Debug sessions are ephemeral and don't require persistence. However, you may want to persist:

- **Logs:** Mount `/app/logs` for audit trails
- **Metrics:** Use external Prometheus for long-term storage
- **Configuration:** Mount custom config files

## Networking

### Port Mapping

```yaml
ports:
  - "3000:3000" # Main service (stdio-based MCP)
  - "9090:9090" # Metrics endpoint (if enabled)
```

### Custom Network

```yaml
networks:
  mcp-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

### Connecting Multiple Services

```yaml
services:
  mcp-debugger:
    networks:
      - mcp-network

  your-app:
    networks:
      - mcp-network
    depends_on:
      - mcp-debugger
```

## Security

### Security Best Practices

1. **Non-root User:** Container runs as user `mcp` (UID 1001)
2. **Read-only Filesystem:** Root filesystem is read-only
3. **No New Privileges:** Security option enabled
4. **Resource Limits:** CPU and memory limits configured
5. **Minimal Base Image:** Alpine Linux for reduced attack surface

### Security Options

```yaml
security_opt:
  - no-new-privileges:true
read_only: true
tmpfs:
  - /tmp
  - /app/logs
cap_drop:
  - ALL
cap_add:
  - NET_BIND_SERVICE # Only if needed
```

### Secrets Management

Use Docker secrets or environment variables from secure sources:

```bash
# Using Docker secrets
echo "your-token" | docker secret create mcp_auth_token -

# In docker-compose.yml
secrets:
  mcp_auth_token:
    external: true

services:
  mcp-debugger:
    secrets:
      - mcp_auth_token
```

## Monitoring

### Health Checks

The container includes a built-in health check:

```yaml
healthcheck:
  test: ["CMD", "node", "-e", "process.exit(0)"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 5s
```

Check health status:

```bash
docker inspect --format='{{.State.Health.Status}}' mcp-debugger-server
```

### Prometheus Metrics

Enable metrics collection:

```yaml
environment:
  - MCP_METRICS_ENABLED=true
  - MCP_METRICS_PORT=9090
ports:
  - "9090:9090"
```

Metrics available at `http://localhost:9090/metrics`

### Logging

View logs:

```bash
# Follow logs
docker-compose logs -f mcp-debugger

# Last 100 lines
docker-compose logs --tail=100 mcp-debugger

# Logs since timestamp
docker-compose logs --since 2024-01-01T00:00:00 mcp-debugger
```

Configure log rotation:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs mcp-debugger-server

# Check container status
docker ps -a | grep mcp-debugger

# Inspect container
docker inspect mcp-debugger-server
```

### Permission Issues

```bash
# Ensure volumes have correct permissions
sudo chown -R 1001:1001 ./logs ./workspace

# Or run with user override (not recommended)
docker run --user root ...
```

### Network Issues

```bash
# Check network connectivity
docker exec mcp-debugger-server ping -c 3 google.com

# Check port bindings
docker port mcp-debugger-server

# Test from host
curl http://localhost:3000/health
```

### Resource Issues

```bash
# Check resource usage
docker stats mcp-debugger-server

# Increase limits in docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 4G
```

### Debug Mode

Run container in debug mode:

```bash
docker run -it --rm \
  -e LOG_LEVEL=debug \
  -e NODE_ENV=development \
  digitaldefiance/mcp-debugger-server:latest
```

## Production Deployment

### Kubernetes Deployment

Example Kubernetes manifest:

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
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: LOG_LEVEL
              value: "info"
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "2Gi"
              cpu: "2000m"
          livenessProbe:
            exec:
              command:
                - node
                - -e
                - process.exit(0)
            initialDelaySeconds: 5
            periodSeconds: 30
          readinessProbe:
            exec:
              command:
                - node
                - -e
                - process.exit(0)
            initialDelaySeconds: 5
            periodSeconds: 10
```

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml mcp-stack

# Scale service
docker service scale mcp-stack_mcp-debugger=3

# Update service
docker service update --image digitaldefiance/mcp-debugger-server:v1.1.0 mcp-stack_mcp-debugger
```

### High Availability

For production HA setup:

1. **Load Balancer:** Use nginx or HAProxy
2. **Multiple Replicas:** Run 3+ instances
3. **Health Checks:** Configure proper health checks
4. **Auto-restart:** Use `restart: unless-stopped`
5. **Monitoring:** Set up Prometheus + Grafana
6. **Logging:** Centralized logging (ELK, Loki)
7. **Backups:** Regular backup of logs and metrics

### Performance Tuning

```yaml
# Optimize for production
environment:
  - NODE_ENV=production
  - NODE_OPTIONS=--max-old-space-size=2048

deploy:
  resources:
    limits:
      cpus: "4"
      memory: 4G
    reservations:
      cpus: "1"
      memory: 1G

  # Update strategy
  update_config:
    parallelism: 1
    delay: 10s
    failure_action: rollback

  # Restart policy
  restart_policy:
    condition: on-failure
    delay: 5s
    max_attempts: 3
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MCP Server README](./README.md)
- [API Documentation](./API.md)
- [Tool Reference](./TOOL-REFERENCE.md)

## Support

For issues and questions:

- GitHub Issues: https://github.com/digital-defiance/ai-capabilities-suite/issues
- Email: info@digitaldefiance.org
- Documentation: https://github.com/digital-defiance/ai-capabilities-suite

## License

MIT License - see [LICENSE](./LICENSE) file for details.
