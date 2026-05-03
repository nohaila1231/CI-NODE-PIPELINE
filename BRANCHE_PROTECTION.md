# Branch Protection Setup Guide

This guide explains how to configure GitHub branch protection rules to work with the advanced release management features of the Node.js CI/CD template.

## Overview

Branch protection prevents direct pushes to important branches (like `main` or `master`) and ensures that all code goes through proper review and testing before being merged. When combined with the automated release feature, it ensures releases only happen on your main branch after successful tests.

## Prerequisites

- Repository owner or administrator access
- The `enable-release` input set to `true` in your workflow
- GitHub branch protection enabled on your repository

## Setting Up Branch Protection

### Step 1: Navigate to Branch Protection Settings

1. Go to your GitHub repository
2. Click **Settings** in the top navigation
3. Click **Branches** in the left sidebar
4. Click **Add rule** under "Branch protection rules"

### Step 2: Configure Branch Pattern

1. Under "Branch name pattern", enter your release branch name:
   - `main` (recommended)
   - `master` (for older repos)
   - Or your custom branch name matching `release-branch` input

### Step 3: Configure Protection Rules

Enable the following protections:

#### Required Status Checks
- [x] **Require a pull request before merging**
  - Dismiss stale pull request approvals when new commits are pushed
  - Require approval from code owners
  - Number of required reviewers: 1+ (recommended: 2 for production)

- [x] **Require status checks to pass before merging**
  - Require branches to be up to date before merging
  - Select required status checks:
    - `validate` - Configuration validation
    - `test` - All test suites must pass
    - `security` - Security scan must pass (if enabled)

#### Enforce Restrictions
- [x] **Require code reviews before merging**
  - Require 1 approval minimum (2+ recommended for critical branches)
  - Require review from code owners (if using CODEOWNERS file)

- [x] **Require conversation resolution before merging**
  - All comments must be resolved

#### Security
- [x] **Require signed commits**
  - Ensures commits are verified by GPG
  - Recommended for sensitive repositories

- [x] **Dismiss stale pull request approvals when new commits are pushed**
  - Ensures reviewers re-approve after changes

### Step 4: Configure Administrator Rules

- [x] **Include administrators**
  - Administrators must also follow these rules
  - Recommended for compliance and best practices

- [x] **Restrict who can push to matching branches**
  - Only allow specific users or teams to bypass these rules
  - Specify: `@github/administrators` or similar team

## Release Workflow with Branch Protection

Here's how the automated release system works with branch protection:

```
Developer commits to feature branch
         ↓
Push to GitHub
         ↓
Pull Request created
         ↓
Status checks run (test, lint, security)
    ├─ validate
    ├─ test (matrix: 18.x, 20.x, 22.x)
    ├─ security (if enabled)
         ↓
Code review (requires 1-2 approvals)
         ↓
Merge to main branch
         ↓
Release workflow triggers (on main branch push)
         ↓
Semantic version calculated
  (feat: minor, fix: patch, breaking: major)
         ↓
Git tag created (v1.2.3)
         ↓
Changelog generated
         ↓
Release published
```

## Troubleshooting

### Release Not Triggering

**Issue**: Automated release job never runs

**Solutions**:
1. Verify `enable-release: true` is set in your workflow call
2. Check that the branch name matches `release-branch` input
3. Ensure the commit is pushed (not just merged through GitHub UI with squash)
4. Verify `git-token` secret is set (use `GITHUB_TOKEN` from secrets if not provided)
5. Check workflow logs for the specific error

### Release Runs but No Tag Created

**Issue**: Release job completes but no Git tag appears

**Solutions**:
1. Check that your branch protection rules allow the GitHub Actions bot to push
2. Verify the git-token secret has the correct permissions
3. Look for errors in the "Create Git tag" step of the workflow logs

### Tests Pass but Release Blocked

**Issue**: Status checks pass but release still doesn't trigger

**Solutions**:
1. Ensure the commit is pushed directly to the release branch
2. If using squash merge, make sure it's an actual branch push (not just PR merge)
3. The `release` job only runs on `push` events; PR events don't trigger it
4. Check that the branch pattern matches exactly (main vs master, for example)

### Cannot Force Push Due to Branch Protection

**For development purposes only**, you can temporarily disable branch protection:
1. Go to repository Settings > Branches
2. Click the X to delete the branch protection rule
3. Make your test pushes
4. Re-create the branch protection rule

**Never disable branch protection in production repositories.**

## Best Practices

1. **Use conventional commits** - The semantic versioning script depends on:
   - `feat:` for features → minor version bump
   - `fix:` for bug fixes → patch version bump
   - `breaking:` or `!:` for breaking changes → major version bump

2. **Require code reviews** - Especially for packages published to npm

3. **Sign commits** - Enables verified release history

4. **Use automation** - Let the workflow handle versioning and releases

5. **Document breaking changes** - In commit messages or PR descriptions

6. **Test release process** - Create a test repository first before enabling on production

## GitHub Actions Bot Permissions

The GitHub Actions bot needs the following permissions to create releases:

```yaml
permissions:
  contents: write  # Create tags and releases
  pull-requests: read  # Read PR information
```

These are automatically granted in workflow files, but ensure your repository settings don't restrict them.

## Examples

### Simple Release Setup

For a simple project that auto-releases on main:

```bash
# Enable release on main branch only
enable-release: 'true'
release-branch: 'main'
enable-security-scan: 'false'
```

### Strict Release Process

For production-critical packages:

```bash
# Enable all protections
enable-release: 'true'
release-branch: 'main'
enable-security-scan: 'true'
security-fail-on-error: 'true'
```

With branch protection requiring:
- 2 approvals minimum
- Signed commits
- All conversations resolved
- Status checks passing

## See Also

- [Release Management Guide](./SETUP.md#release-management)
- [Semantic Versioning](./DEPLOYMENT.md#semantic-versioning)
- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
