# Docker Quick Reference

Quick commands and references for Docker deployment of MCP Debugger Server.

## Quick Start Commands

```bash
# Pull and run
docker pull digidefiance/mcp-debugger-server:latest
docker run -d --name mcp-debugger digidefiance/mcp-debugger-server:latest

# Using docker-compose
docker-compose up -d
docker-compose logs -f
docker-compose down

# Build locally
docker build -t mcp-debugger -f packages/mcp-debugger-server/Dockerfile .
```

## Common Operations

### Container Management

```bash
# Start container
docker start mcp-debugger

# Stop container
docker stop mcp-debugger

# Restart container
docker restart mcp-debugger

# Remove container
docker rm mcp-debugger

# View logs
docker logs -f mcp-debugger

# Execute command in container
docker exec -it mcp-debugger sh
```

### Image Management

```bash
# List images
docker images digidefiance/mcp-debugger-server

# Pull specific version
docker pull digidefiance/mcp-debugger-server:v1.0.0

# Remove image
docker rmi digidefiance/mcp-debugger-server:latest

# Inspect image
docker inspect digidefiance/mcp-debugger-server:latest
```

### Health and Monitoring

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' mcp-debugger

# View resource usage
docker stats mcp-debugger

# View processes
docker top mcp-debugger
```

## Environment Variables

```bash
# Run with custom environment
docker run -d \
  -e NODE_ENV=production \
  -e LOG_LEVEL=debug \
  -e MCP_AUTH_ENABLED=true \
  -e MCP_AUTH_TOKEN=your-token \
  digidefiance/mcp-debugger-server:latest
```

## Volume Mounts

```bash
# Mount workspace and logs
docker run -d \
  -v $(pwd)/workspace:/workspace:ro \
  -v $(pwd)/logs:/app/logs \
  digidefiance/mcp-debugger-server:latest
```

## Port Mapping

```bash
# Expose ports
docker run -d \
  -p 3000:3000 \
  -p 9090:9090 \
  digidefiance/mcp-debugger-server:latest
```

## Docker Compose Profiles

```bash
# Start with monitoring stack
docker-compose --profile monitoring up -d

# Start only main service
docker-compose up -d mcp-debugger
```

## Troubleshooting

```bash
# View detailed logs
docker logs --tail 100 mcp-debugger

# Check container status
docker ps -a | grep mcp-debugger

# Inspect container configuration
docker inspect mcp-debugger

# Test network connectivity
docker exec mcp-debugger ping -c 3 google.com

# Check disk usage
docker system df
```

## Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

## Multi-Platform Build

```bash
# Create builder
docker buildx create --name multiarch --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t digidefiance/mcp-debugger-server:latest \
  --push \
  -f packages/mcp-debugger-server/Dockerfile \
  .
```

## Security Scanning

```bash
# Scan with Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image digidefiance/mcp-debugger-server:latest

# Scan with Snyk
snyk container test digidefiance/mcp-debugger-server:latest
```

## Files Created

- `Dockerfile` - Multi-stage optimized Docker image
- `docker-compose.yml` - Docker Compose configuration with monitoring
- `.dockerignore` - Build context optimization
- `DOCKER-DEPLOYMENT.md` - Comprehensive deployment guide
- `DOCKER-SETUP-GUIDE.md` - Manual setup instructions
- `.github/workflows/docker-publish.yml` - CI/CD automation

## Documentation

- [Full Deployment Guide](./DOCKER-DEPLOYMENT.md)
- [Setup Guide](./DOCKER-SETUP-GUIDE.md)
- [Main README](./README.md)
- [API Documentation](./API.md)

## Support

- GitHub: https://github.com/digital-defiance/ai-capabilities-suite
- Issues: https://github.com/digital-defiance/ai-capabilities-suite/issues
- Email: info@digitaldefiance.org
