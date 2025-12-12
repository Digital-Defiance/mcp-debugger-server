# MCP ACS Debugger Server - Documentation Index

Complete documentation for the MCP ACS Debugger Server package.

## Quick Links

### Getting Started

- **[README.md](./README.md)** - Main documentation, features, and usage
- **[NPM-SETUP-GUIDE.md](./NPM-SETUP-GUIDE.md)** - 5-minute setup for first-time publishers

### For Users

- **[README.md](./README.md)** - Installation and basic usage
- **[TOOL-REFERENCE.md](./TOOL-REFERENCE.md)** - Complete reference for all 25+ tools
- **[API.md](./API.md)** - Detailed API documentation
- **[TESTING.md](./TESTING.md)** - Testing guide and examples

### For AI Agents

- **[AI-AGENT-INTEGRATION.md](./AI-AGENT-INTEGRATION.md)** - Integration guide for Kiro, Amazon Q, etc.
- **[TOOL-REFERENCE.md](./TOOL-REFERENCE.md)** - Tool schemas and parameters

### For IDE Integration

- **[VSCODE-INTEGRATION.md](./VSCODE-INTEGRATION.md)** - VS Code and GitHub Copilot integration

### For Publishers/Maintainers

- **[PUBLISHING.md](./PUBLISHING.md)** - Comprehensive NPM publishing guide
- **[NPM-SETUP-GUIDE.md](./NPM-SETUP-GUIDE.md)** - Quick setup guide
- **[NPM-TROUBLESHOOTING.md](./NPM-TROUBLESHOOTING.md)** - Common issues and solutions
- **[.publish-checklist.md](./.publish-checklist.md)** - Pre-publish checklist

## Documentation by Topic

### Installation & Setup

| Document                                                 | Description                              | Audience      |
| -------------------------------------------------------- | ---------------------------------------- | ------------- |
| [README.md](./README.md)                                 | Installation instructions, prerequisites | All users     |
| [NPM-SETUP-GUIDE.md](./NPM-SETUP-GUIDE.md)               | First-time NPM publishing setup          | Publishers    |
| [DOCKER-DEPLOYMENT.md](./DOCKER-DEPLOYMENT.md)           | Docker deployment guide                  | DevOps, Users |
| [DOCKER-SETUP-GUIDE.md](./DOCKER-SETUP-GUIDE.md)         | Docker Hub setup instructions            | Publishers    |
| [DOCKER-QUICK-REFERENCE.md](./DOCKER-QUICK-REFERENCE.md) | Quick Docker commands                    | All users     |

### Usage & Features

| Document                                 | Description                           | Audience         |
| ---------------------------------------- | ------------------------------------- | ---------------- |
| [README.md](./README.md)                 | Feature overview, common scenarios    | All users        |
| [TOOL-REFERENCE.md](./TOOL-REFERENCE.md) | Complete tool reference with examples | Users, AI agents |
| [API.md](./API.md)                       | Programmatic API documentation        | Developers       |

### Integration

| Document                                             | Description                     | Audience      |
| ---------------------------------------------------- | ------------------------------- | ------------- |
| [AI-AGENT-INTEGRATION.md](./AI-AGENT-INTEGRATION.md) | AI agent integration patterns   | AI developers |
| [VSCODE-INTEGRATION.md](./VSCODE-INTEGRATION.md)     | VS Code and Copilot integration | IDE users     |

### Testing & Quality

| Document                                         | Description                      | Audience   |
| ------------------------------------------------ | -------------------------------- | ---------- |
| [TESTING.md](./TESTING.md)                       | Testing guide, running tests     | Developers |
| [.publish-checklist.md](./.publish-checklist.md) | Quality checklist before publish | Publishers |

### Publishing & Maintenance

| Document                                           | Description                   | Audience       |
| -------------------------------------------------- | ----------------------------- | -------------- |
| [PUBLISHING.md](./PUBLISHING.md)                   | Complete publishing guide     | Maintainers    |
| [NPM-SETUP-GUIDE.md](./NPM-SETUP-GUIDE.md)         | Quick setup for publishers    | New publishers |
| [NPM-TROUBLESHOOTING.md](./NPM-TROUBLESHOOTING.md) | Troubleshooting common issues | Publishers     |

## Documentation Workflow

### For New Users

1. Start with [README.md](./README.md) for overview and installation
2. Review [TOOL-REFERENCE.md](./TOOL-REFERENCE.md) for available tools
3. Check [AI-AGENT-INTEGRATION.md](./AI-AGENT-INTEGRATION.md) for AI agent setup
4. Refer to [TESTING.md](./TESTING.md) for testing examples

### For AI Agent Developers

1. Read [AI-AGENT-INTEGRATION.md](./AI-AGENT-INTEGRATION.md) for integration patterns
2. Review [TOOL-REFERENCE.md](./TOOL-REFERENCE.md) for tool schemas
3. Check [README.md](./README.md) for common debugging scenarios
4. Refer to [API.md](./API.md) for programmatic usage

### For IDE Integration

1. Start with [VSCODE-INTEGRATION.md](./VSCODE-INTEGRATION.md)
2. Review [TOOL-REFERENCE.md](./TOOL-REFERENCE.md) for available tools
3. Check [API.md](./API.md) for programmatic integration
4. Refer to [TESTING.md](./TESTING.md) for testing integration

### For Package Publishers

1. **First Time**: Follow [NPM-SETUP-GUIDE.md](./NPM-SETUP-GUIDE.md) (5 minutes)
2. **Detailed Guide**: Read [PUBLISHING.md](./PUBLISHING.md) for comprehensive info
3. **Before Publishing**: Use [.publish-checklist.md](./.publish-checklist.md)
4. **If Issues**: Check [NPM-TROUBLESHOOTING.md](./NPM-TROUBLESHOOTING.md)

## Quick Reference

### Installation

```bash
# Install from NPM
npm install -g @ai-capabilities-suite/mcp-debugger-server

# Or use Docker
docker pull digitaldefiance/mcp-debugger-server:latest
docker run -d --name mcp-debugger digitaldefiance/mcp-debugger-server:latest

# Verify installation
npx ts-mcp-server --version
```

### Publishing

```bash
# First time setup (5 minutes)
# See: NPM-SETUP-GUIDE.md

# Quick publish
npm version patch
yarn build && yarn test
npm publish

# Detailed guide
# See: PUBLISHING.md
```

### Common Tasks

| Task            | Command                                                  | Documentation                                        |
| --------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| Install package | `npm install @ai-capabilities-suite/mcp-debugger-server` | [README.md](./README.md)                             |
| Run tests       | `yarn test`                                              | [TESTING.md](./TESTING.md)                           |
| Build package   | `yarn build`                                             | [README.md](./README.md)                             |
| Publish to NPM  | `npm publish`                                            | [PUBLISHING.md](./PUBLISHING.md)                     |
| View tools      | See tool reference                                       | [TOOL-REFERENCE.md](./TOOL-REFERENCE.md)             |
| Setup AI agent  | Configure MCP                                            | [AI-AGENT-INTEGRATION.md](./AI-AGENT-INTEGRATION.md) |

## Documentation Standards

All documentation follows these standards:

- **Markdown Format**: All docs use GitHub-flavored Markdown
- **Code Examples**: Include working, tested examples
- **Cross-References**: Link to related documentation
- **Up-to-Date**: Updated with each release
- **Accessible**: Clear language, good structure

## Contributing to Documentation

To improve documentation:

1. Fork the repository
2. Update relevant documentation files
3. Test all code examples
4. Submit pull request
5. Documentation review process

## Support

For documentation issues:

- **GitHub Issues**: [Report documentation issues](https://github.com/digital-defiance/ai-capabilities-suite/issues)
- **Pull Requests**: Submit documentation improvements
- **Email**: <info@digitaldefiance.org>

## Version Information

- **Package Version**: 1.0.0
- **Documentation Version**: 1.0.0
- **Last Updated**: 2024
- **Maintainer**: Digital Defiance

## License

All documentation is licensed under MIT License - See [LICENSE](./LICENSE) file.

---

**Navigation**: [README](./README.md) | [Publishing Guide](./PUBLISHING.md) | [Tool Reference](./TOOL-REFERENCE.md) | [API Docs](./API.md)
