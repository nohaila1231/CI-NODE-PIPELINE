# Quick Reference Card

## One-Liner Usage

```yaml
uses: <org>/node-ci-template/.github/workflows/node-template.yml@v1.0.0
with:
  node-versions: '["20.x"]'
  package-manager: npm
```

## Essential Inputs

| Input | Values | Default |
|-------|--------|---------|
| `node-versions` | JSON array | `["20.x"]` |
| `package-manager` | npm, yarn, pnpm, bun | `npm` |
| `build-command` | Any shell command | `npm run build` |
| `test-command` | Any shell command | `npm test` |

## Quality Checks

| Input | Type | Default |
|-------|------|---------|
| `enable-linting` | true/false | true |
| `enable-type-checking` | true/false | false |
| `enable-coverage` | true/false | false |
| `coverage-threshold` | 0-100 | 80 |
| `fail-on-warnings` | true/false | false |

## Advanced Options

| Category | Inputs |
|----------|--------|
| **Build** | `install-command`, `pre-build-script`, `post-build-script` |
| **Testing** | `coverage-command`, `continue-on-error` |
| **Caching** | `enable-cache`, `cache-key-prefix` |
| **Artifacts** | `enable-artifacts`, `artifact-path`, `artifact-retention-days` |
| **Publishing** | `publish-to-npm`, `npm-registry`, `npm-registry-token` (secret) |

## Common Configs

### React App (Minimal)
```yaml
uses: <org>/node-ci-template/.github/workflows/node-template.yml@v1.0.0
with:
  enable-linting: true
  fail-on-warnings: true
```

### TypeScript Library (Full)
```yaml
uses: <org>/node-ci-template/.github/workflows/node-template.yml@v1.0.0
with:
  node-versions: '["18.x", "20.x", "22.x"]'
  enable-linting: true
  enable-type-checking: true
  enable-coverage: true
  coverage-threshold: '90'
  fail-on-warnings: true
```

### Monorepo (pnpm)
```yaml
uses: <org>/node-ci-template/.github/workflows/node-template.yml@v1.0.0
with:
  working-directory: packages/sdk
  package-manager: pnpm
  install-command: pnpm install --frozen-lockfile
```

### Bun Runtime
```yaml
uses: <org>/node-ci-template/.github/workflows/node-template.yml@v1.0.0
with:
  node-versions: '["22.x"]'
  package-manager: bun
  build-command: bun run build
  test-command: bun test
```

### Publishing to npm
```yaml
uses: <org>/node-ci-template/.github/workflows/node-template.yml@v1.0.0
with:
  publish-to-npm: true
  npm-registry: https://registry.npmjs.org/
secrets:
  npm-registry-token: ${{ secrets.NPM_REGISTRY_TOKEN }}
```

## Secrets Setup

Add to GitHub repo Settings > Secrets and variables > Actions:

```bash
# For installing private packages
NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxx

# For publishing to npm
NPM_REGISTRY_TOKEN=npm_xxxxxxxxxxxxxxxxxxxx
```

Then use in workflow:

```yaml
secrets:
  npm-token: ${{ secrets.NPM_TOKEN }}
  npm-registry-token: ${{ secrets.NPM_REGISTRY_TOKEN }}
```

## Jobs

| Job | Trigger | Description |
|-----|---------|-------------|
| `validate` | Always | Validates input parameters |
| `test` | Always | Runs tests on matrix of Node versions |
| `publish` | If `publish-to-npm: true` | Publishes to npm registry |

## Triggers

In your workflow file (`on:`):

```yaml
on:
  push:
    branches: [main, develop]  # On push to these branches
  pull_request:
    branches: [main]            # On PR against main
  workflow_dispatch:            # Manual trigger
```

## Matrix Testing

Tests on all specified Node versions:

```yaml
with:
  node-versions: '["18.x", "20.x", "22.x"]'
  # Runs test job 3 times, one for each version
```

## Pre/Post Hooks

Run custom scripts:

```yaml
with:
  pre-install-script: 'echo "Before install"'
  post-install-script: 'echo "After install"'
  pre-build-script: 'echo "Before build"'
  post-build-script: 'echo "After build"'
```

## Conditional Execution

```yaml
with:
  # Only run linting if this is true
  enable-linting: true
  lint-command: npm run lint
  
  # Only run type checking if this is true
  enable-type-checking: true
  type-check-command: npm run type-check
  
  # Only upload artifacts if this is true
  enable-artifacts: true
  artifact-path: dist
```

## Error Handling

```yaml
with:
  # Continue workflow if tests fail
  continue-on-error: true
  
  # Fail if linting has warnings
  fail-on-warnings: true
```

## Caching

Automatic for:
- npm (uses package-lock.json)
- yarn (uses yarn.lock)
- pnpm (uses pnpm-lock.yaml)
- bun (uses bun.lockb)

Enable/disable:

```yaml
with:
  enable-cache: true        # Default
  cache-key-prefix: my-app  # Optional custom prefix
```

## Working Directory

For monorepo with multiple packages:

```yaml
with:
  working-directory: packages/core
  # All commands run in this directory
```

## Coverage

Generate and upload:

```yaml
with:
  enable-coverage: true
  coverage-command: npm run coverage
  coverage-threshold: 85    # Require 85% coverage
```

Coverage is uploaded to Codecov (free integration).

## Artifacts

Upload build outputs:

```yaml
with:
  enable-artifacts: true
  artifact-path: dist              # Path to upload
  artifact-retention-days: 30      # Keep for 30 days
```

## Example Workflow File

Full `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    uses: <your-org>/node-ci-template/.github/workflows/node-template.yml@v1.0.0
    with:
      node-versions: '["20.x"]'
      package-manager: npm
      build-command: npm run build
      test-command: npm test
      enable-linting: true
      enable-coverage: true
      coverage-threshold: '80'
    secrets:
      npm-token: ${{ secrets.NPM_TOKEN }}
```

## Documentation Map

| Document | Purpose |
|----------|---------|
| **README.md** | Parameter reference, examples, troubleshooting |
| **SETUP.md** | How to set up and use in projects |
| **DEPLOYMENT.md** | Release and maintenance procedures |
| **PROJECT_SUMMARY.md** | Overview and checklist |
| **examples/usage.yml** | 12 real-world examples |
| **QUICK_REFERENCE.md** | This file - quick lookup |

## Troubleshooting Quick Links

- **Cache not working?** → README.md - Troubleshooting > Cache not working
- **Tests failing?** → Check locally first: `npm test`
- **Custom scripts?** → Use `pre-*` and `post-*` script inputs
- **Publishing fails?** → Verify token: `npm-registry-token` secret
- **Node version mismatch?** → Adjust `node-versions` input

## Version Info

- **Template Version**: v1.0.0
- **Status**: Production-ready
- **License**: MIT
- **Node.js**: 18.x, 20.x, 22.x supported
- **Package Managers**: npm, yarn, pnpm, bun

## Links

- **Repository**: https://github.com/<your-org>/node-ci-template
- **Issues**: https://github.com/<your-org>/node-ci-template/issues
- **Documentation**: See README.md
- **Examples**: See examples/usage.yml
- **Releases**: https://github.com/<your-org>/node-ci-template/releases

## Tips & Tricks

1. **Test locally first**: Run commands locally before relying on workflow
2. **Use matrix for libraries**: Test multiple Node versions for SDKs
3. **Pin versions**: Use `@v1.0.0` not `@main` for stability
4. **Watch logs**: GitHub Actions tab shows detailed step output
5. **Reuse inputs**: Copy working configs from examples/
6. **Cache warmth**: First run will be slow, subsequent runs faster
7. **Coverage gates**: Set realistic thresholds (80-90%)
8. **Pre-commit**: Consider local pre-commit hooks too

---

**Need more?** See [README.md](README.md) for full documentation.
