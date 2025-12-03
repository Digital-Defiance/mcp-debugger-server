# Docker Hub Setup Guide

This guide walks you through the manual steps required to set up Docker Hub publishing for the MCP Debugger Server.

## Prerequisites

- GitHub repository with admin access
- Docker installed locally
- Git installed locally

## Step 1: Create Docker Hub Account

1. Go to [Docker Hub](https://hub.docker.com/)
2. Click "Sign Up" and create an account
3. Verify your email address
4. Log in to Docker Hub

## Step 2: Create Docker Hub Repository

1. Click "Create Repository" button
2. Fill in repository details:
   - **Name:** `ts-mcp-server`
   - **Description:** "Enterprise-grade MCP server for Node.js and TypeScript debugging"
   - **Visibility:** Public (or Private if preferred)
3. Click "Create"

Your repository will be available at: `digidefiance/mcp-debugger-server`

## Step 3: Create Docker Hub Access Token

1. Click on your username in the top right
2. Select "Account Settings"
3. Go to "Security" tab
4. Click "New Access Token"
5. Fill in token details:
   - **Description:** "GitHub Actions CI/CD"
   - **Access permissions:** Read, Write, Delete
6. Click "Generate"
7. **IMPORTANT:** Copy the token immediately - you won't be able to see it again!

## Step 4: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add the following secrets:

### DOCKER_USERNAME

- **Name:** `DOCKER_USERNAME`
- **Value:** Your Docker Hub username (e.g., `digitaldefiance`)

### DOCKER_TOKEN

- **Name:** `DOCKER_TOKEN`
- **Value:** The access token you generated in Step 3

### Optional: SNYK_TOKEN (for security scanning)

- **Name:** `SNYK_TOKEN`
- **Value:** Your Snyk API token (get from https://snyk.io/)

## Step 5: Test Local Docker Build

Before pushing to Docker Hub, test the build locally:

```bash
# Navigate to repository root
cd /path/to/ai-capabilities-suite

# Build the image
docker build -t digidefiance/mcp-debugger-server:test -f packages/mcp-debugger-server/Dockerfile .

# Test the image
docker run --rm digidefiance/mcp-debugger-server:test node --version

# Test the CLI
docker run --rm digidefiance/mcp-debugger-server:test node dist/src/cli.js --help
```

## Step 6: Manual First Push (Optional)

You can manually push the first image before setting up CI/CD:

```bash
# Log in to Docker Hub
docker login -u digidefiance

# Tag the image
docker tag digidefiance/mcp-debugger-server:test digidefiance/mcp-debugger-server:latest

# Push to Docker Hub
docker push digidefiance/mcp-debugger-server:latest

# Push with version tag
docker tag digidefiance/mcp-debugger-server:test digidefiance/mcp-debugger-server:v1.0.0
docker push digidefiance/mcp-debugger-server:v1.0.0
```

## Step 7: Trigger GitHub Actions Workflow

Once secrets are configured, the workflow will automatically run on:

- Push to `main` or `develop` branches
- New tags matching `v*.*.*`
- Manual workflow dispatch

### Manual Trigger

1. Go to Actions tab in GitHub
2. Select "Docker Image CI/CD" workflow
3. Click "Run workflow"
4. Select branch and optional tag
5. Click "Run workflow"

### Automatic Trigger (Tag)

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

This will automatically:
- Build the Docker image
- Run security scans
- Push to Docker Hub with multiple tags
- Update Docker Hub description

## Step 8: Verify Deployment

1. Go to [Docker Hub](https://hub.docker.com/r/digidefiance/mcp-debugger-server)
2. Verify the image is published
3. Check the tags are correct
4. Verify the description is updated

### Pull and Test

```bash
# Pull the published image
docker pull digidefiance/mcp-debugger-server:latest

# Run it
docker run -d --name mcp-test digidefiance/mcp-debugger-server:latest

# Check logs
docker logs mcp-test

# Clean up
docker stop mcp-test
docker rm mcp-test
```

## Step 9: Set Up Docker Hub Webhooks (Optional)

Configure webhooks to notify external services when images are pushed:

1. Go to your Docker Hub repository
2. Click "Webhooks" tab
3. Add webhook URL (e.g., for Slack, Discord, or custom service)
4. Test the webhook

## Troubleshooting

### Authentication Failed

```bash
# Verify credentials
docker login -u digitaldefiance

# Check token permissions
# Ensure token has Read, Write, Delete permissions
```

### Build Fails in GitHub Actions

1. Check the Actions logs for detailed error messages
2. Verify secrets are configured correctly
3. Test build locally first
4. Check Dockerfile syntax

### Image Size Too Large

```bash
# Check image size
docker images digidefiance/mcp-debugger-server

# Analyze layers
docker history digidefiance/mcp-debugger-server:latest

# Use dive for detailed analysis
dive digidefiance/mcp-debugger-server:latest
```

### Security Scan Failures

If Trivy or Snyk report vulnerabilities:

1. Review the security report in GitHub Actions
2. Update base image: `FROM node:18-alpine` → `FROM node:20-alpine`
3. Update dependencies: `npm update`
4. Rebuild and re-scan

## Multi-Platform Builds

To build for multiple architectures (amd64, arm64):

```bash
# Create buildx builder
docker buildx create --name multiarch --use

# Build and push for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t digidefiance/mcp-debugger-server:latest \
  -f packages/mcp-debugger-server/Dockerfile \
  --push \
  .
```

## Maintenance

### Regular Updates

1. **Update base image:** Check for new Node.js Alpine releases
2. **Update dependencies:** Run `npm update` regularly
3. **Security patches:** Monitor Dependabot alerts
4. **Re-scan images:** Run security scans periodically

### Version Management

Follow semantic versioning:

- **Major (v2.0.0):** Breaking changes
- **Minor (v1.1.0):** New features, backward compatible
- **Patch (v1.0.1):** Bug fixes

### Cleanup Old Images

```bash
# List all tags
docker images digidefiance/mcp-debugger-server

# Remove old tags from Docker Hub
# (Use Docker Hub UI or API)

# Clean up local images
docker image prune -a
```

## Best Practices

1. **Always test locally** before pushing
2. **Use semantic versioning** for tags
3. **Keep images small** - use Alpine base
4. **Scan for vulnerabilities** regularly
5. **Document changes** in CHANGELOG.md
6. **Monitor image pulls** in Docker Hub analytics
7. **Set up automated builds** for all branches
8. **Use multi-stage builds** to reduce size
9. **Pin dependency versions** for reproducibility
10. **Enable Docker Content Trust** for signing

## Additional Resources

- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [GitHub Actions Docker Documentation](https://docs.github.com/en/actions/publishing-packages/publishing-docker-images)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

## Support

For issues with Docker Hub setup:

- Docker Hub Support: https://hub.docker.com/support/
- GitHub Issues: https://github.com/digital-defiance/ai-capabilities-suite/issues
- Email: info@digitaldefiance.org

## Next Steps

After completing this setup:

1. ✅ Docker Hub account created
2. ✅ Repository created
3. ✅ Access token generated
4. ✅ GitHub secrets configured
5. ✅ First image pushed
6. → Continue with [Docker Deployment Guide](./DOCKER-DEPLOYMENT.md)
7. → Set up monitoring and alerts
8. → Configure automated security scanning
