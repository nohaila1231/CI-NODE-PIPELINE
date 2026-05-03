# Advanced Caching Guide

This guide explains the caching strategies available in the Node.js CI/CD template for optimizing build times and reducing external dependencies.

## Overview

Effective caching reduces CI/CD execution time by:

- Avoiding re-download of dependencies
- Skipping redundant builds
- Reducing network I/O
- Lowering artifact storage usage

The template implements multi-layer caching for npm, yarn, pnpm, and bun.

## Caching Strategies

### Layer 1: Package Manager Cache

Fastest: Caches the resolved dependencies from lock files.

**How it works**:
- Lock file (package-lock.json, yarn.lock, pnpm-lock.yaml, bun.lockb) is hashed
- If hash matches previous run, cached node_modules is restored
- If hash is different, full install is run
- New cache is saved for next run

**Cache time**: 5-10 seconds restore, 2-3 minutes save

**When to use**: Always (enabled by default)

### Layer 2: Global Package Manager Cache

Medium speed: Uses the package manager's global cache directory.

**How it works**:
- npm, yarn, pnpm have internal caches of downloaded packages
- Cache directory (e.g., ~/.npm, ~/.cache/yarn) is cached separately
- Useful if lock file changes but overlaps with Layer 1

**Cache time**: 3-8 seconds restore

**When to use**: Large projects with many transitive dependencies

### Layer 3: Build Output Cache

Slowest but can skip rebuild entirely.

**How it works**:
- Build output directory (dist/, build/) is cached
- If source hasn't changed, skip build entirely
- Requires careful invalidation logic

**Cache time**: 1-2 seconds restore

**When to use**: Only for static builds or when source rarely changes

## Enabling Caching

### Default Behavior

Caching is enabled by default in the template:

```yaml
with:
  enable-cache: 'true'  # Default
```

### Disable Caching

```yaml
with:
  enable-cache: 'false'
```

Useful for:
- Debugging cache issues
- Force clean install
- Testing reproducibility

## Cache Configuration

### Cache Key Prefix

Customize the cache key prefix:

```yaml
with:
  cache-key-prefix: 'node-deps'  # Default
```

Use when:
- Multiple projects in monorepo
- Want separate caches per project
- Testing cache strategy

**Example**:
```yaml
cache-key-prefix: 'myapp-v1'
```

This creates cache keys like: `myapp-v1-npm-package-lock-abc123`

## Package Manager Specific Caching

### npm Caching

**Lock file**: `package-lock.json`

**Cache directories**:
- Global: `~/.npm`
- Project: `node_modules/`

**Cache key generated from**:
- Lock file contents (most important)
- Node.js version
- OS

**Example**:
```
Cache key: node-deps-npm-lock-abc123def456
Restore keys:
  - node-deps-npm-lock-
  - node-deps-npm-
```

### yarn Caching

**Lock file**: `yarn.lock`

**Cache directories**:
- Global: `~/.cache/yarn`
- Project: `node_modules/`

**Cache key**: Same as npm, but with yarn-specific path

### pnpm Caching

**Lock file**: `pnpm-lock.yaml`

**Cache directories**:
- Global: `~/.pnpm-store`
- Project: `node_modules/`

**Configuration**:
```yaml
with:
  package-manager: 'pnpm'
  enable-cache: 'true'
```

### bun Caching

**Lock file**: `bun.lockb`

**Cache directories**:
- Global: `~/.bun/install/cache`
- Project: `node_modules/`

**Special handling**:
Bun uses custom cache path - script generates unique key from lockb hash

## Monitoring Cache Performance

### Check Cache Hit Rate

1. Go to **Actions** tab
2. Click on workflow run
3. Find "Setup Node.js" or "Configure cache" step
4. Check log output:
   ```
   Cache hit for key: node-deps-npm-lock-abc123
   Restored cache successfully
   ```

### Compare Build Times

**With cache hit**: 30-60 seconds
**Cache miss**: 3-5 minutes
**Savings**: 80-90% faster for cached runs

### View Cache Statistics

Go to **Settings** > **Actions** > **Caches**:
- See all active caches
- Size used
- Last access date
- Can manually delete old caches

## Advanced Caching Patterns

### Monorepo Caching

For monorepos with multiple projects:

```yaml
# Project A
- name: Setup cache for project-a
  uses: actions/setup-node@v4
  with:
    cache: 'npm'
    cache-dependency-path: 'packages/project-a/package-lock.json'

# Project B
- name: Setup cache for project-b
  uses: actions/setup-node@v4
  with:
    cache: 'npm'
    cache-dependency-path: 'packages/project-b/package-lock.json'
```

### Conditional Cache Invalidation

Clear cache on specific events:

```yaml
- name: Clear old cache on workflow_dispatch
  if: github.event_name == 'workflow_dispatch' && inputs.clear-cache == 'true'
  run: |
    # Cache is automatically cleared on API call if needed
    npm cache clean --force
```

### Build Output Caching

Cache compiled artifacts:

```yaml
- name: Cache build output
  uses: actions/cache@v3
  with:
    path: dist/
    key: build-${{ hashFiles('src/**/*') }}-${{ github.sha }}
    restore-keys: |
      build-${{ hashFiles('src/**/*') }}-
      build-
```

**Warning**: Only use if build is deterministic and source rarely changes.

## Cache Size Management

### Default Cache Size Limits

- **Free GitHub plan**: 5 GB across all caches
- **Pro/Team plan**: 10 GB
- **Enterprise**: 200 GB

### Optimize Cache Size

**Keep caches small**:
```yaml
# Good - only cache node_modules
cache-path: node_modules/

# Bad - cache entire project
cache-path: ./
```

**Remove cache periodically**:
```yaml
- name: Clean cache
  if: github.event_name == 'schedule'  # Weekly cleanup
  uses: octokit/request-action@v2
  with:
    route: DELETE /repos/{owner}/{repo}/actions/caches?key=old-
```

**Monitor cache usage**:
1. Go to **Settings** > **Actions** > **Caches**
2. Sort by "Size Used"
3. Delete large unused caches

## Troubleshooting Cache Issues

### Cache Not Being Used

**Issue**: Cache hit never appears in logs

**Causes**:
1. Lock file hash changed (even minor change, spaces, etc.)
2. OS or Node.js version changed in matrix
3. Cache manually cleared
4. Cache expired (14 days of inactivity)

**Solutions**:
1. Check lock file - ensure it's committed identically
2. Verify Node.js version hasn't changed
3. Check cache expiration in Settings > Actions > Caches
4. Manually create cache by re-running workflow

### Stale Cache Causing Issues

**Issue**: Old cached dependencies causing failures

**Symptoms**:
- Works locally but fails in CI
- Works on one run, fails on next
- Dependency version mismatch errors

**Solutions**:
```yaml
# Force cache invalidation
with:
  cache-key-prefix: 'node-deps-v2'  # Change prefix
```

Or manually delete cache:
1. **Settings** > **Actions** > **Caches**
2. Find problematic cache
3. Click delete
4. Re-run workflow

### Cache Corruption

**Issue**: Restored cache causes errors

**Solutions**:
1. Clear cache and rebuild:
   ```bash
   rm -rf node_modules/
   npm ci
   ```

2. Force new cache in workflow:
   ```yaml
   cache-key-prefix: 'node-deps-$(date +%s)'
   ```

3. Verify lock file integrity:
   ```bash
   npm audit
   ```

## Best Practices

1. **Always use lock files** - Ensures cache consistency
2. **Commit lock files** - Never .gitignore them
3. **Use matrix but be smart** - Cache per Node.js version
4. **Monitor cache size** - Keep under limits
5. **Clean regularly** - Remove old caches
6. **Test cache locally** - Ensure reproducibility
7. **Document cache strategy** - In README for team
8. **Version your cache** - Change prefix when build changes
9. **Understand trade-offs** - Cache adds 20-30s save time
10. **Measure improvements** - Track total job time with/without cache

## Performance Baseline

Typical timing for Node.js projects:

```
Without cache:
├─ Setup Node.js: 10s
├─ Install dependencies: 120s
├─ Lint: 15s
├─ Tests: 60s
├─ Build: 45s
└─ Total: ~250s

With cache:
├─ Setup Node.js: 10s
├─ Restore cache: 20s
├─ Lint: 15s
├─ Tests: 60s
├─ Build: 45s
├─ Save cache: 30s
└─ Total: ~180s (save 70s)
```

Cache saves 25-30% of total time even with save time included.

## See Also

- [GitHub Actions Cache Documentation](https://github.com/actions/cache)
- [npm Cache Documentation](https://docs.npmjs.com/cli/v9/commands/npm-cache)
- [yarn Cache Documentation](https://yarnpkg.com/cli/cache)
- [pnpm Store Documentation](https://pnpm.io/pnpm-vs-npm)
