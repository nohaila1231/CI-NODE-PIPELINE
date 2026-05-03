# Deployment & Release Guide

This guide covers deploying the Node.js CI/CD template as a reusable workflow in your organization.

## Quick Deploy

```bash
# 1. Clone and setup
git clone https://github.com/<your-org>/node-ci-template.git
cd node-ci-template

# 2. Update GitHub references
# Edit package.json repository and homepage URLs

# 3. Verify template
node scripts/validate-workflow.js

# 4. Commit and tag
git add .
git commit -m "Initial release: Node.js CI/CD template v1.0.0"
git tag -a v1.0.0 -m "Production-ready reusable workflow"

# 5. Push to GitHub
git push origin main v1.0.0
```

## Release Management

### Semantic Versioning

Use semantic versioning for releases:

- **MAJOR**: Breaking changes to workflow interface or behavior
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, documentation updates

Example: v1.2.3
- v1 = MAJOR (breaking changes)
- 2 = MINOR (new features)
- 3 = PATCH (bug fixes)

### Creating a Release

```bash
# 1. Create a branch for release
git checkout -b release/v1.0.1

# 2. Update CHANGELOG.md with release notes
# Add section under [Unreleased]

# 3. Update package.json version
# "version": "1.0.1"

# 4. Commit changes
git add CHANGELOG.md package.json
git commit -m "Release v1.0.1: Fix caching for bun"

# 5. Create pull request and merge to main
git push origin release/v1.0.1
# Create PR, review, merge

# 6. Tag release
git checkout main
git pull origin main
git tag -a v1.0.1 -m "Release v1.0.1: Fix caching for bun"

# 7. Push tag to GitHub
git push origin v1.0.1
```

## Workflow Distribution

### For Single Organization

Place workflow in shared repository:

```
github-workflows/
├── .github/
│   └── workflows/
│       ├── node-template.yml
│       ├── python-template.yml
│       └── docker-template.yml
```

Reference in projects:

```yaml
uses: <org>/github-workflows/.github/workflows/node-template.yml@v1.0.0
```

### For Multiple Organizations

Publish as public template repository:

1. Create public repository: `node-ci-template`
2. Add detailed README and examples
3. Tag releases: v1.0.0, v1.0.1, v1.1.0, etc.
4. Publish to GitHub Marketplace (optional)

Reference in projects:

```yaml
uses: <org>/node-ci-template/.github/workflows/node-template.yml@v1.0.0
```

### For Public Distribution

To add to GitHub Marketplace:

1. Repository must be public
2. Add `action.yml` or `action.yaml` at root (if using Marketplace)
3. For reusable workflows, update metadata:

```yaml
# In .github/workflows/node-template.yml
name: Node.js CI/CD Template
description: 'Production-ready Node.js CI/CD reusable workflow'
```

4. Create release in GitHub (UI or CLI)
5. Repository appears in Marketplace search

## Maintenance Schedule

### Monthly Check

```bash
# Update dependencies in examples
# Verify workflow runs without issues
# Check for GitHub Actions deprecations
# Review open issues
```

### Quarterly Updates

```bash
# Review Node.js LTS versions
# Update node-versions default if needed
# Test with new GitHub Actions runner versions
# Update documentation
```

### Release Cycle

- **Bug fixes**: Patch release immediately (v1.0.1)
- **New features**: Minor release (v1.1.0) within 2 weeks
- **Breaking changes**: Major release (v2.0.0) with migration guide

## Monitoring & Support

### Issue Tracking

Create GitHub Issues for:

- Bug reports
- Feature requests
- Documentation improvements
- Version compatibility questions

### Common Issues to Watch

1. **GitHub Actions Deprecations**
   - Monitor GitHub Actions announcements
   - Update actions (setup-node, upload-artifact, etc.)
   - Test new versions before recommending

2. **Node.js LTS Updates**
   - Node.js releases new LTS every 2 years
   - Update examples when LTS versions change
   - Consider dropping old versions

3. **Package Manager Changes**
   - npm: Watch for major version updates
   - pnpm: Follows npm compatibility
   - yarn: Monitor Yarn 4+ stability
   - bun: Emerging, monitor for stability

### Security Patching

For security issues:

1. **Fix the workflow** in development branch
2. **Test thoroughly** with security issue
3. **Release as patch** (v1.0.X)
4. **Announce** in CHANGELOG.md
5. **Recommend** users update to new version

Example:

```markdown
## [1.0.1] - 2024-02-20

### Security

- Fixed: npm token exposure in logs (CVE-2024-XXXXX)
```

## Backward Compatibility

### Policy

- **Major versions** (v1.0.0, v2.0.0): Can have breaking changes
- **Minor versions** (v1.1.0, v1.2.0): Always backward compatible
- **Patch versions** (v1.0.1, v1.0.2): Always backward compatible

### When to Break Compatibility

Only for:

- Security vulnerabilities
- Critical bugs preventing use
- Necessary GitHub Actions updates
- Major dependency changes

When breaking:

1. **Create migration guide** in documentation
2. **Provide transition period** (at least 2 minor versions)
3. **Document in CHANGELOG.md** prominently
4. **Tag as MAJOR version** change

Example:

```markdown
## [2.0.0] - 2024-03-15

### BREAKING CHANGES

- Changed: `npm-registry` input now expects full URL with protocol
  - Old: `npm-registry: 'registry.npmjs.org'`
  - New: `npm-registry: 'https://registry.npmjs.org/'`

### Migration

See [MIGRATION.md](MIGRATION.md) for detailed upgrade instructions.
```

## Performance Optimization

Monitor workflow performance:

```bash
# Check average run times
# Look at Actions tab > Workflow runs > Timing
# Identify slow steps

# Optimize:
# 1. Cache improvements
# 2. Parallel job execution
# 3. Conditional step execution
# 4. Remove unused steps
```

## Documentation Updates

### When to Update Docs

- ✅ Adding new input parameter
- ✅ Changing default values
- ✅ Adding supported package manager
- ✅ Fixing example code
- ✅ Adding troubleshooting section
- ✅ Improving clarity

### What to Update

- **README.md**: Parameter reference, examples, troubleshooting
- **CHANGELOG.md**: Version history
- **SETUP.md**: Setup instructions for new features
- **DEPLOYMENT.md**: Release procedures
- **examples/usage.yml**: New usage patterns

## Rollback Procedures

### If Release Has Critical Bug

```bash
# 1. Identify the broken version (e.g., v1.0.1)

# 2. Create hotfix branch
git checkout main
git checkout -b hotfix/v1.0.2

# 3. Fix the issue

# 4. Update CHANGELOG.md
# Explain bug and fix

# 5. Commit and tag
git add .
git commit -m "Hotfix v1.0.2: Fix race condition in caching"
git tag -a v1.0.2 -m "Hotfix: Fix race condition in caching"

# 6. Push
git push origin hotfix/v1.0.2 v1.0.2

# 7. Announce in GitHub Discussions
# Recommend users update from v1.0.1 to v1.0.2
```

## GitHub Actions Runner Compatibility

### Monitor for Updates

- Watch GitHub Actions announcements
- Test with new runner versions
- Update documentation if needed

### Current Support

- Ubuntu: Latest 2 versions
- Windows: Latest version
- macOS: Latest version

Update examples if:

- Runner OS updates significantly
- Available software changes
- Node.js versions change

## Team Collaboration

### Code Review Process

For PRs to the template:

1. **Validate**: Run `node scripts/validate-workflow.js`
2. **Test**: Test in a real project
3. **Document**: Update relevant docs
4. **Review**: At least 1 approval
5. **Merge**: Squash and merge to main

### Template Governance

- **Maintainers**: Team responsible for template
- **Contributors**: Community contributions welcome
- **Decision Making**: Maintainers decide what gets merged

### Communication

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: GitHub Issues for bugs and features
- **CHANGELOG**: All changes documented
- **Releases**: Detailed release notes

## Integration Examples

Share how the template integrates:

### Example 1: TypeScript Library

```yaml
# .github/workflows/ci.yml in your project
uses: <org>/node-ci-template/.github/workflows/node-template.yml@v1.0.0
with:
  node-versions: '["18.x", "20.x"]'
  enable-type-checking: true
  enable-coverage: true
  coverage-threshold: '90'
```

### Example 2: React App

```yaml
# .github/workflows/ci.yml in your project
uses: <org>/node-ci-template/.github/workflows/node-template.yml@v1.0.0
with:
  node-versions: '["20.x"]'
  enable-linting: true
  fail-on-warnings: true
```

## Success Metrics

Track template adoption and success:

- Number of projects using template
- Average workflow run time
- Success/failure rates
- Community feedback and issues

## Next Steps

1. **Deploy**: Release as v1.0.0 to GitHub
2. **Test**: Use in 2-3 real projects
3. **Iterate**: Gather feedback and improve
4. **Document**: Expand documentation based on user questions
5. **Promote**: Share with team/community

---

For questions, see README.md or open an issue on GitHub.
