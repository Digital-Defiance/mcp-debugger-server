# NPM Publishing Guide

This guide covers the complete process for publishing the MCP Debugger Server packages to NPM, including setup, manual publishing, and automated workflows.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Manual Publishing](#manual-publishing)
- [Automated Publishing](#automated-publishing)
- [Version Management](#version-management)
- [Publishing Checklist](#publishing-checklist)
- [Troubleshooting](#troubleshooting)
- [Post-Publishing](#post-publishing)

## Prerequisites

Before publishing to NPM, ensure you have:

1. **NPM Account**: Create an account at [npmjs.com](https://www.npmjs.com/signup)
2. **Organization Access**: Request access to the `@ai-capabilities-suite` organization (or create your own)
3. **Two-Factor Authentication**: Enable 2FA on your NPM account for security
4. **Node.js**: Version 18.0.0 or higher installed
5. **Repository Access**: Write access to the GitHub repository

## Initial Setup

### 1. NPM Account Configuration

#### Create NPM Account
```bash
# If you don't have an account, create one
npm adduser
```

#### Login to NPM
```bash
# Login to your NPM account
npm login

# Verify you're logged in
npm whoami
```

#### Enable Two-Factor Authentication
1. Go to [npmjs.com/settings/profile](https://www.npmjs.com/settings/profile)
2. Navigate to "Two-Factor Authentication"
3. Enable 2FA for "Authorization and Publishing"
4. Save your recovery codes in a secure location

### 2. Generate NPM Access Token

For automated publishing via GitHub Actions, you need an access token:

1. Go to [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
2. Click "Generate New Token" → "Classic Token"
3. Select "Automation" type (for CI/CD)
4. Set permissions:
   - ✅ Read and write packages
   - ✅ Read and write to the registry
5. Copy the token (you won't see it again!)

### 3. Configure GitHub Secrets

Add the NPM token to your GitHub repository:

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste your NPM access token
6. Click "Add secret"

### 4. Verify Package Configuration

Check that `package.json` is properly configured:

```json
{
  "name": "@ai-capabilities-suite/mcp-debugger-server",
  "version": "1.0.0",
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "API.md",
    "TOOL-REFERENCE.md",
    "AI-AGENT-INTEGRATION.md",
    "VSCODE-INTEGRATION.md"
  ]
}
```

## Manual Publishing

### Pre-Publishing Steps

1. **Update Version Number**
   ```bash
   # Update version in package.json
   cd packages/mcp-debugger-server
   npm version patch  # or minor, or major
   ```

2. **Clean and Build**
   ```bash
   # From repository root
   yarn clean
   yarn install
   yarn build
   ```

3. **Run Tests**
   ```bash
   # Run full test suite
   yarn test
   
   # Run E2E tests
   yarn test:e2e
   ```

4. **Verify Package Contents**
   ```bash
   # Dry run to see what will be published
   cd packages/mcp-debugger-server
   npm pack --dry-run
   
   # Or create actual tarball to inspect
   npm pack
   tar -tzf ai-capabilities-suite-mcp-debugger-server-*.tgz
   ```

### Publishing to NPM

#### Important: Publishing Order

The MCP Debugger consists of two packages that must be published in order:

1. **mcp-debugger-core** - Core debugging engine (dependency)
2. **mcp-debugger-server** - MCP server (depends on core)

**Always publish the core package first**, then the server package.

#### First-Time Publishing

For the first publish, use the `--access public` flag:

```bash
# From repository root - publish both packages
npm run publish:debugger

# Or manually:
# 1. Publish core first
cd packages/mcp-debugger-core
npm publish --access public

# 2. Then publish server
cd ../mcp-debugger-server
npm publish --access public
```

#### Subsequent Publishing

```bash
# From repository root - publish both packages
npm run publish:debugger

# Or manually:
# 1. Publish core first
cd packages/mcp-debugger-core
npm publish

# 2. Then publish server
cd ../mcp-debugger-server
npm publish
```

#### Publish with Build and Test

```bash
# From repository root - build, test, then publish
npm run publish:debugger:check
```

#### Publishing with Tags

Use tags for pre-release versions:

```bash
# Beta release
npm publish --tag beta

# Next/canary release
npm publish --tag next

# Latest (default)
npm publish --tag latest
```

### Verify Publication

After publishing, verify the package:

```bash
# Check package info
npm info @ai-capabilities-suite/mcp-debugger-server

# Install in a test directory
mkdir test-install && cd test-install
npm init -y
npm install @ai-capabilities-suite/mcp-debugger-server

# Test the CLI
npx ts-mcp-server --version
```

## Automated Publishing

The repository includes a GitHub Actions workflow for automated publishing.

### Workflow Triggers

The workflow can be triggered in two ways:

#### 1. GitHub Release (Recommended)

When you create a GitHub release, the workflow automatically publishes:

```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0

# Then create a release on GitHub:
# 1. Go to Releases → Draft a new release
# 2. Choose the tag (v1.0.0)
# 3. Generate release notes
# 4. Publish release
```

#### 2. Manual Workflow Dispatch

Trigger the workflow manually from GitHub Actions:

1. Go to Actions → "Publish to NPM"
2. Click "Run workflow"
3. Select options:
   - **Package**: Choose which package to publish
   - **Tag**: Choose NPM dist-tag (latest, beta, next)
4. Click "Run workflow"

### Workflow Configuration

The workflow (`.github/workflows/npm-publish.yml`) performs:

1. ✅ Checkout code
2. ✅ Setup Node.js 20
3. ✅ Install dependencies
4. ✅ Build packages
5. ✅ Run tests
6. ✅ Publish to NPM with provenance
7. ✅ Comment on release with install instructions

### Monitoring Workflow

Monitor the publishing workflow:

1. Go to Actions tab in GitHub
2. Click on the "Publish to NPM" workflow run
3. Check each step for success/failure
4. Review logs if there are errors

## Version Management

### Semantic Versioning

Follow [Semantic Versioning](https://semver.org/) (SemVer):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward compatible

### Version Update Commands

```bash
# Patch version (1.0.0 → 1.0.1)
npm version patch

# Minor version (1.0.0 → 1.1.0)
npm version minor

# Major version (1.0.0 → 2.0.0)
npm version major

# Pre-release versions
npm version prerelease --preid=beta  # 1.0.0 → 1.0.1-beta.0
npm version prerelease --preid=alpha # 1.0.0 → 1.0.1-alpha.0
```

### Updating Multiple Packages

When publishing both core and server packages, **keep versions synchronized**:

```bash
# Update mcp-debugger-core
cd packages/mcp-debugger-core
npm version patch  # 1.0.0 → 1.0.1

# Update mcp-debugger-server (same version)
cd ../mcp-debugger-server
npm version patch  # 1.0.0 → 1.0.1

# Commit version changes
git add .
git commit -m "chore: bump version to 1.0.1"
git push

# Publish both packages
cd ../..
npm run publish:debugger
```

**Note**: While the packages can have different versions, it's recommended to keep them synchronized for easier maintenance and user understanding.

## Publishing Checklist

Use this checklist before each publish:

### Pre-Publish Checklist

- [ ] All tests passing (`yarn test`)
- [ ] E2E tests passing (`yarn test:e2e`)
- [ ] Code coverage meets requirements (>90%)
- [ ] Documentation updated (README, API docs)
- [ ] CHANGELOG.md updated with changes
- [ ] Version number updated in package.json
- [ ] No uncommitted changes (`git status`)
- [ ] On main/master branch
- [ ] Latest code pulled (`git pull`)
- [ ] Dependencies up to date
- [ ] Build successful (`yarn build`)
- [ ] Package contents verified (`npm pack --dry-run`)

### Post-Publish Checklist

- [ ] Package visible on npmjs.com
- [ ] Installation works (`npm install @ai-capabilities-suite/mcp-debugger-server`)
- [ ] CLI executable works (`npx ts-mcp-server --version`)
- [ ] Documentation links work
- [ ] GitHub release created (if applicable)
- [ ] Release notes published
- [ ] Announcement made (if major release)
- [ ] Dependencies updated in dependent projects

## Troubleshooting

### Common Issues

#### Issue: "You must be logged in to publish packages"

**Solution:**
```bash
npm login
npm whoami  # Verify login
```

#### Issue: "You do not have permission to publish"

**Causes:**
- Not a member of the `@ai-capabilities-suite` organization
- Package name already taken
- 2FA not configured

**Solutions:**
```bash
# Check organization membership
npm org ls @ai-capabilities-suite

# Request access from organization owner
# Or publish under your own scope: @yourusername/package-name
```

#### Issue: "Version already exists"

**Solution:**
```bash
# Increment version
npm version patch

# Or manually edit package.json and update version
```

#### Issue: "npm ERR! 403 Forbidden"

**Causes:**
- Invalid NPM token
- Token expired
- Insufficient permissions

**Solutions:**
1. Generate new NPM token
2. Update GitHub secret `NPM_TOKEN`
3. Verify token has publish permissions

#### Issue: "Package size too large"

**Solution:**
```bash
# Check what's being included
npm pack --dry-run

# Update .npmignore to exclude unnecessary files
echo "test/" >> .npmignore
echo "*.spec.ts" >> .npmignore
echo "coverage/" >> .npmignore
```

#### Issue: "Build fails in CI"

**Solutions:**
1. Run build locally: `yarn build`
2. Check Node.js version matches CI (18+)
3. Verify all dependencies installed
4. Check for platform-specific issues

### Debugging Failed Publishes

```bash
# Enable verbose logging
npm publish --verbose

# Check package contents
npm pack
tar -tzf *.tgz | less

# Verify package.json
cat package.json | jq .

# Test installation locally
npm install ./ai-capabilities-suite-mcp-debugger-server-*.tgz
```

## Post-Publishing

### Verify Installation

Test the published package:

```bash
# Create test directory
mkdir /tmp/test-mcp-debugger && cd /tmp/test-mcp-debugger

# Initialize project
npm init -y

# Install published package
npm install @ai-capabilities-suite/mcp-debugger-server

# Test CLI
npx ts-mcp-server --version

# Test programmatic usage
node -e "const mcp = require('@ai-capabilities-suite/mcp-debugger-server'); console.log('Success!');"
```

### Update Documentation

After publishing:

1. **Update README badges** (if using shields.io):
   ```markdown
   ![npm version](https://img.shields.io/npm/v/@ai-capabilities-suite/mcp-debugger-server)
   ![npm downloads](https://img.shields.io/npm/dm/@ai-capabilities-suite/mcp-debugger-server)
   ```

2. **Update installation instructions** in README.md

3. **Create GitHub release** with:
   - Version tag (v1.0.0)
   - Release notes
   - Breaking changes (if any)
   - Migration guide (if needed)

4. **Announce release**:
   - GitHub Discussions
   - Twitter/Social media
   - Discord/Slack communities
   - Blog post (for major releases)

### Monitor Package Health

After publishing, monitor:

1. **NPM Package Page**: Check for issues
   - https://www.npmjs.com/package/@ai-capabilities-suite/mcp-debugger-server

2. **Download Stats**: Track adoption
   ```bash
   npm info @ai-capabilities-suite/mcp-debugger-server
   ```

3. **GitHub Issues**: Watch for bug reports

4. **Security Alerts**: Monitor for vulnerabilities
   ```bash
   npm audit
   ```

## Best Practices

### Security

1. **Never commit NPM tokens** to version control
2. **Use automation tokens** for CI/CD (not personal tokens)
3. **Enable 2FA** on NPM account
4. **Rotate tokens** periodically (every 90 days)
5. **Use provenance** for supply chain security

### Quality

1. **Always run tests** before publishing
2. **Maintain high code coverage** (>90%)
3. **Update documentation** with each release
4. **Follow semantic versioning** strictly
5. **Keep dependencies updated**

### Process

1. **Use feature branches** for development
2. **Create pull requests** for review
3. **Tag releases** in git
4. **Maintain CHANGELOG.md**
5. **Automate where possible**

## Additional Resources

- [NPM Publishing Documentation](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [NPM Provenance](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub Actions for NPM](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)
- [Package.json Documentation](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)

## Support

For publishing issues:

1. Check this guide first
2. Review [NPM documentation](https://docs.npmjs.com/)
3. Open an issue on GitHub
4. Contact package maintainers

---

**Last Updated**: 2024
**Maintainer**: Digital Defiance
**Package**: @ai-capabilities-suite/mcp-debugger-server
