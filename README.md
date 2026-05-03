# Node.js CI/CD Reusable Workflow Template

A comprehensive, production-ready GitHub Actions reusable workflow for Node.js projects. This template provides flexible, parameterized CI/CD automation with support for multiple Node versions, package managers, testing frameworks, coverage reporting, and npm publishing.

## Features

- ✅ **Multi-version testing**: Test against multiple Node.js versions (18.x, 20.x, 22.x, etc.)
- ✅ **Multi-package-manager support**: npm, yarn, pnpm, bun
- ✅ **Advanced caching**: Intelligent dependency caching per package manager
- ✅ **Code quality**: Linting, type checking, coverage reporting
- ✅ **Artifact management**: Build artifact upload with retention policies
- ✅ **Pre/Post hooks**: Custom scripts before/after install and build
- ✅ **NPM publishing**: Automated npm registry publishing
- ✅ **Input validation**: Comprehensive validation of all parameters
- ✅ **Error handling**: Configurable fail-fast and continue-on-error behavior
- ✅ **Production-grade**: Clean, modular, well-commented, no hardcoded logic

## Quick Start

### 1. Add to Your Repository

Place this template in your repository:

```
.github/workflows/node-template.yml
```

### 2. Create a Workflow Using the Template

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    uses: <your-org>/<your-repo>/.github/workflows/node-template.yml@v1.0.0
    with:
      node-versions: '["18.x", "20.x", "22.x"]'
      package-manager: npm
      enable-linting: true
      enable-coverage: true
```

## Input Parameters

### Core Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `node-versions` | string (JSON array) | `["20.x"]` | Node.js versions to test (e.g., `["18.x", "20.x", "22.x"]`) |
| `working-directory` | string | `.` | Working directory for all commands |
| `package-manager` | string | `npm` | Package manager: `npm`, `yarn`, `pnpm`, or `bun` |

### Build Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `install-command` | string | `` (auto-detect) | Custom install command (overrides default) |
| `build-command` | string | `npm run build` | Build command to run |

### Testing Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `test-command` | string | `npm test` | Test command to run |
| `enable-coverage` | string | `false` | Enable code coverage reporting |
| `coverage-command` | string | `npm run coverage` | Custom coverage command |
| `coverage-threshold` | string | `80` | Minimum coverage percentage (0-100) |

### Code Quality

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enable-linting` | string | `true` | Enable linting checks |
| `lint-command` | string | `npm run lint` | Lint command to run |
| `enable-type-checking` | string | `false` | Enable TypeScript type checking |
| `type-check-command` | string | `npm run type-check` | Type check command |

### Caching

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enable-cache` | string | `true` | Enable dependency caching |
| `cache-key-prefix` | string | `node-deps` | Prefix for cache keys |

### Artifacts

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enable-artifacts` | string | `false` | Upload build artifacts |
| `artifact-path` | string | `dist` | Path to artifacts directory |
| `artifact-retention-days` | string | `5` | Days to retain artifacts |

### Pre/Post Scripts

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `pre-install-script` | string | `` | Script to run before install |
| `post-install-script` | string | `` | Script to run after install |
| `pre-build-script` | string | `` | Script to run before build |
| `post-build-script` | string | `` | Script to run after build |

### Behavior Control

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `fail-on-warnings` | string | `false` | Treat linting warnings as errors |
| `continue-on-error` | string | `false` | Continue workflow even if tests fail |

### Publishing

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `publish-to-npm` | string | `false` | Publish to npm after successful test |
| `npm-registry` | string | `https://registry.npmjs.org/` | NPM registry URL |

## Secrets

| Secret | Required | Description |
|--------|----------|-------------|
| `npm-token` | No | NPM authentication token for private packages (install phase) |
| `npm-registry-token` | No | Token for publishing to npm registry |

## Usage Examples

### Basic Example: Simple CI

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    uses: <your-org>/<your-repo>/.github/workflows/node-template.yml@v1.0.0
    with:
      package-manager: npm
```

### Advanced Example: Full Coverage and Publishing

```yaml
name: CI with Coverage and Publishing

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    uses: <your-org>/<your-repo>/.github/workflows/node-template.yml@v1.0.0
    with:
      node-versions: '["18.x", "20.x", "22.x"]'
      package-manager: pnpm
      enable-linting: true
      enable-coverage: true
      coverage-threshold: 85
      enable-artifacts: true
      artifact-path: dist
      artifact-retention-days: 30
      fail-on-warnings: true
      publish-to-npm: false
    secrets:
      npm-token: ${{ secrets.NPM_TOKEN }}
```

### Monorepo Example: With Custom Scripts

```yaml
name: Monorepo CI

on:
  push:
    branches: [main]

jobs:
  test:
    uses: <your-org>/<your-repo>/.github/workflows/node-template.yml@v1.0.0
    with:
      working-directory: packages/sdk
      package-manager: pnpm
      install-command: pnpm install --frozen-lockfile
      build-command: pnpm run build
      test-command: pnpm run test
      lint-command: pnpm run lint
      pre-build-script: echo "Pre-build check"
      post-build-script: echo "Post-build verification"
    secrets:
      npm-token: ${{ secrets.NPM_TOKEN }}
```

### Publishing to NPM

```yaml
name: Publish to NPM

on:
  release:
    types: [created]

jobs:
  publish:
    uses: <your-org>/<your-repo>/.github/workflows/node-template.yml@v1.0.0
    with:
      node-versions: '["20.x"]'
      package-manager: npm
      enable-coverage: true
      publish-to-npm: true
      npm-registry: https://registry.npmjs.org/
    secrets:
      npm-registry-token: ${{ secrets.NPM_REGISTRY_TOKEN }}
      npm-token: ${{ secrets.NPM_TOKEN }}
```

### Bun Example

```yaml
name: CI with Bun

on:
  push:
    branches: [main]

jobs:
  test:
    uses: <your-org>/<your-repo>/.github/workflows/node-template.yml@v1.0.0
    with:
      node-versions: '["22.x"]'
      package-manager: bun
      build-command: bun run build
      test-command: bun test
      lint-command: bun run lint
```

## Job Details

### Validate Job

- Validates JSON format of `node-versions`
- Validates package manager selection
- Validates coverage threshold is between 0-100

### Test Job (Matrix)

- Runs once for each Node version specified
- Steps include:
  1. Checkout code
  2. Pre-install hook
  3. Setup Node.js
  4. Setup package manager (pnpm/yarn/bun/npm)
  5. Configure cache
  6. Install dependencies
  7. Post-install hook
  8. Pre-build hook
  9. Linting (if enabled)
  10. Type checking (if enabled)
  11. Build
  12. Post-build hook
  13. Tests
  14. Coverage (if enabled)
  15. Upload artifacts (if enabled)

### Publish Job

- Only runs if `publish-to-npm` is `true`
- Runs after all test jobs pass
- Publishes package to npm registry

## Best Practices

1. **Use semantic versioning**: Tag releases as `v1.0.0`, `v1.0.1`, etc.
2. **Pin workflow versions**: Use `@v1.0.0` instead of `@main` for stability
3. **Validate inputs**: The template validates JSON and coverage threshold
4. **Use matrix strategy**: Test multiple Node versions to catch compatibility issues
5. **Enable coverage**: Set reasonable thresholds (80-90%) for quality
6. **Pre/Post hooks**: Use for custom environment setup or verification
7. **Secrets management**: Store tokens in GitHub Secrets, not in workflows
8. **Fail-fast disabled**: Matrix jobs continue even if one version fails (allows visibility)

## Troubleshooting

### Cache not working?

- Ensure `enable-cache: true`
- Check if `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml` exists
- Note: Bun uses custom caching; ensure `bun.lockb` exists

### Coverage upload not working?

- Ensure coverage tool generates `coverage/coverage-final.json`
- Check that `enable-coverage: true`
- Verify Codecov integration is enabled (optional)

### Custom scripts not running?

- Ensure script is a valid shell command
- Use `&&` to chain multiple commands if needed
- Example: `pre-build-script: 'echo "Starting build" && npm run check'`

### Publishing fails?

- Verify `npm-registry-token` secret is set correctly
- Ensure `package.json` has valid `version` and `name` fields
- Check that package is public (for public npm registry)

## Migration from Hardcoded Workflows

If you have hardcoded workflows, converting to this template:

1. Replace your entire workflow with a `uses:` reference
2. Extract hardcoded values as `with:` inputs
3. Move secrets to `secrets:` section
4. Test with a PR to ensure behavior matches

## Contributing

To improve this template:

1. Create a new version with changes
2. Tag as `v1.0.1`, `v1.1.0`, etc.
3. Update CHANGELOG.md
4. Test with real projects

## License

MIT

## Support

For issues or questions, open a GitHub issue with:

- Workflow configuration (sanitize secrets)
- Error output from failed job
- Node.js version and package manager used
