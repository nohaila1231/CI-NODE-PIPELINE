# Security Scanning Guide

This guide covers the security scanning features available in the Node.js CI/CD template, including dependency vulnerability checks, SAST analysis with CodeQL, and security reporting.

## Overview

The template includes a comprehensive security scanning job that runs in parallel with tests and includes:

- **npm audit**: Scans dependencies for known vulnerabilities
- **CodeQL**: Static Application Security Testing (SAST) for JavaScript code
- **SARIF reporting**: Results uploaded to GitHub Security tab for visibility

## Enabling Security Scanning

To enable security scanning, set these inputs in your workflow:

```yaml
- name: Run Node.js Template
  uses: your-org/node-ci-template/.github/workflows/node-template.yml@main
  with:
    enable-security-scan: 'true'
    security-fail-on-error: 'false'  # 'true' to fail on vulnerabilities
```

## Security Job Features

### npm audit

Runs `npm audit` to check for dependency vulnerabilities:

```
Critical: 0
High: 2
Moderate: 5
Low: 1
```

**Configuration**:
- Audit level set to `moderate` (finds critical, high, and moderate issues)
- Continues on error by default (doesn't block deployment)
- Use `security-fail-on-error: 'true'` to block on vulnerabilities

### CodeQL Analysis

Performs static code analysis using GitHub's CodeQL engine:

**Detects**:
- Code injection vulnerabilities
- Path traversal issues
- Insecure deserialization
- SQL injection
- XSS vulnerabilities
- And more...

**How it works**:
1. JavaScript code is analyzed
2. Findings are reported as SARIF results
3. Results appear in GitHub Security tab
4. Errors/warnings can optionally block deployment

### SARIF Upload

All security findings are uploaded to GitHub's Security Analysis tab:

1. Go to repository **Security** tab
2. Click **Code scanning alerts**
3. View all CodeQL and npm audit results

## Configuring Security Scanning

### Fail on Vulnerabilities

To make the workflow fail if vulnerabilities are found:

```yaml
security-fail-on-error: 'true'
```

This ensures deployments cannot proceed with known security issues.

### Ignoring Known Vulnerabilities

For accepted vulnerabilities, add to package.json:

```json
{
  "vulnerabilities": {
    "package-name": "Accepted risk: [reason]"
  }
}
```

Then configure npm audit to ignore:

```bash
npm audit --ignore=package-name
```

### Custom Audit Configuration

Create `.npmauditrc` in your project:

```json
{
  "audit-level": "moderate",
  "ignore": [
    "1234567"  // Ignore specific vulnerability ID
  ]
}
```

## CodeQL Configuration

### Custom CodeQL Rules

Create `.github/codeql-config.yml`:

```yaml
name: Custom CodeQL Configuration
queries:
  - uses: security-and-quality
paths-ignore:
  - '**/node_modules'
  - '**/dist'
  - '**/build'
```

### Suppress False Positives

Add CodeQL directives to code:

```javascript
// lgtm [js/unsafe-dynamic-code] - False positive: validated input
eval(userInput);
```

## GitHub Security Tab Setup

### Enable Code Scanning

1. Go to repository **Settings** > **Security & analysis**
2. Enable **Code scanning** section
3. Ensure **GitHub Advanced Security** is enabled for your plan

### Viewing Results

1. Go to **Security** tab
2. Click **Code scanning alerts**
3. Filter by:
   - Severity (Critical, High, Medium, Low)
   - Tool (CodeQL, npm audit, etc.)
   - Branch
   - Status (Open, Closed, Dismissed)

### Configure Branch Protection with Security

Require CodeQL checks to pass before merging:

```
Branch protection rule:
├─ Require status checks to pass
│  └─ Select: code-ql/analyze
└─ Require code reviews
```

## Fixing Security Issues

### For npm Vulnerabilities

**Step 1**: Review the vulnerability
```bash
npm audit --audit-level=moderate
```

**Step 2**: Update the vulnerable package
```bash
npm update vulnerable-package
```

**Step 3**: If no update available, consider alternatives
```bash
npm search similar-package
```

**Step 4**: If accepting risk, document it
```json
{
  "vulnerabilities": {
    "package-name": "Risk accepted: Feature critical, patch pending"
  }
}
```

### For CodeQL Findings

**Step 1**: Review the finding in Security tab
- Understand the vulnerability type
- Check the suggested fix
- Verify the code path

**Step 2**: Fix the vulnerability
```javascript
// Bad
const query = userInput;
database.query(query);

// Good
const query = sanitize(userInput);
database.query(query);
```

**Step 3**: Verify the fix
```bash
# Push code, workflow re-runs automatically
git push origin feature-branch
```

## Dependency Management

### Keep Dependencies Updated

Regularly update dependencies to get security patches:

```bash
# Check for outdated packages
npm outdated

# Update all packages
npm update

# Audit after updates
npm audit
```

### Use Dependabot

Enable GitHub's Dependabot for automatic updates:

1. Go to repository **Settings** > **Code security & analysis**
2. Enable **Dependabot alerts**
3. Optionally enable **Dependabot security updates** for automatic PRs

## Integration with CI/CD

### Block Merge on Security Issues

```yaml
Branch protection rules:
├─ Require status checks to pass before merging
│  ├─ code-ql/analyze
│  └─ npm-audit
```

### Create Issues for Vulnerabilities

The security job outputs can trigger issue creation:

```yaml
- name: Create issue for critical vulnerabilities
  if: failure()
  uses: actions/create-issue@v1
  with:
    title: Security vulnerability found
    body: Review Security tab for details
    labels: security,critical
```

### Send Notifications

Enable notifications on security issues:

```yaml
enable-notifications: 'true'
notify-on-failure: 'true'
```

## Best Practices

1. **Run security scans on every commit** - Enable `enable-security-scan: 'true'` for all PRs
2. **Fail on critical vulnerabilities** - Set `security-fail-on-error: 'true'` for production packages
3. **Review CodeQL alerts regularly** - Don't let warnings accumulate
4. **Update dependencies** - Run `npm update` and `npm audit` weekly
5. **Use Dependabot** - Automatic security updates for dependencies
6. **Document accepted risks** - Clearly mark and justify any ignored vulnerabilities
7. **Train your team** - Review security findings as a team learning opportunity
8. **Publish security advisories** - If you publish packages, create advisories for vulnerabilities

## Troubleshooting

### CodeQL Fails with "No supported framework detected"

This is normal for simple projects. CodeQL will analyze available code without a specific framework.

### npm audit Shows Many Issues

Common causes:
- Outdated dependencies
- Old project with deprecated packages
- Transitive vulnerabilities (in your dependencies' dependencies)

**Solutions**:
1. Update npm: `npm install -g npm@latest`
2. Update packages: `npm update`
3. Run: `npm audit fix`

### Security Job Times Out

If CodeQL takes too long:
1. Reduce code complexity
2. Exclude unnecessary paths in `.github/codeql-config.yml`
3. Use `paths-ignore` for build artifacts

### Results Not Appearing in Security Tab

1. Verify **GitHub Advanced Security** is enabled
2. Check that the workflow completed successfully
3. Ensure CodeQL analysis ran (check workflow logs)
4. Wait a few minutes for results to appear

## See Also

- [GitHub Advanced Security Documentation](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security)
- [CodeQL Documentation](https://codeql.github.com/)
- [npm audit Documentation](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [SARIF Format](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/uploading-a-sarif-file-to-github)
