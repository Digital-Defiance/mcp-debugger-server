# Dockerfile for MCP Debugger Server
# Installs the published NPM package

FROM node:18-alpine

# Install runtime dependencies
RUN apk add --no-cache tini

# Create non-root user for security
RUN addgroup -g 1001 -S mcp && \
    adduser -u 1001 -S mcp -G mcp

# Set working directory
WORKDIR /app

# Install the published package from NPM
RUN npm install -g @ai-capabilities-suite/mcp-debugger-server@1.1.6

# Set environment variables
ENV NODE_ENV=production \
    LOG_LEVEL=info

# Switch to non-root user
USER mcp

# Use tini as init system for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Run the MCP server
CMD ["ts-mcp-server"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "process.exit(0)" || exit 1

# Labels for metadata
LABEL org.opencontainers.image.title="MCP Debugger Server" \
      org.opencontainers.image.description="Enterprise-grade MCP server for Node.js and TypeScript debugging" \
      org.opencontainers.image.version="1.1.6" \
      org.opencontainers.image.vendor="DigiDefiance" \
      org.opencontainers.image.authors="Jessica Mulein <jessica@digitaldefiance.org>" \
      org.opencontainers.image.url="https://github.com/digital-defiance/ai-capabilities-suite" \
      org.opencontainers.image.source="https://github.com/digital-defiance/ai-capabilities-suite" \
      org.opencontainers.image.licenses="MIT"
